<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
        QUEUE
      </div>
    </div>
     <div
      class="d-flex pinned__content flex-column"
      v-if="hasListData">

      <QueueListItem
        :item="filteredList" />

    </div>
  </div>
</template>

<script>

import QueueListItem from './power-dialer-queue-list-item'
import { mapGetters } from 'vuex'

export default {
  name: 'PowerDialerQueueList',
  components: {
    QueueListItem
  },
  computed: {
    ...mapGetters('powerDialer', [
      'myQueue'
    ]),
    filteredList () {
      return {
        count: this.myQueue?.items?.length,
        id: this.myQueue.id,
        link: '/power-dialer/list/',
        name: 'My Queue',
        to: '/power-dialer/list/'
      }
    },
    hasListData () {
      return this.myQueue?.id
    }
  }
}
</script>
