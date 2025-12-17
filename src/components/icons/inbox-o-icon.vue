<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.50098H4C3.1875 2.50098 2.65625 2.93848 2.5 3.75098L1.5 8.50098V12.001C1.50115 12.3984 1.65956 12.7793 1.94061 13.0604C2.22167 13.3414 2.60253 13.4998 3 13.501H13C13.3975 13.4998 13.7783 13.3414 14.0594 13.0604C14.3404 12.7793 14.4988 12.3984 14.5 12.001V8.50098L13.5 3.75098C13.3437 2.90723 12.7812 2.50098 12 2.50098Z" :stroke="color" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M1.5 8.5H6" :stroke="color" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 8.5H14.5" :stroke="color" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 8.5C6 9.03043 6.21071 9.53914 6.58579 9.91421C6.96086 10.2893 7.46957 10.5 8 10.5C8.53043 10.5 9.03914 10.2893 9.41421 9.91421C9.78929 9.53914 10 9.03043 10 8.5" :stroke="color" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'inbox-o-icon',
  props: {
    color: {
      type: String,
      default: '#4F4F4F',
      required: false
    },
    height: {
      type: [String, Number],
      default: 16,
      required: false
    },
    width: {
      type: [String, Number],
      default: '16',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
