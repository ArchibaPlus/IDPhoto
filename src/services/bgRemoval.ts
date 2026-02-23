/**
 * Background removal service using @imgly/background-removal.
 * Lazily initializes the library on first call.
 *
 * Includes mask post-processing (dilation + edge softening)
 * to prevent the AI model from cutting into the subject's head/clothes.
 */

import type { Config } from '@imgly/background-removal'

let removeBackgroundFn: ((blob: Blob, config?: Config) => Promise<Blob>) | null = null

/**
 * Initialize the background removal library lazily.
 */
async function initBgRemoval() {
  if (!removeBackgroundFn) {
    const module = await import('@imgly/background-removal')
    removeBackgroundFn = module.removeBackground
  }
  return removeBackgroundFn
}

export interface BgRemovalProgress {
  /** Progress phase name */
  key: string
  /** Progress value between 0 and 1 */
  progress: number
}

/**
 * Remove the background from an image blob.
 * Returns a transparent PNG blob with refined edges.
 *
 * @param imageBlob - Source image
 * @param onProgress - Optional progress callback
 * @param edgeSize - Edge refinement radius in pixels (default 3). Higher = more forgiving mask.
 * @returns Transparent PNG blob
 */
export async function removeBackground(
  imageBlob: Blob,
  onProgress?: (p: BgRemovalProgress) => void,
  edgeSize: number = 3
): Promise<Blob> {
  const removeBg = await initBgRemoval()

  // Step 1: Get the raw foreground (transparent PNG) from the model
  const config: Config = {
    model: 'isnet',
    progress: (key: string, current: number, total: number) => {
      if (onProgress) {
        onProgress({
          key,
          progress: total > 0 ? current / total : 0
        })
      }
    },
    output: {
      format: 'image/png',
      quality: 1
    }
  }

  const rawResult = await removeBg(imageBlob, config)

  // Step 2: Post-process the mask to fix head/clothes clipping
  const refinedResult = await refineMask(imageBlob, rawResult, edgeSize)
  return refinedResult
}

/**
 * Refine the alpha mask from the AI model.
 *
 * The AI model often produces a mask that's slightly too tight,
 * cutting into the subject's hair, head edges, and clothes.
 * This function extracts the alpha channel, dilates it, applies
 * a gentle blur for smooth edges, then re-composites the result.
 *
 * @param originalBlob - The original source image
 * @param foregroundBlob - The AI output (transparent PNG)
 * @param dilateRadius - How many pixels to expand the mask (default 3)
 */
async function refineMask(
  originalBlob: Blob,
  foregroundBlob: Blob,
  dilateRadius: number
): Promise<Blob> {
  const originalBitmap = await createImageBitmap(originalBlob)
  const foregroundBitmap = await createImageBitmap(foregroundBlob)

  const w = foregroundBitmap.width
  const h = foregroundBitmap.height

  // Draw foreground to extract its alpha channel
  const fgCanvas = new OffscreenCanvas(w, h)
  const fgCtx = fgCanvas.getContext('2d', { willReadFrequently: true })!
  fgCtx.drawImage(foregroundBitmap, 0, 0)
  const fgData = fgCtx.getImageData(0, 0, w, h)
  foregroundBitmap.close()

  // Extract alpha channel as a grayscale mask
  const mask = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    mask[i] = fgData.data[i * 4 + 3]
  }

  // Dilate the mask: expand foreground pixels by dilateRadius
  const dilated = dilateMask(mask, w, h, dilateRadius)

  // Apply box blur to soften edges (2-pass, radius 2)
  const blurred = boxBlurMask(dilated, w, h, 2)

  // Now composite: use original image pixels with the refined alpha mask
  const outCanvas = new OffscreenCanvas(w, h)
  const outCtx = outCanvas.getContext('2d')!

  // Draw the original image at the same size as the foreground output
  outCtx.drawImage(originalBitmap, 0, 0, w, h)
  originalBitmap.close()

  const outData = outCtx.getImageData(0, 0, w, h)

  // Apply the refined mask as alpha
  for (let i = 0; i < w * h; i++) {
    outData.data[i * 4 + 3] = blurred[i]
  }

  outCtx.putImageData(outData, 0, 0)

  return outCanvas.convertToBlob({ type: 'image/png', quality: 1 })
}

/**
 * Dilate (expand) a grayscale mask by the given radius.
 * For each pixel, take the maximum value in the surrounding area.
 * This expands the foreground region, preventing edge clipping.
 */
function dilateMask(mask: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  if (radius <= 0) return mask

  const out = new Uint8Array(w * h)

  // Two-pass separable dilation for performance
  // Horizontal pass
  const temp = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let maxVal = 0
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(w - 1, x + radius)
      for (let xi = x0; xi <= x1; xi++) {
        const v = mask[y * w + xi]
        if (v > maxVal) maxVal = v
      }
      temp[y * w + x] = maxVal
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let maxVal = 0
      const y0 = Math.max(0, y - radius)
      const y1 = Math.min(h - 1, y + radius)
      for (let yi = y0; yi <= y1; yi++) {
        const v = temp[yi * w + x]
        if (v > maxVal) maxVal = v
      }
      out[y * w + x] = maxVal
    }
  }

  return out
}

/**
 * Apply a separable box blur to a grayscale mask.
 * This softens the edges of the mask for a natural transition.
 */
function boxBlurMask(mask: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  if (radius <= 0) return mask

  const temp = new Uint8Array(w * h)
  const out = new Uint8Array(w * h)
  const kernelSize = radius * 2 + 1

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(w - 1, x + radius)
      const count = x1 - x0 + 1
      for (let xi = x0; xi <= x1; xi++) {
        sum += mask[y * w + xi]
      }
      temp[y * w + x] = Math.round(sum / count)
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      const y0 = Math.max(0, y - radius)
      const y1 = Math.min(h - 1, y + radius)
      const count = y1 - y0 + 1
      for (let yi = y0; yi <= y1; yi++) {
        sum += temp[yi * w + x]
      }
      out[y * w + x] = Math.round(sum / count)
    }
  }

  return out
}

/**
 * Apply a solid background color to a transparent PNG blob.
 *
 * @param transparentBlob - PNG with transparency
 * @param bgColor - CSS color string (e.g. '#FFFFFF')
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @returns PNG blob with solid background
 */
export async function applyBackgroundColor(
  transparentBlob: Blob,
  bgColor: string,
  width: number,
  height: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(transparentBlob)

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  // Fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  // Draw the transparent image on top
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const resultBlob = await canvas.convertToBlob({ type: 'image/png', quality: 1 })
  return resultBlob
}

/**
 * Re-apply background removal with a different edge size but reusing existing mask.
 * Used for real-time refinement slider without re-running the AI model.
 *
 * @param originalBlob  - Original source image
 * @param rawForegroundBlob - Raw AI output (first pass, unrefined)
 * @param edgeSize - Edge refinement radius
 */
export async function refineWithEdgeSize(
  originalBlob: Blob,
  rawForegroundBlob: Blob,
  edgeSize: number
): Promise<Blob> {
  return refineMask(originalBlob, rawForegroundBlob, edgeSize)
}
