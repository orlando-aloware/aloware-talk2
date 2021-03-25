<template>
  <div class="calls-empty-state">
    <em>{{ label }}</em>
  </div>
</template>

<script>
export default {
  name: 'calls-empty-state.vue',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.calls-empty-state {
  padding-top: 20px;
  padding-bottom: 40px;
  padding-left: 20px;
  font-size: 12px;
  color: $grey-mid;
  line-height: 16px;
}
</style>
