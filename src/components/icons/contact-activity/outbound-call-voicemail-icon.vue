<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 6.5C14.1569 6.5 15.5 7.84315 15.5 9.5V16.5C15.5 18.1569 14.1569 19.5 12.5 19.5H3.5C1.84315 19.5 0.5 18.1569 0.5 16.5V9.5C0.5 7.84315 1.84315 6.5 3.5 6.5H12.5ZM11 10.4C9.56406 10.4 8.4 11.5641 8.4 13C8.4 13.5159 8.55025 13.9967 8.80939 14.401H7.19061C7.44975 13.9967 7.6 13.5159 7.6 13C7.6 11.5641 6.43594 10.4 5 10.4C3.56406 10.4 2.4 11.5641 2.4 13C2.4 14.4359 3.56406 15.6 5 15.6H11L11.1644 15.5949C12.5238 15.5101 13.6 14.3807 13.6 13C13.6 11.5641 12.4359 10.4 11 10.4ZM5 11.6C5.7732 11.6 6.4 12.2268 6.4 13C6.4 13.7732 5.7732 14.4 5 14.4C4.2268 14.4 3.6 13.7732 3.6 13C3.6 12.2268 4.2268 11.6 5 11.6ZM11 11.6C11.7732 11.6 12.4 12.2268 12.4 13C12.4 13.7732 11.7732 14.4 11 14.4C10.2268 14.4 9.6 13.7732 9.6 13C9.6 12.2268 10.2268 11.6 11 11.6Z" fill="#FA003F"/>
    <path d="M19.5 19.0028V16.489C19.5 13.5649 20.6643 10.7611 22.7356 8.69707L23.4846 7.95068" stroke="#FA003F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.834 7L24.5 7V11.6" stroke="#FA003F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'outbound-call-voicemail-icon',
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
