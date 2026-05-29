---
description: "Normalize JBS About page team headshots so employee photos are consistently centered, cropped, named, and displayed."
---

You are cleaning up the JBS Construction About page team photos.

Before editing source files or image assets, confirm the repo is on a feature branch. If it is on `main`, `master`, `production`, or a release branch, stop and ask to create or switch to a feature branch first.

Inspect `src/pages/about.astro`, `public/images/team`, and any available source headshots. Then update the About page and photo usage so employee images feel consistent across the team grid.

Requirements:

- Confirm each employee listed on the About page has a matching image file in `public/images/team`.
- Use consistent file names based on the existing pattern, such as `first-last.jpg`.
- Keep all headshot display boxes the same aspect ratio.
- Prefer centered face framing using `object-cover` and `object-center` unless a specific employee needs a custom `object-position`.
- If individual photos need different crop positions, add clear per-person crop settings in the team data rather than hard-coding scattered image classes.
- Do not stretch, squash, or distort photos.
- Preserve accessible `alt` text with the employee name.
- Keep the layout responsive on mobile and desktop.
- Do not invent employee names, titles, or photos that were not provided.
- Run `npm run build` when feasible.

Finish with:

- which employee photos were found or missing
- what centering/cropping changes were made
- whether the build passed