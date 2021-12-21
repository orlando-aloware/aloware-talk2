<template>
  <div class="h-100 border-0 no-border-radius">
    <PowerDialerQueueList />
    <PowerDialerList />
  </div>
</template>

<script>

import PowerDialerQueueList from './power-dialer-queue-list'
import PowerDialerList from './power-dialer-list'

export default {
  name: 'PowerDialerSidebar',
  components: {
    PowerDialerQueueList,
    PowerDialerList
  }
}
</script>
