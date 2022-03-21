<template>
  <div>
    <PowerDialerView
      :pd-id="pdId"
      :name="name"
      @on-list-update="updateList" />
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import PowerDialerView from 'src/components/power-dialer/power-dialer-view'
import pdMixin from 'src/plugins/mixins/power-dialer-init.mixin'

export default {
  name: 'PowerDialerBase',
  mixins: [pdMixin],
  components: {
    PowerDialerView
  },
  computed: {
    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),
    ...mapGetters('contacts', [
      'listItems',
      'lists'
    ]),
    objId () {
      return this.$route
    },
    pdId () {
      let id = this.$route.params.id
      return !isNaN(id) ? id : 'my-queue'
    }
  },
  async mounted () {
    this.resetSearch()
    await this.myQueueList()
    await this.loadList(this.pdId)
    // export_event_updates
    this.$VueEvent.listen('export_event_updates', (task) => {
      console.log(' %c EXPORT EVENT : ', 'background: green; color: #000;', task)
    })
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'resetSearch',
      'listLoaded'
    ]),
    ...mapActions('powerDialer', [
      'getMyQueueList',
      'setSelectedPDList'
    ]),
    async updateList (id) {
      await this.loadList(id)
    },
    async fetchResources () {
      if (this.$route.meta.id === 'power-dialer-queue-filter') {
        await this.myQueueList()
        await this.loadList('my-queue')
      } else {
        await this.loadList(this.pdId)
      }
    },
    async myQueueList () {
      let response = await this.getMyQueueList()
      this.listLoaded({ ...response.data, id: 'my-queue' })
    }
  },
  watch: {
    'id': async function (id) {
      this.resetSearch()
      if (this.$route.name === 'Power Dialer') {
        this.loadList(id)
      }
    },
    'objId': async function (val) {
      if (val.name === 'Power Dialer') {
        // await this.fetchResources()
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
