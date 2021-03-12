<template>
  <div class="d-flex flex-column calldetails">
    <div class="calldetails__label">{{ label }}</div>
    <div class="calldetails__value">{{ value }}</div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.calldetails {
  &__label {
    font-size: 12px;
    font-family: Roboto;
    color: $grey-dark;
  }
  &__value {
    font-size: 14px;
    font-family: Roboto;
    color: $black;
    font-weight: bold;
  }
}
</style>
