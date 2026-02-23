<template>
  <div class="page home-page">
    <div class="home-header">
      <h1 class="home-title">{{ t('app.title') }}</h1>
      <p class="home-subtitle">{{ t('app.subtitle') }}</p>
    </div>

    <!-- Mode toggle -->
    <div class="home-mode-toggle">
      <button
        :class="['mode-btn', { 'mode-btn--active': mode === 'upload' }]"
        @click="mode = 'upload'"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="7.5" cy="9.5" r="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M2 14l4.5-4.5 3.5 3.5 2.5-2.5 5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ t('home.uploadPhoto') }}
      </button>
      <button
        :class="['mode-btn', { 'mode-btn--active': mode === 'camera' }]"
        @click="mode = 'camera'"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="10" cy="10.5" r="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 5l1-2h4l1 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ t('home.takePhoto') }}
      </button>
    </div>

    <!-- Upload mode -->
    <div v-if="mode === 'upload'">
      <PhotoUploader @photo-selected="onPhotoSelected" />
    </div>

    <!-- Camera mode -->
    <div v-else>
      <CameraCapture @photo-selected="onPhotoSelected" />
    </div>

    <!-- Privacy notice -->
    <p class="home-privacy">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="vertical-align: middle; margin-right: 4px;">
        <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="currentColor" stroke-width="1.2" fill="none"/>
        <path d="M5.5 8L7 9.5 10.5 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ t('app.privacyNote') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import PhotoUploader from '@/components/PhotoUploader.vue'
import CameraCapture from '@/components/CameraCapture.vue'

const { t } = useI18n()
const router = useRouter()
const { setSourceImage, setStep } = useAppStore()

const mode = ref<'upload' | 'camera'>('upload')

function onPhotoSelected(blob: Blob) {
  setSourceImage(blob)
  setStep(2)
  router.push('/crop')
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.home-header {
  text-align: center;
}
.home-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}
.home-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
}

.home-mode-toggle {
  display: flex;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  width: 100%;
  max-width: 360px;
}
.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-btn--active {
  background: var(--color-primary);
  color: #fff;
}

.home-privacy {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 340px;
  line-height: 1.5;
  margin: 0;
}
</style>
