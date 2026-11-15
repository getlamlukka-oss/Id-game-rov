# ROV ID Manager Mobile

A separate Expo / React Native client for the existing ROV ID Manager Supabase project. The Next.js web app remains unchanged.

## Current scope

- Supabase email/password sign-in using the existing user accounts.
- Session restore and token refresh while the app is active.
- Owner-scoped read-only access to categories and game accounts through existing RLS.
- Search by game ID, character name, notes, and category.
- Category and played-status filters.
- Account detail view, including the existing notes and owned-skin note format.
- Category counts and account counts.

Account create, edit, and delete are intentionally not enabled in this first mobile slice. The current web Server Actions also apply auto-tags and record automation events. Direct mobile writes would bypass that business logic. A shared authenticated server endpoint must be implemented and tested before enabling mutations.

Automation / Discord settings are also excluded from this first slice. Discord webhook URLs and service-role credentials must remain server-side.

## Requirements

- Node.js compatible with Expo SDK 57 (use the current Expo environment guide).
- Expo Go on Android for the first device preview.
- A Supabase project URL and publishable key. Never use a service-role or secret key.

## Setup

1. Copy .env.example to .env in this folder.
2. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY using the project's public client configuration.
3. From this folder, run npm install.
4. Run npx expo start.
5. Open Expo Go on Android and scan the QR code.

For Android development, the phone and the computer running Expo CLI must be able to reach each other on the same network. If the network blocks LAN discovery, use Expo CLI's tunnel mode.

## Security

The mobile client uses the publishable key only. Access to categories and game_accounts depends on the authenticated user's existing Supabase RLS policies. Never add service-role keys, CRON secrets, or Discord webhook URLs to EXPO_PUBLIC variables.

Supabase Auth session persistence follows the official React Native quickstart and uses AsyncStorage. AsyncStorage is not an encrypted vault; protect the device with its OS lock screen and do not store additional secrets in it. Revisit secure session storage if the app's threat model requires stronger at-rest protection.

## Verification status

The source files are committed, but dependencies have not been installed and no Expo typecheck, Metro bundle, Android emulator, or physical-device run has been performed in this environment.
