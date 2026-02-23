<template>
  <div class="crop-editor">
    <!-- Spec selector -->
    <div class="spec-selector">
      <label class="spec-label">{{ t('crop.selectSpec') }}</label>
      <select v-model="selectedSpecId" class="spec-select">
        <option v-for="spec in photoSpecs" :key="spec.id" :value="spec.id">
          {{ t(spec.nameKey) }}
        </option>
      </select>
    </div>

    <!-- Cropper -->
    <div class="cropper-container">
      <Cropper
        ref="cropperRef"
        class="cropper"
        :src="imageUrl"
        :stencil-props="{
          aspectRatio: aspectRatio,
          movable: true,
          resizable: true
        }"
        :stencil-component="FaceGuideStencil"
        image-restriction="stencil"
        :canvas="{
          minHeight: 0,
          minWidth: 0,
          maxHeight: 4096,
          maxWidth: 4096
        }"
      />
    </div>

    <p class="crop-tip">{{ t('crop.guideTip') }}</p>
    <p class="crop-tip-mobile">{{ t('crop.pinchZoomTip') }}</p>

    <!-- Confirm button -->
    <BaseButton variant="primary" block @click="onConfirm">
      {{ t('crop.confirm') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import BaseButton from '@/components/ui/BaseButton.vue'
import FaceGuideStencil from '@/components/FaceGuideStencil.vue'
import { photoSpecs } from '@/config/photoSpecs'
import type { PhotoSpec } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  imageUrl: string
  imageBlob: Blob
  initialSpecId?: string
}>()

const emit = defineEmits<{
  cropped: [blob: Blob, spec: PhotoSpec]
}>()

const cropperRef = ref<InstanceType<typeof Cropper>>()
const selectedSpecId = ref(props.initialSpecId || photoSpecs[0].id)

const selectedSpec = computed(() =>
  photoSpecs.find(s => s.id === selectedSpecId.value) || photoSpecs[0]
)

const aspectRatio = computed(() =>
  selectedSpec.value.widthMm / selectedSpec.value.heightMm
)

// When spec changes, force the cropper to re-apply the new aspect ratio
watch(selectedSpecId, () => {
  // Reactivity handles this via the aspectRatio computed
})

async function onConfirm() {
  // Always get a fresh result from the Cropper — this is the most reliable approach
  const result = cropperRef.value?.getResult()
  if (!result) return

  const spec = selectedSpec.value

  // Use the cropper's built-in canvas (coordinate mapping done internally by the library)
  const sourceCanvas: HTMLCanvasElement | undefined = result.canvas
  if (!sourceCanvas) return

  // Resize the cropper's canvas output to the exact spec pixel dimensions (300 DPI)
  const targetW = spec.widthPx
  const targetH = spec.heightPx

  const outCanvas = new OffscreenCanvas(targetW, targetH)
  const ctx = outCanvas.getContext('2d')!
  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, targetW, targetH)

  const blob = await outCanvas.convertToBlob({ type: 'image/png', quality: 1 })
  emit('cropped', blob, spec)
}
</script>

<style scoped>
.crop-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.spec-selector {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.spec-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.spec-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%23666' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  cursor: pointer;
}
.spec-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.cropper-container {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
}

.cropper {
  width: 100%;
  height: 100%;
}

.crop-tip {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

.crop-tip-mobile {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

@media (min-width: 768px) {
  .crop-tip-mobile {
    display: none;
  }
}
</style>
