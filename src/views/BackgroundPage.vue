<template>
  <div class="page bg-page">
    <h2 class="page-title">{{ t('background.title') }}</h2>

    <BackgroundEditor
      v-if="state.croppedBlob && state.selectedSpec"
      :image-blob="state.croppedBlob"
      :image-width="state.selectedSpec.widthPx"
      :image-height="state.selectedSpec.heightPx"
      @done="onDone"
      @skip="onSkip"
    />

    <div v-else class="bg-no-image">
      <p>{{ t('common.error') }}</p>
      <BaseButton variant="primary" @click="router.push('/')">
        {{ t('common.back') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import BackgroundEditor from '@/components/BackgroundEditor.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
const { state, setBgRemovedImage, setFinalImage, setBgColor, setStep, hasCropped } = useAppStore()

onMounted(() => {
  if (!hasCropped.value) {
    router.replace('/')
  }
})

function onDone(transparentBlob: Blob, finalBlob: Blob, bgColor: string) {
  setBgRemovedImage(transparentBlob)
  setFinalImage(finalBlob)
  setBgColor(bgColor)
  setStep(4)
  router.push('/layout')
}

function onSkip() {
  // Use cropped image directly (no bg removal)
  if (state.croppedBlob) {
    setFinalImage(state.croppedBlob)
    setStep(4)
    router.push('/layout')
  }
}
</script>

<style scoped>
.bg-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}
.bg-no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}
</style>
