<template>
  <div class="page layout-page">
    <h2 class="page-title">{{ t('layout.title') }}</h2>

    <LayoutPreview
      v-if="state.finalBlob && state.selectedSpec"
      :photo-blob="state.finalBlob"
      :spec="state.selectedSpec"
      @downloaded="onDownloaded"
    />

    <div v-else class="layout-no-image">
      <p>{{ t('common.error') }}</p>
      <BaseButton variant="primary" @click="router.push('/')">
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <!-- Start over button -->
    <BaseButton variant="ghost" block @click="onStartOver">
      {{ t('common.back') }} — {{ t('steps.upload') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import LayoutPreview from '@/components/LayoutPreview.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
const { state, reset, hasFinal, setStep } = useAppStore()

onMounted(() => {
  if (!hasFinal.value) {
    router.replace('/')
  }
})

function onDownloaded() {
  // Could show a success toast here
}

function onStartOver() {
  reset()
  router.push('/')
}
</script>

<style scoped>
.layout-page {
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
.layout-no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}
</style>
