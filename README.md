# A&B Construction - Modern Website

## 🚀 Overview

A cutting-edge website for A&B Construction that demonstrates how small construction businesses can leverage modern web technology. Built with Astro, React, and TailwindCSS v4.

## ✨ Innovative Features

### What Makes This Different from Traditional Construction Websites

1. **Interactive Cost Calculator** - Instant project estimates with step-by-step wizard
2. **Before/After Image Slider** - Engaging interactive comparison tool
3. **Real-time Project Showcase** - Dynamic project browser with smooth animations
4. **Modern Design System** - Professional yet innovative visual identity
5. **Mobile-First Responsive** - Perfect experience on any device
6. **Performance Optimized** - Lightning-fast load times with Astro static generation

## 🛠️ Tech Stack

- **Astro 5** - Static site generation for optimal performance
- **React 19** - Interactive components where needed
- **TailwindCSS v4** - Modern utility-first styling
- **Framer Motion** - Smooth, professional animations
- **TypeScript** - Type-safe development

## 📁 Project Structure

```
/
├── public/
│   └── images/          # Static images, logos, project photos
├── src/
│   ├── components/      # Reusable React/Astro components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── BeforeAfterSlider.tsx
│   │   ├── QuoteCalculator.tsx
│   │   ├── ProjectShowcase.tsx
│   │   └── FadeInSection.tsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/           # Routes (each .astro file = a page)
│   │   ├── index.astro
│   │   ├── services.astro
│   │   ├── portfolio.astro
│   │   ├── about.astro
│   │   ├── blog.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tailwind.config.js
└── package.json
```

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

### Color Palette

- **Primary Orange** (#FF6B35) - Energy, innovation, action
- **Secondary Blue** (#004E89) - Trust, professionalism, stability  
- **Accent Yellow** (#F7C548) - Optimism, craftsmanship, warmth
- **Dark** (#1A1A2E) - Modern, sophisticated
- **Light** (#F5F5F5) - Clean, airy
- **Steel** (#8D99AE) - Industrial, professional

### Typography

- **Display Font**: Space Grotesk - Bold, modern headlines
- **Body Font**: Inter - Clean, readable content

## 📝 Key Pages to Create

- [x] Home - Hero, features, calculator, projects
- [ ] Services - Detailed service offerings
- [ ] Portfolio - Full project gallery with filters
- [ ] About - Company story, team, values
- [ ] Blog - Construction tips, project updates (SEO)
- [ ] Contact - Modern form with Web3Forms integration

## 🔮 Future Enhancements

### Phase 2 - Internal Tools (Go/Python Backend)

The current site is purely static (no backend needed). Future phases will add:

- `/internal` - Protected intranet for clients
  - Project management portal
  - Document sharing
  - Budget tracking
  - Timeline visualization
  - Real-time photo updates
- Go API for business logic
- Python scripts for automation

### Additional Features

- [ ] Blog with MDX support
- [ ] Client portal authentication
- [ ] 3D model viewer for designs
- [ ] Virtual consultation booking
- [ ] Material selection tool
- [ ] Progress photo timeline
- [ ] Live project webcams

## 📧 Contact Form

Uses **Web3Forms** (free tier) - no backend needed:
- 1000 submissions/month free
- Email notifications
- Spam protection
- Easy setup

Alternative options:
- Formspree
- Netlify Forms
- EmailJS

## 🚀 Deployment

### Recommended Hosting

1. **Netlify** (easiest, free tier)
   - Drag & drop deployment
   - Automatic builds from Git
   - Free SSL
   - CDN included

2. **Vercel** (great DX)
   - Similar to Netlify
   - Excellent analytics
   - Free tier

3. **Cloudflare Pages** (fastest)
   - Free unlimited bandwidth
   - Global CDN
   - Fast builds

### Deploy to Netlify

```bash
npm run build
# Drag the `dist/` folder to Netlify
```

Or connect your Git repo for automatic deployments.

## 🎯 SEO Optimization

- Semantic HTML structure
- Meta tags for social sharing
- Responsive images
- Fast load times
- Accessible components
- Schema.org markup (add later)

## 📱 Progressive Web App (Future)

Could add PWA features:
- Offline capability
- Install to home screen
- Push notifications for project updates

## 🤝 Contributing

This is a client project. For IT Will team members:

1. Keep design consistent with brand
2. Test on real devices
3. Optimize images before committing
4. Follow TypeScript best practices

## 📄 License

Proprietary - A&B Construction © 2026

---

**Built with ❤️ by IT Will** - Showing construction companies what modern web development can do.
