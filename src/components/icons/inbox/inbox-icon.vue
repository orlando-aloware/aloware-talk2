<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6 2H4.4C3.07452 2 2 3.07452 2 4.4V11.6C2 12.9255 3.07452 14 4.4 14H11.6C12.9255 14 14 12.9255 14 11.6V4.4C14 3.07452 12.9255 2 11.6 2Z" stroke="#4F4F4F" stroke-width="1.2"/>
    <path d="M2 7.40395V8.13947C2 8.80221 2.53726 9.33947 3.2 9.33947H5.01391C5.61082 9.33947 6.11699 9.77821 6.20175 10.3691L6.23068 10.5708C6.31544 11.1617 6.82161 11.6004 7.41852 11.6004H8.58148C9.17839 11.6004 9.68456 11.1617 9.76932 10.5708L9.79825 10.3691C9.88301 9.77821 10.3892 9.33947 10.9861 9.33947H12.8C13.4627 9.33947 14 8.80221 14 8.13947V7.40039" stroke="#4F4F4F" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'inbox-icon',
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
