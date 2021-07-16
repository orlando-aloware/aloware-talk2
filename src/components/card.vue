<template>
  <div class="mycard d-flex flex-column" v-bind:class="{ 'mycard--shadow': shadow }">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    shadow: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../css/mixins';
@import '../css/variables';
.mycard {
  box-sizing: border-box;
  border: solid 1px $grey-light3;
  @include border-radius(10px);
}
.mycard--shadow {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}
</style>
