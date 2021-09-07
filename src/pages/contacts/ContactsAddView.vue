<template>
  <contacts-add-items-static
    v-if="isLoaded && contactList.type === ContactListType.STATIC"
    :contactList="contactList"
  />
  <contacts-view
    v-else-if="isLoaded && contactList.type === ContactListType.DYNAMIC"
    :id="contactList.id"
    :name="contactList.name"
  />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import {
  DEFAULT_CONTACT_LIST_ITEMS,
  STATIC,
  DYNAMIC
} from 'src/constants/contacts-list-types'

import ContactsAddItemsStatic from './ContactsAddItemsStatic.vue'
import ContactsView from './ContactsView.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    ContactsAddItemsStatic,
    ContactsView
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems']),
    contactList () {
      return this.lists[String(this.$route.params.id)]
    },
    isLoaded () {
      if (this.lists[String(this.$route.params.id)]) {
        return true
      }
      return false
    }
  },
  data () {
    return {
      ContactListType: {
        STATIC,
        DYNAMIC
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['listLoaded', 'contactsLoaded', 'openFilters']),
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
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.$router.replace('/contacts/')
        })
    }
  },
  mounted () {
    this.loadList(this.$route.params.id)
    if (this.contactList.type === this.ContactListType.DYNAMIC) {
      this.openFilters()
    }
  },
  watch: {
    '$route.params.id': function (id) {
      this.loadList(id)
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
