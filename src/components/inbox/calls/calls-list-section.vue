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

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.calls-list-section {
  display: flex;
  height: 40px;
  border-bottom: solid 1px $grey-light3;
  align-items: center;
  &__time {
    text-align: right;
    letter-spacing: 0.25px;
    font-size: 10px;
    color: $grey-dark;
    display: none;
    @include screen('md') {
      display: block;
    }
  }
  &__actions {
    width: 100px;
    text-align: right;
    letter-spacing: 0.25px;
    font-size: 10px;
    color: $grey-dark;
    padding-right: 20px;
    padding-left: 10px;
  }
  &__label {
    display: flex;
    padding-left: 10px;
    flex-grow: 1;
    &__name {
      color: $black;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.35px;
      padding-right: 20px;
    }
    &__count {
      color: $green;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.35px;
    }
  }
}
</style>
