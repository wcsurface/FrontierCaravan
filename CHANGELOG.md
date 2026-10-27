## [1.0.4] - 2026-10-26 (versionCode: 5)
- **Target SDK Upgrade**: Updated `targetSdk` from `35` to `36` (Android 16) in `app/build.gradle.kts` to meet Google Play Store requirements.
- **Google Play Billing Library Upgrade**: Upgraded `com.android.billingclient:billing-ktx` to version `8.0.0` (from `7.0.0`) in `app/build.gradle.kts` and refactored `enablePendingPurchases` with `PendingPurchasesParams` and `queryProductDetailsAsync` in `MainActivity.kt` to satisfy Google Play Store monetization requirements.
- **Google Play Release Prep**: Bumped `versionCode` to `5` and `versionName` to `"1.0.4"` in `app/build.gradle.kts`.
- **Direct Railway API Endpoint Routing**: Standardized all API sync (`/api/sync/pull`, `/api/sync/push`) and authentication requests to point directly to production Railway PostgreSQL (`https://frontiercaravan-production.up.railway.app`).
- **Global Function Scoping**: Moved core authentication, event handling, venue autocomplete, and UI feed functions into `<head>` script tag to guarantee instant execution.
- **Header Navigation Labels**: Updated navigation button label from "Profile" to "Settings".

## [Unreleased] - 2026-10-26

### Added
- **Project Rebranding & Clean Name Alignment**:
  - Renamed display titles, strings (`<string name="app_name">LiveLore</string>`), themes (`Theme.LiveLore`), Gradle root project (`rootProject.name = "LiveLore"`), shared preferences (`LiveLorePrefs`), and CI/CD pipelines to **LiveLore**.
  - Retained live infrastructure endpoint URLs (`frontier-caravan.vercel.app` & `frontiercaravan-production.up.railway.app`) and package namespace (`app.vercel.frontiercaravan`) to guarantee zero network or database disruptions.
- **Google Play Billing Library Integration (`AndroidBilling`)**:
  - Integrated `com.android.billingclient:billing-ktx:7.0.0` into native Android app (`MainActivity.kt`).
  - Registered Product ID `vip_pass_499` ($4.99 Non-Consumable In-App Product).
  - Wired `handleUpgradeVip()` to launch Google Play's official purchase sheet (supporting License Testing always-approved test payments).
  - Automatically acknowledges purchases and persists `$4.99` VIP Pass status to Railway PostgreSQL database (`/api/auth/upgrade-vip`).
- **Hidden Scrollbars Across Web & App**:
  - Global CSS rules (`*::-webkit-scrollbar { display: none !important; }` and `scrollbar-width: none !important;`) applied across `app/src/main/assets/index.html`, `frontend-web/public/index.html`, and `frontend-web/src/app/globals.css`.
  - Removes all visible scrollbars on Web browsers (Chrome, Safari, Firefox, Edge, iOS, Android) while preserving 100% full touch and wheel scrolling.
- **Multi-Platform Concert Sharing**:
  - Added prominent `🚀 SHARE CONCERT` CTA button on the Concert Details screen.
  - Implemented custom glassmorphic share modal with 6 target choices:
    1. Instagram (Stories / Feed)
    2. Messages / WhatsApp
    3. Facebook
    4. Reddit
    5. X (Twitter)
    6. More / Native OS Share Sheet
  - Standardized text share payload:
    ```text
    🎸 [Artist] live at [Venue] ([Date])!
    Notes: [Notes]
    Logged in LiveLore: Concert Diary & Setlist Vault
    ```
  - Added VIP photo attachment gating:
    - Standard Users share formatted text; tapping photo attachment displays upgrade prompt: *"Sharing concert photos and generated ticket cards is a VIP Vault feature. Upgrade to include photos with your shares!"*
    - VIP Users include primary concert photo or ticket card image alongside text payload when sharing.
- **Native Android Share Bridge (`AndroidShare`)**:
  - Implemented `AndroidShareInterface` in `MainActivity.kt` with `shareText()` and `shareImageAndText()` exposed to WebView JavaScript.
  - Uses `FileProvider` to share cached JPEG images with native Android apps.
- **Featured Ticket Stub Card Preview**:
  - Enhanced Concert Details screen to display the featured physical ticket stub preview at top.

### Fixed
- **Home Page Filter & Sorting**:
  - Fixed missing `handleSortChange()` function reference on Home page filter dropdown.
  - Added case-insensitive alphabetical sorting for Band (A-Z), Newest First, and Oldest First.
- **Dual Fail-Safe Vault Persistence & Data Safety**:
  - Added immediate local persistence to `localStorage` and `IndexedDB` inside `saveShowsToStorage()`.
  - Implemented non-destructive `mergeConcerts()` algorithm in `loadSavedShows()` to prevent cloud responses from overwriting unsaved local entries.
