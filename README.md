# Mozaddid Ul Hoque Babar — Academic & Research Portfolio

A modern, high-performance academic and research portfolio website with a built-in Administrative Management Console, dynamic database storage, real-time section reordering and customization, automated CV generation & management, and Google Scholar/Semantic Scholar paper import.

---

## 🛠 Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide Icons
- **Backend:** Node.js, Express, Vite middleware in dev, ESBuild bundled server in production
- **Database:** Local JSON Database (`data/portfolio_db.json`) with auto-sync and snapshot backup/import
- **PDF Generation:** HTML2PDF / jsPDF for automated dynamic academic CV downloads

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd babar-portfolio

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Configure Credentials (.env)
Edit `.env` to configure your admin dashboard login:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
PORT=3100
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3100](http://localhost:3100) in your browser.

---

## 💾 Database & Persistence

All website data is persisted in:
```
data/portfolio_db.json
```
This includes:
- Personal Profile, Bio, Contact Information & Social Links
- Publications with BibTeX, DOIs, and abstracts
- Research Pillars & Focus Areas
- Career Experiences, Academic Education & Progressive Timeline
- Engineering & Applied AI Projects
- Technical Proficiencies & Skills
- Distinctions, Honors, Awards & Achievements
- Certifications, Professional Workshops & Trainings
- Academic & Professional References
- Section Layouts, Titles, Eyebrow Badges, Descriptions, and Ordering
- Contact Form Messages

### Database Backups:
From **Admin Dashboard > Settings Tab**, you can:
- **Export Backup:** Download a full JSON snapshot of your portfolio database.
- **Import Backup:** Restore your entire portfolio instantly from any exported JSON snapshot.
- **Reset Database:** Reset to default portfolio template state.

---

## 🌐 Deployment Guide

Because the application is a **full-stack Node.js + Express** app that persists data to `data/portfolio_db.json`, you should deploy to platforms that support Node.js containers with **persistent disk storage** so data edits made through the Admin Console persist across restarts.

### Option 1: Render.com (Recommended — Fast & Simple)
1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start` (or `node dist/server.cjs`)
5. Add Environment Variables:
   - `ADMIN_USERNAME`: your admin username
   - `ADMIN_PASSWORD`: your secure password
   - `NODE_ENV`: `production`
6. *(Important for persistent disk)*: Under **Disks**, add a Persistent Disk mounted at `/data` so database updates made through the Admin Console are never lost on redeploys.

### Option 2: Railway.app (Excellent & Fast)
1. Go to [Railway](https://railway.app/) and create a **New Project**.
2. Select **Deploy from GitHub repo**.
3. In settings, add a **Persistent Volume** mounted at `/data`.
4. Configure variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
5. Railway will automatically detect the `package.json` scripts and run `npm run build` followed by `npm run start`.

### Option 3: VPS (DigitalOcean Droplet, Hetzner, AWS EC2, Linode)
1. Connect via SSH to your server.
2. Clone repository and run:
   ```bash
   npm install
   npm run build
   ```
3. Use **PM2** to run the app in background:
   ```bash
   npm install -g pm2
   pm2 start dist/server.cjs --name "babar-portfolio"
   pm2 save
   pm2 startup
   ```
4. Set up Nginx as reverse proxy with SSL (Let's Encrypt / Certbot) directing port 80/443 to `localhost:3100`.

### Option 4: Docker
You can build and run using the included `Dockerfile`:
```bash
docker build -t babar-portfolio .
docker run -d -p 3100:3100 -v $(pwd)/data:/app/data --env-file .env babar-portfolio
```

> **Note regarding Vercel / Netlify:**
> Standard serverless platforms have ephemeral, read-only file systems in production functions. Changes saved via the Admin Console would not persist across serverless invocations unless connected to an external cloud database. For zero-config out-of-the-box persistence, **Render**, **Railway**, or a **VPS** is strongly recommended.

---

## 🛠 Available Scripts

- `npm run dev`: Launch fullstack Vite development server with hot-reload.
- `npm run build`: Compile production Vite frontend assets and bundle Express backend.
- `npm run start`: Launch production server (`node dist/server.cjs`).
- `npm run lint`: Run TypeScript type checking.
