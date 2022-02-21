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
    id () {
      let id = this.$route.params.id
      return !isNaN(id) ? id : 'my-queue'
    }
  },
  async mounted () {
    this.resetSearch()
    await this.fetchResources()
  },
  data () {
    return {
      name: 'Power Dialer X'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'resetSearch',
      'setSelectedList',
      'listLoaded'
    ]),
    ...mapActions('powerDialer', [
      'getMyQueueList'
    ]),
    async updateList (data) {
      await this.loadList(data.id)
    },
    async fetchResources () {
      if (this.$route.meta.title === 'Power Dialer') {
        let response = await this.getMyQueueList()
        this.listLoaded({ ...response.data, id: 'my-queue' })
        // this.setSelectedList({
        //   id: response.data.id,
        //   name: response.data.name,
        //   type: response.data.type
        // })
      } else {
        await this.loadList(this.id)
      }
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
