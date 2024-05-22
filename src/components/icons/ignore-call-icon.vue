<template>
  <svg :width="width" :height="height" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="ignore-call-icon-svg">
    <path d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16Z" :fill="fillColor"/>
    <path d="M21 22L11 12" :stroke="strokeColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 12L11 22" :stroke="strokeColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'ignore-call-icon',
  props: {
    width: {
      type: [Number, String],
      default: 32
    },
    height: {
      type: [Number, String],
      default: 32
    },
    fillColor: {
      type: String,
      default: '#FA003F'
    },
    strokeColor: {
      type: String,
      default: 'white'
    }
  }
}
</script>
