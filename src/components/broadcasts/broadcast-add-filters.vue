<template>
  <div class="broadcasts__add__filters">
    <contacts-filters @filtersUpdated="updateFilterHasChanges"
                      :keep-open="true"
                      v-if="shouldShowFilters"/>
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

  computed: {
    shouldShowFilters () {
      return this.contactGroup === 'filter'
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
    contactGroup () {
      return this.openFilters()
    }
  }
}
</script>
