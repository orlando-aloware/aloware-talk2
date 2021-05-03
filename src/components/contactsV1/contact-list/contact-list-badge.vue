<template>
  <div
    class="contact-list-badge"
    v-bind:class="{
      'contact-list-badge--red': color === 'red',
      'contact-list-badge--orange': color === 'orange',
      'contact-list-badge--grey-light3': color === 'grey-light3',
      'contact-list-badge--grey-light4': color === 'grey-light4',
      'contact-list-badge--green': color === 'green'
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
      default: 'grey-light4'
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contact-list-badge {
  display: inline-block;
  padding-left: 16px;
  padding-right: 16px;
  height: 20px;
  border-radius: 20px;
  font-size: 12px;
  background-color: $grey-light4;
  color: $grey-dark;
  line-height: 20px;
  font-weight: bold;

  &--green {
    background-color: $green;
    color: $white;
  }

  &--grey-light4 {
    background-color: $grey-light4;
    color: $grey-dark;
  }

  &--grey-light3 {
    background-color: $grey-light3;
    color: $grey-dark;
  }

  &--orange {
    background-color: $orange;
    color: $white;
  }

  &--red {
    background-color: $red;
    color: $white;
  }
}
</style>
