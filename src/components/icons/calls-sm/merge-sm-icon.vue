<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>call icon / merge</title>
    <g id="call-icon-/-merge" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="merge" transform="translate(6.000000, 4.000000)" fill="#15163F" fill-rule="nonzero">
        <polygon id="Path"
                 points="6.09094737 0 1.83609972 4.25484765 5.14539612 4.25484765 5.14539612 9.53560111 0.0253961219 14.6556011 1.3633241 15.9934848 7.03645429 10.3203546 7.03645429 4.25484765 10.345795 4.25484765"></polygon>
        <polygon id="Rectangle"
                 transform="translate(9.872836, 13.710057) rotate(-45.000000) translate(-9.872836, -13.710057) "
                 points="8.9268062 11.4268659 10.8188656 11.4268659 10.8188656 15.9932487 8.9268062 15.9932487"></polygon>
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
