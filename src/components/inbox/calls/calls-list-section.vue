<template>
  <div class="calls-list-section">
    <div class="calls-list-section__label">
      <div class="calls-list-section__label__name">{{ label }}</div>
      <div class="calls-list-section__label__count">{{ count }}</div>
    </div>
    <div class="calls-list-section__time">
      {{ subLabel }}
    </div>
    <div class="calls-list-section__actions">Action</div>
  </div>
</template>

<script>
export default {
  name: 'calls-list-section.vue',
  components: {},
  props: {
    label: {
      type: String,
      default: 'Active'
    },
    subLabel: {
      type: String,
      default: 'Wait Time'
    },
    count: {
      type: [String, Number],
      default: 0
    }
  }
}
</script>
