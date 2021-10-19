<template>
  <svg :width="width" :height="height" viewBox="0 0 5 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="2" height="2" :fill="color"/>
    <rect x="3" width="2" height="2" :fill="color"/>
    <rect y="5" width="2" height="2" :fill="color"/>
    <rect x="3" y="5" width="2" height="2" :fill="color"/>
    <rect y="10" width="2" height="2" :fill="color"/>
    <rect x="3" y="10" width="2" height="2" :fill="color"/>
    <rect y="15" width="2" height="2" :fill="color"/>
    <rect x="3" y="15" width="2" height="2" :fill="color"/>
    <rect y="20" width="2" height="2" :fill="color"/>
    <rect x="3" y="20" width="2" height="2" :fill="color"/>
    <rect y="25" width="2" height="2" :fill="color"/>
    <rect x="3" y="25" width="2" height="2" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'call-o-icon',
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
      type: [String],
      default: '#4F4F4F'
    }
  }
}
</script>
