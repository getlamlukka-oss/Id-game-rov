---
name: impeccable
description: "Use for frontend design, UX critique, accessibility, responsive adaptation, visual refinement, and design-system work."
metadata:
  version: "4.9.2-manual-project"
---

# Impeccable — ROV ID Manager manual project skill

Adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable), Apache-2.0. This repository copy is deliberately self-contained for AI agents that can read project files. It does not require or invoke a CLI.

## When to use
Use for requests to design, critique, audit, polish, simplify, harden, or adapt frontend UI. Do not use for backend-only tasks.

## Project-specific design constraints
- Treat the ROV dashboard as an **Operate** surface: task completion, scanability, consistency, mobile usability, accessibility, and predictable interaction outrank decoration.
- Preserve Editorial Minimal: cream `#F3F0E7`, dark text `#292A23`, muted lime `#DCE8A5`; avatar-centric and mobile-first.
- Avoid gold frames, fantasy effects, excess ornament, placeholder lettermarks, and avatar initials used as branding.
- Preserve Thai product terminology and existing data semantics. `category_id` and `status` are separate; never conflate category with play status.
- Do not change Supabase schema, RLS, Storage, Auth, CRUD, automation, or account data during visual work unless explicitly requested.
- Reuse existing components/assets and make the smallest necessary change. Do not add dependencies for visual work unless essential and approved.

## Operating procedure
1. Inspect the current branch, target files, dependencies, existing tokens/components, and relevant project instructions before editing.
2. Identify the surface mode. Dashboard/admin UI is Operate: use restraint and precision, not marketing-page treatment.
3. State the user task, main friction, and evidence from the current implementation before proposing a change.
4. Preserve behavior, copy, visual identity, and all out-of-scope areas during refinement. Ask before changing factual copy or adding claims.
5. Make only the minimum necessary edits. Keep accessibility, keyboard behavior, focus states, semantic HTML, responsive layout, and loading/empty/error states intact.
6. Verify at mobile and desktop sizes using an available rendered preview. If rendering is unavailable, say so and do not claim visual verification.
7. Run relevant lint/typecheck/build checks when available. Report exactly what ran, what passed, and what could not be run.
8. Report changed files and any residual risks. Never deploy or mutate production data without explicit authorization.

## Review modes
- **critique**: evaluate hierarchy, information scent, task flow, consistency, affordances, responsive behavior, accessibility, and visual craft. Return prioritized findings with evidence and severity; do not edit unless asked.
- **audit**: inspect semantic structure, keyboard/focus, contrast where measurable, image handling, responsive overflow, performance risks, and edge states. Distinguish confirmed defects from items needing browser verification.
- **polish**: refine an existing screen without changing its design direction or behavior. Fix spacing, alignment, typography hierarchy, states, and interaction details only where evidence supports it.
- **adapt**: adapt the existing layout to a specified viewport/device. Preserve content and core interactions; avoid horizontal overflow and touch targets that are too small.
- **distill**: remove unnecessary visual or interaction complexity while preserving essential information and tasks.
- **harden**: improve robust handling of loading, empty, error, validation, and unusual input states without weakening security.
- **document**: document the actual design tokens and components found in source; do not invent a design system.

## Output format for a UI review
1. Overall assessment and surface mode.
2. Prioritized findings (severity, location, evidence, user impact).
3. Minimal recommended changes.
4. Verification plan and limitations.

## Termux / CLI limitation
This is a manual skill bundle. Do not instruct users to run `npx impeccable install`, `scripts/impeccable`, or hook commands in Android Termux. The Impeccable Android ARM64 engine/checksum was not available in the user's environment. This skill supports agent-guided review and implementation only; it does not provide the official CLI, browser live mode, or automatic detector hooks.
