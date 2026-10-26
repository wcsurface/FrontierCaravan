# CURRENT_STATUS.md - LiveLore: Concert Diary & Setlist Vault

## Current Development Status
**Active Version**: 1.0.1 (Target SDK 36, Version Code 2, Play Billing Library v8.0.0)
**Build Status**: ✅ Passing (`:app:assembleDebug`, `:app:assembleRelease`, and `:app:bundleRelease` build cleanly)

---

## Completed Features
- [x] **Concert Logging & Vault**: Log headline artist, openers, date, venue, city, state, country, general notes, ticket price, and setlists.
- [x] **Multi-Color Vintage Ticket Stubs**: Automatic ticket color selection with classic or multi-color theme toggle.
- [x] **Fail-Safe Offline/Cloud Vault Sync**: Immediate local persistence to `localStorage` + `IndexedDB` with non-destructive cloud merge (`POST /api/sync/push` & `GET /api/sync/pull`).
- [x] **Multi-Tier Account Authentication**: Login and registration with bcrypt hashing, JWT authentication, 6-digit OTP email password resets (Resend API), and Google Sign-In via native bridge.
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
