<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.1875 4.37549H11.8125"
      stroke="#BDBDBD"
      stroke-miterlimit="10"
      stroke-linecap="round"
    />
    <path
      d="M2.1875 7H11.8125"
      stroke="#BDBDBD"
      stroke-miterlimit="10"
      stroke-linecap="round"
    />
    <path
      d="M2.1875 9.62549H11.8125"
      stroke="#BDBDBD"
      stroke-miterlimit="10"
      stroke-linecap="round"
    />
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 14
    }
  }
}
</script>
