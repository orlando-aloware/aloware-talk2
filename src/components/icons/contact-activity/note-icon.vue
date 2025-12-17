<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0455 1H3.95455C2.32279 1 1 2.30584 1 3.91667V12.0833C1 13.6942 2.32279 15 3.95455 15H11.0455C12.6772 15 14 13.6942 14 12.0833V3.91667C14 2.30584 12.6772 1 11.0455 1Z" fill="#00BF4A"/>
    <path d="M4.5459 5.0835H6.90953" stroke="white" stroke-linecap="round"/>
    <path d="M4.5459 8H10.455" stroke="white" stroke-linecap="round"/>
    <path d="M4.5459 10.9165H10.455" stroke="white" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'note-icon',
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
