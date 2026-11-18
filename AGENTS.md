<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
## ROV ID Manager project constraints

- Treat the dashboard as an **Operate** surface: prioritize task completion, scanability, mobile usability, accessibility, and predictable interaction over decorative expression.
- Preserve the established editorial-minimal visual direction: warm cream background (`#F3F0E7`), dark text (`#292A23`), and muted lime accent (`#DCE8A5`) where appropriate.
- Keep the interface avatar-centric and mobile-first. Avoid gold frames, fantasy effects, excessive ornament, and placeholder lettermarks or avatar initials used as branding.
- Preserve existing product terminology and data semantics. Category (`category_id`) and play status (`status`) are separate concepts; do not conflate them.
- Do not change Supabase schema, RLS, Storage policies, Auth, CRUD behavior, automation, or account data as part of a visual task unless the user explicitly requests it.
- For refinement, preserve existing behavior, copy, and visual identity outside the requested scope. Make the smallest necessary change and reuse existing components and assets.
- Before UI edits, inspect the target component, its dependencies, existing design tokens, and the rendered page. Verify the result at mobile and desktop sizes; do not claim visual verification if the page was not rendered and inspected.
- Run the relevant lint/build checks after code changes and report any checks that could not be run.
- When using Impeccable, prefer `critique`, `audit`, `polish`, `adapt`, and `distill` as appropriate. Do not run broad redesign commands or replace the established design direction without explicit approval.

- For frontend/UI work, read `.agents/skills/impeccable/SKILL.md` first and follow its manual workflow. This project copy does not include the Impeccable CLI, native engine, or automatic hooks; do not claim those tools were run.
