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

export default {
  name: 'broadcast-add-view-schedule',

  components: {
    BroadcastTimeRestrictionAlert,
    ContactLineSelector,
    DateSelector,
    PredefinedTimeSelector,
    ThrottleSelector
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    isValid () {
      const time = this.time === 'scheduled'
        ? this.schedule.date && this.schedule.time
        : true

      return time && this.campaign.id && this.throttle
    },

    companyTimezone () {
      return window.moment().tz(this.currentCompany.timezone).format('z')
    },

    sendTimeLabel () {
      return 'Send ' + (this.time === 'now'
        ? `today at ` + window.moment().format('hh:mm a')
        : 'message at ' + window.moment(this.schedule.date + ' ' + this.schedule.time).format('MM/DD/YYYY hh:mm a'))
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
      handler (time) {
        // reset / set default schedule
        this.schedule.date = time === 'now' ? null : window.moment().format('MM-DD-YYYY')
        this.schedule.time = time === 'now' ? null : '06:00'

        this.$emit('time', {
          time: time,
          schedule: this.schedule
        })
      }
    },

    schedule: {
      immediate: true,
      deep: true,
      handler () {
        this.$emit('time', {
          time: this.time,
          schedule: this.schedule
        })
      }
    },

    throttle (value) {
      this.$emit('throttle', value)
    }
  }
}
</script>
