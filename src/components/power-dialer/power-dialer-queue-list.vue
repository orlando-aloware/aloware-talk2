<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
        QUEUE
      </div>
    </div>
     <div class="d-flex pinned__content flex-column">
      <!-- Queue List Here -->
      <QueueListItem
        v-for="(item, key) in filteredList"
        :key="key"
        :item="item" />
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
      'my_queue'
    ]),
    filteredList () {
      return [{
        count: this.my_queue.items.length,
        id: this.my_queue.id,
        link: '/power-dialer/list/',
        name: 'My Queue',
        to: '/power-dialer/list/'
      }]
    }
  },
  data () {
    return {
      listItems: [
        {
          count: 0,
          id: 'my-queue',
          link: '/power-dialer/list/',
          name: 'My Queue',
          to: '/power-dialer/list/'
        }
      ]
    }
  }
}
</script>
