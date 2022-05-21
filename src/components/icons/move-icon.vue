<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.375 6.50049L6.90625 2.23486V4.67236C2.62971 4.67236 1.625 7.73879 1.625 10.7661C2.85924 9.1858 3.95078 8.32861 6.90625 8.32861V10.7661L11.375 6.50049Z"
      :stroke="color"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: 'folder-arrow-open-icon',
  props: {
    width: {
      type: [Number, String],
      default: 13
    },
    height: {
      type: [Number, String],
      default: 13
    },
    color: {
      type: String,
      default: '#333333'
    }
  }
}
</script>
