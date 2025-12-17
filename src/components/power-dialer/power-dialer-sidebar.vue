<template>
  <div class="h-100 border-0 no-border-radius">
    <PowerDialerQueueList
      :active-count="count"
      @fetchMyQueueData="onFetchMyQueueData" />
    <PowerDialerList />
  </div>
</template>

<script>

import PowerDialerQueueList from './power-dialer-queue-list'
import PowerDialerList from './power-dialer-list'

export default {
  name: 'PowerDialerSidebar',
  inject: [
    'contactsData'
  ],
  computed: {
    fixedContactsData () {
      return this.$parent.$data.contactsData
    }
  },
  components: {
    PowerDialerQueueList,
    PowerDialerList
  },
  watch: {
    'fixedContactsData': {
      handler (objRef) {
        if (objRef?.total_queued) {
          this.count = objRef.total_queued
        }
      },
      deep: true
    }
  },
  data () {
    return {
      count: 0
    }
  },
  methods: {
    onFetchMyQueueData () {
      this.$emit('fetchMyQueueData')
    }
  }
}
</script>
