<template>
  <contacts-add-items-static
    v-if="isLoaded && contactList.type === ContactListType.STATIC"
    :id="contactList.id"
    :contactList="contactList"
    :name="contactList.name"
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
  STATIC,
  DYNAMIC
} from 'src/constants/contacts-list-types'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
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
    if (this.contactList && this.contactList.type === this.ContactListType.DYNAMIC) {
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
