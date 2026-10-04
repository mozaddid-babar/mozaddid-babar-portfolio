import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { createServer as createViteServer } from 'vite';
import { db, reloadEnvironmentVariables } from './src/server/db.ts';

// Load environment variables (.env.local overrides .env)
reloadEnvironmentVariables();
import { 
  parseBibTeX, 
  scrapeGoogleScholar, 
  fetchSemanticScholarPapers, 
  fetchByDOI 
} from './src/server/academicImporter.ts';

// In-memory token store for sessions
const ACTIVE_SESSIONS = new Map<string, { username: string; expiresAt: number }>();

function generateToken(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // Token valid for 7 days
  ACTIVE_SESSIONS.set(token, {
    username,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  return token;
}

function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);

  if (!session) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }

  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({ success: false, message: 'Session has expired.' });
  }

  (req as any).user = session;
  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3100;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- Public APIs ---
  app.get('/api/health', (req: Request, res: Response) => {
    const dbStatus = db.getDatabaseStatus();
    res.json({ 
      status: 'ok', 
      dbMode: dbStatus.mode, 
      connectedToCloudDb: dbStatus.connected,
      timestamp: new Date().toISOString() 
    });
  });

  // Get public portfolio content
  app.get('/api/portfolio', (req: Request, res: Response) => {
    try {
      const data = db.getPublicData();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get publications list directly
  app.get('/api/publications', (req: Request, res: Response) => {
    try {
      const publications = db.getPublications();
      res.json({ success: true, data: publications });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get sections configuration
  app.get('/api/sections', (req: Request, res: Response) => {
    try {
      const sections = db.getSections();
      res.json({ success: true, data: sections });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get research pillars
  app.get('/api/research-pillars', (req: Request, res: Response) => {
    try {
      const pillars = db.getResearchPillars();
      res.json({ success: true, data: pillars });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public contact message submission
  app.post('/api/contact', (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }

      const created = db.addMessage({ name, email, subject: subject || '', message });
      res.status(201).json({
        success: true,
        message: 'Your message has been delivered successfully. Thank you for reaching out!',
        data: created
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }

      const isValid = db.verifyAdmin(username, password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid username or password credentials.' });
      }

      const token = generateToken(username);
      res.json({
        success: true,
        token,
        user: { username, role: 'admin' },
        message: 'Authentication successful.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Auth: Verify token
  app.get('/api/auth/me', verifyAuth, (req: Request, res: Response) => {
    const session = (req as any).user;
    res.json({ success: true, user: { username: session.username, role: 'admin' } });
  });

  // Auth: Update credentials (disabled in favor of environment variables)
  app.post('/api/auth/update-credentials', verifyAuth, (_req: Request, res: Response) => {
    return res.status(403).json({
      success: false,
      message: 'Direct credential modification is disabled. Admin username and password must be configured via environment variables (ADMIN_USERNAME & ADMIN_PASSWORD).'
    });
  });

  // --- Scholar Sync API ---
  app.get('/api/scholar/sync', async (req: Request, res: Response) => {
    try {
      const scholarUrl = req.query.url as string;
      if (!scholarUrl) {
        return res.status(400).json({ success: false, message: 'Google Scholar URL is required.' });
      }

      // We'll use cheerio to scrape the public Google Scholar profile
      
      const response = await fetch(scholarUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Scholar responded with status: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const citationsMap: Record<string, number> = {};
      
      // Parse the table rows containing papers
      $('.gsc_a_tr').each((i: number, el: any) => {
        const title = $(el).find('.gsc_a_at').text().trim();
        const citationText = $(el).find('.gsc_a_ac').text().trim();
        const citationCount = parseInt(citationText, 10);
        
        if (title && !isNaN(citationCount)) {
          citationsMap[title.toLowerCase()] = citationCount;
        }
      });

      res.json({ success: true, data: citationsMap, message: 'Successfully fetched citations from Google Scholar.' });
    } catch (err: any) {
      console.error("Scholar sync error:", err.message);
      // Fallback response so frontend doesn't crash, since Google often returns 429
      res.status(500).json({ 
        success: false, 
        message: 'Could not reach Google Scholar directly. It may be temporarily blocking automated requests.', 
        error: err.message 
      });
    }
  });

  // --- Protected Admin CRUD Endpoints ---
  app.get('/api/admin/data', verifyAuth, (req: Request, res: Response) => {
    try {
      const fullData = db.getFullData();
      res.json({ success: true, data: fullData });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Profile update
  app.put('/api/admin/profile', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateProfile(req.body);
      res.json({ success: true, data: updated, message: 'Profile information updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // CV Settings update (mode: 'auto' | 'manual', manual PDF upload)
  app.put('/api/admin/cv-settings', verifyAuth, (req: Request, res: Response) => {
    try {
      const { cvSettings } = req.body;
      if (!cvSettings) {
        return res.status(400).json({ success: false, message: 'cvSettings object is required.' });
      }
      const updated = db.updateCvSettings(cvSettings);
      res.json({ success: true, data: updated, message: 'CV settings updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public CV direct download endpoint (serves manual PDF if active, or signals auto mode)
  app.get('/api/cv/download', (req: Request, res: Response) => {
    try {
      const cvSettings = db.getCvSettings();
      if (cvSettings.downloadMode === 'manual' && cvSettings.manualCvUrl) {
        if (cvSettings.manualCvUrl.startsWith('data:application/pdf;base64,')) {
          const base64Data = cvSettings.manualCvUrl.replace(/^data:application\/pdf;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = cvSettings.manualCvFileName || 'Curriculum_Vitae.pdf';
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          return res.send(buffer);
        } else if (cvSettings.manualCvUrl.startsWith('http')) {
          return res.redirect(cvSettings.manualCvUrl);
        }
      }
      res.json({ success: true, mode: 'auto' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Publications CRUD
  app.post('/api/admin/publications', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, authors, venue, year, category } = req.body;
      if (!title || !authors || !venue || !year || !category) {
        return res.status(400).json({ success: false, message: 'Title, authors, venue, year, and category are required.' });
      }
      const created = db.addPublication(req.body);
      res.status(201).json({ success: true, data: created, message: 'Publication created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/publications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updatePublication(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Publication not found.' });
      }
      res.json({ success: true, data: updated, message: 'Publication updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/publications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deletePublication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Publication not found.' });
      }
      res.json({ success: true, message: 'Publication deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Automated Publication Importer: Parse BibTeX
  app.post('/api/admin/publications/parse-bibtex', verifyAuth, (req: Request, res: Response) => {
    try {
      const { bibtex } = req.body;
      if (!bibtex || typeof bibtex !== 'string') {
        return res.status(400).json({ success: false, message: 'BibTeX string is required.' });
      }

      const parsed = parseBibTeX(bibtex);
      const existingPubs = db.getPublications();
      const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

      const enriched = parsed.map(item => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || '').trim().toLowerCase();
        const existing = existingPubs.find(p => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });

        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : undefined
        };
      });

      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
        message: `Parsed ${enriched.length} publications from BibTeX.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Automated Publication Importer: Fetch from Academic Providers (Scholar / Semantic Scholar / DOI)
  app.post('/api/admin/publications/fetch-academic', verifyAuth, async (req: Request, res: Response) => {
    try {
      const { source, query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Search query or URL is required.' });
      }

      let papers: any[] = [];
      let sourceName = source;
      let notes = '';

      if (source === 'scholar') {
        try {
          papers = await scrapeGoogleScholar(query);
          sourceName = 'Google Scholar Profile';
        } catch (scholarErr: any) {
          console.warn('Google Scholar direct scrape failed, attempting Semantic Scholar fallback:', scholarErr.message);
          // Try to extract author name from query if possible
          const fallbackResult = await fetchSemanticScholarPapers(query);
          papers = fallbackResult.papers;
          sourceName = 'Semantic Scholar (Scholar Scrape Fallback)';
          notes = 'Google Scholar rate-limited automated requests; automatically retrieved via Semantic Scholar Open API.';
        }
      } else if (source === 'semanticscholar') {
        const result = await fetchSemanticScholarPapers(query);
        papers = result.papers;
        sourceName = 'Semantic Scholar Graph API';
      } else if (source === 'doi') {
        // query could be comma or newline separated DOIs
        const dois = query.split(/[\n,;]+/).map(d => d.trim()).filter(Boolean);
        for (const singleDoi of dois) {
          try {
            const paper = await fetchByDOI(singleDoi);
            papers.push(paper);
          } catch (doiErr: any) {
            console.warn(`DOI fetch failed for ${singleDoi}:`, doiErr.message);
          }
        }
        sourceName = 'CrossRef / OpenAlex DOI Lookup';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid source. Supported: scholar, semanticscholar, doi' });
      }

      const existingPubs = db.getPublications();
      const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

      const enriched = papers.map(item => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || '').trim().toLowerCase();
        const existing = existingPubs.find(p => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });

        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : undefined
        };
      });

      res.json({
        success: true,
        source: sourceName,
        count: enriched.length,
        notes: notes || undefined,
        data: enriched,
        message: `Retrieved ${enriched.length} publications from ${sourceName}.`
      });
    } catch (err: any) {
      console.error('Fetch academic error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch publications from academic source.' });
    }
  });

  // Automated Publication Importer: Bulk Import into Database
  app.post('/api/admin/publications/bulk-import', verifyAuth, (req: Request, res: Response) => {
    try {
      const { publications: itemsToImport, updateExisting = true } = req.body;
      if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'An array of publications is required.' });
      }

      const result = db.bulkImportPublications(itemsToImport, { updateExisting });
      res.json({
        success: true,
        data: result,
        message: `Successfully imported: ${result.addedCount} new papers added, ${result.updatedCount} existing papers updated.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Projects CRUD
  app.post('/api/admin/projects', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, category, description } = req.body;
      if (!title || !category || !description) {
        return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
      }
      const created = db.addProject(req.body);
      res.status(201).json({ success: true, data: created, message: 'Project created successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/projects/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateProject(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      res.json({ success: true, data: updated, message: 'Project updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/projects/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Experience CRUD
  app.post('/api/admin/experience', verifyAuth, (req: Request, res: Response) => {
    try {
      const { role, organization, period, description } = req.body;
      if (!role || !organization || !period) {
        return res.status(400).json({ success: false, message: 'Role, organization, and period are required.' });
      }
      const created = db.addExperience(req.body);
      res.status(201).json({ success: true, data: created, message: 'Experience record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/experience/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateExperience(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Experience not found.' });
      }
      res.json({ success: true, data: updated, message: 'Experience record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/experience/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteExperience(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Experience not found.' });
      }
      res.json({ success: true, message: 'Experience record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Education CRUD
  app.post('/api/admin/education', verifyAuth, (req: Request, res: Response) => {
    try {
      const { degree, institution, year } = req.body;
      if (!degree || !institution || !year) {
        return res.status(400).json({ success: false, message: 'Degree, institution, and year are required.' });
      }
      const created = db.addEducation(req.body);
      res.status(201).json({ success: true, data: created, message: 'Education record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/education/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateEducation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Education not found.' });
      }
      res.json({ success: true, data: updated, message: 'Education record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/education/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteEducation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Education not found.' });
      }
      res.json({ success: true, message: 'Education record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Training CRUD
  app.post('/api/admin/trainings', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: 'Title, issuer, and year are required.' });
      }
      const created = db.addTraining(req.body);
      res.status(201).json({ success: true, data: created, message: 'Training record added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/trainings/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateTraining(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Training record not found.' });
      }
      res.json({ success: true, data: updated, message: 'Training record updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/trainings/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteTraining(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Training record not found.' });
      }
      res.json({ success: true, message: 'Training record deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Certifications CRUD
  app.post('/api/admin/certifications', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: 'Title, issuer, and year are required.' });
      }
      const created = db.addCertification(req.body);
      res.status(201).json({ success: true, data: created, message: 'Certification added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


  app.put('/api/admin/certifications/reorder', verifyAuth, (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'orderedIds must be an array of strings' });
      }
      const updated = db.reorderCertifications(orderedIds);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/certifications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateCertification(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Certification not found.' });
      }
      res.json({ success: true, data: updated, message: 'Certification updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/certifications/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteCertification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Certification not found.' });
      }
      res.json({ success: true, message: 'Certification deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


  // --- Awards ---
  app.post('/api/admin/awards', verifyAuth, (req: Request, res: Response) => {
    try {
      const added = db.addAward(req.body);
      res.json({ success: true, data: added });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/awards/reorder', verifyAuth, (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      const updated = db.reorderAwards(orderedIds);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/awards/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateAward(req.params.id, req.body);
      if (updated) res.json({ success: true, data: updated });
      else res.status(404).json({ success: false, message: 'Not found' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/awards/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteAward(req.params.id);
      if (deleted) res.json({ success: true });
      else res.status(404).json({ success: false, message: 'Not found' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Achievements CRUD
  app.post('/api/admin/achievements', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required.' });
      }
      const created = db.addAchievement(req.body);
      res.status(201).json({ success: true, data: created, message: 'Achievement added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

    app.put('/api/admin/achievements/reorder', verifyAuth, (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'orderedIds must be an array of strings' });
      }
      const updated = db.reorderAchievements(orderedIds);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/achievements/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateAchievement(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Achievement not found.' });
      }
      res.json({ success: true, data: updated, message: 'Achievement updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/achievements/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteAchievement(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Achievement not found.' });
      }
      res.json({ success: true, message: 'Achievement deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Affiliations CRUD
  app.post('/api/admin/affiliations', verifyAuth, (req: Request, res: Response) => {
    try {
      const { organization, role } = req.body;
      if (!organization || !role) {
        return res.status(400).json({ success: false, message: 'Organization and role are required.' });
      }
      const created = db.addAffiliation(req.body);
      res.status(201).json({ success: true, data: created, message: 'Affiliation added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/affiliations/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateAffiliation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Affiliation not found.' });
      }
      res.json({ success: true, data: updated, message: 'Affiliation updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/affiliations/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteAffiliation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Affiliation not found.' });
      }
      res.json({ success: true, message: 'Affiliation deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Volunteer Work CRUD
  app.post('/api/admin/volunteer', verifyAuth, (req: Request, res: Response) => {
    try {
      const created = db.addVolunteerWork(req.body);
      res.status(201).json({ success: true, data: created, message: 'Volunteer engagement added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/volunteer/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateVolunteerWork(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Volunteer engagement not found.' });
      }
      res.json({ success: true, data: updated, message: 'Volunteer engagement updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/volunteer/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteVolunteerWork(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Volunteer engagement not found.' });
      }
      res.json({ success: true, message: 'Volunteer engagement deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // References CRUD
  app.post('/api/admin/references', verifyAuth, (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const created = db.addReference(req.body);
      res.status(201).json({ success: true, data: created, message: 'Reference added.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/references/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateReference(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Reference not found.' });
      }
      res.json({ success: true, data: updated, message: 'Reference updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/references/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteReference(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Reference not found.' });
      }
      res.json({ success: true, message: 'Reference deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Skills Group Update
  app.put('/api/admin/skills', verifyAuth, (req: Request, res: Response) => {
    try {
      const { skillGroups } = req.body;
      if (!Array.isArray(skillGroups)) {
        return res.status(400).json({ success: false, message: 'skillGroups array is required.' });
      }
      const updated = db.updateSkillGroups(skillGroups);
      res.json({ success: true, data: updated, message: 'Skills updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Research Pillars Endpoints ---
  app.get('/api/admin/research-pillars', verifyAuth, (req: Request, res: Response) => {
    try {
      const pillars = db.getResearchPillars();
      res.json({ success: true, data: pillars });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/research-pillars', verifyAuth, (req: Request, res: Response) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required.' });
      }
      const created = db.addResearchPillar(req.body);
      res.status(201).json({ success: true, data: created, message: 'Research focus area added successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/research-pillars/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.updateResearchPillar(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Research focus area not found.' });
      }
      res.json({ success: true, data: updated, message: 'Research focus area updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/research-pillars/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteResearchPillar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Research focus area not found.' });
      }
      res.json({ success: true, message: 'Research focus area deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/research-pillars-reorder', verifyAuth, (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
      }
      const reordered = db.reorderResearchPillars(orderedIds);
      res.json({ success: true, data: reordered, message: 'Research focus areas reordered.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Messages Management
  app.get('/api/admin/messages', verifyAuth, (req: Request, res: Response) => {
    try {
      const messages = db.getMessages();
      res.json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.patch('/api/admin/messages/:id/read', verifyAuth, (req: Request, res: Response) => {
    try {
      const updated = db.toggleMessageRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
      }
      res.json({ success: true, data: updated, message: 'Message status updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/messages/:id', verifyAuth, (req: Request, res: Response) => {
    try {
      const deleted = db.deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
      }
      res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Section Ordering & Visibility Endpoints ---
  app.get('/api/admin/sections', verifyAuth, (req: Request, res: Response) => {
    try {
      const sections = db.getSections();
      res.json({ success: true, data: sections });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/sections', verifyAuth, (req: Request, res: Response) => {
    try {
      const { sections } = req.body;
      if (!Array.isArray(sections)) {
        return res.status(400).json({ success: false, message: 'sections array is required.' });
      }
      const updated = db.updateSections(sections);
      res.json({ success: true, data: updated, message: 'Sections configuration updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/sections/reorder', verifyAuth, (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
      }
      const updated = db.reorderSections(orderedIds);
      res.json({ success: true, data: updated, message: 'Sections reordered successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.patch('/api/admin/sections/:id/visibility', verifyAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { field, value } = req.body;
      const allowedFields = ['showInFrontend', 'showInCv', 'showTitle', 'showTopText', 'showDescription'];
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid field specified. Must be one of: ${allowedFields.join(', ')}` 
        });
      }
      const updated = db.toggleSectionVisibility(id, field, Boolean(value));
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Section not found.' });
      }
      res.json({ success: true, data: updated, message: 'Section visibility updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/sections/reset', verifyAuth, (req: Request, res: Response) => {
    try {
      const reset = db.resetSections();
      res.json({ success: true, data: reset, message: 'Sections reset to default order and visibility.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Database Backup, Import, and Reset
  app.post('/api/admin/db/reset', verifyAuth, (req: Request, res: Response) => {
    try {
      const resetData = db.resetToDefault();
      res.json({ success: true, data: resetData, message: 'Database reset to default template state.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/db/import', verifyAuth, (req: Request, res: Response) => {
    try {
      const imported = req.body;
      db.importDatabase(imported);
      res.json({ success: true, message: 'Database imported and restored successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: `Import error: ${err.message}` });
    }
  });

  // Cloud Database Status & Diagnostics
  app.get('/api/admin/db/status', verifyAuth, (req: Request, res: Response) => {
    try {
      const status = db.getDatabaseStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Reconnect / Test Cloud MongoDB Atlas Connection
  app.post('/api/admin/db/reconnect', verifyAuth, async (req: Request, res: Response) => {
    try {
      const connected = await db.reconnectMongo();
      const status = db.getDatabaseStatus();
      res.json({
        success: true,
        connected,
        data: status,
        message: connected
          ? 'Successfully connected and synchronized with MongoDB Atlas cluster!'
          : (status.hasUri
              ? `Connection failed: ${status.error || 'Please verify cluster credentials, database user, and IP Access List (0.0.0.0/0).'}`
              : 'No MONGODB_URI found. Add MONGODB_URI in your environment or .env.local file.')
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // --- Vite / Static Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();
