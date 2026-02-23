<template>
  <div class="photo-uploader">
    <div
      class="drop-zone"
      :class="{ 'drop-zone--active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFilePicker"
    >
      <div class="drop-zone-content">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" stroke-width="2.5"/>
          <circle cx="18" cy="22" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M6 34l10-10 8 8 6-6 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="drop-zone-text">{{ t('home.dragDrop') }}</p>
        <p class="drop-zone-hint">{{ t('home.supportFormat') }}</p>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden-input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadOrientedImage } from '@/services/exifHandler'

const { t } = useI18n()
const emit = defineEmits<{
  photoSelected: [blob: Blob]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    await processFile(input.files[0])
    input.value = '' // Reset for re-selection
  }
}

async function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    await processFile(file)
  }
}

async function processFile(file: File) {
  try {
    // Load and auto-orient the image
    const bitmap = await loadOrientedImage(file)
    // Convert ImageBitmap to Blob
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()
    const blob = await canvas.convertToBlob({ type: 'image/png', quality: 1 })
    emit('photoSelected', blob)
  } catch {
    // Fallback: use the file directly
    emit('photoSelected', file)
  }
}
</script>

<style scoped>
.photo-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-surface);
}

.drop-zone:hover,
.drop-zone--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-secondary);
}

.drop-zone-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
}

.drop-zone-hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
