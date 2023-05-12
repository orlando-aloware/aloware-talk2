<template>
  <div class="broadcasts__add__filters">
    <contacts-filters @filtersUpdated="updateFilterHasChanges"/>
  </div>
</template>

<script>
import ContactsFilters from 'src/components/contacts/contacts-filters'
import { mapActions } from 'vuex'

export default {
  name: 'broadcast-add-filters',

  components: {
    ContactsFilters
  },

  props: {
    contactGroup: {
      type: String,
      required: true
    }
  },

  methods: {
    ...mapActions('contacts', [
      'openFilters',
      'closeFilters'
    ]),

    updateFilterHasChanges (changes) {
      console.log({ changes })
    }
  },

  watch: {
    contactGroup (group) {
      if (group === 'filter') {
        return this.openFilters()
      }

      return this.closeFilters()
    }
  }
}
</script>
