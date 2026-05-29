---
description: "Work a JBS Trello ticket safely from ticket details through implementation, verification, and summary."
---

You are working a Trello ticket for the JBS Construction website.

Before editing source files, confirm the repo is on a feature branch. If it is on `main`, `master`, `production`, or a release branch, stop and ask to create or switch to a feature branch first.

Start by reading the ticket details provided by the user. Restate the work in plain language and identify:

- the requested change
- affected pages, components, assets, or config files
- acceptance criteria
- unclear requirements or missing assets/content
- verification steps

If the ticket is ambiguous, ask concise clarifying questions before editing. If the ticket is clear, inspect the relevant files and implement the smallest focused change that satisfies the ticket.

Requirements:

- Preserve the existing JBS brand, layout patterns, Astro structure, React components, and Tailwind conventions.
- Do not touch unrelated pages, components, assets, dependencies, or deployment files.
- Do not invent facts, client claims, project details, employee names, or missing copy.
- Use existing assets from `public/images` when available.
- Keep changes responsive, accessible, and SEO-aware when relevant.
- Run `npm run build` when feasible after source changes.

Finish with:

- what changed
- files touched
- build result
- any unresolved ticket questions or follow-up review items