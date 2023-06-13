<template>
  <div class="broadcast-add broadcast-add__schedule">
    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Schedule
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <broadcast-time-restriction-alert />

        <b-form-group>
          <b-form-radio value="now"
                        v-model="time">
            Now
          </b-form-radio>
          <b-form-radio value="scheduled"
                        v-model="time">
            Pick a time
            <div class="time-schedule"
                 v-if="time === 'scheduled'">
              <div class="time-schedule__row">
                <div class="time-schedule__row__label">
                  Day
                </div>
                <div class="time-schedule__row__field">
                  <date-selector v-model="schedule.date"
                                 @dateSelected="onDateSelected"/>
                </div>
              </div>
              <div class="time-schedule__row">
                <div class="time-schedule__row__label">
                  Time
                </div>
                <div class="time-schedule__row__field position-relative">
                  <!-- <date-selector only-time
                                 format="hh:mm a"
                                 formatted="hh:mm a"
                                 :date-only="false"
                                 v-model="schedule.time"/> -->
                  <predefined-time-selector v-model="schedule.time"
                                            @select="onTimeSelected"/>
                  <b-badge class="mr-2 position-absolute"
                           style="right: -50px; top: 15px"
                           variant="light">
                    {{ companyTimezone }}
                  </b-badge>
                </div>
              </div>
            </div>
          </b-form-radio>
        </b-form-group>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label" />
      <div class="broadcast-add__schedule__row__fields flex-row align-items-center">
        <b>{{ sendTimeLabel }}</b>
        <b-badge class="ml-2"
                 variant="light">
          {{ companyTimezone }}
        </b-badge>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        From
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <contact-line-selector v-model="campaign.id"
                               @select="onCampaignSelected"/>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Throttling
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <throttle-selector :campaign="campaign"
                           v-model="throttle"/>
      </div>
    </div>
  </div>
</template>

<script>
import BroadcastTimeRestrictionAlert from 'src/components/broadcasts/broadcast-time-restriction-alert'
import ContactLineSelector from 'src/components/contact-line-selector.vue'
import DateSelector from 'src/components/date-selector.vue'
import PredefinedTimeSelector from 'src/components/predefined-time-selector.vue'
import ThrottleSelector from 'src/components/generic-selectors/throttle-selector.vue'
import { mapState } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view-schedule',

  components: {
    BroadcastTimeRestrictionAlert,
    ContactLineSelector,
    DateSelector,
    PredefinedTimeSelector,
    ThrottleSelector
  },

  props: {
    propCampaign: {
      type: Object,
      required: false,
      default: null
    },

    propTime: {
      type: Object,
      required: false,
      default: null
    },

    propThrottle: {
      type: Object,
      required: false,
      default: null
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    isValid () {
      const time = this.time === 'scheduled'
        ? this.schedule.date && this.schedule.time
        : true

      return time &&
        !isEmpty(this.campaign) &&
        !isEmpty(this.throttle) &&
        !this.scheduleIsPast
    },

    companyTimezone () {
      return window.moment().tz(this.currentCompany.timezone).format('z')
    },

    companyDate () {
      return window.moment(this.utcDate).tz(this.currentCompany.timezone)
    },

    utcDate () {
      return window.moment().tz('UTC')
    },

    sendTimeLabel () {
      return 'Send ' + (this.time === 'now'
        ? `today at ` + this.companyDate.format('hh:mm a')
        : 'message at ' + window.moment(this.schedule.date + ' ' + this.schedule.time).format('MM/DD/YYYY hh:mm a'))
    },

    scheduleIsPast () {
      if (this.time === 'now') {
        return false
      }

      const scheduledDate = this.schedule.date + ' ' + this.schedule.time

      return window.moment(scheduledDate).isBefore(this.companyDate)
    },

    isInsideRestrictedTime () {
      if (!this.currentCompany.broadcast_open || !this.currentCompany.broadcast_close) {
        return false
      }

      const time = this.time === 'now'
        ? this.companyDate.format('HH:mm:ss')
        : (this.schedule.time + ':00')

      return time >= this.currentCompany.broadcast_open && time <= this.currentCompany.broadcast_close
    }
  },

  data: () => ({
    time: 'now',
    schedule: {
      date: null,
      time: null
    },
    campaign: {},
    throttle: null
  }),

  created () {
    this.campaign = this.propCampaign || {}
    this.throttle = this.propThrottle

    if (this.propTime) {
      this.time = this.propTime.time
    }

    if (this.propTime?.schedule) {
      this.schedule = this.propTime.schedule
    }
  },

  methods: {
    onDateSelected (date) {
      this.schedule.date = date.substr(0, 10)
    },

    onTimeSelected (time) {
      this.schedule.time = time.value
    },

    onCampaignSelected (campaign) {
      this.campaign = campaign

      this.$emit('campaign', this.campaign)
    },

    emitValues () {
      this.$emit('time', {
        time: this.time,
        schedule: this.schedule
      })

      const date = this.time === 'now'
        ? this.companyDate.format('YYYY-MM-DD HH:mm')
        : `${this.schedule.date} ${this.schedule.time}`

      this.$emit('date-changed', date)
    }
  },

  watch: {
    isValid: {
      immediate: true,
      handler (state) {
        this.$emit('input', state)
      }
    },

    time: {
      immediate: true,
      handler () {
        this.emitValues()
      }
    },

    schedule: {
      deep: true,
      handler () {
        this.emitValues()
      }
    },

    isInsideRestrictedTime: {
      immediate: true,
      handler (state) {
        this.$emit('restricted-time', !state)
      }
    },

    throttle (value) {
      this.$emit('throttle', value)
    }
  }
}
</script>
