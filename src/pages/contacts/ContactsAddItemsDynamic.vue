<template>
  <contacts-view :id="String(contactList.id)" :name="contactList.name" v-if="isLoaded" />
</template>

<script>
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-types'
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
    ...mapActions('contacts', ['listLoaded', 'contactsLoaded']),
    loadList (id) {
      const stringId = String(id)

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_CONTACT_LIST_ITEMS
        })
      }

      window.axios
        .get('/api/v1/contacts-list/' + stringId)
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: stringId })
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
          this.$router.replace('/contacts')
        })
    }
  },
  mounted () {
    this.loadList(this.$route.params.id)
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
