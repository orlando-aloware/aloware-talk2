<template>
  <h1 class="contact-list-name-label" data-testid="contact-app-header">
    {{ title }}
    <q-tooltip anchor="bottom middle"
               data-testid="contact-app-header-tooltip"
               self="center middle">
      {{ title }}
    </q-tooltip>
  </h1>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { get } from 'lodash'

export default {
  name: 'contact-app-header',

  computed: {
    ...mapGetters('contacts', ['selectedList']),
    ...mapState('contacts', ['search']),

    previousPage () {
      return get(this.$route?.query, 'previousPage', null)
    },

    title () {
      if (this.previousPage === 'Power Dialer') {
        return 'Power Dialer'
      }

      return this.search && this.search.length > 0 ? 'Search results' : this.selectedList.name
    }
  }
}
</script>
