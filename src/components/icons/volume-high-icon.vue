<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.90625 9.0009H2.625C2.52554 9.0009 2.43016 9.04041 2.35983 9.11074C2.28951 9.18106 2.25 9.27645 2.25 9.3759V14.6259C2.25 14.7254 2.28951 14.8207 2.35983 14.8911C2.43016 14.9614 2.52554 15.0009 2.625 15.0009H5.88984C6.06271 14.9995 6.2307 15.0582 6.36515 15.1668L10.6528 18.6773C10.7086 18.7184 10.7747 18.7431 10.8438 18.7489C10.9128 18.7547 10.9821 18.7412 11.044 18.71C11.1058 18.6788 11.1578 18.631 11.1942 18.5721C11.2306 18.5131 11.2499 18.4452 11.25 18.3759V5.6259C11.2499 5.55662 11.2306 5.48872 11.1942 5.42975C11.1578 5.37077 11.1058 5.32303 11.044 5.29181C10.9821 5.26059 10.9128 5.24712 10.8438 5.25289C10.7747 5.25866 10.7086 5.28345 10.6528 5.3245L6.36515 8.83497C6.2369 8.94329 6.07412 9.00215 5.90625 9.0009Z" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 14.9989C15.4566 14.0905 15.75 13.0846 15.75 11.9989C15.75 10.8983 15.4687 9.91674 15 8.99893" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.2498 17.2488C18.1629 15.6588 18.7498 14.246 18.7498 11.9988C18.7498 9.75159 18.1873 8.35472 17.2498 6.74878" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.5 19.4976C20.9062 17.3414 21.75 15.2119 21.75 11.9976C21.75 8.78343 20.9062 6.70077 19.5 4.49765" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'volume-high-icon',

  props: {
    width: {
      type: [Number, String],
      default: 18
    },

    height: {
      type: [Number, String],
      default: 18
    },

    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
