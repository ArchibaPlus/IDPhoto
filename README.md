# 證件相自動排版 — ID Photo Maker

A **fully client-side** web application for creating ID / passport photos. Upload or take a photo, crop to spec, optionally remove the background with on-device AI, then auto-layout onto printable paper — all without uploading a single byte to any server.

## ✨ Features

| Step | Description |
|------|-------------|
| **1. Upload / Capture** | Drag-and-drop, file picker, or live camera capture. EXIF orientation is auto-corrected. |
| **2. Crop & Align** | Interactive cropper with face-guide overlay (head-top / chin lines, center axis, face oval). Aspect ratio is locked to the selected spec. |
| **3. Background Removal** | Optional AI-powered background removal ([`@imgly/background-removal`](https://github.com/nicehash/background-removal-js)) running entirely in-browser via ONNX / WebGL. Includes edge-refinement slider and preset / custom background colors. |
| **4. Layout & Export** | Auto-arrange photos onto 4R or 3R paper with cut lines. Download as high-quality 300 DPI JPG or PNG. |

### Supported ID Photo Specs

| Spec | Size |
|------|------|
| UK Passport | 35 × 45 mm |
| US Visa | 51 × 51 mm |
| HK SAR Passport | 40 × 50 mm |
| China Visa | 33 × 48 mm |
| Schengen Visa | 35 × 45 mm |
| Japan Visa | 45 × 45 mm |

## 🔒 Privacy

**Zero server uploads.** All image processing (cropping, AI background removal, compositing, export) happens locally in the browser. Your photos never leave your device.

## 🛠 Tech Stack

- **Vue 3** (Composition API + `<script setup>`) + **TypeScript**
- **Vite 6** — HMR dev server & optimized production builds
- **vue-advanced-cropper** — interactive image cropping with custom stencil
- **@imgly/background-removal** — on-device AI background removal (ISNet model)
- **vue-i18n** — 繁體中文 (default) + English
- **vite-plugin-pwa** — installable PWA with Workbox caching (ONNX models cached on first load)
- **exifr** — EXIF orientation fallback for older browsers

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Vue components
│   ├── ui/              #   Reusable UI primitives (BaseButton, LoadingSpinner, StepIndicator)
│   ├── BackgroundEditor.vue
│   ├── CameraCapture.vue
│   ├── CropEditor.vue
│   ├── FaceGuideStencil.vue   # Custom vue-advanced-cropper stencil
│   ├── LayoutPreview.vue
│   └── PhotoUploader.vue
├── composables/         # Reactive state & logic hooks
│   ├── useAppStore.ts   #   Global reactive singleton store
│   ├── useBackgroundRemoval.ts
│   ├── useCamera.ts
│   └── useLayout.ts
├── config/
│   ├── paperSizes.ts    # 4R / 3R paper definitions + layout calculator
│   └── photoSpecs.ts    # ID photo specs (mm → px @300 DPI)
├── i18n/                # zh-TW.json, en.json
├── services/
│   ├── bgRemoval.ts     # AI bg removal + mask post-processing pipeline
│   ├── canvasUtils.ts   # Canvas compositing & export utilities
│   └── exifHandler.ts   # EXIF orientation correction
├── types/               # TypeScript interfaces
├── views/               # Page-level route components
│   ├── HomePage.vue
│   ├── CropPage.vue
│   ├── BackgroundPage.vue
│   └── LayoutPage.vue
├── App.vue
├── main.ts
└── router.ts
```

## 🌐 Internationalization

The app defaults to **繁體中文** and includes **English**. Switch languages via the toggle in the header. Add new locales by creating a JSON file in `src/i18n/` and registering it in `src/i18n/index.ts`.

## 📄 License

MIT
