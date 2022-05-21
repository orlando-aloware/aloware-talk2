<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.53539 5.79029C6.75152 5.472 6.79405 5.24286 6.5862 4.79748C6.2777 4.13586 5.19322 2.55076 4.49558 2.30275C4.17341 2.18818 3.85105 2.26462 3.46942 2.48953C2.34549 3.15153 1.94211 4.14799 2.00658 5.42116C2.22444 9.73341 6.52154 14.0256 10.8306 14.2434C12.1031 14.3079 13.0988 13.9043 13.7607 12.7798C13.9854 12.398 14.0619 12.0754 13.9471 11.7531C13.6995 11.0551 12.1152 9.97006 11.4539 9.6614C11.0086 9.45344 10.7798 9.49599 10.4616 9.71223C9.38793 10.4432 9.40102 11.3876 8.09118 10.5396C7.1089 9.90363 6.3439 9.14458 5.70842 8.16198C4.86086 6.85145 5.80503 6.86455 6.53539 5.79029Z" :stroke="color" stroke-width="1.2"/>
    <path d="M10 1.75H13.6V5.35" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.6001 6.88794V5.88794C10.6001 4.08159 11.6837 3.21469 12.9001 2.50391" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'outbound-call-o-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: [String, Number],
      default: 17,
      required: false
    },
    width: {
      type: [String, Number],
      default: 17,
      required: false
    }
  }
}
</script>

<style scoped>

</style>
