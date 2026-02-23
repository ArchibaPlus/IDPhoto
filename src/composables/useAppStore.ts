/**
 * Reactive application state store.
 * Simple reactive singleton — no Pinia needed for this app size.
 */

import { reactive, computed } from 'vue'
import type { AppState, PhotoSpec, PaperSize } from '@/types'

const state = reactive<AppState>({
  sourceImageUrl: null,
  sourceBlob: null,
  croppedBlob: null,
  croppedImageUrl: null,
  bgRemovedBlob: null,
  bgRemovedImageUrl: null,
  finalBlob: null,
  finalImageUrl: null,
  selectedSpec: null,
  selectedPaper: null,
  bgColor: '#FFFFFF',
  step: 1
})

export function useAppStore() {
  function setSourceImage(blob: Blob) {
    revokeUrl(state.sourceImageUrl)
    state.sourceBlob = blob
    state.sourceImageUrl = URL.createObjectURL(blob)
  }

  function setCroppedImage(blob: Blob) {
    revokeUrl(state.croppedImageUrl)
    state.croppedBlob = blob
    state.croppedImageUrl = URL.createObjectURL(blob)
  }

  function setBgRemovedImage(blob: Blob) {
    revokeUrl(state.bgRemovedImageUrl)
    state.bgRemovedBlob = blob
    state.bgRemovedImageUrl = URL.createObjectURL(blob)
  }

  function setFinalImage(blob: Blob) {
    revokeUrl(state.finalImageUrl)
    state.finalBlob = blob
    state.finalImageUrl = URL.createObjectURL(blob)
  }

  function setSpec(spec: PhotoSpec) {
    state.selectedSpec = spec
  }

  function setPaper(paper: PaperSize) {
    state.selectedPaper = paper
  }

  function setBgColor(color: string) {
    state.bgColor = color
  }

  function setStep(step: number) {
    state.step = step
  }

  function reset() {
    revokeUrl(state.sourceImageUrl)
    revokeUrl(state.croppedImageUrl)
    revokeUrl(state.bgRemovedImageUrl)
    revokeUrl(state.finalImageUrl)
    state.sourceImageUrl = null
    state.sourceBlob = null
    state.croppedBlob = null
    state.croppedImageUrl = null
    state.bgRemovedBlob = null
    state.bgRemovedImageUrl = null
    state.finalBlob = null
    state.finalImageUrl = null
    state.selectedSpec = null
    state.selectedPaper = null
    state.bgColor = '#FFFFFF'
    state.step = 1
  }

  const hasSource = computed(() => !!state.sourceBlob)
  const hasCropped = computed(() => !!state.croppedBlob)
  const hasBgRemoved = computed(() => !!state.bgRemovedBlob)
  const hasFinal = computed(() => !!state.finalBlob)

  return {
    state,
    setSourceImage,
    setCroppedImage,
    setBgRemovedImage,
    setFinalImage,
    setSpec,
    setPaper,
    setBgColor,
    setStep,
    reset,
    hasSource,
    hasCropped,
    hasBgRemoved,
    hasFinal
  }
}

function revokeUrl(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}
