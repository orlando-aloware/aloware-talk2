<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        QUEUE
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <!-- Queue List Here -->
      <QueueListItem
        v-for="(item, key) in listItems"
        :key="key"
        :item="item" />
    </div>
  </div>
</template>

<script>

import QueueListItem from './power-dialer-queue-list-item.vue'

export default {
  name: 'PowerDialerQueueList',
  components: {
    QueueListItem
  },
  data () {
    return {
      listItems: [
        {
          count: 3453,
          id: 'all',
          link: '/power-dialer/',
          name: 'My Queue',
          to: '/power-dialer'
        }
      ]
    }
  }
}
</script>
