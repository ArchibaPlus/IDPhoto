<template>
  <div class="page crop-page">
    <h2 class="page-title">{{ t('crop.title') }}</h2>

    <CropEditor
      v-if="state.sourceImageUrl && state.sourceBlob"
      :image-url="state.sourceImageUrl"
      :image-blob="state.sourceBlob"
      @cropped="onCropped"
    />

    <div v-else class="crop-no-image">
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
import CropEditor from '@/components/CropEditor.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { PhotoSpec } from '@/types'

const { t } = useI18n()
const router = useRouter()
const { state, setCroppedImage, setSpec, setStep, hasSource } = useAppStore()

onMounted(() => {
  if (!hasSource.value) {
    router.replace('/')
  }
})

function onCropped(blob: Blob, spec: PhotoSpec) {
  setCroppedImage(blob)
  setSpec(spec)
  setStep(3)
  router.push('/background')
}
</script>

<style scoped>
.crop-page {
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
.crop-no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}
</style>
