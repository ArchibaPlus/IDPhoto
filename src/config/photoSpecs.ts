import type { PhotoSpec } from '@/types'

/**
 * Millimeters to pixels at 300 DPI.
 * 1 inch = 25.4 mm, 300 DPI → 1 mm ≈ 11.811 px
 */
export function mmToPx300(mm: number): number {
  return Math.round((mm / 25.4) * 300)
}

/**
 * Built-in ID photo specifications.
 * All pixel values are at 300 DPI.
 */
export const photoSpecs: PhotoSpec[] = [
  {
    id: 'uk-passport',
    nameKey: 'specs.ukPassport',
    widthMm: 35,
    heightMm: 45,
    widthPx: mmToPx300(35),   // 413
    heightPx: mmToPx300(45),  // 531
    headHeightMinMm: 29,
    headHeightMaxMm: 34,
    defaultBgColor: '#D5D5D5'
  },
  {
    id: 'us-visa',
    nameKey: 'specs.usVisa',
    widthMm: 51,
    heightMm: 51,
    widthPx: mmToPx300(51),   // 600
    heightPx: mmToPx300(51),  // 600
    headHeightMinMm: 25,
    headHeightMaxMm: 35,
    defaultBgColor: '#FFFFFF'
  },
  {
    id: 'hk-passport',
    nameKey: 'specs.hkPassport',
    widthMm: 40,
    heightMm: 50,
    widthPx: mmToPx300(40),   // 472
    heightPx: mmToPx300(50),  // 591
    headHeightMinMm: 32,
    headHeightMaxMm: 36,
    defaultBgColor: '#FFFFFF'
  },
  {
    id: 'china-visa',
    nameKey: 'specs.chinaVisa',
    widthMm: 33,
    heightMm: 48,
    widthPx: mmToPx300(33),   // 390
    heightPx: mmToPx300(48),  // 567
    headHeightMinMm: 28,
    headHeightMaxMm: 33,
    defaultBgColor: '#FFFFFF'
  },
  {
    id: 'schengen-visa',
    nameKey: 'specs.schengenVisa',
    widthMm: 35,
    heightMm: 45,
    widthPx: mmToPx300(35),   // 413
    heightPx: mmToPx300(45),  // 531
    headHeightMinMm: 32,
    headHeightMaxMm: 36,
    defaultBgColor: '#FFFFFF'
  },
  {
    id: 'japan-visa',
    nameKey: 'specs.japanVisa',
    widthMm: 45,
    heightMm: 45,
    widthPx: mmToPx300(45),   // 531
    heightPx: mmToPx300(45),  // 531
    headHeightMinMm: 30,
    headHeightMaxMm: 34,
    defaultBgColor: '#FFFFFF'
  }
]

export function getSpecById(id: string): PhotoSpec | undefined {
  return photoSpecs.find(s => s.id === id)
}
