/**
 * EXIF orientation handler.
 * Uses createImageBitmap with orientation option (modern browsers),
 * falls back to exifr for older browsers.
 */

/**
 * Load an image file and return a correctly-oriented ImageBitmap.
 */
export async function loadOrientedImage(file: File | Blob): Promise<ImageBitmap> {
  // Try the modern approach first
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'flipY' // This is actually 'from-image' in spec but some browsers use 'flipY'
    })
    // Test if the option was actually respected by trying the standard value
    bitmap.close()
  } catch {
    // ignore — will try the standard value below
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image' as any
    })
    return bitmap
  } catch {
    // Fallback: manual EXIF rotation
    return await loadWithExifCorrection(file)
  }
}

async function loadWithExifCorrection(file: File | Blob): Promise<ImageBitmap> {
  const exifr = await import('exifr')
  let orientation = 1

  try {
    const exifData = await exifr.parse(file, { pick: ['Orientation'] })
    if (exifData?.Orientation) {
      orientation = exifData.Orientation
    }
  } catch {
    // No EXIF data — use as-is
  }

  // Load image as HTMLImageElement
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)
  URL.revokeObjectURL(url)

  // If no rotation needed, return directly
  if (orientation <= 1) {
    return createImageBitmap(img)
  }

  // Create a canvas to apply the rotation
  const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight)
  const ctx = canvas.getContext('2d')!

  // Apply EXIF orientation transform
  applyExifTransform(ctx, orientation, img.naturalWidth, img.naturalHeight, canvas)
  ctx.drawImage(img, 0, 0)

  return createImageBitmap(canvas)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function applyExifTransform(
  ctx: OffscreenCanvasRenderingContext2D,
  orientation: number,
  w: number,
  h: number,
  canvas: OffscreenCanvas
): void {
  switch (orientation) {
    case 2: // Flip horizontal
      ctx.transform(-1, 0, 0, 1, w, 0)
      break
    case 3: // Rotate 180°
      ctx.transform(-1, 0, 0, -1, w, h)
      break
    case 4: // Flip vertical
      ctx.transform(1, 0, 0, -1, 0, h)
      break
    case 5: // Transpose
      canvas.width = h
      canvas.height = w
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6: // Rotate 90° CW
      canvas.width = h
      canvas.height = w
      ctx.transform(0, 1, -1, 0, h, 0)
      break
    case 7: // Transverse
      canvas.width = h
      canvas.height = w
      ctx.transform(0, -1, -1, 0, h, w)
      break
    case 8: // Rotate 90° CCW
      canvas.width = h
      canvas.height = w
      ctx.transform(0, -1, 1, 0, 0, w)
      break
  }
}
