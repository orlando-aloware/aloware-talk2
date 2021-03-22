<template>
  <div
    class="inbox-nav-badge"
    v-bind:class="{
      'inbox-nav-badge--danger': color === 'danger',
      'inbox-nav-badge--closed': closed
    }"
  >
    {{ value }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    color: {
      type: String,
      default: 'default'
    },
    closed: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-nav-badge {

  background-color: $grey-light4;
  color: $grey-dark;

  display: inline-block;
  padding-left: 16px;
  padding-right: 16px;
  height: 20px;
  border-radius: 20px;
  font-size: 12px;
  line-height: 20px;
  font-weight: bold;

  &--danger {
    background-color: $red;
    color: $white;
  }

  &--closed {
    padding: 0px;
    overflow: hidden;
    width: 8px;
    height: 8px;
    color: transparent;
    border-radius: 50%;
    line-height: 0px;
    position: absolute;
    top: 11px;
    right: 9px;
    border: solid 1px $white;
  }
}
</style>
