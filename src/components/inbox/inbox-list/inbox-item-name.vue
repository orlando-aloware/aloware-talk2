<template>
  <div>
    <strong>{{ getIdentity }}</strong>
  </div>
</template>

<script>
export default {
  name: 'inbox-item-name',

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    getIdentity () {
      if (this.contact.name) {
        return this.$options.filters.fixName(this.$options.filters.truncate(this.contact.name, 15))
      } else {
        return this.$options.filters.fixPhone(this.contact.phone_number)
      }
    }
  }
}
</script>

<style scoped>

</style>
