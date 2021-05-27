<template>
  <div
    class="contact-menu-item align-items-center d-flex px-2 move-item"
    @click="onClick"
  >
    <div class="contact-menu-item__icon pr-2">
      <slot name="icon"></slot>
    </div>
    <div class="contact-menu-item__title flex-grow-1 move-item">
      <slot name="title"></slot>
    </div>
    <div class="contact-menu-item__suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    onClick () {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.contact-menu-item {
  height: 31px;
  cursor: pointer;
  transition: background-color 100ms ease-in-out;
  &__title {
    line-height: 14px;
    font-size: 12px;
    font-weight: 400;
  }
  &__icon {
    margin-top: -2px;
  }
  &:hover {
    background-color: $light-green2;
  }
}
</style>
