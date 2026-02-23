<template>
  <div class="face-guide-stencil" :style="rootStyle">
    <BoundingBox
      :width="stencilWidth"
      :height="stencilHeight"
      :transitions="transitions"
      @resize="onResize"
      @resize-end="onResizeEnd"
      @move="onMove"
      @move-end="onMoveEnd"
    >
      <DraggableArea>
        <div class="stencil-overlay">
          <!-- Cropped preview of the image inside the stencil -->
          <img
            v-if="image?.src"
            :src="image.src"
            class="stencil-preview-image"
            :style="previewStyle"
          />
          <!-- Face guidelines SVG -->
          <svg
            class="guide-svg"
            :viewBox="`0 0 ${stencilWidth} ${stencilHeight}`"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Center vertical axis -->
            <line
              :x1="stencilWidth / 2"
              y1="0"
              :x2="stencilWidth / 2"
              :y2="stencilHeight"
              stroke="rgba(100, 255, 100, 0.45)"
              stroke-width="1"
              stroke-dasharray="6 4"
            />

            <!-- Head top guideline -->
            <line
              x1="0"
              :y1="headTopY"
              :x2="stencilWidth"
              :y2="headTopY"
              stroke="rgba(100, 255, 100, 0.6)"
              stroke-width="1.5"
              stroke-dasharray="8 4"
            />

            <!-- Chin guideline -->
            <line
              x1="0"
              :y1="chinY"
              :x2="stencilWidth"
              :y2="chinY"
              stroke="rgba(100, 255, 100, 0.6)"
              stroke-width="1.5"
              stroke-dasharray="8 4"
            />

            <!-- Face oval hint -->
            <ellipse
              :cx="stencilWidth / 2"
              :cy="(headTopY + chinY) / 2"
              :rx="stencilWidth * 0.28"
              :ry="(chinY - headTopY) / 2"
              stroke="rgba(255, 255, 255, 0.3)"
              stroke-width="1"
              fill="none"
              stroke-dasharray="4 4"
            />
          </svg>
        </div>
      </DraggableArea>
    </BoundingBox>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BoundingBox, DraggableArea } from 'vue-advanced-cropper'

const props = defineProps<{
  image?: any
  coordinates?: any
  transitions?: any
  stencilCoordinates?: any
  aspectRatio?: number
  minAspectRatio?: number
  maxAspectRatio?: number
}>()

const emit = defineEmits(['resize', 'resize-end', 'move', 'move-end'])

const stencilWidth = computed(() => props.stencilCoordinates?.width || 200)
const stencilHeight = computed(() => props.stencilCoordinates?.height || 280)

// Position the root element using stencilCoordinates (matches RectangleStencil behavior)
const rootStyle = computed(() => {
  const sc = props.stencilCoordinates
  if (!sc) return {}
  const style: Record<string, string> = {
    position: 'absolute',
    width: `${sc.width}px`,
    height: `${sc.height}px`,
    transform: `translate(${sc.left}px, ${sc.top}px)`
  }
  if (props.transitions?.enabled) {
    style.transition = `${props.transitions.time}ms ${props.transitions.timingFunction}`
  }
  return style
})

// Compute the image preview transform so the cropped region shows inside the stencil
const previewStyle = computed(() => {
  const sc = props.stencilCoordinates
  const coord = props.coordinates
  const img = props.image
  if (!sc || !coord || !img) return { display: 'none' }

  const coefficient = coord.width / sc.width
  const imageWidth = (img.width || img.naturalWidth) / coefficient
  const imageHeight = (img.height || img.naturalHeight) / coefficient
  const translateX = -coord.left / coefficient
  const translateY = -coord.top / coefficient

  return {
    width: `${imageWidth}px`,
    height: `${imageHeight}px`,
    transform: `translate(${translateX}px, ${translateY}px)`,
    transformOrigin: 'top left'
  }
})

// Head top: approximately 5-10% from the top
const headTopY = computed(() => stencilHeight.value * 0.08)

// Chin: approximately 70-78% from the top (head occupies ~62-70% of height)
const chinY = computed(() => stencilHeight.value * 0.75)

function onResize(e: any) {
  emit('resize', e)
}
function onResizeEnd() {
  emit('resize-end')
}
function onMove(e: any) {
  emit('move', e)
}
function onMoveEnd() {
  emit('move-end')
}

/**
 * Expose aspectRatios() method so the Cropper can read it via $refs.stencil.aspectRatios()
 * This is how vue-advanced-cropper enforces the aspect ratio constraint.
 */
function aspectRatios() {
  return {
    minimum: props.aspectRatio || props.minAspectRatio,
    maximum: props.aspectRatio || props.maxAspectRatio
  }
}

defineExpose({ aspectRatios })
</script>

<style scoped>
.face-guide-stencil {
  /* Positioned via rootStyle computed */
}

.stencil-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.stencil-preview-image {
  position: absolute;
  pointer-events: none;
  user-select: none;
  max-width: none !important;
}

.guide-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
