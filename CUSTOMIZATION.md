# Easy Customization Guide

This guide shows you exactly where to update colors and images when you get the final assets from your client.

## 🎨 Updating Brand Colors

All colors are defined in one place: `tailwind.config.js`

### Current Placeholder Colors:
```js
colors: {
  'construction-primary': '#FF6B35',   // Orange - Main brand color
  'construction-secondary': '#004E89', // Blue - Secondary brand color
  'construction-accent': '#FFB81C',    // Yellow - Accent/highlights
  'construction-dark': '#1A1A2E',      // Dark - Text/headers
  'construction-steel': '#4B5563',     // Steel gray (updated for contrast)
  'construction-light': '#F5F5F5',     // Light - Backgrounds
}
```

### To Update:
1. Open `tailwind.config.js`
2. Replace the hex values with your client's brand colors
3. Save and refresh - colors update everywhere automatically!

**Pro Tip:** Keep the same color names (`construction-primary`, etc.) so you don't have to edit any components.

---

## 📸 Updating Images

All images currently use placeholder services. Here's what to replace:

### Before/After Slider Images
**Location:** These appear on Homepage and Portfolio page

**Files to update:**
- `src/pages/index.astro` (line ~165)
- `src/pages/portfolio.astro` (lines ~208, ~223)

**Current placeholders:**
```astro
beforeImage="https://placehold.co/1200x800/cccccc/ffffff?text=Before"
afterImage="https://placehold.co/1200x800/FF6B35/ffffff?text=After"
```

**Replace with your images:**
```astro
beforeImage="/images/before-kitchen-renovation.jpg"
afterImage="/images/after-kitchen-renovation.jpg"
```

### Project Portfolio Images
**Location:** Portfolio page project cards and ProjectShowcase component

**Files to update:**
- `src/pages/portfolio.astro` (lines ~19, ~30, ~41, ~52, ~63, ~74)
- `src/components/ProjectShowcase.tsx` (lines ~12, ~23, ~34)

**Current placeholders:**
```js
image: 'https://placehold.co/800x600/004E89/ffffff?text=Project+1',
```

**Replace with your images:**
```js
image: '/images/projects/modern-mountain-retreat.jpg',
```

### Background Pattern (Optional)
**Location:** Homepage hero section
**File:** `src/pages/index.astro` (line ~22)

**Current:** SVG pattern
**Replace with:** Your custom pattern or remove the line

---

## 📁 Recommended Image Structure

Add your images to the `public/` folder:

```
public/
  images/
    before-kitchen.jpg
    after-kitchen.jpg
    before-bathroom.jpg
    after-bathroom.jpg
    projects/
      project1.jpg
      project2.jpg
      project3.jpg
      project4.jpg
      project5.jpg
      project6.jpg
```

**Important:** Images in `public/` are accessed as `/images/filename.jpg` (no `public/` in the path)

---

## 🖼️ Image Best Practices

### Recommended Sizes:
- **Before/After images:** 1200x800px (3:2 ratio)
- **Project cards:** 800x600px (4:3 ratio)
- **Max file size:** ~500KB per image (use compression)

### Optimization Tools:
- [TinyPNG](https://tinypng.com/) - Free image compression
- [Squoosh](https://squoosh.app/) - Google's image optimizer
- [ImageOptim](https://imageoptim.com/) - Mac app for bulk optimization

---

## 🚀 Quick Update Workflow

1. **Get final brand colors** → Update `tailwind.config.js` → Save
2. **Receive images** → Optimize & add to `public/images/` folder
3. **Update image paths** in:
   - `src/pages/index.astro`
   - `src/pages/portfolio.astro`
   - `src/components/ProjectShowcase.tsx`
4. **Test locally** → Run `npm run dev` and check all pages
5. **Deploy** → Push to Git and redeploy

---

## 💡 Pro Tips

- **Use descriptive filenames:** `modern-kitchen-after.jpg` not `IMG_1234.jpg`
- **Keep aspect ratios consistent** for each section (all project cards same size)
- **Test on mobile** - images should look good on small screens too
- **Compress images** before adding - faster load times = better SEO
- **Use WebP format** if possible (better compression, modern browsers support it)

---

## Need Help?

If you need to make changes beyond colors/images:
- Component styles are in each `.tsx` or `.astro` file
- Global styles in `src/styles/global.css`
- Tailwind config in `tailwind.config.js`
- Layout/SEO in `src/layouts/Layout.astro`
