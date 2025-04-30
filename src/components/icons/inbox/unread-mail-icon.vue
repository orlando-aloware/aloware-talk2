<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 8L10.1 13.6C11.3 14.4 12.7 14.4 13.9 13.6L22 8" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="20" cy="5" r="3" fill="currentColor"/>
  </svg>
</template>

<script>
export default {
  name: 'unread-mail-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    }
  }
}
</script>
