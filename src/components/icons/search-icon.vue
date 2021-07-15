<template>
  <svg :width="width"
       :height="height" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>D193AD03-E450-45DE-A4EE-AE5E5B71542F</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="20" height="20"></rect>
    </defs>
    <g id="DESKTOP-App" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="Inbox_task_dialer-active" transform="translate(-1179.000000, -226.000000)">
        <g id="dialer" transform="translate(1160.000000, 75.000000)">
          <g id="search" transform="translate(19.000000, 151.000000)">
            <mask id="mask-2" fill="white">
              <use xlink:href="#path-1"></use>
            </mask>
            <g id="edit-/-search-(Background/Mask)"></g>
            <path
              d="M12.5971455,11.1778173 C14.2731138,8.82613782 14.0561832,5.54021135 11.9463541,3.43038221 C9.59473324,1.07876137 5.7820029,1.07876161 3.4303823,3.43038221 C1.07876146,5.78200305 1.07876146,9.59473327 3.4303823,11.9463541 C5.54021144,14.0561833 8.82613755,14.273114 11.1778173,12.5971456 L16.9140041,18.3333333 L18.3333333,16.9140041 L12.5971455,11.1778173 C13.7144577,9.61003097 13.7144577,9.61003097 12.5971455,11.1778173 Z M10.5270258,4.84971074 C12.0947729,6.41745781 12.0947729,8.95927875 10.5270258,10.5270258 C8.9592786,12.094773 6.41745826,12.0947729 4.84971119,10.5270258 C3.281964,8.95927863 3.281964,6.41745793 4.84971119,4.84971074 C6.41745826,3.28196367 8.9592786,3.28196355 10.5270258,4.84971074 C11.5721905,5.89487545 11.5721905,5.89487545 10.5270258,4.84971074 Z"
              id="edit-/-search" fill="#00BF4A" mask="url(#mask-2)"></path>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'search-icon',
  props: {
    width: {
      type: [Number, String],
      default: 20
    },
    height: {
      type: [Number, String],
      default: 20
    }
  }
}
</script>
