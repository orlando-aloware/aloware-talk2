<template>
  <contacts-add-items-static
    v-if="isLoaded && contactList.type === ContactListTypes.STATIC"
    :id="contactList.id"
    :contactList="contactList"
    :name="contactList.name"
  />
  <contacts-view
    v-else-if="isLoaded && contactList.type === ContactListTypes.DYNAMIC"
    :id="contactList.id"
    :name="contactList.name"
  />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import ContactsView from './ContactsView.vue'
import ContactsAddItemsStatic from 'pages/contacts/ContactsAddItemsStatic'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    ContactsAddItemsStatic,
    ContactsView
  },

  props: {
    contactsData: {
      type: Object,
      default: () => {
        return {
          data: []
        }
      }
    },
    list: {
      type: Object,
      default: () => {}
    },
    isLoadingDisabled: {
      type: Boolean,
      default: false
    },
    isStartState: {
      type: Boolean,
      default: false
    },
    isEditable: {
      type: Boolean,
      default: false
    },
    search: {
      type: String,
      default: ''
    },
    isMyContactsView: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    filtersCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters('contacts', ['lists', 'listItems']),
    contactList () {
      return this.lists[String(this.$route.params.id)]
    },
    isLoaded () {
      return !!this.lists[String(this.$route.params.id)]
    }
  },
  data () {
    return {
      ContactListTypes
    }
  },
  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'openFilters'
    ]),
    loadList (id) {
      if (!id) {
        id = 'all'
      }

      const stringId = String(id)

      this.$axios
        .get('/api/v2/contacts-list/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
        })
        .catch((error) => {
          const { message } = extractErrorMessage(error)
          this.$generalNotification(message, 'error')
          this.$router.replace('/contacts/')
        })
    }
  },
  mounted () {
    this.loadList(this.$route.params.id)
    if (this.contactList && this.contactList.type === this.ContactListTypes.DYNAMIC) {
      this.openFilters()
    }
  },
  watch: {
    '$route.params.id': function (id) {
      if (this.$route.name === 'Contacts' && id) {
        this.loadList(id)
      }
    }
  }
}
</script>
