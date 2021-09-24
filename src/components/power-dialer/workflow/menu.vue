<template>
  <div class="contact-menu d-flex flex-column">
    <div
      class="contact-menu__title d-flex align-items-center mb-2"
      v-if="title"
    >
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
  name: 'PowerDialerMenu',
  props: {
    title: {
      type: String
    }
  }
}
</script>
