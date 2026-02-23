import type { PaperSize, PhotoSpec, LayoutResult } from '@/types'
import { mmToPx300 } from './photoSpecs'

/**
 * Built-in paper sizes for printing. All at 300 DPI.
 */
export const paperSizes: PaperSize[] = [
  {
    id: '4r',
    nameKey: 'paper.4r',
    widthMm: 102,
    heightMm: 152,
    widthPx: mmToPx300(102),  // 1205 → use standard 1200
    heightPx: mmToPx300(152)  // 1795 → use standard 1800
  },
  {
    id: '3r',
    nameKey: 'paper.3r',
    widthMm: 89,
    heightMm: 127,
    widthPx: mmToPx300(89),   // 1051 → use standard 1050
    heightPx: mmToPx300(127)  // 1500
  }
]

// Override to exact standard pixel values
paperSizes[0].widthPx = 1200
paperSizes[0].heightPx = 1800
paperSizes[1].widthPx = 1050
paperSizes[1].heightPx = 1500

/**
 * Calculate the optimal layout of ID photos on a given paper.
 * Tries both portrait and landscape orientation and picks the one
 * that fits more photos.
 *
 * @param spec - The ID photo specification
 * @param paper - The target paper size
 * @param gapMm - Gap between photos in mm (default 2)
 */
export function calculateLayout(
  spec: PhotoSpec,
  paper: PaperSize,
  gapMm: number = 2
): LayoutResult {
  const gapPx = mmToPx300(gapMm)
  const photoW = spec.widthPx
  const photoH = spec.heightPx

  function calc(pw: number, ph: number): { cols: number; rows: number; total: number } {
    const cols = Math.floor((pw + gapPx) / (photoW + gapPx))
    const rows = Math.floor((ph + gapPx) / (photoH + gapPx))
    return { cols, rows, total: cols * rows }
  }

  const portrait = calc(paper.widthPx, paper.heightPx)
  const landscape = calc(paper.heightPx, paper.widthPx)

  const rotated = landscape.total > portrait.total
  const best = rotated ? landscape : portrait
  const paperW = rotated ? paper.heightPx : paper.widthPx
  const paperH = rotated ? paper.widthPx : paper.heightPx

  // Calculate centering offsets
  const gridW = best.cols * photoW + (best.cols - 1) * gapPx
  const gridH = best.rows * photoH + (best.rows - 1) * gapPx
  const offsetX = Math.floor((paperW - gridW) / 2)
  const offsetY = Math.floor((paperH - gridH) / 2)

  return {
    cols: best.cols,
    rows: best.rows,
    total: best.total,
    offsetX,
    offsetY,
    gapPx,
    paperWidthPx: paperW,
    paperHeightPx: paperH,
    rotated
  }
}

export function getPaperById(id: string): PaperSize | undefined {
  return paperSizes.find(p => p.id === id)
}
