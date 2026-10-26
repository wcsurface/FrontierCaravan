# PROJECT_MEMORY.md - LiveLore: Concert Diary & Setlist Vault

## 1. Application Purpose & Intended Users
**LiveLore** (package ID: `app.vercel.frontiercaravan`, brand name: **LiveLore: Concert Diary & Setlist Vault**) is a cross-platform concert tracking application built for live music enthusiasts, concertgoers, and music archivists.

Key capabilities:
- Log live concert experiences (Headline artist, opener(s), date, venue, city, state, country, general notes, ticket prices, and setlists).
- Attach and view up to 5 concert photo memories per entry.
- View concert tickets formatted as vintage multi-color physical ticket stubs.
- Analyze concert statistics (total concerts logged, unique artists, unique venues, top cities/states/years, top days of the week, and concert investment total).
- Cloud sync across devices via Railway PostgreSQL and Vercel endpoints, with fail-safe local offline storage (`localStorage` + `IndexedDB`).
- One-time **VIP Pass ($4.99)** tier offering 100% ad-free experience, multi-photo concert memories, and CSV vault data export.

---

## 2. Actual Technology Stack & Architecture

### **Architecture Overview**
The application uses a hybrid client-server architecture with dual frontend targets (Native Android WebView app & Next.js Web App) backed by a central Node.js REST API with PostgreSQL database persistence.

```
+-------------------------------------------------------+
|                 CLIENT LAYER                          |
|  Android App (Kotlin + WebView) / Web (Next.js / Vercel)|
|                       |                               |
|        Single-File HTML5/JS/CSS Engine                |
|           (index.html / public/index.html)            |
+-------------------------------------------------------+
                        |
                        v REST (JSON)
+-------------------------------------------------------+
|                 BACKEND LAYER                         |
|      Express.js API Server (TypeScript / Node.js)     |
|          Deployed on Railway & Next.js Routes         |
+-------------------------------------------------------+
                        |
                        v Prisma ORM
+-------------------------------------------------------+
|                 DATABASE LAYER                        |
|            Railway PostgreSQL Database                |
+-------------------------------------------------------+
```

### **Tech Stack Breakdown**

1. **Android Client (`:app`)**:
   - **Language**: Kotlin 1.9+
   - **Target SDK**: 35 (Android 15) / Compile SDK: 37
   - **Min SDK**: 26 (Android 8.0)
   - **Key Libraries**: AndroidX WebKit (`1.12.1`), AppCompat (`1.7.0`), Gson (`2.11.0`), Google Play Services Ads / AdMob (`23.6.0`).
   - **Native Bridges exposed to JavaScript**:
     - `AndroidHaptics` (Haptic vibration feedback)
     - `AndroidGoogleAuth` (Native Android AccountManager Google Sign-In)
     - `AndroidAdMob` (Toggles native AdMob banner ads)
     - `AndroidCSV` (Saves CSV files to device Downloads via `MediaStore`)
     - `AndroidShare` (Invokes Android OS native system share sheet with image & text support)

2. **Web Client (`frontend-web`)**:
   - **Framework**: Next.js 14 (`^14.2.15`) + React 18
   - **Styling**: Tailwind CSS + PostCSS + Lucide Icons
   - **State Management**: Zustand
   - **Deployment**: Vercel (`frontier-caravan.vercel.app`)

3. **Backend API (`backend-api`)**:
   - **Runtime**: Node.js (TypeScript `^5.6.3`, Express `^4.21.1`)
   - **ORM**: Prisma `^5.21.0`
   - **Database**: PostgreSQL (Hosted on Railway)
   - **Auth**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`)
   - **Email Service**: Resend API (`api.resend.com`) for 6-digit OTP password reset codes
   - **Deployment**: Railway (`frontiercaravan-production.up.railway.app`) via Nixpacks / Dockerfile

---

## 3. Project Structure & Important File Locations

```
FrontierCaravan/
├── AGENTS.md                   # Permanent AI project instructions & rules
├── PROJECT_MEMORY.md           # Permanent project architecture & state memory (THIS FILE)
│
├── app/                        # Android Native App Sub-Project
│   ├── build.gradle.kts        # Android build configuration & dependencies
│   └── src/main/
│       ├── AndroidManifest.xml # Permissions, AdMob app ID, FileProvider, Activity config
│       ├── assets/
│       │   └── index.html      # CORE SINGLE-FILE APP ENGINE (JS/CSS/HTML)
│       └── java/app/vercel/frontiercaravan/
│           ├── MainActivity.kt # Main Activity, WebView setup, AdMob, WebChromeClient chooser
│           ├── AndroidNativeBridge.kt # Device ID, vibrations, orientation, audio cues
│           └── NativeSpaceBridge.kt   # Additional native utility bridge
│
├── backend-api/                # Node.js / Express Backend Server
│   ├── package.json            # Scripts and dependencies
│   ├── Dockerfile & nixpacks.toml # Deployment configs for Railway
│   ├── prisma/
│   │   └── schema.prisma       # User & ConcertVault database models
│   └── src/
│       ├── server.ts           # Main Express server, auth endpoints, sync endpoints
│       └── routes/
│           └── discoveries.ts  # Community discoveries & bases endpoints
│
└── frontend-web/               # Next.js Web Application
    ├── package.json            # Web app dependencies
    ├── vercel.json             # Vercel deployment routes
    ├── public/
    │   ├── index.html          # Synchronized copy of core index.html engine
    │   └── vaults/             # Sample/test vault json files
    └── src/
        ├── app/
        │   ├── page.tsx        # Embeds /index.html in full-screen iframe
        │   └── api/            # Serverless Next.js API route mirrors
        ├── components/         # React UI component implementations
        └── engine/             # Concert data types, venue dataset, setlist parser
```

---

## 4. Existing Screens & Navigation Flow

The UI uses a single-page application (SPA) screen switcher pattern (`showScreen(screenId)`). All screens are defined in `index.html`.

1. **Auth Screen (`view-auth` / `'auth'`)**:
   - Google Sign-In button (`Continue with Google`).
   - Tab switcher for `Log In` / `Create Account`.
   - Email and password input fields.
   - Forgot Password link (opens 6-digit OTP verification modal).

2. **Diary / Home Screen (`view-diary` / `'diary'`)**:
   - Fixed top header with enlarged LiveLore logo and 4-button glassmorphic navigation bar (`Home`, `Add`, `Profile`, `Stats`).
   - Sort & Filter control bar (`Newest First`, `Oldest First`, `Band (A-Z)`).
   - Scrollable feed of concert ticket stub cards.
   - Empty state prompt with upward pointing animation if 0 concerts are logged.

3. **Log / Edit Concert Screen (`view-log` / `'log'`)**:
   - Headline Artist field.
   - Opener(s) field with `+ Add Another Opener` dynamic list.
   - Date field (MM/DD/YYYY format with auto-formatting).
   - Venue Name (with auto-complete dropdown from 100+ venue dataset), City, State/Province, Country.
   - General Notes text area.
   - Concert Photos section (up to 5 photo thumbnails for VIPs; VIP Upgrade tile for standard members).
   - Action CTA button (`+ ADD CONCERT` or `SAVE CHANGES`).

4. **Concert Detail Screen (`view-detail` / `'detail'`)**:
   - Large physical ticket stub representation.
   - Concert Metadata (Date, Venue, Location, Opener list, General Notes).
   - Concert Photo Memories gallery (Tap any thumbnail to open the lightbox modal).
   - **`🚀 SHARE CONCERT`** button opening custom share action sheet (Instagram, Messages/WhatsApp, Facebook, Reddit, X/Twitter, Native OS Share).
   - Edit Concert (`btn-edit`) and Delete Concert (`btn-delete`) buttons.

5. **Stats Overview Screen (`view-stats` / `'stats'`)**:
   - Total Concerts Logged count.
   - Unique Artists, Unique Venues, Top Cities, Top States/Provinces, Top Years, and Total Concert Investment.
   - Interactive breakdown cards.

6. **Profile Dashboard Screen (`view-profile` / `'profile'`)**:
   - User account email display.
   - **VIP Pass Status Card** (`#profile-vip-card-box`):
     - Displays VIP active status or Standard Member status with `$4.99 One-Time Upgrade` button (`handleUpgradeVip()`).
   - **Download Concert Data (CSV)** button (VIP exclusive feature; triggers native `shareCsv` or web CSV download).
   - Theme toggle switcher (`Multicolor Vintage`, `Classic Gold`).
   - Change Password button (opens secure password update modal).
   - Sign Out button (`handleLogout()`).

7. **Legal & Information Screens**:
   - **Terms of Service (`view-terms` / `'terms'`)**
   - **Privacy Policy (`view-privacy` / `'privacy'`)**
   - **FAQ (`view-faq` / `'faq'`)**

8. **Modals & Dialogs**:
   - **Photo Lightbox Modal** (`#photo-lightbox-modal`): Fullscreen photo viewer with previous/next controls.
   - **Custom Dialog Modal** (`#custom-dialog-modal`): Glassmorphic alert and confirm dialogs.
   - **Password Reset Prompt Modal** (`#custom-prompt-modal`): Handles 6-digit OTP code input and password reset.

---

## 5. Implemented Features & How They Work

### **1. Fail-Safe Dual Persistence & Multi-Tier Sync**
- **Local Persistence**: Whenever a concert is created, updated, or deleted, `saveShowsToStorage()` **immediately** writes the full `userShows` array to both `localStorage` (`livelore_vault_<email>`) and `IndexedDB`. This ensures 100% data safety on-device regardless of network connectivity or image payload size.
- **Cloud Persistence**: After saving locally, `saveShowsToStorage()` sends a `POST /api/sync/push` payload to Railway PostgreSQL.
- **Non-Destructive Cloud Merge**: On app startup or login, `loadSavedShows()` pulls cloud data from `GET /api/sync/pull`. It runs `mergeConcerts(localList, cloudList)` to combine local and cloud records by unique ID or `headline + date + venue`, ensuring local concerts are **never overwritten or lost**.

### **2. Authentication Flow**
- **Multi-Tier Password Verification**:
  - `handleLoginSubmit()` sends a `POST /api/auth/login` request to Railway PostgreSQL (`bcrypt.compare`).
  - **Wrong Password**: Railway returns `401 Unauthorized`. The app displays `Invalid email or password. Please try again.`, calls `resetSubmitButton()`, and halts access.
  - **Correct Password**: Railway returns `200 OK`, generates a JWT, stores the active user session in `localStorage`, and opens the diary.
  - **Network Failure Fallback**: Compares against local password hash (`livelore_creds_<cleanEmail>`).
- **Google Sign-In**:
  - Handled via `AndroidGoogleAuth` native bridge on Android (`AccountManager.newChooseAccountIntent`).
  - Triggers `onNativeGoogleAuthSuccess(email)` to store user session and open diary.

### **3. VIP Pass ($4.99 One-Time) Gatekeeping**
- **VIP Identification**: `checkIsVIPUser(email)` returns `true` for `wcsurface@gmail.com` or users with `isVIP === true` in PostgreSQL / `localStorage`.
- **Photo Memories**:
  - VIP users can attach up to 5 photos per concert entry.
  - Non-VIP users see a `👑 VIP ONLY` tile button in the concert form. Tapping it calls `navigateToProfileVip()`, navigating to the Profile screen and scrolling to the VIP Pass card.
- **CSV Data Export**:
  - VIP users can export their concert vault as a formatted `.csv` file. Non-VIP users are prompted and redirected to the VIP Pass card.
- **No Ads**:
  - Ads are hidden across ALL screens for VIP users (`window.AndroidAdMob.hideBannerAd()`).

### **4. AdMob Banner Ad Integration**
- Android app displays native AdMob banner ads at the bottom of the screen (`adContainerLayout`).
- Ads are **100% hidden** on `auth`, `terms`, `privacy`, and `faq` screens for all users.
- Ads are **permanently hidden on all screens** for VIP Pass members.

### **5. Image Compression Engine**
- `compressImageDataUrl()` resizes user-selected concert photos down to max 800x800px at 0.7 JPEG quality, producing lightweight base64 URIs (~50-80KB per photo) that sync over HTTP in milliseconds.

### **6. Multi-Platform Concert Sharing**
- Prominent `🚀 SHARE CONCERT` CTA on the concert details screen.
- Custom share sheet offering 6 targets: Instagram, Messages/WhatsApp, Facebook, Reddit, X (Twitter), and More / Native OS Share.
- VIP Photo Gating:
  - **Standard Users**: Share text payload (`🎸 [Artist] live at [Venue] ([Date])!\nNotes: [Notes]\nLogged in LiveLore: Concert Diary & Setlist Vault`). If photo attachment is tapped, displays VIP upgrade prompt (*"Sharing concert photos and generated ticket cards is a VIP Vault feature. Upgrade to include photos with your shares!"*).
  - **VIP Users**: Include primary concert photo or ticket card image alongside formatted text payload when sharing via `AndroidShare.shareImageAndText` or Web Share API.

---

## 6. UI Design Rules & Established Decisions

- **Color Palette**:
  - Primary Dark Background: `#0A0D0E`
  - Secondary Container Background: `#121619`
  - Gold Accent: `#FFB300`
  - Green CTA / Accent: `#00E676` / `#00C853`
  - Input Borders: `#FFB300`
  - Text Primary: `#f1f5f9` / `#ffffff`
  - Text Secondary: `#94a3b8` / `#64748b`
- **Ticket Stub Color Palette**: Assortment of multi-color vintage ticket stub styles (`#F7C252` Warm Gold, `#F7A993` Vintage Peach, etc.) and classic ticket theme (`#f4e4bc`).
- **Glassmorphic Navigation Bar**: Fixed glassmorphic navigation bar with blurred background and glowing borders (`#F6B756` Home/Profile, `#2DE38E` Add/Stats) positioned directly under the header logo.
- **Hidden Scrollbars Rule**: All scrollbars are hidden across Web, Chrome, Safari, Firefox, Edge, and iOS/Android using `*::-webkit-scrollbar { display: none !important; }` and `scrollbar-width: none !important;` while maintaining 100% full touch/mouse scrolling functionality.
- **Character Encoding Rule**: All special characters and bullet points MUST use explicit HTML entities (e.g., `&bull;`, `&#169;`, `&uarr;`) rather than raw UTF-8 symbols to prevent Windows/PowerShell encoding corruption (`â€¢`).

---

## 7. Backend Services, APIs, Authentication, & Database Integrations

### **Database Schema (Railway PostgreSQL via Prisma)**
- `User` table: `id` (UUID), `email` (unique), `passwordHash`, `displayName`, `isVIP` (Boolean, default `false`), `createdAt`, `updatedAt`.
- `ConcertVault` table: `id` (UUID), `userId` (unique foreign key to `User.id`), `concertsData` (JSONB array of concert objects), `updatedAt`.

### **Backend API Endpoints (`https://frontiercaravan-production.up.railway.app`)**
- `GET /health`: Server health and version status.
- `GET /api/debug/vaults`: Debug endpoint listing vaults and users.
- `POST /api/auth/register`: Create user account with bcrypt password hash & JWT token.
- `POST /api/auth/login`: Authenticate user with bcrypt comparison & JWT token.
- `GET /api/auth/me`: Validate JWT token and return active user profile.
- `POST /api/auth/upgrade-vip`: Persist `$4.99` VIP Pass status for email.
- `POST /api/auth/forgot-password`: Generate 6-digit OTP code and send via Resend API email.
- `POST /api/auth/reset-password`: Verify 6-digit OTP code and update password.
- `POST /api/sync/push`: Upsert user's `concertsData` JSONB array into PostgreSQL.
- `GET /api/sync/pull`: Retrieve and merge user's `concertsData` JSONB array from PostgreSQL.
- `GET /api/venues/community`: Community crowdsourced venues list (threshold = 5 unique users).

---

## 8. Important Technical Decisions That Must Not Be Casually Changed

1. **Keep `index.html` as the Core App Engine**: Both the Android app (`WebView`) and Vercel web app (`iframe`) run the same single-file HTML/JS/CSS application engine in `app/src/main/assets/index.html` and `frontend-web/public/index.html`. Changes MUST be kept in sync across both copies.
2. **Dual Fail-Safe Local & Cloud Persistence**: Never remove the immediate `localStorage` / `IndexedDB` write inside `saveShowsToStorage()`. Local data must always be saved first.
3. **Non-Destructive Cloud Sync Merge**: Never allow `loadSavedShows()` or `/api/sync/pull` to overwrite local shows without calling `mergeConcerts()`.
4. **Android WebView Settings**: `MainActivity.kt` MUST keep `allowUniversalAccessFromFileURLs = true` and `allowFileAccessFromFileURLs = true` so the local asset `file:///` WebView can perform cross-origin HTTPS requests to Railway and Vercel API servers.
5. **Character Encoding**: Use HTML entities (`&bull;`) instead of literal bullet characters (`•`).
6. **Button State Management**: On authentication errors, `resetSubmitButton()` MUST be called to re-enable the button (`disabled = false`) and reset text back to `LOG IN` or `CREATE ACCOUNT`.

---

## 9. Known Bugs, Incomplete Functionality, & Technical Limitations

1. **Google Account Password Login**: Users who register via Google Sign-In do not have a text password stored in PostgreSQL. Attempting to log into a Google-created account using the email/password form will return `Invalid email or password.` (users must click `Continue with Google`).
2. **Device Offline Account Creation**: Users can create concerts offline, but online email authentication requires network access to Railway API or pre-seeded local credentials.
3. **AdMob Banner Unit ID**: Currently configured to Google's official AdMob test banner unit ID (`ca-app-pub-3940256099942544/6300978111`) for development and testing. Real AdMob production unit ID will need to be configured before final Google Play Store release.

---

## 10. Current Development Priorities

1. Maintain rock-solid authentication, data safety, and zero-loss concert vault synchronization.
2. Prepare Google Play Store release assets (App icons, screenshots, production AdMob IDs, privacy policy URLs).
3. Ensure ongoing consistency between Android native assets (`app/src/main/assets/index.html`) and Web public assets (`frontend-web/public/index.html`).
