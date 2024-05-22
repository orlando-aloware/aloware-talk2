<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="remove-tag-icon-svg">
    <circle cx="6" cy="6" r="5" stroke="#62666E" stroke-width="1.2"/>
    <path d="M4.52686 4.52686L7.47313 7.47313" stroke="#62666E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.47313 4.52687L4.52686 7.47314" stroke="#62666E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'remove-tag-icon',
  props: {
    width: {
      type: [Number, String],
      default: 12
    },
    height: {
      type: [Number, String],
      default: 12
    }
  }
}
</script>
