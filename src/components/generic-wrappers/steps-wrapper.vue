<template>
  <div class="steps-wrapper">
    <div class="steps-wrapper__step"
         :key="step.id"
         v-for="step in steps">
      <span class="steps-wrapper__step__icon">
        {{ step.id }}
      </span>
      <span class="steps-wrapper__step__name">
        {{ step.name }}
      </span>
      <!-- <span class="steps-wrapper__step__separator" /> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'steps-wrapper',

  props: {
    currentStep: {
      type: Object,
      required: true
    },

    steps: {
      type: Array,
      required: true
    }
  }
}
</script>
