# Sufyan Malik · Graphic Designer & Brand Identity Specialist

A minimalist, high-performance portfolio crafted with an editorial Scandinavian/Japanese aesthetic, fluid motion, interactive category filtering, Cloudinary image integration, MongoDB Atlas persistence, and native Netlify deployment readiness.

---

## 🎨 Color Palette Architecture

This design system uses the custom requested organic luxury palette:
- **`#597058`** — Deep Forest Sage (Primary brand tone, buttons, key headings, accents)
- **`#BBBB9A`** — Warm Khaki Sand (Dividers, tag highlights, subtle glows)
- **`#9AAEA3`** — Soft Laurel / Dusty Mint (Secondary accents, status badges, ambient blur)
- **`#E2E2DB`** — Warm Linen / Alabaster Canvas (Tactile background canvas)
- **`#1C241D`** — Charcoal Green (High-contrast, legible typography)
- **`#FFFFFF`** — Clean Porcelain (Elevated card surfaces)

---

## ✨ Features & Enhancements

1. **Minimalist Luxury Editorial Aesthetic**:
   - Modern typography pairing: *Playfair Display* (luxury editorial serif) + *Plus Jakarta Sans* (precision geometric sans).
   - Glassmorphic floating pill navbar with active scroll spy and live project availability status.
   - Fluid typography with responsive `clamp()` calculations.

2. **Silky Motion & Micro-Interactions**:
   - Ambient background fluid mesh gradients.
   - IntersectionObserver scroll reveal system (`[data-reveal]`) with staggered item fades.
   - Smooth animated stat counters (8+ Years Craft, 5+ Years Fiverr Top Rated, 4 Years Agency).
   - Smooth card elevation, image scale, and directional arrow animations.
   - Accessible `<dialog>` modal with backdrop blur and smooth scale-in transitions.

3. **Curated Work & Interactive Showcase**:
   - Real-time category filtering tabs: *All Works*, *Logo Design*, *Watercolor*, *Illustration*, *Mascot*, *Poster*, *Social Post*.
   - View Switcher: Curated Grid vs. Horizontal Showcase Reel.
   - Click-to-expand project modal with full client story, deliverables, and pre-filled inquiry button.

4. **100% Responsive & Touch-Optimized**:
   - Fluid responsiveness across phones (360px+), tablets (768px+), laptops, and 4K displays.
   - Mobile slide-out drawer navigation with backdrop blur.
   - Quick one-click copy buttons for email (`sufyanmalik7998@gmail.com`) and phone (`+92 310 3195201`).

5. **Netlify Deployment Ready**:
   - Serverless Netlify function (`netlify/functions/api.js`) powered by `serverless-http`.
   - `netlify.toml` with routing redirects, security headers, and asset caching.
   - Netlify Forms built-in support (`data-netlify="true"`).
   - Graceful offline fallback: Displays curated showcase works even before database connection strings are configured.

---

## 🛠️ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local server
npm start
# or with auto-reload:
npm run dev

# 3. Open browser
http://localhost:3000
```

Admin credentials:
- **Password**: `portfolio2005` (configurable in `.env`)
