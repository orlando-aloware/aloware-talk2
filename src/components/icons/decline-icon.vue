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
    <title>calls / decline</title>
    <defs>
      <filter id="filter-1">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 1.000000 0"
        ></feColorMatrix>
      </filter>
      <rect id="path-2" x="0" y="0" width="13.6" height="13.6"></rect>
    </defs>
    <g
      id="calls-/-decline"
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
    >
      <g id="decline">
        <circle id="Oval" cx="12" cy="12" r="12"></circle>
        <g filter="url(#filter-1)" id="icon-/-close">
          <g transform="translate(5.200000, 5.600000)" id="close_big">
            <mask id="mask-3" fill="white">
              <use xlink:href="#path-2"></use>
            </mask>
            <g id="menu-/-close_big-(Background/Mask)"></g>
            <path
              d="M9.96766675,2.83333333 L6.8,6.00100009 L3.63233331,2.83333333 L2.83333333,3.63233331 L6.00100009,6.8 L2.83333333,9.96766675 L3.63233331,10.7666667 L6.8,7.59899991 L9.96766675,10.7666667 L10.7666667,9.96766675 L7.59899991,6.8 L10.7666667,3.63233331 L9.96766675,2.83333333 Z"
              id="menu-/-close_big"
              fill="#00BF4A"
              fill-rule="nonzero"
              mask="url(#mask-3)"
            ></path>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  data () {
    return {
      focus: false
    }
  },
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
  fill: $red;
}

.svg:hover circle {
  fill: darken($red, 7%);
}
</style>
