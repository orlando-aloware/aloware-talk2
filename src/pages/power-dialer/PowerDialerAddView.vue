<template>
  <PowerDialerAddItems
    v-if="isLoaded && contactListName"
    :id="id"
    :contactList="contactList"
    :name="contactListName"
    :open-edit="true"
    :is-contact-module="false" />
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerAddItems from 'src/pages/contacts/ContactsAddItemsStatic.vue'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import {
  STATIC,
  DYNAMIC
} from 'src/constants/contacts-list-types'

export default {
  name: 'PowerDialerAddView',
  components: {
    PowerDialerAddItems
  },
  mounted () {
    this.loadList(this.$route.params.id)
  },
  computed: {
    // ...mapGetters('powerDialer', ['powerDialerListItems']),
    ...mapGetters('contacts', ['lists', 'listItems']),
    contactList () {
      return this.lists[this.id]
    },
    contactListName () {
      return this.contactList?.name || ''
    },
    isLoaded () {
      if (this.lists[String(this.id)]) {
        return true
      }
      return false
    },
    // powerDialerList () {
    //   return this.powerDialerListItems[String(this.$route.params.id)]
    // },
    id () {
      if (this.$route.meta.id === 'power-dialer-add-queue-list') {
        return 'my-queue'
      }
      return this.$route.params.id || 'all'
    },
    filteredName () {
      return this.contactList?.name || ''
    }
  },
  data () {
    return {
      name: 'Power Dialer X',
      ContactListType: {
        STATIC,
        DYNAMIC
      }
    }
  },
  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'contactsLoaded',
      'openFilters'
    ]),
    loadList (id) {
      if (!id) {
        id = 'my-queue'
      }

      let stringId = String(id)

      if (this.$route.meta.id === 'power-dialer-add-queue-list' || this.$route.meta.id === 'power-dialer-queue-filter') {
        stringId = 'my-queue'
      }

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_CONTACT_LIST_ITEMS
        })
      }

      this.$axios
        .get('/api/v2/power-dialer-lists/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.$router.replace('/power-dialer/')
        })
    }
  },
  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'Power Dialer') {
        this.loadList(id)
      }
    }
  }
}
</script>
