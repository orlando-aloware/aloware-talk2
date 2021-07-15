<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>calls / add</title>
    <g id="calls-/-add" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="add">
        <circle id="Oval" cx="12" cy="12" r="12"></circle>
        <path
          d="M12.7142857,12.7142857 L12.7142857,17 L11.2857143,17 L11.2857143,12.7142857 L7,12.7142857 L7,11.2857143 L11.2857143,11.2857143 L11.2857143,7 L12.7142857,7 L12.7142857,11.2857143 L17,11.2857143 L17,12.7142857 L12.7142857,12.7142857 Z"
          id="edit-/-plus" fill="#FFFFFF" fill-rule="nonzero"></path>
      </g>
    </g>ad
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.svg circle {
  fill: $grey-mid;
}
.svg:hover circle {
  fill: darken($grey-mid, 7%);
}
</style>
