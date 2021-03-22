<template>
  <svg :width="width"
       :height="height" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>BE4292A8-6739-4758-849E-33F3DA7A9FA7</title>
    <defs>
      <filter id="filter-1">
        <feColorMatrix in="SourceGraphic" type="matrix"
                       values="0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 1.000000 0"></feColorMatrix>
      </filter>
      <rect id="path-2" x="0" y="0" width="16" height="16"></rect>
    </defs>
    <g id="Contacts" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="Contacts_1-Selecting-multiple-list" transform="translate(-380.000000, -190.000000)">
        <g id="list" transform="translate(360.000000, 75.000000)">
          <g id="icon-/-check" transform="translate(20.000000, 115.000000)" filter="url(#filter-1)">
            <g id="check">
              <mask id="mask-3" fill="white">
                <use xlink:href="#path-2"></use>
              </mask>
              <g id="basic-/-done-(Background/Mask)"></g>
              <path
                d="M7.24999454,11.5000015 L6.08332935,12.6666667 L2,8.58333732 L3.16666549,7.41667173 L7.24999454,11.5000015 Z M13.0833193,3.33333333 L14.2499845,4.49999911 L7.24999454,11.5000015 L6.0833262,10.3333333 L13.0833193,3.33333333 Z"
                id="basic-/-done" fill="#00BF4A" mask="url(#mask-3)"></path>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
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
