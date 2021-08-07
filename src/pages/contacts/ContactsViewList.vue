<template>
  <contacts-view
    :id="String(contactList.id)"
    :name="contactList.name"
    :type="String(contactList.type)"
    v-if="isLoaded"
  />
</template>

<script>
import { DEFAULT_CONTACT_LIST_ITEMS, DYNAMIC } from 'src/constants/contacts-list-types'
import { mapActions, mapGetters } from 'vuex'
import ContactsView from './ContactsView.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    ContactsView
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems']),
    contactList () {
      return this.lists[String(this.$route.params.id)]
    },
    isLoaded () {
      if (
        this.listItems[String(this.$route.params.id)] &&
        this.lists[String(this.$route.params.id)]
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    ...mapActions('contacts', ['listLoaded', 'contactsLoaded', 'setCurrentListFilters', 'setSelectedList']),
    loadList (id) {
      const stringId = String(id)

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_CONTACT_LIST_ITEMS
        })
      }

      this.$axios
        .get('/api/v2/contacts-list/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
          this.setSelectedList({ id: response.id, name: response.name, type: response.type })
          let filters = {
            contact_lists: {
              operator: 1,
              value: [stringId]
            }
          }

          if (response.type === DYNAMIC) {
            filters = response.filters
          }
          this.setCurrentListFilters(filters)
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
          this.$router.replace('/contacts/')
        })
    }
  },
  mounted () {
    this.loadList(this.$route.params.id)
  },
  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'Contacts') {
        this.loadList(id)
        this.setCurrentListFilters({})
      }
    }
  }
}
</script>

<style scoped>
  .loader-spacer {
    min-height: calc(100vh - 300px);
    width: 100%;
    position: relative;
  }
</style>
