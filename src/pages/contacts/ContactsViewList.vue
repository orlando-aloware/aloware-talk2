<template>
  <contacts-view
    :id="id"
    :name="name"
    :type="type"
    v-if="isLoaded"
  />
</template>

<script>
import { DYNAMIC } from 'src/constants/contacts-list-types'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
import { mapActions, mapGetters } from 'vuex'
import ContactsView from './ContactsView.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    ContactsView
  },

  computed: {
    ...mapGetters('contacts', ['lists', 'listItems']),
    id () {
      if (['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
        let list = this.lists[String(this.$route.params.id)]
        return list.id
      }

      if (['Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      }

      return 'all'
    },
    contactList () {
      return this.lists[this.$route.params.id]
    },
    isLoaded () {
      if (this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return true
      }

      return !!(this.listItems[String(this.$route.params.id)] &&
        this.lists[String(this.$route.params.id)])
    }
  },

  data () {
    return {
      name: 'All Contacts',
      type: 2
    }
  },

  methods: {
    ...mapActions('contacts', ['listLoaded', 'contactsLoaded', 'setCurrentListFilters', 'setSelectedList']),
    loadList (id) {
      if (!id) {
        id = 'all'
      }

      const stringId = String(id)

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_CONTACT_LIST_ITEMS
        })
      }

      this.$axios
        .get('/api/v2/contacts-list/' + stringId + (this.$route.query.type && this.$route.query.type === 'public' ? '?is_public_list=true' : ''))
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
          this.setSelectedList({ id: response.id, name: response.name, type: response.type })
          this.name = response.name
          this.type = response.type
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
          return response
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.$router.replace('/contacts/')
        })
    },

    setData (id) {
      const list = this.lists[id] || {}
      if (Object.values(list).length > 0) {
        this.name = list.name
        this.type = list.type
        this.setSelectedList({ id: this.id, name: this.name, type: this.type })
      }
    }
  },

  mounted () {
    if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
      this.loadList(this.$route.params.id)
    }

    if (this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
      this.setData(this.id)
      this.setSelectedList({ id: this.id, name: this.name, type: this.type })
    }
  },

  watch: {
    '$route.params.id': async function (id) {
      if (this.$route.name === 'Contacts' && ['Contacts List', 'Public Contacts List'].includes(this.$route.meta.page)) {
        this.loadList(id)
        this.setCurrentListFilters({})
      }
      if (this.$route.name === 'Contacts' && ['Contacts', 'Default Contacts List'].includes(this.$route.meta.page)) {
        if (!id) {
          id = 'all'
        } else {
          this.setData(id)
        }
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
