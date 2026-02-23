/**
 * Camera composable — manages WebRTC getUserMedia stream.
 */

import { ref, onUnmounted } from 'vue'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const error = ref<string | null>(null)
  const facingMode = ref<'user' | 'environment'>('user')
  const isActive = ref(false)

  async function startCamera(videoEl: HTMLVideoElement) {
    error.value = null
    try {
      // Stop any existing stream
      stopCamera()

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode.value,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      stream.value = mediaStream
      videoEl.srcObject = mediaStream
      await videoEl.play()
      isActive.value = true
    } catch (e: any) {
      error.value = e.message || 'Camera access denied'
      isActive.value = false
    }
  }

  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach(t => t.stop())
      stream.value = null
    }
    isActive.value = false
  }

  async function switchCamera(videoEl: HTMLVideoElement) {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    await startCamera(videoEl)
  }

  /**
   * Capture the current video frame as a Blob (PNG).
   */
  function captureFrame(videoEl: HTMLVideoElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Cannot get canvas context'))
        return
      }
      ctx.drawImage(videoEl, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Capture failed'))
        },
        'image/png',
        1
      )
    })
  }

  onUnmounted(() => {
    stopCamera()
  })

  return {
    stream,
    error,
    facingMode,
    isActive,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame
  }
}
