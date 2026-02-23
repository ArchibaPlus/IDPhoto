<template>
  <div class="bg-editor">
    <!-- Ask before starting -->
    <div v-if="showPrompt" class="bg-prompt">
      <div class="bg-prompt-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="48" height="48" rx="12" stroke="var(--color-primary)" stroke-width="2.5" fill="var(--color-primary-bg)"/>
          <path d="M20 28h16M28 20v16" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="bg-prompt-title">{{ t('background.promptTitle') }}</h3>
      <p class="bg-prompt-desc">{{ t('background.promptDesc') }}</p>
      <div class="bg-prompt-actions">
        <BaseButton variant="primary" block @click="onStartRemoval">
          {{ t('background.promptRemove') }}
        </BaseButton>
        <BaseButton variant="ghost" block @click="$emit('skip')">
          {{ t('background.promptSkip') }}
        </BaseButton>
      </div>
    </div>

    <!-- Processing state -->
    <div v-else-if="isProcessing" class="bg-processing">
      <LoadingSpinner :percent="progress" :label="t('background.processing')" />
      <p class="bg-processing-tip">{{ t('background.processingTip') }}</p>
      <BaseButton variant="ghost" class="bg-skip-btn" @click="$emit('skip')">
        {{ t('background.skip') }}
      </BaseButton>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-error">
      <p class="bg-error-text">{{ t('background.failed') }}</p>
      <p class="bg-error-detail">{{ error }}</p>
      <div class="bg-error-actions">
        <BaseButton variant="secondary" @click="$emit('skip')">
          {{ t('background.skip') }}
        </BaseButton>
        <BaseButton variant="primary" @click="startRemoval">
          {{ t('background.retry') }}
        </BaseButton>
      </div>
    </div>

    <!-- Success state: show result + color picker + refinement -->
    <div v-else-if="transparentUrl" class="bg-result">
      <!-- Preview -->
      <div class="bg-preview" :style="{ backgroundColor: selectedColor }">
        <img :src="previewUrl || transparentUrl" alt="preview" class="bg-preview-img" />
      </div>

      <!-- Edge refinement slider -->
      <div class="bg-refine">
        <label class="bg-refine-label">
          {{ t('background.edgeRefine') }}
          <span class="bg-refine-value">{{ edgeSize }}</span>
        </label>
        <div class="bg-refine-row">
          <span class="bg-refine-hint">{{ t('background.edgeTight') }}</span>
          <input
            type="range"
            class="bg-refine-slider"
            min="0"
            max="12"
            step="1"
            v-model.number="edgeSize"
            @change="onEdgeChange"
          />
          <span class="bg-refine-hint">{{ t('background.edgeLoose') }}</span>
        </div>
        <p class="bg-refine-tip">{{ t('background.edgeTip') }}</p>
      </div>

      <!-- Color picker -->
      <div class="bg-colors">
        <label class="bg-colors-label">{{ t('background.selectColor') }}</label>
        <div class="bg-color-options">
          <button
            v-for="opt in colorOptions"
            :key="opt.id"
            :class="['color-btn', { 'color-btn--active': selectedColor === opt.color }]"
            :style="{ backgroundColor: opt.color }"
            :title="t(opt.nameKey)"
            @click="selectColor(opt.color)"
          >
            <svg v-if="selectedColor === opt.color" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9L7 13L15 5" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <!-- Custom color -->
          <label class="color-btn color-btn--custom" :title="t('background.custom')">
            <input
              type="color"
              :value="selectedColor"
              class="color-input"
              @input="selectColor(($event.target as HTMLInputElement).value)"
            />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9 5v8M5 9h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <BaseButton variant="primary" block @click="onNext" :disabled="isRefining">
        {{ t('background.next') }}
      </BaseButton>
      <BaseButton variant="ghost" block @click="$emit('skip')">
        {{ t('background.skipKeepOriginal') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { applyBackgroundColor } from '@/services/bgRemoval'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { BgColorOption } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  imageBlob: Blob
  imageWidth: number
  imageHeight: number
}>()

const emit = defineEmits<{
  done: [transparentBlob: Blob, finalBlob: Blob, bgColor: string]
  skip: []
}>()

const { isProcessing, isRefining, progress, error, removeBg, refine } = useBackgroundRemoval()

const showPrompt = ref(true)
const transparentBlob = ref<Blob | null>(null)
const transparentUrl = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const selectedColor = ref('#FFFFFF')
const edgeSize = ref(3)

const colorOptions: BgColorOption[] = [
  { id: 'white', nameKey: 'background.white', color: '#FFFFFF' },
  { id: 'blue', nameKey: 'background.lightBlue', color: '#438EDB' },
  { id: 'grey', nameKey: 'background.lightGrey', color: '#D3D3D3' },
  { id: 'red', nameKey: 'background.red', color: '#FF0000' }
]

function onStartRemoval() {
  showPrompt.value = false
  startRemoval()
}

async function startRemoval() {
  const result = await removeBg(props.imageBlob, edgeSize.value)
  if (result) {
    transparentBlob.value = result
    if (transparentUrl.value) URL.revokeObjectURL(transparentUrl.value)
    transparentUrl.value = URL.createObjectURL(result)
    await updatePreview()
  }
}

/** When user changes the edge refinement slider */
async function onEdgeChange() {
  const result = await refine(props.imageBlob, edgeSize.value)
  if (result) {
    transparentBlob.value = result
    if (transparentUrl.value) URL.revokeObjectURL(transparentUrl.value)
    transparentUrl.value = URL.createObjectURL(result)
    await updatePreview()
  }
}

async function selectColor(color: string) {
  selectedColor.value = color
  await updatePreview()
}

async function updatePreview() {
  if (!transparentBlob.value) return
  try {
    const result = await applyBackgroundColor(
      transparentBlob.value,
      selectedColor.value,
      props.imageWidth,
      props.imageHeight
    )
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(result)
  } catch (e) {
    console.error('Preview update failed:', e)
  }
}

function onNext() {
  if (!transparentBlob.value) return
  applyBackgroundColor(
    transparentBlob.value,
    selectedColor.value,
    props.imageWidth,
    props.imageHeight
  ).then(finalBlob => {
    emit('done', transparentBlob.value!, finalBlob, selectedColor.value)
  })
}

// No longer auto-start — wait for user to choose
</script>

<style scoped>
.bg-editor {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.bg-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
}
.bg-processing-tip {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
}
.bg-skip-btn {
  margin-top: 0.5rem;
}

.bg-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}
.bg-prompt-icon {
  margin-bottom: 0.25rem;
}
.bg-prompt-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}
.bg-prompt-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
}
.bg-prompt-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 320px;
  margin-top: 0.5rem;
}

.bg-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;
}
.bg-error-text {
  color: var(--color-danger);
  font-weight: 600;
  margin: 0;
}
.bg-error-detail {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}
.bg-error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.bg-result {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.bg-preview {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  /* Checkerboard for transparent */
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
}
.bg-preview-img {
  width: 100%;
  display: block;
}

/* Edge refinement slider */
.bg-refine {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}
.bg-refine-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bg-refine-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
.bg-refine-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bg-refine-hint {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 2rem;
}
.bg-refine-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--color-border);
  outline: none;
  cursor: pointer;
}
.bg-refine-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}
.bg-refine-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}
.bg-refine-tip {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.bg-colors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bg-colors-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}
.bg-color-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.color-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}
.color-btn:hover {
  transform: scale(1.1);
}
.color-btn--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}

.color-btn--custom {
  position: relative;
  background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
  color: #fff;
}
.color-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
