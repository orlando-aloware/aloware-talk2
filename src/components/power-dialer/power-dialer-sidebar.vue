<template>
  <card class="h-100 border-0 no-border-radius">
    <PowerDialerQueueList />
    <PowerDialerQueueList />
    <PowerDialerResourcesList />
  </card>
</template>

<script>

import PowerDialerQueueList from './power-dialer-queue-list'
import PowerDialerResourcesList from './power-dialer-resources-list'

export default {
  name: 'PowerDialerSidebar',
  components: {
    PowerDialerQueueList,
    PowerDialerResourcesList
  }
}
</script>
