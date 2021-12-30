<template>
  <div>
    <PowerDialerView
      :id="id"
      :name="name"
      @on-list-update="updateList" />
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerView from 'src/components/power-dialer/power-dialer-view'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  name: 'PowerDialerBase',
  components: {
    PowerDialerView
  },
  computed: {
    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),
    ...mapGetters('contacts', [
      'listItems',
      'lists',
      'selectedList'
    ]),
    objId () {
      return this.$route
    },
    id () {
      return this.$route.params.id || 'my-queue'
    }
  },
  async mounted () {
    this.resetSearch()
    if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
      await this.getMyQueueList()
    }
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'listLoaded',
      'contactsLoaded',
      'setCurrentListFilters',
      'setSelectedList',
      'resetSearch'
    ]),
    ...mapActions('powerDialer', [
      'getMyQueueList'
    ]),
    async updateList (data) {
      await this.loadList(data.id)
    },
    async loadList (id) {
      if (!id) {
        id = 'my-queue'
      }

      let stringId = String(id)

      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        stringId = 'my-queue'
      }

      if (!this.listItems[stringId]) {
        this.contactsLoaded({
          id: stringId,
          ...DEFAULT_LIST_ITEMS
        })
      }

      this.$axios
        .get('/api/v2/power-dialer-lists/' + stringId)
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

          this.setCurrentListFilters(filters)
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          if (this.$route.name === 'Power Dialer') {
            this.$router.replace('/power-dialer/')
          }
        })
    }
  },
  watch: {
    'id': async function (id) {
      this.resetSearch()
      if (this.$route.name === 'Power Dialer') {
        this.loadList(id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
