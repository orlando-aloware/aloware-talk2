<template>
  <div class="t-menu">
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        QUEUE
      </div>
    </div>
    <div class="d-flex t-menu__content flex-column pb-3">
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
          count: 99,
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
