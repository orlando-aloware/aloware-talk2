<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="search-icon-svg">
    <path d="M14 14.0001L10.6594 10.665" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.0107 2C9.77828 2 12.0214 4.24312 12.0214 7.0107C12.0214 9.77828 9.77828 12.0214 7.0107 12.0214C4.24312 12.0214 2 9.77828 2 7.0107C2 4.24312 4.24312 2 7.0107 2Z" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'search-icon',
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
      default: '#62666E'
    }
  }
}
</script>
