# Portfolio Features & Generation Prompts

*Documentation of all updated features generated today, along with ready-to-use prompts for reproducing or extending them.*

---

## Part 1: Features Updated & Generated Today

### 1. Standard U.S. Ph.D. Scholarship Academic CV Generation
- **What it does**: Dynamically generates an authentic, high-density academic Curriculum Vitae matching the standard formatting used by U.S. doctoral candidates (modeled directly on **I K M Reaz Rahman** at UC Berkeley and **Md Abir Hossain** at Ohio State University).
- **Research Impact Summary Box**: Dedicated metrics panel displaying Google Scholar Citations, h-index, Journal Articles count, and Conference Papers count to give high academic credibility for early-career researchers.
- **Categorized Publications**: Automatically groups papers into Refereed Journal Articles (`[J1]`, `[J2]`), Peer-Reviewed Conference Proceedings (`[C1]`, `[C2]`), and Manuscripts Under Review / Preprints.
- **Candidate Name Highlighting**: Automatically bolds and underlines your name in author citations (e.g. `MUH Babar`).
- **Academic Layout Sections**: Research Profile & Interests, Education (with thesis & advisor), Research & Professional Experience, Featured Technical Projects, Technical Skills, Honors & Awards, Certifications & Workshops, Affiliations, and References.
- **Print-to-PDF Formatting**: Integrated `@media print` CSS ensuring 8.5" x 11" Letter margins, pure black-and-white contrast, and suppression of modal/site chrome.

### 2. Two-Tier Hide/Unhide (`showInCv`) Synchronization
- **What it does**: Ensures the generated CV strictly reflects the visibility switches configured in your Admin Console.
- **Section-Level Filtering**: If a section has `CV: Off` (`showInCv: false`) in Section Layout, that entire section is omitted from the CV.
- **Item-Level Filtering**: If an individual paper, skill, work experience, education entry, project, award, or certification has its toggle turned off, it is filtered out of the CV while remaining on the frontend (or vice versa).
- **Contact & Social Fields**: Custom contacts and social profiles respect their individual `showInCv` switches.

### 3. Frontend "View CV" Modal & Actions
- **What it does**: Replaces static external download links with a live interactive modal popup across the entire site.
- **Hero Section**: Upgraded action button from static link to an interactive "View CV" button.
- **Desktop Header**: Added a sleek "View CV" button in the top navigation bar right next to the dark-mode switch.
- **Mobile Drawer**: Added a full-width "View CV" option in the mobile menu.
- **Modal Controls**: Live document viewing, active section counter (`X sections active`), Print / Save as PDF button, and direct Download PDF button.

### 4. Modern Glassmorphic Horizon: Distinct Section Titles & Colors
- **What it does**: Eliminates monotonous, repetitive blue headings and matched cards across the site, giving every section its own jewel-toned identity.
- **Floating Frosted Badges**: Glowing pill badges with animated status beacons, category-tailored icons, and tracked uppercase labels.
- **Dual-Tone Gradient Headings**: Bold `<h2>` typography with dual-tone shimmer gradients and descriptive subtitles.
- **Dedicated Color Palettes**:
  - **Publications**: Sapphire & Indigo (`[ BookOpen | RESEARCH & SCHOLARLY WORKS ]`), dark charcoal titles, italic academic venue styling, neutral segmented filter pills.
  - **Projects**: Emerald & Mint Teal (`[ Code2 | ENGINEERING & APPLIED AI ]`).
  - **Skills & Capabilities**: Amethyst & Royal Violet (`[ Cpu | EXPERTISE & PROFICIENCIES ]`).
  - **Experience & Education**: Amber & Warm Gold (`[ Briefcase | CAREER & ACADEMIA ]`).
  - **Research Identity (About)**: Rose & Coral (`[ Sparkles | RESEARCH IDENTITY ]`).
  - **Certifications**: Cyan & Cerulean (`[ Award | PROFESSIONAL CREDENTIALS ]`).
  - **Honors & Activities**: Gold & Amber (`[ Trophy | DISTINCTIONS & ACADEMIC SERVICE ]`).
  - **Achievements**: Violet & Fuchsia (`[ Star | KEY MILESTONES & HONORS ]`).
  - **Volunteer Service**: Emerald & Forest (`[ HeartHandshake | COMMUNITY ENGAGEMENT ]`).
  - **References**: Indigo & Slate (`[ UserCheck | RECOMMENDATIONS & ADVISORS ]`).
  - **Contact**: Teal & Sage (`[ Send | COMMUNICATION & INQUIRIES ]`).

### 5. Calmer, Smoother Project Card Animations
- **What it does**: Replaces abrupt, fast snappy movements in the Projects section with smooth, deliberate pacing.
- Extended `duration` to `1.3s` with custom cubic bezier ease `[0.16, 1, 0.3, 1]`.
- Softened horizontal opposite-angle displacements from ±75px to ±50px with staggered `(idx % 2) * 0.16s` delays.

### 6. Dynamic Top Navigation Bar (Admin Layout Driven)
- **What it does**: Automatically reflects the sections enabled in the Admin Console layout layer.
- Organized into 4 clean primary groups: **Overview**, **Research**, **Work**, and **Contact**.
- **Adaptive Rendering**: Direct link if 1 sub-section is active; glassmorphic dropdown if multiple sub-sections are active; completely hidden if all are disabled.
- **Dynamic Reordering**: Automatically reorders to match the sequence of sections on the page.

---

## Part 2: Prompts to Generate These Features

### Prompt 1: Dynamic U.S. Ph.D. Academic CV Generation & Modal
```markdown
Create a dynamic Academic Curriculum Vitae (CV) generation system that builds a printable, standard U.S. Ph.D. scholarship application CV directly from the current portfolio profile data.

Requirements:
1. Target Academic Format: Model the layout after top engineering/CS doctoral candidate CVs (such as I K M Reaz Rahman at UC Berkeley and Md Abir Hossain at Ohio State University).
2. Layout & Typography:
   - Clean, formal header with candidate's full name in bold uppercase serif typography, academic headline, and a single-line contact bar (Email, Phone, Location, Google Scholar, ResearchGate, ORCID, GitHub, LinkedIn).
   - Research Profile & Core Research Interests paragraph.
   - Dedicated "Research Impact" summary box displaying Google Scholar Citations, h-index, Journal Articles count, and Conference Proceedings count to establish immediate credibility.
   - Categorized Publications: Group into Refereed Journal Articles ([J1], [J2]), Peer-Reviewed Conference Proceedings ([C1], [C2]), and Preprints / Manuscripts Under Review. Automatically bold and underline the candidate's name in author lists. Include full venue citations in italics, year, and clickable DOI hyperlinks.
   - Education: Reverse chronological order with Degree, Department, Institution, Dates, CGPA/Rank, Thesis topic, and Research Advisor.
   - Research & Professional Experience: Position, Lab/Company, Department, Dates, Location, and detailed bullet points describing methodologies and outcomes.
   - Technical Skills Matrix: Grouped by category (Programming Languages, Machine Learning & AI, Frameworks & Libraries, Tools & Platforms).
   - Awards, Certifications, Professional Affiliations, and Academic References.
3. Two-Tier Visibility Filtering:
   - Section Level: Respect `sec.showInCv !== false`. If a section is toggled off for CV, omit it completely.
   - Item Level: Respect `item.showInCv !== false` on every publication, skill, project, experience, award, and certificate.
4. "View CV" Integration:
   - Replace any static "Download Resume" links with a "View CV" button in the Hero section, Desktop Navbar, Mobile Drawer, and Admin Console.
   - Clicking "View CV" opens a modal popup displaying the live rendered CV document.
   - Inside the modal, provide a "Print / Save as PDF" button (triggering window.print()) and a "Download PDF" button.
   - Include print-specific CSS (@media print) so that printing from the modal hides all page/modal chrome and prints only the clean academic paper on standard Letter/A4 dimensions.
```

### Prompt 2: Modern Glassmorphic Horizon Section Headers & Jewel Palettes
```markdown
Redesign all section titles across the portfolio to replace monotonous, single-color headings with the "Modern Glassmorphic Horizon" design system. Each section should have its own distinct jewel-toned color identity:

1. Header Structure for Every Section:
   - A floating glassmorphic pill badge with a subtle frosted background (backdrop-blur-md), a border tinted to the section's accent color, an animated pulsing status dot, an icon from lucide-react, and tracked uppercase mono text (e.g. [ BookOpen | RESEARCH & SCHOLARLY WORKS ]).
   - A bold display title (<h2>) featuring a dual-tone gradient shimmer tailored to the section's domain.
   - A descriptive contextual subtitle explaining the section's contents.
2. Distinct Color Coding Per Section:
   - Publications: Sapphire & Deep Indigo theme. Change paper titles to crisp dark slate/white with subtle hover transitions, italicize academic venues, and use neutral segmented filter pills (removing solid blue blocks).
   - Projects: Emerald & Mint Teal theme.
   - Skills & Capabilities: Amethyst & Royal Violet theme.
   - Experience & Education: Amber & Warm Gold theme.
   - About / Identity: Rose & Coral theme.
   - Certifications: Cyan & Cerulean theme.
   - Honors & Activities: Gold & Amber theme.
   - Achievements: Violet & Fuchsia theme.
   - Volunteer Service: Emerald & Forest theme.
   - References: Indigo & Slate theme.
   - Contact: Teal & Sage theme.
3. Ensure high contrast in both Light Mode and Dark Mode, with clean responsive padding.
```

### Prompt 3: Calmer, Smoother Project Animations
```markdown
Adjust the scroll animations in the Projects section to be calmer, smoother, and cinematic:
1. Increase the animation duration to 1.3s with a custom cubic bezier ease [0.16, 1, 0.3, 1].
2. Soften opposite-angle and directional horizontal displacements from ±75px to ±50px.
3. Add staggered entry delays ((idx % 2) * 0.16s) between alternating project cards so they glide in gracefully without abrupt snapping.
```

### Prompt 4: Dynamic Admin-Driven Top Navigation Bar
```markdown
Refactor the top navigation bar to dynamically adapt to section visibility and ordering settings configured in the Admin Console:
1. Group sections into 4 concise top-level navigation items: Overview, Research, Work, and Contact.
2. Filter out any section where `showInFrontend === false` or where the section has no data.
3. Smart Nesting:
   - If only 1 sub-section in a group is active, the navigation item should be a direct link to that section.
   - If multiple sub-sections in a group are active, render a clean glassmorphic dropdown menu.
   - If all sub-sections in a group are hidden, hide that top-level navigation item completely.
4. Dynamic Ordering: The order of the 4 main navigation groups should dynamically match the order of sections on the page.
5. Update scrollspy observation so the active navigation indicator accurately highlights the current section as the user scrolls.
```
