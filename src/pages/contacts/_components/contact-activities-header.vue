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
  height: 45px;
  display: flex;
  align-items: center;
  border-bottom: solid 1px $grey-light3;
  &__label {
    padding-left: 20px;
    font-weight: bold;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
