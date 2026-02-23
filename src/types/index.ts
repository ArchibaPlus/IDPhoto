/** ID photo specification */
export interface PhotoSpec {
  id: string
  /** Display name key for i18n */
  nameKey: string
  /** Width in millimeters */
  widthMm: number
  /** Height in millimeters */
  heightMm: number
  /** Width in pixels at 300 DPI */
  widthPx: number
  /** Height in pixels at 300 DPI */
  heightPx: number
  /** Minimum head height in mm (crown to chin) */
  headHeightMinMm: number
  /** Maximum head height in mm (crown to chin) */
  headHeightMaxMm: number
  /** Default/required background color (hex) */
  defaultBgColor: string
}

/** Paper size for printing */
export interface PaperSize {
  id: string
  /** Display name key for i18n */
  nameKey: string
  /** Width in millimeters */
  widthMm: number
  /** Height in millimeters */
  heightMm: number
  /** Width in pixels at 300 DPI */
  widthPx: number
  /** Height in pixels at 300 DPI */
  heightPx: number
}

/** Layout computation result */
export interface LayoutResult {
  /** Number of columns */
  cols: number
  /** Number of rows */
  rows: number
  /** Total photos on the sheet */
  total: number
  /** Starting X offset in pixels to center the grid */
  offsetX: number
  /** Starting Y offset in pixels to center the grid */
  offsetY: number
  /** Gap between photos in pixels */
  gapPx: number
  /** Paper width in pixels */
  paperWidthPx: number
  /** Paper height in pixels */
  paperHeightPx: number
  /** Whether the paper is rotated to landscape for better fit */
  rotated: boolean
}

/** Crop area coordinates (relative 0-1) */
export interface CropArea {
  left: number
  top: number
  width: number
  height: number
}

/** Background color option */
export interface BgColorOption {
  id: string
  nameKey: string
  color: string
}

/** Application wizard state */
export interface AppState {
  /** Original source image as object URL */
  sourceImageUrl: string | null
  /** Original source image as Blob */
  sourceBlob: Blob | null
  /** Cropped image as Blob */
  croppedBlob: Blob | null
  /** Cropped image object URL */
  croppedImageUrl: string | null
  /** Background-removed image as Blob (transparent PNG) */
  bgRemovedBlob: Blob | null
  /** Background-removed image object URL */
  bgRemovedImageUrl: string | null
  /** Final image with background color applied as Blob */
  finalBlob: Blob | null
  /** Final image object URL */
  finalImageUrl: string | null
  /** Selected photo specification */
  selectedSpec: PhotoSpec | null
  /** Selected paper size */
  selectedPaper: PaperSize | null
  /** Selected background color */
  bgColor: string
  /** Current wizard step (1-4) */
  step: number
}
