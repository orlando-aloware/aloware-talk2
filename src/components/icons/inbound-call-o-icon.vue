<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.53539 4.79029C5.75152 4.472 5.79405 4.24286 5.5862 3.79748C5.2777 3.13586 4.19322 1.55076 3.49558 1.30275C3.17341 1.18818 2.85105 1.26462 2.46942 1.48953C1.34549 2.15153 0.942111 3.14799 1.00658 4.42116C1.22444 8.73341 5.52154 13.0256 9.83056 13.2434C11.1031 13.3079 12.0988 12.9043 12.7607 11.7798C12.9854 11.398 13.0619 11.0754 12.9471 10.7531C12.6995 10.0551 11.1152 8.97006 10.4539 8.6614C10.0086 8.45344 9.77976 8.49599 9.46163 8.71223C8.38793 9.44317 8.40102 10.3876 7.09118 9.53964C6.1089 8.90363 5.3439 8.14458 4.70842 7.16198C3.86086 5.85145 4.80503 5.86455 5.53539 4.79029Z" :stroke="color" stroke-width="1.2"/>
    <path d="M12.6001 5.88867H9.0001V2.28867" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 0.750734V1.75073C12 3.55708 10.9164 4.42398 9.7 5.13477" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'inbound-call-o-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: [String, Number],
      default: 14,
      required: false
    },
    width: {
      type: [String, Number],
      default: 14,
      required: false
    }
  }
}
</script>

<style scoped>

</style>
