<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.00003" cy="7.99978" r="6.51111" stroke="#4F4F4F" stroke-width="1.2"/>
    <circle cx="8" cy="8" r="3" fill="#4F4F4F"/>
  </svg>

</template>

<script>
export default {
  name: 'record-icon',
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
