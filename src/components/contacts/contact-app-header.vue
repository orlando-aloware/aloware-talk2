<template>
  <h1>{{ title }}</h1>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-app-header',

  computed: {
    ...mapGetters('contacts', ['selectedList']),
    title () {
      return this.selectedList.name
    }
  }
}
</script>

<style scoped>

</style>
