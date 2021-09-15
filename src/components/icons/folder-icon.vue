<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 15 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.8906 11.6562H2.10937C1.79857 11.6562 1.5005 11.5328 1.28073 11.313C1.06096 11.0932 0.9375 10.7952 0.9375 10.4844V2.51562C0.9375 2.20482 1.06096 1.90675 1.28073 1.68698C1.5005 1.46722 1.79857 1.34375 2.10937 1.34375H4.33271C4.5641 1.34376 4.7903 1.41226 4.98281 1.54063L5.79844 2.08437C5.99095 2.21274 6.21715 2.28124 6.44853 2.28125H12.8906C13.2014 2.28125 13.4995 2.40471 13.7193 2.62448C13.939 2.84425 14.0625 3.14232 14.0625 3.45312V10.4844C14.0625 10.7952 13.939 11.0932 13.7193 11.313C13.4995 11.5328 13.2014 11.6562 12.8906 11.6562Z"
      :stroke="color"
      stroke-width="1.1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 15
    },
    height: {
      type: [Number, String],
      default: 13
    },
    color: {
      type: String,
      default: '#BDBDBD'
    }
  }
}
</script>
