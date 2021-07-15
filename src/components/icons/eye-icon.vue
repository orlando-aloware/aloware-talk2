<template>
  <svg :width="width" :height="height" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9089 3.46898C11.2886 2.01277 9.57828 1.25 8.003 1.25C4.20733 1.25 1.22179 5.49726 1.10177 5.67062C0.966076 5.86222 0.966076 6.13778 1.10177 6.32938C1.69611 7.14439 2.36514 7.88258 3.09713 8.53102C4.71742 9.98723 6.42772 10.75 8.003 10.75C11.7987 10.75 14.7842 6.50274 14.9042 6.31204C15.0319 6.12369 15.0319 5.85897 14.9042 5.67062C14.3098 4.8557 13.6408 4.11752 12.9089 3.46898Z" :stroke="color" stroke-width="1.2"/>
    <path d="M8 8.67188C6.55025 8.67188 5.375 7.47564 5.375 6C5.375 4.52436 6.55025 3.32812 8 3.32812C9.44975 3.32812 10.625 4.52436 10.625 6C10.618 7.47266 9.44682 8.66471 8 8.67188Z" :stroke="color" stroke-width="1.2"/>
  </svg>

</template>

<script>
export default {
  name: 'eye-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '12',
      required: false
    },
    width: {
      type: String,
      default: '12',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
