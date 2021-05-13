<template>
  <div class="contact-menu d-flex flex-column">
    <div class="contact-menu__title d-flex align-items-center mb-2">
      <div
        class="border-bottom contact-menu__title__inner w-100 d-flex align-items-center"
      >
        <div class="px-2">{{ title }}</div>
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Actions'
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.contact-menu {
  width: 200px;
  min-height: 133px;
  &__title {
    padding-left: 2px;
    padding-right: 2px;
    &__inner {
      height: 34px;
      font-weight: bold;
      line-height: 14px;
      font-size: 12px;
    }
  }
}
</style>
