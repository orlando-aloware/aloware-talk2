<template>
  <div
    class="contact-menu-item align-items-center d-flex move-item"
    data-testid="contact-menu-item"
    @click="onClick"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <div class="contact-menu-item__icon align-items-center d-flex" data-testid="contact-menu-item-icon">
      <slot name="icon"></slot>
    </div>
    <div class="contact-menu-item__title flex-grow-1 move-item align-items-center d-flex" data-testid="contact-menu-item-title">
      <slot name="title"></slot>
    </div>
    <div class="contact-menu-item__suffix align-items-center d-flex" data-testid="contact-menu-item-suffix">
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
