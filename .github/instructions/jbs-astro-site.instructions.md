---
applyTo: "src/**/*.{astro,ts,tsx,js,jsx,css}"
description: "Use when editing the JBS Astro marketing site, React components, Tailwind styling, SEO metadata, navigation, portfolio pages, or contact flows."
---

# JBS Astro Site Instructions

Use the existing visual language: dark charcoal sections, JBS blue accents, uppercase Barlow Condensed headings, Roboto body text, angular construction-inspired layouts, and project photography.

Before editing app code, confirm the repo is on a feature branch. Do not edit `src`, `public`, deployment config, or package files directly on `main`, `master`, `production`, or release branches. If the current branch is protected, stop and ask to create or switch to a feature branch first.

When editing pages:

- Keep `Layout.astro` metadata accurate for the page purpose.
- Import and use `Navbar`, `Footer`, and `FadeInSection` consistently with nearby pages.
- Prefer compact, confident copy over generic marketing filler.
- For project cards, include a clear title, location, category, image, and useful alt text.
- Check mobile spacing and avoid oversized text that can overflow narrow screens.

When editing components:

- Keep React components small and purpose-specific.
- Preserve accessibility states such as `aria-label`, focus behavior, and keyboard-friendly controls.
- Avoid introducing browser-only code outside client-loaded React components.

Before finishing:

- Run `npm run build` when the change touches source files.
- Summarize what changed in plain language a business owner can understand.