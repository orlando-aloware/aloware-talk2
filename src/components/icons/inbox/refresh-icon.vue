<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.49994 3.42187C7.49994 3.42187 8.07088 3.14062 5.99994 3.14062C5.25826 3.14062 4.53324 3.36056 3.91655 3.77261C3.29987 4.18467 2.81922 4.77034 2.53539 5.45556C2.25156 6.14078 2.1773 6.89478 2.322 7.62221C2.46669 8.34964 2.82384 9.01783 3.34829 9.54227C3.87274 10.0667 4.54092 10.4239 5.26835 10.5686C5.99578 10.7133 6.74978 10.639 7.435 10.3552C8.12023 10.0713 8.70589 9.5907 9.11795 8.97401C9.53001 8.35733 9.74994 7.6323 9.74994 6.89062" stroke="#62666E" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M6.00006 1.35938L7.87506 3.23437L6.00006 5.10937" stroke="#62666E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'refresh-icon',
  props: {
    width: {
      type: [Number, String],
      default: 12
    },
    height: {
      type: [Number, String],
      default: 12
    }
  }
}
</script>
