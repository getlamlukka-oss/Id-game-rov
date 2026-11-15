# ROV ID Manager — Native Mobile App Plan

Status: architecture and UX plan only. No production application code, database schema, authentication settings, or deployment configuration has been changed.

Target: a separate Expo + React Native application for Android and iOS, while keeping the existing Next.js web application intact.

## 1. Existing project assessment

### Confirmed from the repository

- The current application is Next.js 16.4.6, React 19.3.0, TypeScript, and Tailwind CSS 4.
- The root application is a web application. There is no Expo or React Native project in the current repository.
- The authenticated home page reads `categories` and `game_accounts` from Supabase.
- Account fields currently used by the UI are `id`, `category_id`, `game_name`, `game_id`, `notes`, `image_path`, and `created_at`.
- The web UI supports account search, category/status filters, create, edit, delete, account notes, owned-skin notes, and category-specific frame artwork.
- Authentication currently uses Supabase email/password through Next.js Server Actions and cookie-based SSR sessions.
- The repository includes an Automation Center migration with settings, workflows, rules, tags, events, and scheduled reports. The migration enables RLS and defines owner policies for these new tables.
- Auto-tag matching currently runs inside `src/app/actions/accounts.ts`, not inside a database trigger or shared API.
- The daily report endpoint uses `SUPABASE_SERVICE_ROLE_KEY` on the server. The Discord webhook is stored in `automation_settings`.

### Not confirmed; must be checked before implementation

- The deployed web origin and production environment variables were not inspected. No secrets or environment values were requested or read.
- Storage upload lifecycle and whether existing `image_path` values are object paths or signed URLs still need to be confirmed.
- There is no verified simulator/emulator run or release build for a mobile app yet.

Do not infer missing database policies or create replacement tables. The connected Supabase project was inspected read-only after this repository review; the verified findings are recorded below.


### Live Supabase inspection (read-only)

The connected Supabase project named `game-id-manager` was inspected without changing its schema or data:

- `categories`: 5 rows; RLS enabled; columns include `id`, `user_id`, `name`, `description`, `cover_image_path`, timestamps. SELECT/INSERT/UPDATE/DELETE policies restrict rows to `auth.uid() = user_id` and target the `authenticated` role.
- `game_accounts`: 52 rows; RLS enabled; columns match the fields used by the web UI and include `user_id` and `updated_at`. SELECT/INSERT/UPDATE/DELETE policies restrict rows to the authenticated owner. A composite foreign key ties `category_id` and `user_id` to the same category owner.
- All seven Automation Center tables exist and have RLS enabled. The owner predicates are present. Their current policies are declared for the `public` role with `auth.uid() = user_id` (or an ownership EXISTS check), rather than explicitly targeting `authenticated`. This does not grant anonymous users an owner identity, but it should be reviewed and tightened to `TO authenticated` as a separate security-hardening change before release; do not silently alter it as part of the mobile UI work.
- Private Storage buckets `category-covers` and `game-images` exist. Both allow JPEG, PNG, and WebP up to 5 MiB. Storage object policies restrict access to the authenticated user's UID-prefixed folder for read, upload, update, and delete.
- The schema inspection showed no existing mobile-specific API or shared account-mutation function. Current auto-tag and event behavior remains in the Next.js Server Action.

- Supabase Security Advisor currently reports **Leaked Password Protection Disabled**. Enable leaked-password protection in Supabase Auth settings before public release; this is a project-level setting and was not changed during this review. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

This confirms that the current account tables are suitable for authenticated, owner-scoped mobile reads once the app uses the publishable key and a real user session. It does **not** justify bypassing RLS or embedding privileged credentials.

## 2. Recommended architecture

Create a standalone Expo project under `mobile/`. Keep the existing root `package.json`, Next.js routes, web components, and web deployment unchanged.

Proposed mobile structure:

```text
mobile/
  app/
    (auth)/
      sign-in.tsx
    (tabs)/
      _layout.tsx
      library.tsx
      categories.tsx
      automation.tsx
      settings.tsx
    accounts/
      new.tsx
      [id].tsx
      [id]/edit.tsx
  src/
    components/
    features/
      accounts/
      categories/
      automation/
      auth/
    lib/
      supabase/
      api/
    theme/
    types/
  assets/
  app.json
  package.json
  tsconfig.json
```

This is a proposed structure, not files created yet.

### Technology choices

- Expo + Expo Router + React Native + TypeScript.
- Supabase JavaScript client for authenticated data access.
- Secure session persistence with Expo SecureStore; do not put refresh tokens in plain local storage.
- React Native Safe Area Context for system insets.
- Expo Image for account and category artwork.
- Native controls and platform navigation patterns; use Reanimated only where motion materially improves feedback.
- Use a virtualized list for the account collection if data volume warrants it. Avoid adding a state-management library until actual complexity requires one.

No dependencies should be installed until the mobile project is approved and the supported Expo SDK version is selected.

## 3. Mobile UX and screen design

### Visual direction

Reuse the existing product identity rather than introducing a new template:

| Token | Existing web value | Intended use |
|---|---|---|
| Ivory | `#f5f5f0` | Main background |
| Ink | `#17191d` | Primary text and borders |
| Lime | `#d9f36a` | Primary action and selected state |
| Coral | `#f5a18e` | Played status and secondary emphasis |
| Cream | `#fffefa` | Cards and input surfaces |
| Muted | `#74746d` | Secondary text |
| Accent | `#60741e` | Focus and emphasis |

Use one accent family and a consistent corner-radius scale. Keep the existing ROV ID Manager branding, account frame artwork, and category artwork where licensing and asset quality permit. Do not copy the web layout literally: adapt it to native touch, safe areas, and platform navigation.

The current web app defines a light palette only. The native app must add a tested dark theme using semantic tokens rather than assuming the current web colors work unchanged in dark mode.

### Main screens

1. **Sign in** — email and password, clear validation, loading and authentication error states. No registration or password-reset flow should be added until the existing Supabase account policy is confirmed.
2. **Library** — total/played/not-played summary, prominent search, horizontally scrollable category and status filters, and a compact vertical account list.
3. **Account detail** — game ID, character name, category, notes, owned skins, and available artwork. Provide selectable/copyable text for IDs.
4. **Create/edit account** — native form route or modal with required-field validation, keyboard-safe scrolling, save/cancel, and explicit unsaved-change handling.
5. **Categories** — browse categories and filter the library by category. Preserve special categories such as `บัต Evo` and existing frame categories based on live category data.
6. **Automation** — workflow list, report settings, recent activity, and a secure Discord configuration flow. Secret values must never be returned to the app after saving.
7. **Settings** — account identity, theme, session sign-out, and app information.

### Navigation

Use four peer tabs:

- คลังไอดี
- หมวดหมู่
- Automation
- ตั้งค่า

Push account detail and edit routes above the tabs. Treat create/edit as a focused task with an explicit Cancel/Save path. Use a native destructive confirmation for delete. Back navigation must return to the previous screen without silently discarding unsaved changes. On sign-out, clear the local session and replace the navigation state with Sign in.

### Required UI states

Every data screen must define loading, empty, error, and populated states. Include long IDs, long notes, no matching search results, slow network, expired session, failed save, and failed delete. Support large text, minimum 44pt/48dp touch targets, keyboard-safe forms, and Reduce Motion.

## 4. Supabase integration and security

### Authentication

- Use the existing Supabase project URL and publishable/anon key only.
- Persist the user session with a SecureStore-backed storage adapter.
- Refresh sessions using the Supabase client; handle expired sessions and sign-out explicitly.
- Never embed the Supabase service-role key, CRON secret, Discord webhook, or other server secrets in the app bundle.
- Verify the actual `game_accounts` and `categories` RLS policies before enabling mobile reads or writes. Client-side filtering is not an authorization boundary.

### Data access

Read-only category and account queries may use the Supabase client directly after RLS verification.

Account mutations need a shared trusted path. Today, web create/update actions also execute auto-tag matching and write automation events. A mobile client that writes directly to `game_accounts` would bypass that server-side behavior. Do not duplicate that business logic in the mobile UI.

Recommended implementation: introduce authenticated server endpoints or a Supabase Edge Function for account create/update/delete, then have both web Server Actions and mobile calls use the same validated business-logic service. Authenticate each request with the user's access token and enforce ownership through RLS or an explicitly scoped user context. Do not use a service-role key for ordinary user operations.

The exact endpoint/function choice should be made after reviewing current deployment and Supabase configuration. The implementation must preserve the existing web behavior and return safe, typed errors.

### Automation and Discord

- Keep the Discord webhook server-side. The current web UI intentionally does not prefill the saved webhook value.
- Mobile may submit a new webhook URL to an authenticated server endpoint, but must not read it back.
- Do not query `automation_settings.discord_webhook_url` from the mobile client.
- Keep scheduled report execution server-side; the app only reads safe report summaries and status.
- Workflow creation and auto-tag behavior must be made consistent across web and mobile through shared trusted logic.
- Verify RLS for all automation tables against the actual Supabase project before enabling the feature.

### Images

The current account model exposes `image_path`, and the web app renders existing public artwork from `public/`. No confirmed Supabase Storage upload bucket or policy was found in the inspected source. Initially display existing image paths and bundled product artwork only. Add user image upload only after confirming bucket, access policy, file-size/type constraints, and deletion behavior.

## 5. Implementation sequence

1. **Preflight** — verify live Supabase tables, column types, RLS policies, auth settings, Storage buckets, and deployed environment. Record only non-secret configuration.
2. **Mobile shell** — create isolated `mobile/` Expo app, navigation, theme tokens, safe areas, and SecureStore-backed Supabase auth.
3. **Read-only library** — categories, account list, search, filters, and detail view. Confirm RLS behavior with two different test users if available.
4. **Account mutations** — implement shared trusted account operations so auto-tags and activity events behave the same from web and mobile.
5. **Automation** — expose safe workflow/report data and server-only Discord configuration without returning secrets.
6. **Polish** — empty/loading/error states, dark mode, accessibility, long-content handling, and measured list performance.
7. **Release** — Android internal test build first, then iOS if required. Keep web deployment independent.

Each phase should be reviewed before proceeding to the next. No production database migration or web refactor is part of the initial mobile shell.

## 6. Test and release plan

- Static checks: TypeScript, Expo configuration validation, lint, and dependency audit.
- Auth: sign-in, session restore, token refresh, sign-out, expired/invalid credentials.
- Authorization: user A cannot read or mutate user B's accounts, categories (where user-scoped), workflows, tags, or events.
- CRUD: create, edit, delete, invalid input, duplicate/edge cases, and network interruption.
- Business rules: auto-tags and event logging must match the web app exactly.
- Secrets: inspect app bundle and network responses to ensure no service-role key, CRON secret, or stored Discord webhook is exposed.
- UI: Android device/emulator first; test light/dark mode, safe areas, keyboard, large text, long IDs, empty/error/loading states, and back behavior.
- Performance: profile a release build on a lower-end supported Android device. Do not claim 60 fps without measurement.
- Deployment: separate mobile build/release pipeline; existing Vercel web deployment remains unchanged.

## 7. Approval gates and open decisions

Before implementation, confirm:

- Whether Android is the first and only target, or iOS is also required.
- Whether the existing Supabase project is the source of truth for the live web app and whether its schema/RLS can be inspected.
- Whether account image upload is required in the first release.
- Whether the Automation Center and Discord reporting must be included in the first mobile release, or can follow after the account library.

Until those checks are complete, this document is the implementation plan only. No native app has been built, tested, or deployed.
