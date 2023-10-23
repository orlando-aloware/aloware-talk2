<template>
  <div class="stepper__content__header">
    <img
      alt="icon"
      :src="icon"
      v-if="icon"/>
    <h4 class="text-h4 text-weight-bold">
      {{ title }}
    </h4>
    <p class="text-body1">
      {{ description }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'StepHeader',

  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
