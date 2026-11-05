# Higgsfield Instant Chrome Extension — Web Store Submission Guide

## 1. Store Listing Metadata

- **Extension Title**: Higgsfield Instant — AI Media Recreator & Prompt Vault
- **Short Description**: Recreate any image or video with Higgsfield AI and Soul character identity preservation directly from your browser.
- **Detailed Description**:
  Higgsfield Instant bridges your web inspiration on Instagram, Pinterest, X, and stock portals directly into your Higgsfield AI generation pipeline and personal Prompt Vault.

  ### Key Features:
  - **1-Click Media Recreation**: Hover over any image on Instagram, Pinterest, or X and tap the Higgsfield Recreate button.
  - **Soul 2.0 Identity Consistency**: Keep your custom character faces, lighting, and expressions consistent across any recreated pose or aesthetic.
  - **4-Tile Generating Pipeline**: Monitor jobs in real-time with zero-latency streaming progress.
  - **Personal Prompt Vault**: Curate your generations in a clean, edge-to-edge gallery (no text overlay clutter), with full prompt deconstruction, specs, and one-click video conversion.
  - **Direct CLI & API Integration**: Powered directly by your Higgsfield workspace account (`@higgsfield/cli`), credits, and presets.

- **Category**: Productivity / Creative Tools
- **Version**: 1.3.6
- **Language**: English

---

## 2. Permissions Justification (Manifest V3)

| Permission | Purpose | Justification |
|---|---|---|
| `storage` | Local Vault & User Preferences | Caches saved prompt cards, active layout settings (Square vs. Masonry, card sizes), and offline job history. |
| `sidePanel` | Side Panel Companion | Displays the prompt vault, generating queue, and inspector side-by-side with web browsing. |
| `activeTab` | Temporary Tab Context | Captures the URL of the selected image/video when the user explicitly triggers recreation. |
| `contextMenus` | Right-Click Shortcut | Allows right-clicking any web image to "Recreate with Higgsfield Instant". |
| `host_permissions: http://localhost:9876/*` | Local CLI Bridge | Connects the extension securely to the local `@higgsfield/cli` daemon running on the user's machine. |
| `host_permissions: https://*/*` | Host Matchers | Injects hover detection on authorized creative platforms (Instagram, Pinterest, X, etc.). |

---

## 3. Privacy Disclosures

- **Single Purpose**: Recreating visual assets and organizing AI prompts using Higgsfield AI services.
- **Data Collection**:
  - The extension collects user-selected image URLs only upon explicit user action ("Recreate" button click or context menu).
  - No personal browsing history, keystrokes, or unprompted web content is collected or tracked.
  - All communication is routed either to the user's local `@higgsfield/cli` bridge or directly to official Higgsfield API endpoints.

---

## 4. Asset Submission Checklist

- [x] Extension Icon 16x16 (`public/icons/icon16.png`)
- [x] Extension Icon 32x32 (`public/icons/icon32.png`)
- [x] Extension Icon 48x48 (`public/icons/icon48.png`)
- [x] Extension Icon 64x64 (`public/icons/icon64.png`)
- [x] Extension Icon 128x128 (`public/icons/icon128.png`)
- [x] Verified Manifest V3 format
- [x] Validated strict CSP and sandboxed scripts
