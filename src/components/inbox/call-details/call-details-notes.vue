<template>
  <div class="d-flex flex-column call-details">
    <div class="call-details__label">{{ label }}</div>
    <div class="call-details__value">{{ value }}</div>
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
.call-details {
  &__value {
    font-size: 14px;
    font-family: Roboto;
    color: $grey-dark;
  }
  &__label {
    font-size: 14px;
    font-family: Roboto;
    color: $black;
    font-weight: bold;
  }
}
</style>
