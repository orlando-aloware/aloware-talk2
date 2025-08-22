<template>
  <div>
    <b-form class="appointment-form"
            @submit.prevent="onSubmit"
            @reset="onReset">
      <b-form-row>
        <b-col>
          <b-form-group
            id="input-group-1"
            label="Select date and time"
            label-for="input-1"
            description=""
          >
            <vue-ctk-date-time-picker formatted="lll"
                                      label="Select date"
                                      :inline="false"
                                      :no-label="true"
                                      :no-header="true"
                                      :format="`YYYY-MM-DD HH:mm`"
                                      :no-button-now="true"
                                      :auto-close="true"
                                      :minute-interval="5"
                                      :disabled-hours="['00','01','02','03','04', '05']"
                                      v-model="appointment.date">
            </vue-ctk-date-time-picker>
          </b-form-group>

          <b-form-group id="input-group-2" label="Duration" label-for="input-2">
            <predefined-time-duration-selector @select="durationSelected"></predefined-time-duration-selector>
          </b-form-group>

          <b-form-group id="input-group-2" label="Timezone" label-for="input-2">
            <timezone-selector @select="timezoneSelected"></timezone-selector>
          </b-form-group>

          <b-form-group id="input-group-2" label="Note" label-for="input-2">
            <b-form-textarea
              class="textarea-no-auto-shrink"
              placeholder="Write a note for this event.."
              rows="3"
              max-rows="8"
              no-auto-shrink
              v-model="appointment.note"
            ></b-form-textarea>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-3">
        <b-col cols="12">
          <h6 class="form-title">SMS Reminder</h6>
        </b-col>
        <b-col cols="12">
          <b-form-group id="input-group-2" label="" class="checkbox-wrapper">
            <b-form-checkbox
              v-model="appointment.smsReminder.enabled"
              :value="true"
              :unchecked-value="false">
              Enable SMS reminder
            </b-form-checkbox>
          </b-form-group>
        </b-col>
        <b-col v-show="appointment.smsReminder.enabled" cols="12">
          <b-form-group id="input-group-2" label="Send From" label-for="input-2">
            <contact-line-selector @select="lineSelected"></contact-line-selector>
          </b-form-group>

          <b-form-group id="input-group-2" label="Time" label-for="input-2">
            <predefined-time-selector @select="smsReminderTimeSelected"></predefined-time-selector>
          </b-form-group>

          <b-form-group id="input-group-2" label="Send (n) days before" label-for="input-2">
            <number-of-days-selector @select="smsReminderFrequencySelected"></number-of-days-selector>
          </b-form-group>

          <b-form-group id="input-group-2" label="Template Variables" label-for="input-2">
            <div class="mb-1">
              <span class="text-danger sms-reminder-template-variables"
                    v-for="item in appointment.smsReminder.template_variables"
                    :key="item"
                    @click="appendSmsReminderTemplateVariable(item)">
                {{ item }}
            </span>
            </div>
            <b-form-textarea
              class="textarea-no-auto-shrink"
              placeholder=""
              rows="3"
              max-rows="8"
              no-auto-shrink
              v-model="appointment.smsReminder.body"
            ></b-form-textarea>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <b-button
      variant="success"
      class="custom-btn"
      size="sm"
      @click="onHidden"
    >
      Close
    </b-button>
    <b-button
      variant="primary"
      class="custom-btn"
      size="sm"
      @click="onSubmit"
    >
      Add Event
    </b-button>
  </div>
</template>

<script>
import ContactLineSelector from 'components/contact-line-selector'
import NumberOfDaysSelector from 'components/number-of-days-selector'
import PredefinedTimeDurationSelector from 'components/predefined-time-duration-selector'
import PredefinedTimeSelector from 'components/predefined-time-selector'
import TimezoneSelector from 'components/timezone-selector'
import talk2Api from 'src/plugins/api/api'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
import { mapState } from 'vuex'

export default {
  name: 'appointment-form',
  props: {
    id: {
      type: Number,
      required: false
    },
    contact: {
      type: Object,
      required: true
    }
  },
  components: {
    NumberOfDaysSelector,
    PredefinedTimeSelector,
    ContactLineSelector,
    TimezoneSelector,
    PredefinedTimeDurationSelector,
    VueCtkDateTimePicker
  },
  data () {
    return {
      isSaving: false,
      appointment: {
        date: '',
        time: '',
        duration: '',
        timezone: '',
        body: '',
        type: 12,
        smsReminder: {
          enabled: true,
          body: '',
          campaign_id: '',
          frequencies: [],
          time: '',
          template_variables: ['[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]']
        },
        contact: null,
        user: null
      }
    }
  },
  computed: {
    ...mapState('auth', ['profile'])
  },
  methods: {
    onSubmit () {
      this.isSaving = true
      talk2Api.V1.contact[this.id ? 'updateEngagement' : 'addEngagement'](this.contact.id, this.getParams())
        .then(response => {
          this.$generalNotification(`Event has been ${(this.id ? 'updated' : 'added')}.`)
        }).catch(error => {
          console.log(error)
          this.$generalNotification(`Error while ${(this.id ? 'updating' : 'adding')} event`, 'error')
        }).finally(() => {
          this.isSaving = false
        })
    },
    getParams () {
      const params = {
        date: this.appointment.date,
        time: this.appointment.time,
        duration: this.appointment.duration,
        timezone: this.appointment.timezone,
        body: this.appointment.body,
        type: this.appointment.type,
        contact: this.contact,
        user: this.profile
      }

      if (this.appointment.smsReminder.enabled) {
        params.sms_reminder = {
          enabled: this.appointment.smsReminder.enabled,
          body: this.appointment.smsReminder.body,
          campaign_id: this.appointment.smsReminder.campaign_id,
          frequencies: this.appointment.smsReminder.frequencies,
          time: this.appointment.smsReminder.time,
          template_variables: this.appointment.smsReminder.template_variables
        }
      }

      return params
    },
    onReset () {
    },
    durationSelected (duration) {
      this.appointment.duration = duration.value
    },
    timezoneSelected (timezone) {
      this.appointment.timezone = timezone.value
    },
    lineSelected (line) {
      this.appointment.smsReminder.campaign_id = line.id
    },
    smsReminderTimeSelected (time) {
      this.appointment.smsReminder.time = time.value
    },
    smsReminderFrequencySelected (frequencies) {
      this.appointment.smsReminder.frequencies = frequencies
    },
    appendSmsReminderTemplateVariable (variable) {
      this.appointment.smsReminder.body = `${(this.appointment.smsReminder.body ?? '')} ${variable}`
    }
  }
}
</script>
