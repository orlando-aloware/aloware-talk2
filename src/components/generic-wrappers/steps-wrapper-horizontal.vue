<template>
  <div class="steps-wrapper-horizontal">
    <div
      :class="['steps-wrapper-horizontal__step', stepClasses(step.id)]"
      :key="step.id"
      v-for="step in steps"
    >
      <span
        class="steps-wrapper-horizontal__step__separator"
        v-if="!isLastStep(step.id)"
      />
      <span class="steps-wrapper-horizontal__step__icon">
        <check-icon v-if="currentStep.id > step.id" />
        <span v-else>{{ step.id }}</span>
      </span>
      <span class="steps-wrapper-horizontal__step__name">
        {{ step.name }}
      </span>
    </div>
  </div>
</template>

<script>
import CheckIcon from 'src/components/icons/check-icon.vue'

export default {
  name: 'steps-wrapper-horizontal',

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
        'steps-wrapper-horizontal__step--active': this.currentStep.id === stepId,
        'steps-wrapper-horizontal__step--completed': this.currentStep.id > stepId
      }
    },

    isLastStep (stepId) {
      return stepId === this.steps.slice(-1)[0].id
    }
  }
}
</script>

<style scoped>

</style>
