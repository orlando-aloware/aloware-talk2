<template>
  <div class="t-menu">
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title text-13 pl-3 pt-3 flex-grow-1">
        QUEUE
      </div>
    </div>
    <div
      v-if="my_queue"
      class="d-flex t-menu__content flex-column pb-3">
      <!-- Queue List Here -->
      <QueueListItem
        v-for="(item, key) in listItems"
        :key="key"
        :item="item" />
    </div>
    <div
      v-else
      class="px-3 py-2 text-grey-6">No lists found</div>
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
    ])
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
