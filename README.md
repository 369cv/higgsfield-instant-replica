# Higgsfield Instant — AI Media Recreator & Prompt Vault

> Exact replica of the official Higgsfield Instant Chrome Extension (`oohmjaflbknghbidmaoonmchcodhmkgj`) with full `@higgsfield/cli` and Higgsfield Soul 2.0 integration.

![Prompt Vault](public/gallery/ferrari_selfie.jpg)

## ⚡ Features

- **Personal Prompt Vault**: Clean edge-to-edge photography cards with **ZERO text clutter** on gallery cards.
- **Inspector Panel**: Full `savage_mode` author profile, tabs (`Info`, `Edit`, `Comments`), vision deconstructed prompt box with copy action, Soul 2.0 specs (`Quality: 2k`, `Size: 2048x2048`), and action bar (`Turn to video`, `Recreate`, `Reference`, `Download`).
- **4-Tile Generating Queue**: Exact 4-column row featuring the yellow-green/lime `( Generating` badge.
- **View Popover**: Layout toggling between `Square` and `Masonry` (with active `✓` checkmark), `Split by date`, and continuous `Card size` slider.
- **In-Page Floating Recreate Widget**: Injects on Instagram (`div._aagv`), Pinterest, and X with isolated Shadow DOM modal for one-click recreation with character identity preservation.
- **Direct CLI Integration**: Powered directly by your authenticated Higgsfield workspace account (`@higgsfield/cli`), syncing live generations, credits, and Soul IDs.

---

## 🚀 Quick Start

### 1. Run Web & Desktop Studio Locally
```bash
npm install
npm run start
```
- Web Studio: [http://localhost:5174](http://localhost:5174)
- CLI Bridge: [http://localhost:9876](http://localhost:9876)

### 2. Load into Google Chrome as Extension
1. Build the production extension:
   ```bash
   npm run build
   ```
2. Open Google Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the `dist/` folder from this repository.

---

## 🛠️ Tech Stack

- **Extension**: Chrome Manifest V3, Content Scripts, Service Worker, Chrome Side Panel API.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend / Daemon**: Node.js Express bridge connecting to `@higgsfield/cli`.

---

## 📄 License

MIT
