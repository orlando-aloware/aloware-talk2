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
                  <date-selector v-model="schedule.date"/>
                </div>
              </div>
              <div class="time-schedule__row">
                <div class="time-schedule__row__label">
                  Time
                </div>
                <div class="time-schedule__row__field">
                  <date-selector only-time
                                 format="hh:mm a"
                                 formatted="hh:mm a"
                                 :date-only="false"
                                 :no-header="false"
                                 v-model="schedule.time"/>
                </div>
              </div>
            </div>
          </b-form-radio>
        </b-form-group>
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        From
      </div>
      <div class="broadcast-add__schedule__row__fields">
        From fields
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Throttling
      </div>
      <div class="broadcast-add__schedule__row__fields">
        throttling fields
      </div>
    </div>
  </div>
</template>

<script>
import BroadcastTimeRestrictionAlert from 'src/components/broadcasts/broadcast-time-restriction-alert'
import DateSelector from 'src/components/date-selector.vue'

export default {
  name: 'broadcast-add-view-schedule',

  components: {
    BroadcastTimeRestrictionAlert,
    DateSelector
  },

  computed: {
    isValid () {
      return false
    }
  },

  data: () => ({
    time: 'now',
    schedule: {
      date: null,
      time: null
    }
  }),

  watch: {
    isValid (state) {
      this.$emit('input', state)
    }
  }
}
</script>
