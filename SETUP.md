# A&B Construction Website - Setup Guide

## 🎯 Quick Start

### Step 1: Install Dependencies

```bash
cd /Users/will/ITWill/A&B/a-b-construction-modern
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:4321`

### Step 3: Add Images

1. Copy logo and project images to `/public/images/`
2. See `/public/images/README.md` for required assets
3. Update image paths in components if needed

### Step 4: Customize Content

Edit these files to match A&B Construction's details:

- `src/pages/index.astro` - Homepage content
- `src/components/Navbar.tsx` - Navigation links
- `src/components/Footer.tsx` - Contact info, social links
- `src/components/ProjectShowcase.tsx` - Featured projects data

## 📧 Contact Form Setup (Web3Forms)

1. Go to https://web3forms.com
2. Sign up (free)
3. Create a new form and get your Access Key
4. Create a contact page with the form integration

## 🎨 Customization Guide

### Update Colors

Edit `tailwind.config.js`:

```js
colors: {
  construction: {
    primary: '#FF6B35',    // Main orange
    secondary: '#004E89',  // Main blue
    accent: '#F7C548',     // Yellow accent
    // ... customize these
  }
}
```

### Update Company Info

In `src/components/Footer.tsx`, update:
- Phone number
- Email address
- Physical address
- Social media links

### Update Meta Tags

In `src/layouts/Layout.astro`, update:
- Default site description
- Company name
- Social media image

## 🚀 Build & Deploy

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with static files.

### Deploy to Netlify (Recommended)

**Option 1: Drag & Drop**
1. Run `npm run build`
2. Go to https://app.netlify.com
3. Drag the `dist/` folder to deploy

**Option 2: Git Integration**
1. Push code to GitHub
2. Connect repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts. Done!

### Deploy to Cloudflare Pages

1. Push code to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect repository
4. Build command: `npm run build`
5. Output directory: `dist`

## 🔧 Troubleshooting

### Port Already in Use

If port 4321 is taken:

```bash
npm run dev -- --port 3000
```

### Images Not Loading

- Check file paths are correct (case-sensitive)
- Images should be in `/public/images/`
- Reference as `/images/filename.jpg` (no 'public' in path)

### Build Errors

Clear cache and rebuild:

```bash
rm -rf node_modules dist .astro
npm install
npm run build
```

## 📱 Testing

### Test on Different Devices

- Desktop (Chrome, Firefox, Safari)
- Mobile (iOS Safari, Chrome)
- Tablet (iPad)

Use browser dev tools for device emulation.

### Performance Testing

- Run Lighthouse audit in Chrome DevTools
- Aim for 90+ scores across all metrics
- Test page load speed on 3G network

## 🎓 Learning Resources

- [Astro Docs](https://docs.astro.build)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

## 📞 Support

Questions? Contact IT Will:
- Email: hello@it-will.dev
- Website: https://it-will.dev

---

**Next Steps:**

1. ✅ Install dependencies
2. ⬜ Add company images
3. ⬜ Customize content
4. ⬜ Create additional pages (services, portfolio, about, contact)
5. ⬜ Set up contact form
6. ⬜ Deploy to production
7. ⬜ Connect custom domain
