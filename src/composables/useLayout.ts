/**
 * Layout composable — computes layout and generates the print canvas.
 */

import { ref, computed, watch } from 'vue'
import type { PhotoSpec, PaperSize, LayoutResult } from '@/types'
import { calculateLayout } from '@/config/paperSizes'
import { generateLayoutCanvas, canvasToBlob, downloadBlob } from '@/services/canvasUtils'

export function useLayout() {
  const layoutResult = ref<LayoutResult | null>(null)
  const layoutCanvas = ref<HTMLCanvasElement | null>(null)
  const isGenerating = ref(false)

  /**
   * Compute layout for the given spec and paper.
   */
  function computeLayout(spec: PhotoSpec, paper: PaperSize) {
    layoutResult.value = calculateLayout(spec, paper)
  }

  /**
   * Generate the full-resolution print canvas.
   */
  async function generateCanvas(
    photoBlob: Blob,
    spec: PhotoSpec,
    paper: PaperSize
  ): Promise<HTMLCanvasElement | null> {
    isGenerating.value = true
    try {
      const layout = calculateLayout(spec, paper)
      layoutResult.value = layout

      const canvas = await generateLayoutCanvas(
        photoBlob,
        layout,
        spec.widthPx,
        spec.heightPx
      )
      layoutCanvas.value = canvas
      return canvas
    } catch (e) {
      console.error('Layout generation failed:', e)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Download the layout as a file.
   */
  async function download(
    format: 'image/jpeg' | 'image/png',
    specId: string,
    paperId: string
  ) {
    if (!layoutCanvas.value) return

    const ext = format === 'image/jpeg' ? 'jpg' : 'png'
    const quality = format === 'image/jpeg' ? 0.95 : 1
    const blob = await canvasToBlob(layoutCanvas.value, format, quality)
    const now = new Date()
    const ts = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const filename = `${specId}_${paperId}_300dpi_${ts}.${ext}`
    downloadBlob(blob, filename)
  }

  return {
    layoutResult,
    layoutCanvas,
    isGenerating,
    computeLayout,
    generateCanvas,
    download
  }
}
