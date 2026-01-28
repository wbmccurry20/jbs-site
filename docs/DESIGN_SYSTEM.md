# Design System - A&B Construction Modern Site

## Color Palette

### Primary Colors
- **Orange** `#FF6B35` - Primary CTAs, key highlights, energy
- **Blue** `#004E89` - Headers, trust elements, professionalism
- **Yellow** `#FFB81C` - Construction accent, badges, emphasis

### Neutral Colors
- **Dark** `#1A1A2E` - Main text, dark backgrounds
- **Steel Gray** `#4B5563` - Secondary text (updated for better contrast)
- **Light** `#F5F5F5` - Page backgrounds

### Text Color Standards
- **On white/light backgrounds**: `text-gray-700` or `text-construction-dark`
- **On dark backgrounds**: `text-white` for headings, `text-gray-300` for body text
- **On colored gradients**: `text-white` with opacity (90%, 80%) for hierarchy
- **Never use**: `text-gray-400` or `text-gray-500` (insufficient contrast)

---

## Section Patterns

### Hero Sections
- Background: `bg-gradient-to-br from-construction-secondary via-construction-dark to-black`
- Badge: Colored pill with service/category name
- Heading: White text with colored accent word
- Text: `text-gray-300` for readability

### Content Sections
- Alternate: `bg-white` → `bg-construction-light` → `bg-white`
- Section badges: Colored pills above headings
- Cards: White background with colored left-border accents

### CTA Sections
- Background: Dark gradient `bg-gradient-to-br from-construction-secondary via-construction-dark to-black`
- Heading: White text
- Description: `text-gray-300` for readability
- Buttons: Orange/yellow with white text, high contrast hover states

---

## Component Styles

### Section Badges
```astro
<div class="inline-block px-4 py-2 bg-construction-primary/10 text-construction-primary font-semibold rounded-full mb-4">
  Badge Text
</div>
```

### Feature Cards
```astro
<div class="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-l-4 border-construction-primary">
  Content
</div>
```

### Testimonial Cards
```astro
<div class="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-l-4 border-construction-accent">
  Content
</div>
```

### Buttons

**Primary CTA:**
```astro
<a class="px-8 py-4 bg-construction-primary text-white rounded-lg font-semibold hover:bg-construction-accent hover:text-construction-dark transition-all">
  Text
</a>
```

**Secondary CTA:**
```astro
<a class="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-construction-accent text-construction-accent rounded-lg font-semibold hover:bg-construction-accent hover:text-construction-dark transition-all">
  Text
</a>
```

---

## Typography Hierarchy

### Headings
- H1: `text-5xl md:text-6xl font-display font-bold`
- H2: `text-4xl md:text-5xl font-display font-bold`
- H3: `text-2xl font-display font-bold`

### Body Text
- Primary: `text-construction-dark`
- Secondary: `text-construction-steel`
- Light backgrounds: `text-gray-300`

---

## Design Principles

1. **High Contrast** - Always ensure text is readable (white on dark, dark on white)
2. **Simple Backgrounds** - No complex gradients in content areas
3. **Consistent Spacing** - `py-20` for sections, `mb-16` for section headings
4. **Color Purposefully** - Orange for action, Blue for trust, Yellow for highlights
5. **Clean Alternation** - White → Light Gray → White for visual rhythm
6. **Accent Borders** - Use left-borders on cards instead of full borders
7. **Section Badges** - Always include category badges in colored pills

---

## Accessibility

- All text meets WCAG AA contrast requirements
- Focus states on interactive elements
- Semantic HTML structure
- Descriptive button text
- Alt text on images (when added)

---

## Pages Updated

✅ Home - Hero, sections, CTAs all updated
✅ Services - Hero, service cards, process, CTA
✅ Portfolio - Hero, projects, stats, CTA
✅ About - Hero, values, team, CTA  
✅ Blog - Hero, posts, newsletter, CTA
✅ Contact - Hero, form section

All pages now follow the same clean, readable design system!
