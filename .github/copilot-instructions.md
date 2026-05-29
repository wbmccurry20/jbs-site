# JBS Site Copilot Instructions

This repository is the public marketing website for JBS Construction. Treat changes as client-facing production work.

## Project Context

- Framework: Astro 5 with React islands.
- Styling: Tailwind CSS 4 tokens defined in `src/styles/global.css`.
- Components live in `src/components` and pages live in `src/pages`.
- Deployment target: Vercel.
- Verification command: `npm run build`.

## Working Style

- Before editing production code, run or request a branch check.
- Never make source, asset, config, or deployment changes directly on `main`, `master`, `production`, or release branches.
- If the current branch is protected, stop and ask to create or switch to a feature branch before editing.
- Use feature branch names like `feature/jbs-about-team-photos` or `feature/jbs-portfolio-update`.
- Keep edits focused on the requested page, component, or workflow.
- Reuse existing components, spacing, colors, fonts, and layout patterns before introducing new ones.
- Preserve the JBS brand voice: direct, confident, construction-focused, and professional.
- Use real project imagery from `public/images` when relevant.
- Avoid unrelated refactors or dependency additions.

## Frontend Expectations

- Keep pages responsive across mobile, tablet, and desktop.
- Maintain strong contrast on dark hero sections and image overlays.
- Use semantic headings, descriptive alt text, and accessible interactive controls.
- Keep navigation, calls to action, SEO metadata, and contact paths consistent across pages.

## Safety Checks

- Confirm the active branch is a feature branch before editing production code.
- Do not expose secrets or API keys in source files.
- Do not edit deployment or environment files unless explicitly requested.
- Run `npm run build` after code changes when feasible and report the result.