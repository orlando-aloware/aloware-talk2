<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 0.5C14.1569 0.5 15.5 1.84315 15.5 3.5V10.5C15.5 12.1569 14.1569 13.5 12.5 13.5H3.5C1.84315 13.5 0.5 12.1569 0.5 10.5V3.5C0.5 1.84315 1.84315 0.5 3.5 0.5H12.5ZM11 4.4C9.56406 4.4 8.4 5.56406 8.4 7C8.4 7.51589 8.55025 7.99669 8.80939 8.40103H7.19061C7.44975 7.99669 7.6 7.51589 7.6 7C7.6 5.56406 6.43594 4.4 5 4.4C3.56406 4.4 2.4 5.56406 2.4 7C2.4 8.43594 3.56406 9.6 5 9.6H11L11.1644 9.59488C12.5238 9.51005 13.6 8.38071 13.6 7C13.6 5.56406 12.4359 4.4 11 4.4ZM5 5.6C5.7732 5.6 6.4 6.2268 6.4 7C6.4 7.7732 5.7732 8.4 5 8.4C4.2268 8.4 3.6 7.7732 3.6 7C3.6 6.2268 4.2268 5.6 5 5.6ZM11 5.6C11.7732 5.6 12.4 6.2268 12.4 7C12.4 7.7732 11.7732 8.4 11 8.4C10.2268 8.4 9.6 7.7732 9.6 7C9.6 6.2268 10.2268 5.6 11 5.6Z" fill="#FA003F"/>
    <path d="M19.5 13.0033V10.4895C19.5 7.56534 20.6643 4.76156 22.7356 2.69755L23.4846 1.95117" stroke="#FA003F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.834 1L24.5 1V5.6" stroke="#FA003F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'outbound-voicemail-icon',
  props: {
    width: {
      type: [Number, String],
      default: 26
    },
    height: {
      type: [Number, String],
      default: 26
    }
  }
}
</script>
