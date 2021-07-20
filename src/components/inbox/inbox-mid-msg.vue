<template>
  <div class="message animate__animated animate__fadeIn">
  </div>
</template>

<script>

export default {
  name: 'message.vue',
  components: {},
  methods: {
    toggle () {
      this.$emit('toggle')
    }
  }
}
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
}
</style>
