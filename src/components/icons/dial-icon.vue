<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.91893 12.0271H3.40001C2.07452 12.0271 1 10.9525 1 9.62706V3.40001C1 2.07452 2.07452 1 3.40001 1H9.62706C10.9525 1 12.0271 2.07452 12.0271 3.40001V3.91893" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3033 7.96979C10.1748 7.78053 10.1495 7.64429 10.2731 7.37947C10.4565 6.98607 11.1013 6.04358 11.5161 5.89611C11.7077 5.82799 11.8994 5.87344 12.1263 6.00717C12.7946 6.40079 13.0344 6.99329 12.9961 7.75031C12.8665 10.3144 10.3115 12.8665 7.74938 12.996C6.99275 13.0343 6.40068 12.7944 6.00715 12.1257C5.87349 11.8987 5.82806 11.7069 5.89627 11.5153C6.04354 11.1002 6.98554 10.4551 7.37873 10.2715C7.64353 10.1479 7.77959 10.1732 7.96874 10.3018C8.60716 10.7364 8.59938 11.298 9.3782 10.7937C9.96226 10.4156 10.4171 9.96424 10.795 9.37999C11.2989 8.60076 10.7375 8.60854 10.3033 7.96979Z" fill="#62666E" :stroke="color" stroke-width="1.2"/>
    <path d="M4.01611 4.08105H8.21613" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.01611 6.35156H6.41612" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'dial-icon',
  props: {
    color: {
      type: String,
      default: '#256EFF',
      required: false
    },
    height: {
      type: String,
      default: '14',
      required: false
    },
    width: {
      type: String,
      default: '14',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
