<template>
  <h1>{{ title }}</h1>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'contact-app-header',

  computed: {
    ...mapGetters('contacts', ['selectedList']),
    ...mapState('contacts', ['search']),

    title () {
      return this.search && this.search.length > 0 ? 'Search results' : this.selectedList.name
    }
  }
}
</script>
