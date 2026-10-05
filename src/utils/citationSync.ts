import { Publication } from '../types';

/**
 * Centrally syncs real-time publication citations from Google Scholar
 * with a fallback to Semantic Scholar DOI API.
 */
export async function syncCitationsForPublications(
  publications: Publication[],
  scholarUrl?: string
): Promise<Record<string, number>> {
  const newCounts: Record<string, number> = {};
  let scholarSuccess = false;

  // 1. Try Google Scholar Scraper Backend first
  if (scholarUrl) {
    try {
      const scholarRes = await fetch(`/api/scholar/sync?url=${encodeURIComponent(scholarUrl)}`);
      if (scholarRes.ok) {
        const data = await scholarRes.json();
        if (data.success && data.data) {
          const scholarCitations = data.data as Record<string, number>;

          for (const pub of publications) {
            const pubTitleLower = pub.title.toLowerCase();
            const matchedKey = Object.keys(scholarCitations).find(
              k => pubTitleLower.includes(k) || k.includes(pubTitleLower.substring(0, 30))
            );

            if (matchedKey) {
              newCounts[pub.id] = scholarCitations[matchedKey];
            }
          }
          scholarSuccess = true;
        }
      }
    } catch (e) {
      console.warn('[CitationSync] Google Scholar sync failed, falling back to DOI:', e);
    }
  }

  // 2. Fallback to Semantic Scholar if Google Scholar failed or missed some publications
  for (const pub of publications) {
    if (newCounts[pub.id] === undefined && pub.doi) {
      try {
        const cleanDoi = pub.doi.replace(/^https?:\/\/doi\.org\//, '');
        const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/DOI:${cleanDoi}?fields=citationCount`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.citationCount === 'number') {
            newCounts[pub.id] = data.citationCount;
          }
        }
      } catch (e) {
        console.warn(`[CitationSync] Failed to fetch DOI for ${pub.id}:`, e);
      }
    }
  }

  return newCounts;
}
