import * as cheerio from 'cheerio';
import { Publication } from '../types';

export interface ParsedPublicationItem extends Omit<Publication, 'id'> {
  tempId?: string;
  source?: string;
  existsInDb?: boolean;
  existingId?: string;
}

// Clean LaTeX characters
function cleanLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\['"`^~=.](\w)/g, '$1')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\#/g, '#')
    .replace(/\{([^{}]+)\}/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Format BibTeX author string ("Last, First and Last2, First2") to ("First Last, First2 Last2")
function formatBibtexAuthors(authorField: string): string {
  if (!authorField) return '';
  const cleaned = cleanLatex(authorField);
  const authorsList = cleaned.split(/\s+and\s+/i).map(a => a.trim()).filter(Boolean);
  
  const formatted = authorsList.map(author => {
    if (author.includes(',')) {
      const parts = author.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        return `${parts[1]} ${parts[0]}`.trim();
      }
    }
    return author;
  });

  return formatted.join(', ');
}

// Parse Raw BibTeX text into publication objects
export function parseBibTeX(rawBibtex: string): ParsedPublicationItem[] {
  if (!rawBibtex || typeof rawBibtex !== 'string') return [];

  const results: ParsedPublicationItem[] = [];
  // Regex to match BibTeX entries: @type{key, fields...}
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]*)\s*,([\s\S]*?)(?=\n@|\s*$)/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(rawBibtex)) !== null) {
    const entryType = match[1].toLowerCase();
    const citeKey = match[2].trim();
    const body = match[3];

    // Parse fields
    const fields: Record<string, string> = {};
    const fieldRegex = /([a-zA-Z_-]+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)"|([^\s,}]+))/g;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase().trim();
      const val = fieldMatch[2] ?? fieldMatch[3] ?? fieldMatch[4] ?? '';
      fields[fieldName] = cleanLatex(val);
    }

    const title = fields['title'] || fields['booktitle'] || citeKey || 'Untitled Publication';
    const authors = formatBibtexAuthors(fields['author'] || fields['authors'] || fields['editor'] || '');
    const venue = fields['journal'] || fields['journaltitle'] || fields['booktitle'] || fields['school'] || fields['institution'] || fields['publisher'] || fields['series'] || 'Academic Publication';
    
    let year = parseInt(fields['year'] || '', 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      year = new Date().getFullYear();
    }

    // Determine category
    let category: Publication['category'] = 'Journal';
    if (entryType === 'article') {
      category = 'Journal';
    } else if (entryType === 'inproceedings' || entryType === 'conference' || entryType === 'proceedings') {
      category = 'Conference';
    } else if (entryType === 'book' || entryType === 'incollection' || entryType === 'inbook') {
      category = 'Book Chapter';
    } else if (entryType === 'techreport' || entryType === 'misc' || entryType === 'unpublished' || entryType === 'preprint') {
      const lowerVenue = venue.toLowerCase();
      if (lowerVenue.includes('arxiv') || lowerVenue.includes('biorxiv') || lowerVenue.includes('chemrxiv') || lowerVenue.includes('ssrn') || lowerVenue.includes('preprint')) {
        category = 'Preprint';
      } else if (lowerVenue.includes('workshop')) {
        category = 'Workshop';
      } else {
        category = 'Journal';
      }
    }

    const doi = fields['doi'] || '';
    let link = fields['url'] || (doi ? `https://doi.org/${doi}` : '');
    const pdfUrl = fields['pdf'] || fields['pdfurl'] || fields['eprint'] || '';
    const abstract = fields['abstract'] || fields['note'] || '';
    const citations = parseInt(fields['citations'] || fields['citationcount'] || '0', 10) || 0;

    // Build standard bibtex string
    const bibtexSnippet = `@${entryType}{${citeKey || 'pub_' + year},
  title = {${fields['title'] || title}},
  author = {${fields['author'] || authors}},
  ${category === 'Journal' ? 'journal' : 'booktitle'} = {${venue}},
  year = {${year}}${doi ? `,\n  doi = {${doi}}` : ''}${fields['volume'] ? `,\n  volume = {${fields['volume']}}` : ''}${fields['pages'] ? `,\n  pages = {${fields['pages']}}` : ''}
}`;

    results.push({
      title,
      authors: authors || 'Unknown Authors',
      venue,
      year,
      category,
      doi,
      link,
      pdfUrl,
      abstract,
      citations,
      featured: false,
      tags: [],
      bibtex: bibtexSnippet,
      source: 'BibTeX File'
    });
  }

  return results;
}

// Scrape Google Scholar public profile
export async function scrapeGoogleScholar(scholarUrlOrId: string): Promise<ParsedPublicationItem[]> {
  let targetUrl = scholarUrlOrId.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://scholar.google.com/citations?user=${encodeURIComponent(targetUrl)}&hl=en&pagesize=100`;
  } else if (!targetUrl.includes('pagesize=')) {
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'pagesize=100&cstart=0';
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Scholar responded with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ParsedPublicationItem[] = [];

  const trElements = $('.gsc_a_tr').toArray();
  for (const el of trElements) {
    const titleEl = $(el).find('.gsc_a_at');
    const title = titleEl.text().trim();
    const relativeLink = titleEl.attr('href');
    const link = relativeLink ? `https://scholar.google.com${relativeLink}` : '';

    const grayDivs = $(el).find('.gs_gray');
    const authors = grayDivs.eq(0).text().trim() || 'Unknown Authors';
    const venueRaw = grayDivs.eq(1).text().trim() || 'Google Scholar Publication';

    const citationText = $(el).find('.gsc_a_ac').text().trim();
    const citations = parseInt(citationText, 10) || 0;

    const yearText = $(el).find('.gsc_a_y').text().trim();
    const year = parseInt(yearText, 10) || new Date().getFullYear();

    let category: Publication['category'] = 'Journal';
    const lowerVenue = venueRaw.toLowerCase();
    if (lowerVenue.includes('conference') || lowerVenue.includes('proceedings') || lowerVenue.includes('symposium') || lowerVenue.includes('ieee') || lowerVenue.includes('icre')) {
      category = 'Conference';
    } else if (lowerVenue.includes('arxiv') || lowerVenue.includes('biorxiv') || lowerVenue.includes('preprint')) {
      category = 'Preprint';
    } else if (lowerVenue.includes('book') || lowerVenue.includes('chapter')) {
      category = 'Book Chapter';
    } else if (lowerVenue.includes('workshop')) {
      category = 'Workshop';
    }

    if (title) {
      let abstract = '';
      if (link) {
        try {
          const absRes = await fetch(link, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });
          if (absRes.ok) {
            const absHtml = await absRes.text();
            const abs$ = cheerio.load(absHtml);
            abstract = abs$('#gsc_oci_title').parent().find('.gsh_csp').text().trim() || abs$('#gsc_vcd_descr').text().trim() || abs$('.gsh_csp').text().trim() || abs$('#gsc_oci_descr').text().trim();
          }
          await new Promise(r => setTimeout(r, 800)); // Be polite to Google Scholar
        } catch (e) {
           // Skip errors
        }
      }

      items.push({
        title,
        authors,
        venue: venueRaw,
        year,
        category,
        doi: '',
        link,
        pdfUrl: '',
        abstract,
        citations,
        featured: false,
        tags: [],
        bibtex: `@article{scholar_${year}_${title.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '_')},\n  title = {${title}},\n  author = {${authors}},\n  journal = {${venueRaw}},\n  year = {${year}}\n}`,
        source: 'Google Scholar'
      });
    }
  }

  return items;
}

// Fetch from Semantic Scholar API (Open & Highly reliable)
export async function fetchSemanticScholarPapers(authorQueryOrId: string): Promise<{ authorName?: string; papers: ParsedPublicationItem[] }> {
  let authorId = authorQueryOrId.trim();
  let authorName: string | undefined;

  // Check if query is an author name rather than numeric/hex ID
  if (!/^\d+$/.test(authorId) && !/^[a-f0-9]{40}$/i.test(authorId)) {
    // Search author
    const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorId)}&fields=name,paperCount,citationCount,hIndex`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`Semantic Scholar author search failed: ${searchRes.statusText}`);
    }
    const searchJson = await searchRes.json();
    if (!searchJson.data || searchJson.data.length === 0) {
      return { papers: [] };
    }
    authorId = searchJson.data[0].authorId;
    authorName = searchJson.data[0].name;
  }

  const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,authors,venue,year,citationCount,openAccessPdf,externalIds,abstract,publicationTypes,url,publicationDate&limit=100`;
  const papersRes = await fetch(papersUrl);
  if (!papersRes.ok) {
    throw new Error(`Semantic Scholar papers fetch failed: ${papersRes.statusText}`);
  }

  const papersJson = await papersRes.json();
  const rawList = papersJson.data || [];
  const parsedItems: ParsedPublicationItem[] = [];

  for (const item of rawList) {
    if (!item.title) continue;

    const authorsStr = (item.authors || []).map((a: any) => a.name).join(', ') || 'Unknown Authors';
    const doi = item.externalIds?.DOI || '';
    const link = item.url || (doi ? `https://doi.org/${doi}` : '');
    const pdfUrl = item.openAccessPdf?.url || '';
    const year = item.year || new Date().getFullYear();
    const venue = item.venue || 'Academic Journal / Conference';
    
    // Categorization
    let category: Publication['category'] = 'Journal';
    const pubTypes: string[] = item.publicationTypes || [];
    if (pubTypes.includes('Conference') || pubTypes.includes('JournalArticle') === false && venue.toLowerCase().includes('conference')) {
      category = 'Conference';
    } else if (pubTypes.includes('Book') || pubTypes.includes('BookSection')) {
      category = 'Book Chapter';
    } else if (pubTypes.includes('Review')) {
      category = 'Journal';
    }

    const bibKey = `s2_${year}_${(item.title || 'paper').substring(0, 12).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const bibtex = `@article{${bibKey},
  title = {${item.title}},
  author = {${authorsStr}},
  journal = {${venue}},
  year = {${year}}${doi ? `,\n  doi = {${doi}}` : ''}
}`;

    parsedItems.push({
      title: item.title,
      authors: authorsStr,
      venue,
      year,
      category,
      doi,
      link,
      pdfUrl,
      abstract: item.abstract || '',
      citations: item.citationCount || 0,
      featured: false,
      tags: [],
      bibtex,
      source: 'Semantic Scholar'
    });
  }

  return { authorName, papers: parsedItems };
}

// Fetch single or multiple publications by DOI using CrossRef / OpenAlex
export async function fetchByDOI(doiString: string): Promise<ParsedPublicationItem> {
  const cleanDoi = doiString.trim().replace(/^https?:\/\/doi\.org\//i, '');
  const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EnergySystemsPortfolio/1.0 (mailto:admin@academic-portfolio.app)'
    }
  });

  if (!res.ok) {
    throw new Error(`CrossRef lookup failed for DOI ${cleanDoi}: ${res.statusText}`);
  }

  const json = await res.json();
  const work = json.message;
  if (!work) {
    throw new Error(`No metadata found for DOI ${cleanDoi}`);
  }

  const title = (work.title && work.title[0]) ? cleanLatex(work.title[0]) : 'Untitled';
  const authors = (work.author || []).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', ') || 'Unknown Authors';
  const venue = (work['container-title'] && work['container-title'][0]) || work.publisher || 'Academic Venue';
  
  let year = new Date().getFullYear();
  if (work['published-print']?.['date-parts']?.[0]?.[0]) {
    year = work['published-print']['date-parts'][0][0];
  } else if (work['published-online']?.['date-parts']?.[0]?.[0]) {
    year = work['published-online']['date-parts'][0][0];
  } else if (work.issued?.['date-parts']?.[0]?.[0]) {
    year = work.issued['date-parts'][0][0];
  }

  let category: Publication['category'] = 'Journal';
  if (work.type === 'proceedings-article') {
    category = 'Conference';
  } else if (work.type === 'book-chapter') {
    category = 'Book Chapter';
  } else if (work.type === 'posted-content' || work.subtype === 'preprint') {
    category = 'Preprint';
  }

  const abstract = work.abstract ? cleanLatex(work.abstract.replace(/<[^>]*>/g, '')) : '';
  const citations = work['is-referenced-by-count'] || 0;
  const link = work.URL || `https://doi.org/${cleanDoi}`;

  const bibtex = `@article{doi_${cleanDoi.replace(/[^a-zA-Z0-9]/g, '_')},
  title = {${title}},
  author = {${authors}},
  journal = {${venue}},
  year = {${year}},
  doi = {${cleanDoi}}
}`;

  return {
    title,
    authors,
    venue,
    year,
    category,
    doi: cleanDoi,
    link,
    pdfUrl: '',
    abstract,
    citations,
    featured: false,
    tags: [],
    bibtex,
    source: 'CrossRef DOI'
  };
}
