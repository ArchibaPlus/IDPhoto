/**
 * Canvas utility functions for compositing and export.
 */

/**
 * Load a blob as an HTMLImageElement (for use in canvas drawImage).
 */
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * Crop a source image to the given area and resize to target dimensions.
 * Returns a PNG blob.
 *
 * @param sourceBlob - Original full image
 * @param cropArea - Crop coordinates (in source pixel space)
 * @param targetWidth - Output width in pixels
 * @param targetHeight - Output height in pixels
 */
export async function cropAndResize(
  sourceBlob: Blob,
  cropArea: { x: number; y: number; width: number; height: number },
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const img = await loadImageFromBlob(sourceBlob)

  const canvas = new OffscreenCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    img,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, targetWidth, targetHeight
  )

  return canvas.convertToBlob({ type: 'image/png', quality: 1 })
}

/**
 * Generate the final print layout canvas.
 *
 * @param photoBlob - The final single photo (with background) as Blob
 * @param layout - Layout computation result
 * @param photoWidthPx - Single photo width in px
 * @param photoHeightPx - Single photo height in px
 * @returns Canvas element ready for export
 */
export async function generateLayoutCanvas(
  photoBlob: Blob,
  layout: {
    cols: number
    rows: number
    offsetX: number
    offsetY: number
    gapPx: number
    paperWidthPx: number
    paperHeightPx: number
  },
  photoWidthPx: number,
  photoHeightPx: number
): Promise<HTMLCanvasElement> {
  const img = await loadImageFromBlob(photoBlob)

  const canvas = document.createElement('canvas')
  canvas.width = layout.paperWidthPx
  canvas.height = layout.paperHeightPx

  const ctx = canvas.getContext('2d')!

  // White paper background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw photos in grid
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x = layout.offsetX + col * (photoWidthPx + layout.gapPx)
      const y = layout.offsetY + row * (photoHeightPx + layout.gapPx)

      ctx.drawImage(img, x, y, photoWidthPx, photoHeightPx)

      // Draw cut lines (dashed border)
      ctx.strokeStyle = '#BBBBBB'
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.strokeRect(x - 0.5, y - 0.5, photoWidthPx + 1, photoHeightPx + 1)
    }
  }

  ctx.setLineDash([]) // Reset dash
  return canvas
}

/**
 * Export a canvas to a Blob.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      type,
      quality
    )
  })
}

/**
 * Trigger a browser download for a blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // Revoke after a delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
