<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.95668 3.42432L2.37891 11.019L1.75 12.2495L2.98019 11.6206L10.5752 4.04283L9.95668 3.42432Z"
      :stroke="color"
      stroke-width="1.1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11.5033 1.87804L10.8848 2.49655L11.5033 3.11534L12.1218 2.49655C12.2038 2.41452 12.2498 2.30328 12.2498 2.1873C12.2498 2.07131 12.2038 1.96008 12.1218 1.87804V1.87804C12.0398 1.79605 11.9285 1.75 11.8125 1.75C11.6966 1.75 11.5853 1.79605 11.5033 1.87804V1.87804Z"
      :stroke="color"
      stroke-width="1.1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: 'people-icon',
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 14
    },
    color: {
      type: String,
      default: '#333333'
    }
  }
}
</script>
