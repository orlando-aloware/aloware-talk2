<template>
  <div class="d-flex justify-center align-items-center m-auto"
       :style="styles">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'round-bg-icon',
  props: {
    bgColor: {
      required: false,
      type: String,
      default: '#D8D8D8'
    },
    bgWidth: {
      type: String,
      default: '30px'
    },
    bgHeight: {
      type: String,
      default: '30px'
    }
  },
  data () {
    return {
      styles: {
        'width': this.bgWidth,
        'height': this.bgHeight,
        'background-color': this.bgColor,
        'border-radius': '100%'
      }
    }
  }
}
</script>

<style scoped>

</style>
