<template>
  <svg viewBox="0 0 16 16"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :width="width"
       :height="height">
    <path fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8 1.2C4.24446 1.2 1.2 4.24446 1.2 8C1.2 11.7555 4.24446 14.8 8 14.8C11.7555 14.8 14.8 11.7555 14.8 8C14.8 4.24446 11.7555 1.2 8 1.2ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
          :fill="pathColor"/>
    <circle cx="7.99999"
            cy="8.00027"
            r="3.27273"
            :fill="circleColor"/>
  </svg>
</template>

<script>
export default {
  name: 'pause-record-icon',

  props: {
    width: {
      type: [Number, String],
      default: 16
    },

    height: {
      type: [Number, String],
      default: 16
    },

    pathColor: {
      type: String,
      default: '#62666E'
    },

    circleColor: {
      type: String,
      default: '#FA003F'
    }
  }
}
</script>
