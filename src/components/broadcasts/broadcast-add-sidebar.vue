<template>
  <div class="broadcasts__add__sidebar">
    <q-stepper class="h-100"
               vertical
               animated
               v-model="currentStep.id">
      <q-step :title="step.name"
              :name="step.id"
              v-for="step in steps"
              v-bind:key="step.id">
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
export default {
  name: 'broadcast-add-sidebar',

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
