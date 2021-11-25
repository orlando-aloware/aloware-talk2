<template>
  <PowerDialerAddList
    v-if="false"
    :id="id"
    :name="name"
    :power-dialer-list="powerDialerList" />
  <PowerDialerAddItems
    v-else
    :id="id"
    :contactList="contactList"
    :name="contactList.name" />
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerAddList from 'src/components/power-dialer/power-dialer-add-list-items'
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
    PowerDialerAddList,
    PowerDialerAddItems
  },
  mounted () {
    this.loadList(this.$route.params.id)
    if (this.contactList && this.contactList.type === this.ContactListType.DYNAMIC) {
      this.openFilters()
    }
  },
  computed: {
    ...mapGetters('powerDialer', ['powerDialerListItems']),
    ...mapGetters('contacts', ['lists', 'listItems']),
    contactList () {
      return this.lists[this.id]
    },
    isLoaded () {
      if (this.lists[String(this.id)]) {
        return true
      }
      return false
    },
    powerDialerList () {
      return this.powerDialerListItems[String(this.$route.params.id)]
    },
    id () {
      return this.$route.params.id || 'all'
    },
    filteredName () {
      return this.contactList?.name || ''
    }
    // filter () {
    //   if (this.$route.params.id) {
    //     if (this.$route.meta === 'Power Dialer' || (this.$route.meta === 'Power Dialer Filter' || this.$route.meta === 'Power Dialer Individual Advance')) {
    //       return this.$route.params.id
    //     } else {
    //       if (this.$route.params.filter) {
    //         return this.$route.params.filter
    //       }
    //       return 'in-queue'
    //     }
    //   }
    //   return 'in-queue'
    // }
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
      console.log('666 :>> ', 666)
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
      this.loadList(id)
    }
  }
}
</script>
