<template>
  <svg :width="width" :height="height" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.37494 4.77734C9.37494 4.77734 10.0886 4.42578 7.49994 4.42578C6.57284 4.42578 5.66656 4.7007 4.89571 5.21577C4.12485 5.73084 3.52404 6.46292 3.16926 7.31945C2.81447 8.17598 2.72164 9.11848 2.90251 10.0278C3.08338 10.9371 3.52982 11.7723 4.18538 12.4278C4.84094 13.0834 5.67617 13.5298 6.58545 13.7107C7.49474 13.8916 8.43724 13.7987 9.29377 13.444C10.1503 13.0892 10.8824 12.4884 11.3975 11.7175C11.9125 10.9467 12.1874 10.0404 12.1874 9.11328" :stroke="color" stroke-width="1.6" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M7.50006 2.19922L9.84381 4.54297L7.50006 6.88672" :stroke="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'refresh-icon',
  props: {
    width: {
      type: [Number, String],
      default: 15
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
