<template>
  <svg
    class="svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>calls / pause</title>
    <g id="calls-/-pause" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="pause">
        <circle id="Oval" cx="12" cy="12" r="12"></circle>
        <rect
          id="Rectangle"
          fill="#FFFFFF"
          x="9"
          y="7"
          width="2"
          height="10"
          rx="1"
        ></rect>
        <rect
          id="Rectangle-Copy-3"
          fill="#FFFFFF"
          x="13"
          y="7"
          width="2"
          height="10"
          rx="1"
        ></rect>
      </g>
    </g>
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
  fill: $orange;
}
.svg:hover circle {
  fill: darken($orange, 7%);
}
</style>
