<template>
  <div class='pinned'>
    <div class='pinned__header d-flex align-items-center list--header'>
      <div class='header__header__title font-weight-bold flex-grow-1'>
        QUEUE
      </div>
    </div>
    <contacts-sidebar-loader v-if='!hasListData'
                             :items='1'>
    </contacts-sidebar-loader>
    <div class='d-flex pinned__content flex-column'
         v-if='hasListData'>

      <QueueListItem :item='filteredList' />
    </div>
  </div>
</template>

<script>

import QueueListItem from './power-dialer-queue-list-item'
import { mapGetters } from 'vuex'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'

export default {
  name: 'PowerDialerQueueList',

  props: {
    activeCount: {
      type: [String, Number],
      default: 0
    }
  },

  components: {
    ContactsSidebarLoader,
    QueueListItem
  },

  computed: {
    ...mapGetters('powerDialer', [
      'myQueue'
    ]),

    filteredList () {
      return {
        count: this.activeCount,
        id: this.myQueue.id,
        link: '/power-dialer/list/',
        name: 'My Queue',
        to: '/power-dialer/list/'
      }
    },

    hasListData () {
      return this.myQueue?.id
    }
  },

  mounted () {
    if (this.$route.name === 'Power Dialer' && this.$route.params.id !== 'in-queue') {
      this.$emit('fetchMyQueueData')
    }
  }
}
</script>
