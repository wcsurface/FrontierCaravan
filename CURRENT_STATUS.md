# CURRENT_STATUS.md - LiveLore: Concert Diary & Setlist Vault

## Current Development Status
**Active Version**: 1.0.18 (versionCode: 19, API Backend v6.1.0)
**Build Status**: ✅ Passing (`:app:assembleDebug` & `:app:bundleRelease` build cleanly)

---

## Completed Features
- [x] **Canonicalized & Deduplicated Venue Database**: Ran a canonicalization pass over the venue database, merging name variants *(e.g. "Fiddlers Green Amphitheatre", "Fiddlers Green Amphitheater", "The Fiddlers Green Amphitheatre" ➔ "Fiddler's Green Amphitheatre")*, removing leading "The" prefixes, and standardizing truncated city/state names.
- [x] **Updated Concert Logging Terminology**: Updated form labels, input placeholders, dynamic field addition buttons, and detail view labels from "Opener" to **"Opening Artist"** and **"+ Add Another Opening Artist"**.
- [x] **Release Versioning**: Version **`1.0.18`** (`versionCode = 19`) active.
- [x] **Over-The-Air (OTA) Live Updates**: Configured `MainActivity.kt` to load live frontend updates dynamically from Vercel (`https://livelore-app.vercel.app`) when online. All future UI changes and feature enhancements now take effect **instantly without requiring new APK builds**.
- [x] **Release Versioning**: Version **`1.0.18`** (`versionCode = 19`) active.

---

## Completed Features
- [x] **Concert Logging & Vault**: Log headline artist, openers, date, venue, city, state, country, general notes, ticket price, and setlists.
- [x] **Multi-Color Vintage Ticket Stubs**: Automatic ticket color selection with classic or multi-color theme toggle.
- [x] **Strict Account Vault Isolation**: Each account (`wcsurface@gmail.com`, `reviewer@livelore.app`, `queenie162001@gmail.com`) is strictly isolated to its own cloud/local data vault; no cross-account data leakage. Pre-seeded credentials for `reviewer@livelore.app` (`TestPassword123!`).
- [x] **Smart Settings UI**: Automatically hides "CHANGE PASSWORD" section in Settings for Google Sign-In users since they authenticate via Google OAuth.
- [x] **Verified VIP Pass & Ad-Free Experience**: Confirmed `reviewer@livelore.app` recognized as VIP (`✓ VIP CONFIRMED`) with 100% ad-free experience, CSV export unlocked, and empty initial vault (`0 CONCERTS LOGGED`).
- [x] **Top Scroll Positioning**: Automatic scroll reset to `(0,0)` on all screen transitions, ensuring Logo, Header, Navigation bar, and VIP Pass card display at the top of the Settings view.
- [x] **Fail-Safe Offline/Cloud Vault Sync**: Immediate local persistence to `localStorage` + `IndexedDB` with non-destructive concert and photo merge (`POST /api/sync/push` & `GET /api/sync/pull`).
- [x] **Multi-Tier Account Authentication**: Login and registration with bcrypt hashing, JWT authentication, 6-digit OTP email password resets (Resend API), and Google Sign-In with 1-tap email confirmation.
- [x] **VIP Pass ($4.99 One-Time)**:
  - 100% Ad-Free experience across all screens.
  - Multi-photo attachments (up to 5 compressed memories per entry).
  - CSV Concert Vault Export (`AndroidCSV` MediaStore integration).
  - Photo attachment & ticket card sharing enabled.
- [x] **Multi-Platform Concert Sharing**:
  - Prominent `🚀 SHARE CONCERT` CTA on the show details screen.
  - Custom glassmorphic share modal sheet with 6 target platforms: Instagram, Messages/WhatsApp, Facebook, Reddit, X (Twitter), and OS Native Share.
  - Formatted text payload (`🎸 [Artist] live at [Venue] ([Date])!\nNotes: [Notes]\nLogged in LiveLore: Concert Diary & Setlist Vault`).
  - Native Android Share Bridge (`AndroidShare.shareText` & `AndroidShare.shareImageAndText`).
  - Non-intrusive VIP photo attachment gating with upgrade prompt (*"Sharing concert photos and generated ticket cards is a VIP Vault feature. Upgrade to include photos with your shares!"*).
- [x] **AdMob Banner Ads Integration**: Native Android AdMob banner ad integration with automatic screen-based and VIP-based hiding.

---

## Known Issues & Limitations
1. **Google Account Form Login**: Accounts created via Google OAuth Sign-In do not store a plaintext/hashed password in PostgreSQL; users must sign in via `Continue with Google`.
2. **AdMob Test Unit ID**: Currently configured to Google's official AdMob test banner unit ID (`ca-app-pub-3940256099942544/6300978111`) for testing. Production unit ID needed for release build.

---

## Next Recommended Steps
1. Configure production AdMob unit IDs in `MainActivity.kt` and `AndroidManifest.xml`.
2. Generate Google Play Store release build (`:app:assembleRelease`) with signed keystore.
3. Keep `app/src/main/assets/index.html` and `frontend-web/public/index.html` synchronized for all future UI/engine updates.
