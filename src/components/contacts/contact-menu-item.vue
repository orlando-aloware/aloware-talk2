<template>
  <div
    class="contact-menu-item align-items-center d-flex px-2 move-item"
    @click="onClick"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
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
    },
    onMouseOver () {
      this.$emit('mouseover')
    },
    onMouseLeave () {
      this.$emit('mouseleave')
    }
  }
}
</script>
