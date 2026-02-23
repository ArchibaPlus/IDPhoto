<template>
  <div class="layout-preview">
    <!-- Paper size selector -->
    <div class="paper-selector">
      <label class="paper-label">{{ t('layout.selectPaper') }}</label>
      <div class="paper-options">
        <button
          v-for="paper in paperSizes"
          :key="paper.id"
          :class="['paper-btn', { 'paper-btn--active': selectedPaperId === paper.id }]"
          @click="selectPaper(paper.id)"
        >
          {{ t(paper.nameKey) }}
        </button>
      </div>
    </div>

    <!-- Layout info -->
    <div v-if="layout" class="layout-info">
      <p class="layout-info-text">
        {{ t('layout.layoutInfo', {
          paper: t(selectedPaper.nameKey),
          cols: layout.cols,
          rows: layout.rows,
          total: layout.total
        }) }}
      </p>
    </div>

    <!-- Canvas preview -->
    <div class="preview-wrapper">
      <div v-if="isGenerating" class="preview-loading">
        <LoadingSpinner :percent="-1" :show-percent="false" :label="t('common.loading')" />
      </div>
      <canvas ref="previewCanvas" class="preview-canvas" />
    </div>

    <!-- Print tip -->
    <p class="print-tip">{{ t('layout.printTip') }}</p>

    <!-- Download buttons -->
    <div class="download-actions">
      <BaseButton variant="primary" block @click="onDownload('image/jpeg')">
        {{ t('layout.downloadJpg') }}
      </BaseButton>
      <BaseButton variant="outline" block @click="onDownload('image/png')">
        {{ t('layout.downloadPng') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { paperSizes, getPaperById } from '@/config/paperSizes'
import { useLayout } from '@/composables/useLayout'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { PhotoSpec, PaperSize } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  photoBlob: Blob
  spec: PhotoSpec
}>()

const emit = defineEmits<{
  downloaded: []
}>()

const { layoutResult, isGenerating, generateCanvas, download } = useLayout()

const selectedPaperId = ref(paperSizes[0].id)
const selectedPaper = computed(() => getPaperById(selectedPaperId.value) || paperSizes[0])
const layout = computed(() => layoutResult.value)
const previewCanvas = ref<HTMLCanvasElement>()

async function selectPaper(paperId: string) {
  selectedPaperId.value = paperId
  await renderLayout()
}

async function renderLayout() {
  const canvas = await generateCanvas(props.photoBlob, props.spec, selectedPaper.value)
  if (canvas && previewCanvas.value) {
    // Copy the full-res canvas to the preview canvas
    const ctx = previewCanvas.value.getContext('2d')!
    previewCanvas.value.width = canvas.width
    previewCanvas.value.height = canvas.height
    ctx.drawImage(canvas, 0, 0)
  }
}

async function onDownload(format: 'image/jpeg' | 'image/png') {
  await download(format, props.spec.id, selectedPaperId.value)
  emit('downloaded')
}

onMounted(() => {
  renderLayout()
})

watch(selectedPaperId, () => {
  renderLayout()
})
</script>

<style scoped>
.layout-preview {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.paper-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.paper-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}
.paper-options {
  display: flex;
  gap: 0.5rem;
}
.paper-btn {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.paper-btn:hover {
  border-color: var(--color-primary);
}
.paper-btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 700;
}

.layout-info {
  text-align: center;
}
.layout-info-text {
  font-size: 0.9rem;
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;
}
.preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
  z-index: 1;
}
.preview-canvas {
  width: 100%;
  height: auto;
  display: block;
}

.print-tip {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.download-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .download-actions {
    flex-direction: row;
  }
  .download-actions > * {
    flex: 1;
  }
}
</style>
