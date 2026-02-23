<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--block': block, 'btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  block?: boolean
  disabled?: boolean
}>()

defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.btn--primary:hover:not(.btn--disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn--secondary:hover:not(.btn--disabled) {
  background: var(--color-bg-hover);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn--outline:hover:not(.btn--disabled) {
  background: var(--color-primary);
  color: #fff;
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn--ghost:hover:not(.btn--disabled) {
  background: var(--color-bg-hover);
}

.btn--block {
  display: flex;
  width: 100%;
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active:not(.btn--disabled) {
  transform: scale(0.97);
}
</style>
