<template>
  <svg :width="width" :height="height" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H14C14.5304 1 15.0391 1.21071 15.4142 1.58579C15.7893 1.96086 16 2.46957 16 3V13C16 13.5304 15.7893 14.0391 15.4142 14.4142C15.0391 14.7893 14.5304 15 14 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V3ZM6 2V14H14C14.2652 14 14.5196 13.8946 14.7071 13.7071C14.8946 13.5196 15 13.2652 15 13V3C15 2.73478 14.8946 2.48043 14.7071 2.29289C14.5196 2.10536 14.2652 2 14 2H6ZM5 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V13C2 13.2652 2.10536 13.5196 2.29289 13.7071C2.48043 13.8946 2.73478 14 3 14H5V2Z" :fill="color" :stroke="color" stroke-width="0.2"/>
  </svg>
</template>

<script>
export default {
  name: 'collapse-icon',

  props: {
    width: {
      type: [Number, String],
      default: 16
    },

    height: {
      type: [Number, String],
      default: 16
    },

    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
