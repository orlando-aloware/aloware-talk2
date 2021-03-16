<template>
<div class="calls-header">
  <div class="calls-header__label">
    {{ label }}
  </div>
</div>
</template>

<script>
export default {
  name: 'calls-header.vue',
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
.calls-header {
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: solid 1px $grey-light3;
  &__label {
    padding-left: 20px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.3px;
  }
}
</style>
