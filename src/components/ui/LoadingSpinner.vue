<template>
  <div class="spinner-wrapper">
    <div class="spinner" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg viewBox="0 0 50 50">
        <circle
          class="spinner-track"
          cx="25" cy="25" r="20"
          fill="none"
          stroke-width="4"
        />
        <circle
          class="spinner-fill"
          cx="25" cy="25" r="20"
          fill="none"
          stroke-width="4"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
        />
      </svg>
      <div v-if="showPercent" class="spinner-text">{{ percent }}%</div>
    </div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Progress 0-100. If -1, shows indeterminate spinner. */
  percent?: number
  size?: number
  showPercent?: boolean
  label?: string
}>(), {
  percent: -1,
  size: 64,
  showPercent: true,
  label: ''
})

const circumference = 2 * Math.PI * 20 // r=20
const offset = computed(() => {
  if (props.percent < 0) return circumference * 0.25 // indeterminate
  return circumference - (props.percent / 100) * circumference
})
</script>

<style scoped>
.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  position: relative;
}

.spinner svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.spinner-track {
  stroke: var(--color-border);
}

.spinner-fill {
  stroke: var(--color-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

/* Indeterminate animation */
.spinner-fill {
  animation: none;
}

.spinner-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.spinner-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
