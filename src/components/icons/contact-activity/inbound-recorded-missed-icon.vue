<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.9614 4.8461V6.58644C16.9614 8.61083 16.1554 10.5519 14.7214 11.9808L14.2029 12.4976" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.7302 13.1562H13.4999V9.97163" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.53854 13.1537C8.21499 13.1537 10.3847 10.984 10.3847 8.30758C10.3847 5.63112 8.21499 3.46143 5.53854 3.46143C2.86208 3.46143 0.692383 5.63112 0.692383 8.30758C0.692383 10.984 2.86208 13.1537 5.53854 13.1537ZM5.53852 10.3851C6.68558 10.3851 7.61545 9.45523 7.61545 8.30818C7.61545 7.16113 6.68558 6.23126 5.53852 6.23126C4.39147 6.23126 3.4616 7.16113 3.4616 8.30818C3.4616 9.45523 4.39147 10.3851 5.53852 10.3851Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'inbound-recorded-missed-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: '#FA003F'
    }
  }
}
</script>
