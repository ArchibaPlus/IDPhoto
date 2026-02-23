/**
 * Background removal composable — wraps the bgRemoval service with reactive state.
 * Includes support for edge refinement (adjustable mask dilation).
 */

import { ref } from 'vue'
import {
  removeBackground as removeBgService,
  applyBackgroundColor,
  refineWithEdgeSize
} from '@/services/bgRemoval'
import type { BgRemovalProgress } from '@/services/bgRemoval'

export function useBackgroundRemoval() {
  const isProcessing = ref(false)
  const isRefining = ref(false)
  const progress = ref(0)
  const progressKey = ref('')
  const error = ref<string | null>(null)

  /** Stores the raw AI output for re-refinement without re-running the model */
  const rawForegroundBlob = ref<Blob | null>(null)

  /**
   * Remove background from an image blob.
   * Returns a transparent PNG blob with refined edges.
   *
   * @param imageBlob - Source image
   * @param edgeSize - Edge expansion radius in px (default 3)
   */
  async function removeBg(imageBlob: Blob, edgeSize: number = 3): Promise<Blob | null> {
    isProcessing.value = true
    progress.value = 0
    progressKey.value = ''
    error.value = null
    rawForegroundBlob.value = null

    try {
      // Run the AI model to get raw foreground
      const { removeBackground: removeBgRaw } = await import('@imgly/background-removal')
      const rawResult = await removeBgRaw(imageBlob, {
        model: 'isnet',
        progress: (key: string, current: number, total: number) => {
          progress.value = Math.round((total > 0 ? current / total : 0) * 100)
          progressKey.value = key
        },
        output: {
          format: 'image/png' as const,
          quality: 1
        }
      })

      // Save raw result for re-refinement
      rawForegroundBlob.value = rawResult

      // Apply mask post-processing (dilation + blur)
      const refined = await refineWithEdgeSize(imageBlob, rawResult, edgeSize)
      return refined
    } catch (e: any) {
      error.value = e.message || 'Background removal failed'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Re-refine the mask with a different edge size.
   * Does NOT re-run the AI model — reuses the saved raw output.
   * This is fast (~100ms) and suitable for a real-time slider.
   *
   * @param originalBlob - Original source image
   * @param edgeSize - New edge expansion radius in px
   */
  async function refine(originalBlob: Blob, edgeSize: number): Promise<Blob | null> {
    if (!rawForegroundBlob.value) return null
    isRefining.value = true
    try {
      return await refineWithEdgeSize(originalBlob, rawForegroundBlob.value, edgeSize)
    } catch (e: any) {
      console.error('Refinement failed:', e)
      return null
    } finally {
      isRefining.value = false
    }
  }

  /**
   * Apply a solid background color to a transparent image.
   */
  async function applyBgColor(
    transparentBlob: Blob,
    bgColor: string,
    width: number,
    height: number
  ): Promise<Blob> {
    return applyBackgroundColor(transparentBlob, bgColor, width, height)
  }

  return {
    isProcessing,
    isRefining,
    progress,
    progressKey,
    error,
    rawForegroundBlob,
    removeBg,
    refine,
    applyBgColor
  }
}
