<template>
  <div class="step-indicator">
    <div
      v-for="(step, index) in steps"
      :key="index"
      :class="['step', {
        'step--active': index + 1 === current,
        'step--done': index + 1 < current
      }]"
    >
      <div class="step-dot">
        <svg v-if="index + 1 < current" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="step-label">{{ step }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: string[]
  current: number
}>()
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 1rem 0;
  width: 100%;
  overflow: hidden;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  position: relative;
}

.step::after {
  content: '';
  position: absolute;
  top: 14px;
  left: calc(50% + 16px);
  width: calc(100% - 32px);
  height: 2px;
  background: var(--color-border);
}
.step:last-child::after {
  display: none;
}
.step--done::after {
  background: var(--color-primary);
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  z-index: 1;
  transition: all 0.3s ease;
}

.step--active .step-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  transform: scale(1.1);
}

.step--done .step-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.step-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.step--active .step-label {
  color: var(--color-primary);
  font-weight: 600;
}
.step--done .step-label {
  color: var(--color-text);
}
</style>
