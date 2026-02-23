<template>
  <div class="camera-capture">
    <!-- Viewfinder -->
    <div v-if="!capturedUrl" class="camera-viewfinder">
      <video
        ref="videoEl"
        class="camera-video"
        playsinline
        muted
        autoplay
      />
      <!-- Face alignment guide overlay -->
      <svg class="camera-guide" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="170" rx="75" ry="100"
          stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="none" stroke-dasharray="8 4"/>
        <line x1="150" y1="50" x2="150" y2="350"
          stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4 4"/>
      </svg>
      <!-- Controls -->
      <div class="camera-controls">
        <button class="camera-btn camera-btn--switch" @click="onSwitch" :title="t('home.switchCamera')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 7l-4-4m4 4l-4 4m4-4H8M4 17l4 4m-4-4l4-4m-4 4h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="camera-btn camera-btn--capture" @click="onCapture">
          <div class="capture-ring" />
        </button>
        <div class="camera-btn-placeholder" />
      </div>
      <!-- Error -->
      <div v-if="cameraError" class="camera-error">
        <p>{{ t('home.cameraError') }}</p>
        <p class="camera-error-detail">{{ cameraError }}</p>
      </div>
    </div>

    <!-- Preview captured photo -->
    <div v-else class="camera-preview">
      <img :src="capturedUrl" class="camera-preview-img" alt="captured" />
      <div class="camera-preview-actions">
        <BaseButton variant="secondary" @click="onRetake">
          {{ t('home.retake') }}
        </BaseButton>
        <BaseButton variant="primary" @click="onUsePhoto">
          {{ t('home.usePhoto') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCamera } from '@/composables/useCamera'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const emit = defineEmits<{
  photoSelected: [blob: Blob]
}>()

const { startCamera, stopCamera, switchCamera, captureFrame, error: cameraError } = useCamera()
const videoEl = ref<HTMLVideoElement>()
const capturedUrl = ref<string | null>(null)
const capturedBlob = ref<Blob | null>(null)

onMounted(async () => {
  if (videoEl.value) {
    await startCamera(videoEl.value)
  }
})

onUnmounted(() => {
  stopCamera()
  if (capturedUrl.value) {
    URL.revokeObjectURL(capturedUrl.value)
  }
})

async function onSwitch() {
  if (videoEl.value) {
    await switchCamera(videoEl.value)
  }
}

async function onCapture() {
  if (!videoEl.value) return
  try {
    const blob = await captureFrame(videoEl.value)
    capturedBlob.value = blob
    capturedUrl.value = URL.createObjectURL(blob)
    stopCamera()
  } catch (e) {
    console.error('Capture failed:', e)
  }
}

function onRetake() {
  if (capturedUrl.value) {
    URL.revokeObjectURL(capturedUrl.value)
  }
  capturedUrl.value = null
  capturedBlob.value = null
  if (videoEl.value) {
    startCamera(videoEl.value)
  }
}

function onUsePhoto() {
  if (capturedBlob.value) {
    emit('photoSelected', capturedBlob.value)
  }
}
</script>

<style scoped>
.camera-capture {
  width: 100%;
  position: relative;
}

.camera-viewfinder {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-guide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.camera-controls {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 1.5rem;
}

.camera-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.camera-btn--capture {
  width: 72px;
  height: 72px;
  background: rgba(255,255,255,0.3);
  padding: 4px;
}

.capture-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
.camera-btn--capture:active .capture-ring {
  transform: scale(0.9);
}

.camera-btn--switch {
  transition: transform 0.3s;
}
.camera-btn--switch:active {
  transform: rotate(180deg);
}

.camera-btn-placeholder {
  width: 48px;
  height: 48px;
}

.camera-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 1.5rem;
  text-align: center;
}
.camera-error-detail {
  font-size: 0.8rem;
  opacity: 0.7;
}

.camera-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.camera-preview-img {
  width: 100%;
  border-radius: 16px;
  aspect-ratio: 3/4;
  object-fit: cover;
}
.camera-preview-actions {
  display: flex;
  gap: 0.75rem;
}
.camera-preview-actions > * {
  flex: 1;
}
</style>
