<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 6.5C14.1569 6.5 15.5 7.84315 15.5 9.5V16.5C15.5 18.1569 14.1569 19.5 12.5 19.5H3.5C1.84315 19.5 0.5 18.1569 0.5 16.5V9.5C0.5 7.84315 1.84315 6.5 3.5 6.5H12.5ZM13.6441 10.343C13.4511 10.0736 13.0763 10.0116 12.8069 10.2045L8.92425 12.9848L8.79351 13.0691C8.2584 13.3782 7.58587 13.3501 7.07575 12.9848L3.19307 10.2045L3.10937 10.1542C2.85051 10.026 2.52956 10.1005 2.35593 10.343C2.163 10.6124 2.22501 10.9872 2.49443 11.1801L6.3771 13.9605L6.55168 14.0759C7.49985 14.6529 8.70961 14.6144 9.6229 13.9605L13.5056 11.1801L13.5801 11.1171C13.7848 10.9133 13.8177 10.5855 13.6441 10.343Z" fill="#4450C0"/>
    <path d="M24.5 7.00013V9.51396C24.5 12.4381 23.3357 15.2419 21.2644 17.3059L20.5154 18.0522" stroke="#4450C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24.166 19.0029H19.5V14.4029" stroke="#4450C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'inbound-email-inprogress-icon',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    }
  }
}
</script>
