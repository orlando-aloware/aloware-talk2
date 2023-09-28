<template>
  <div class="steps-wrapper">
    <div :class="['steps-wrapper__step', stepClasses(step.id)]"
         :key="step.id"
         v-for="step in steps">
      <span class="steps-wrapper__step__separator"
            v-if="!isLastStep(step.id)"/>
      <span class="steps-wrapper__step__icon">
        <check-icon v-if="currentStep.id > step.id"/>
        <span v-else>{{ step.id }}</span>
      </span>
      <span class="steps-wrapper__step__name">
        {{ step.name }}
      </span>
    </div>
  </div>
</template>

<script>
import CheckIcon from 'src/components/icons/check-icon.vue'

export default {
  name: 'steps-wrapper',

  components: {
    CheckIcon
  },

  props: {
    currentStep: {
      type: Object,
      required: true
    },

    steps: {
      type: Array,
      required: true
    }
  },

  methods: {
    stepClasses (stepId) {
      return {
        'steps-wrapper__step--active': this.currentStep.id === stepId,
        'steps-wrapper__step--completed': this.currentStep.id > stepId
      }
    },

    isLastStep (stepId) {
      return stepId === this.steps.slice(-1)[0].id
    }
  }
}
</script>
