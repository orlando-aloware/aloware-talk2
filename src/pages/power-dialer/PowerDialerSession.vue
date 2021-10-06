<template>
  <div class="mx-0 content-row d-flex overflow-hidden h-100">
    <div class="col-2  pt-0 pl-0 pr-0 mb-0 h-100 bordered-right">
      <SessionSidebar />
    </div>
    <div
      class="col-10 bg-grey-1 px-0 pr-1 mb-0">
      <div class="t-flex-group">
        <div class="d-flex bg-white">
          <div class="col-7 p-0 bordered-right">
            <CallDisposition />
          </div>
          <div class="col-5 p-0">
            <CallStatus />
          </div>
        </div>
        <SessionPage />
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import CallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import CallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionPage from 'src/components/power-dialer/sessions/session-page'

export default {
  name: 'PowerDialerSession',
  components: {
    SessionSidebar,
    CallDisposition,
    CallStatus,
    SessionPage
  },
  computed: {
    ...mapGetters('powerDialer', [
      'isStartingDial'
    ])
  },
  created () {
    console.log('this.isStartingDial :>> ', this.isStartingDial)
    if (!this.isStartingDial) {
      this.$router.push({ name: 'Power Dialer' })
    }
  }
}
</script>
