# 💎 Premium Crystal Black Portfolio Website

A modern, responsive personal portfolio website with a **Crystal Black + Glassmorphism** aesthetic. Designed for software engineers, developers, and technology creators with an emphasis on minimalism, performance, and attention to detail.

---

## 🌟 Visual Theme & Design Tokens

- **Primary Background**: `#050505` (Deep Obsidian Black)
- **Secondary Background**: `#0A0A0C` (Graphite Shadow)
- **Glass Surfaces**: `rgba(255, 255, 255, 0.04)` with `backdrop-filter: blur(16px)`
- **Glass Borders**: `rgba(255, 255, 255, 0.12)` with silver specular reflection (`rgba(200, 208, 218, 0.35)`)
- **Primary Text**: `#F5F5F7`
- **Secondary Text**: `#A1A1AA`
- **Accent & Glow**: Cool Silver (`#C8D0DA`) & Platinum (`#E4E7EB`)
- **Typography**: Inter & Space Grotesk (Google Fonts)

---

## 📐 Website Architecture

1. **Section 1: Landing / Hero (`#hero`)**
   - **React Bits `<Galaxy />` WebGL2 Starfield**: Procedural GPU shader starfield with star glow, cross-flares, twinkle physics, cursor repulsion, and click-to-warp speed.
   - Translucent floating navigation bar with scrollspy active indicator
   - Monogram logo badge and brand name
   - Hero headline: *"Building Digital Experiences. Solving Real Problems."*
   - Interactive availability indicator badge
   - Two CTAs: *"Explore My Work"* and *"Let's Collaborate"*
   - Social connect strip (GitHub, LinkedIn, Email)
   - 3D Crystal Obsidian visual card with specular caustics and interactive *"Engage Warp"* trigger button

2. **Section 2: About Me (`#about`)**
   - Profile avatar with crystal glass frame and silver glow
   - Professional biography & first-principles problem-solving approach
   - Academic background card (Degree, Institution, Focus areas)
   - Areas of technical interest chips
   - Three highlight value cards: **Curiosity**, **Continuous Learning**, and **Innovation**

3. **Section 3: Skills & Technologies (`#skills`)**
   - Structured glass cards grouped into **6 core categories**:
     1. *Programming Languages* (TypeScript, JavaScript, Python, C++, Java, Go, SQL)
     2. *Web Development* (HTML5, Modern CSS3, Responsive Design, RESTful APIs, WebSockets, Performance)
     3. *Frameworks and Libraries* (React, Next.js, Tailwind CSS, Node.js, FastAPI, Three.js, Vite)
     4. *Databases* (PostgreSQL, MongoDB, Redis, MySQL, SQLite, Prisma)
     5. *Tools and Platforms* (Git & GitHub, Docker, Linux, AWS, Vercel, Postman, Figma)
     6. *Core Computer Science Concepts* (Data Structures & Algorithms, OOD, System Design, Concurrency, API Security)

4. **Section 4: Featured Projects (`#projects`)**
   - Filter tabs: *All Projects*, *Web Development*, *Software & Systems*, *Data Science & AI*
   - Project cards with 16:9 previews, problem statements, solutions, tech tags, and key achievements
   - Interactive *"Architecture & Details"* quick-view modal dialog
   - Direct GitHub repository and live demo links
   - Section CTA banner: *"Have an idea? Let's build it."*

5. **Section 5: Milestones & Experience (`#milestones`)**
   - Vertical silver timeline line with glowing nodes
   - Filter tabs: *All Milestones*, *Experience*, *Education*, *Events & Hackathons*
   - Chronological growth cards with dates, organization, and key accomplishments

6. **Section 6: Collaborate / Contact (`#collaborate`)**
   - Heading: *"Let's Create Something Meaningful."*
   - Interactive contact form with real-time field validation (Name, Email, Subject, Message)
   - Collaboration interest chips (Full-Stack, Open Source, Architecture, Roles, Technical Discussions)
   - 1-click email copy button with floating crystal toast notification
   - Direct channels: Email, LinkedIn, GitHub, Location & Timezone info

7. **Section 7: Footer**
   - Personal brand logo, quick navigation links, social links
   - Closing line: *"Designed with purpose. Built with curiosity."*
   - **React Bits `<SlingButton />` Integration**: Interactive physics-based rubberband slingshot button with particle burst and spring recoil that launches visitors smoothly back to the `#hero` landing page and triggers a warp speed jump!

---

## 🛠️ How to Customize Your Content

All personal content is organized inside [`assets/js/portfolio-data.js`](file:///c:/Users/nitin/OneDrive/Desktop/Portfolio/assets/js/portfolio-data.js).

Open that file to update:
- Your name, title, bio, email, and social profiles
- Profile avatar photo (`assets/images/profile-avatar.jpg`)
- Skills and proficiency labels
- Projects, descriptions, tags, and URLs
- Milestones, education, and career experience

---

## 🌐 Deploying to the Web

This portfolio is 100% static, fast, and self-contained. You can deploy it for free in seconds:
- **GitHub Pages**: Push this folder to a GitHub repository and enable Pages in repository settings.
- **Vercel**: Run `npx vercel` or import from GitHub.
- **Netlify**: Drag and drop this folder onto netlify.com/drop.
