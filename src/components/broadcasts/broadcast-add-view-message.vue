<template>
  <div class="broadcast-add broadcast-add__message">
    Message
  </div>
</template>

<script>
export default {
  name: 'broadcast-add-view-message',

  computed: {
    isValid () {
      return false
    }
  },

  data: () => ({
  }),

  watch: {
    isValid (state) {
      this.$emit('input', state)
    }
  }
}
</script>
