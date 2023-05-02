<template>
  <svg :width="width" :height="height" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.30078 11.3865C1.30078 9.74921 2.62811 8.42188 4.26545 8.42188H7.66945C9.30678 8.42188 10.6341 9.74921 10.6341 11.3865" stroke="#62666E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.97255 1.54861C9.07903 2.6551 9.07903 4.44907 7.97255 5.55555C6.86606 6.66204 5.07209 6.66204 3.96561 5.55555C2.85912 4.44907 2.85912 2.6551 3.96561 1.54861C5.07209 0.442128 6.86606 0.442128 7.97255 1.54861" stroke="#62666E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'contact-alt-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '14',
      required: false
    },
    width: {
      type: String,
      default: '20',
      required: false
    }
  }
}
</script>
