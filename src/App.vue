<template>
  <div class="app-shell">
    <!-- Header -->
    <header class="app-header">
      <button v-if="state.step > 1" class="header-back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="header-title">{{ t('app.title') }}</span>
      <button class="header-lang-btn" @click="toggleLocale">
        {{ t('common.langSwitch') }}
      </button>
    </header>

    <!-- Step indicator (show on steps 2-4) -->
    <StepIndicator
      v-if="state.step > 1"
      :steps="stepLabels"
      :current="state.step"
    />

    <!-- Main content -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import StepIndicator from '@/components/StepIndicator.vue'

const { t, locale } = useI18n()
const router = useRouter()
const { state, setStep } = useAppStore()

const stepLabels = computed(() => [
  t('steps.upload'),
  t('steps.crop'),
  t('steps.background'),
  t('steps.layout')
])

function toggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
}

function goBack() {
  const step = state.step
  if (step === 2) {
    setStep(1)
    router.push('/')
  } else if (step === 3) {
    setStep(2)
    router.push('/crop')
  } else if (step === 4) {
    setStep(3)
    router.push('/background')
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem var(--page-padding);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 0.5rem;
}

.header-back-btn {
  position: absolute;
  left: var(--page-padding);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-back-btn:hover {
  background: var(--color-bg-hover);
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.header-lang-btn {
  position: absolute;
  right: var(--page-padding);
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.header-lang-btn:hover {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;
  padding-bottom: 2rem;
}
</style>
