# Halal Fans Chrome Extension — Web Store Submission Guide

## 1. Store Listing Metadata

- **Extension Title**: Halal Fans — AI Media Recreator & Prompt Vault
- **Short Description**: Recreate any image or video with Halal Fans and Soul character identity preservation directly from your browser.
- **Detailed Description**:
  Halal Fans bridges your web inspiration on Instagram, Pinterest, X, and creative portals directly into your AI generation pipeline and personal Prompt Vault.

  ### Key Features:
  - **1-Click Media Recreation**: Hover over any image on Instagram, Pinterest, or X and tap the Halal Fans Recreate button.
  - **Soul 2.0 Identity Consistency**: Keep your custom character faces, lighting, and expressions consistent across any recreated pose or aesthetic.
  - **4-Tile Generating Pipeline**: Monitor jobs in real-time with zero-latency streaming progress.
  - **Personal Prompt Vault**: Curate your generations in a clean, edge-to-edge gallery (no text overlay clutter), with full prompt deconstruction, specs, and one-click video conversion.
  - **Direct CLI & API Integration**: Powered directly by your workspace account, credits, and presets.

- **Category**: Productivity / Creative Tools
- **Version**: 1.3.8
- **Language**: English
- **Live Production URL**: [https://halalfans.me](https://halalfans.me) (aliased to [https://www.halalfans.me](https://www.halalfans.me))

---

## 2. Permissions Justification (Manifest V3)

| Permission | Purpose | Justification |
|---|---|---|
| `storage` | Local Vault & User Preferences | Caches saved prompt cards, active layout settings (Square vs. Masonry, card sizes), and offline job history. |
| `sidePanel` | Side Panel Companion | Displays the prompt vault, generating queue, and inspector side-by-side with web browsing. |
| `activeTab` | Temporary Tab Context | Captures the URL of the selected image/video when the user explicitly triggers recreation. |
| `contextMenus` | Right-Click Shortcut | Allows right-clicking any web image to "Recreate with Halal Fans". |
| `host_permissions: http://localhost:9876/*` | Local CLI Bridge | Connects the extension securely to the local bridge daemon running on the user's machine. |
| `host_permissions: https://*/*` | Host Matchers | Injects hover detection on authorized creative platforms (Instagram, Pinterest, X, etc.). |

---

## 3. Privacy Disclosures

- **Single Purpose**: Recreating visual assets and organizing AI prompts using Halal Fans services.
- **Data Collection**:
  - The extension collects user-selected image URLs only upon explicit user action ("Recreate" button click or context menu).
  - No personal browsing history, keystrokes, or unprompted web content is collected or tracked.
  - All communication is routed either to the user's local bridge or directly to verified API endpoints.

---

## 4. Asset Submission Checklist

- [x] Extension Icon 16x16 (`public/icons/icon16.png`)
- [x] Extension Icon 32x32 (`public/icons/icon32.png`)
- [x] Extension Icon 48x48 (`public/icons/icon48.png`)
- [x] Extension Icon 64x64 (`public/icons/icon64.png`)
- [x] Extension Icon 128x128 (`public/icons/icon128.png`)
- [x] Verified Manifest V3 format
- [x] Validated strict CSP and sandboxed scripts
