<template>
  <div class="w-100 mobile-live-call-bar"
       v-if="showMobileLiveCallBar">
    <div class="w-100 bg-success call-status text-center"
         role='button'
         v-if="hasLiveCall"
         @click="openPhone">
      <span class="text-white">
        {{ liveCallText }}
      </span>
    </div>
    <div class="w-100 bg-purple-100 call-status text-center position-relative"
         role='button'
         v-if="hasParkedCall">
      <b-dropdown class="h-auto b-compact-dropdown-button text-bold w-100"
                  offset="25%"
                  variant="transparent"
                  no-caret
                  :menu-class="{ 'bg-grey-93': hideLiveCall }"
                  :disabled="loading"
                  v-if="dialer.currentStatus !== 'WRAP_UP' && hasParkedAndLiveCall">
        <template #button-content>
          <span class="text-white">
            {{ parkedCallText }}
          </span>
        </template>
        <b-dropdown-item href=""
                         :disabled="parkCallDisabled"
                         @click="answerCommunication(true, false)">
          <park-call-icon class="icon-margin"
                          width="13"
                          height="13"
                          color="#9B51E0"/>
          Park Current Call & Connect
        </b-dropdown-item>
        <b-dropdown-item href=""
                         :disbled="loading"
                         @click="answerCommunication(false, true)">
          <hangup-icon class="icon-margin"/>
          Hangup Current Call & Connect
        </b-dropdown-item>
      </b-dropdown>
      <div class="w-100 text-white"
           v-else
           @click="unparkCall">
        {{ parkedCallText }}
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import ParkCallIcon from 'components/icons/park-call-icon'
import HangupIcon from 'components/icons/hangup-icon'

export default {
  name: 'mobile-live-call-bar',
  components: {
    ParkCallIcon,
    HangupIcon
  },

  props: {
    hideLiveCall: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false
    }
  },

  computed: {
    ...mapState([
      'dialer',
      'isMobile'
    ]),

    parkCallDisabled () {
      return _.isEmpty(this.dialer.parkedCall) && !this.loading
    },

    liveCallText () {
      return `Live Call... ${this.dialer.timer}`
    },

    parkedCallText () {
      if (this.loading) {
        return 'Unparking Call...'
      }

      return `Parked Call... ${this.dialer.parkedCallTimer}`
    },

    hasLiveCall () {
      return !this.hideLiveCall && !_.isEmpty(this.dialer.call) && !['RECEIVED_CALL_INVITE', 'WRAP_UP'].includes(this.dialer.currentStatus)
    },

    hasParkedCall () {
      return !_.isEmpty(this.dialer.parkedCall)
    },

    hasParkedAndLiveCall () {
      return !_.isEmpty(this.dialer.parkedCall) && !_.isEmpty(this.dialer.call)
    },

    showMobileLiveCallBar () {
      const hasInProgressCall = this.hasLiveCall || this.hasParkedCall

      return this.isMobile && hasInProgressCall
    }
  },

  created () {
    this.$VueEvent.listen('doneParkAndConnect', () => {
      this.loading = false
      if (this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
        this.setShowPhone(true)
      }
    })

    this.$VueEvent.listen('doneHangupAndConnect', () => {
      this.loading = false
      if (this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
        this.setShowPhone(true)
      }
    })

    this.$VueEvent.listen('doneUnparkCall', () => {
      this.loading = false
      if (this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
        this.setShowPhone(true)
      }
    })
  },

  methods: {
    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.dialer.parkedCall.id,
          campaignId: this.dialer.parkedCall.campaign_id,
          contactName: this.dialer.parkedCall.contact.name,
          companyName: this.dialer.parkedCall.contact.company_name,
          contactId: this.dialer.parkedCall.contact.id,
          phoneNumber: this.dialer.parkedCall.contact.phone_number
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }

      this.loading = true
      this.$VueEvent.fire('answerCallFishing', data)
    },

    unparkCall () {
      if (this.loading) {
        return
      }

      this.loading = true
      this.$VueEvent.fire('unparkCall')

      if (this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
        this.setShowPhone(true)
      }
    },

    openPhone () {
      this.setShowPhone(true)
      if (this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
      }
    },

    ...mapActions(['setShowPhone'])
  },

  watch: {
    showMobileLiveCallBar (value) {
      this.$emit('shown', value)
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('doneParkAndConnect')
    this.$VueEvent.stop('doneHangupAndConnect')
    this.$VueEvent.stop('doneUnparkCall')
  }
}
</script>
