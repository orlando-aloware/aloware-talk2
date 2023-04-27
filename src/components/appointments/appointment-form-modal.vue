<template>
  <b-modal title="Add Appointment"
           id="appointment-modal"
           size="md"
           v-model="isOpen"
           scrollable
           @hidden="onHidden">

    <b-form class="appointment-form"
            ref="appointmentForm"
            @submit.prevent="onSubmit"
            @reset="resetForm">
      <b-form-row>
        <b-col sm="12">
          <b-form-group id="input-group-1"
                        label="Select date"
                        label-for="input-1"
                        description="">
            <date-selector :min-date="minDate"
                           :no-clear-button="true"
                           v-model="appointment.date"
                           @dateSelected="dateSelected">
            </date-selector>
          </b-form-group>
        </b-col>
        <b-col md="12" lg="6">
          <b-form-group id="input-group-2"
                        label="Time"
                        label-for="input-2">
            <predefined-time-selector v-model="appointment.time"
                                      @select="timeSelected">
            </predefined-time-selector>
          </b-form-group>
        </b-col>
        <b-col md="12" lg="6">
          <b-form-group id="input-group-2"
                        label="Duration"
                        label-for="input-2">
            <predefined-time-duration-selector @select="durationSelected">
            </predefined-time-duration-selector>
          </b-form-group>
        </b-col>
        <b-col>

          <b-form-group id="input-group-2"
                        label="Timezone"
                        label-for="input-2">
            <timezone-selector @select="timezoneSelected"></timezone-selector>
          </b-form-group>

          <b-form-group id="input-group-2"
                        label="Note"
                        label-for="input-2">
            <b-form-textarea class="textarea-no-auto-shrink"
                             placeholder="Write a note for this event.."
                             rows="3"
                             max-rows="8"
                             no-auto-shrink
                             v-model="appointment.body"/>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-3">
        <b-col cols="12">
          <h6 class="form-title">SMS Reminder</h6>
        </b-col>
        <b-col cols="12">
          <b-form-group id="input-group-2"
                        label=""
                        class="checkbox-wrapper">
            <b-form-checkbox :value="true"
                             :unchecked-value="false"
                             v-model="appointment.smsReminder.enabled">
              <span class="sms-reminder-label">Enable SMS reminder</span>
            </b-form-checkbox>
          </b-form-group>
        </b-col>
        <b-col cols="12"
               v-show="appointment.smsReminder.enabled">
          <b-form-group id="input-group-2"
                        label="Send From"
                        label-for="input-2">
            <contact-line-selector :showPaused="false"
                                   @select="lineSelected">
            </contact-line-selector>
          </b-form-group>

          <b-form-group id="input-group-2"
                        label="Time"
                        label-for="input-2">
            <predefined-time-selector @select="smsReminderTimeSelected"/>
          </b-form-group>

          <b-form-group id="input-group-2"
                        label="Send (n) days before"
                        label-for="input-2">
            <number-of-days-selector @select="smsReminderFrequencySelected"/>
          </b-form-group>

          <b-form-group id="input-group-2"
                        label="Template Variables"
                        label-for="input-2">
            <div class="mb-1">
              <span class="text-danger sms-reminder-template-variables"
                    :key="item"
                    v-for="item in appointment.smsReminder.template_variables"
                    @click="appendSmsReminderTemplateVariable(item)">
                {{ item }}
            </span>
            </div>
            <b-form-textarea class="textarea-no-auto-shrink"
                             placeholder=""
                             rows="3"
                             max-rows="8"
                             no-auto-shrink
                             v-model="appointment.smsReminder.body"/>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <template slot="modal-footer">
      <b-button variant="success"
                class="custom-btn"
                size="sm"
                @click="onHidden">
        Close
      </b-button>
      <b-button variant="primary"
                class="custom-btn"
                size="sm"
                :disabled="isSaving || !isValid"
                @click="onSubmit">
        <q-spinner-bars color="white"
                        v-if="isSaving"/>
        {{ isSaving ? 'Adding Event...' : 'Add Event' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import PredefinedTimeDurationSelector from 'components/predefined-time-duration-selector'
import TimezoneSelector from 'components/timezone-selector'
import ContactLineSelector from 'components/contact-line-selector'
import PredefinedTimeSelector from 'components/predefined-time-selector'
import NumberOfDaysSelector from 'components/number-of-days-selector'
import talk2Api from 'src/plugins/api/api'
import DateSelector from 'components/date-selector'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

export default {
  name: 'appointment-form-modal',
  components: {
    DateSelector,
    NumberOfDaysSelector,
    PredefinedTimeSelector,
    ContactLineSelector,
    TimezoneSelector,
    PredefinedTimeDurationSelector
  },
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
  computed: {
    ...mapState('contacts', ['isAddAppointmentOpen']),
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),
    isValid () {
      return this.appointment.date &&
        this.appointment.date !== 'Invalid date' &&
        this.appointment.time &&
        this.appointment.timezone &&
        this.contact
    },
    minDate () {
      return window.moment().format('YYYY-MM-DD')
    },
    isOpen: {
      get () {
        return this.isAddAppointmentOpen
      },
      set (isOpen) {
        return isOpen
      }
    }
  },
  data () {
    return {
      isSaving: false,
      appointment: {
        date: window.moment().format('MM/DD/YYYY'),
        time: '',
        duration: '',
        timezone: '',
        body: '',
        type: 12,
        smsReminder: {
          enabled: false,
          body: '',
          campaign_id: '',
          frequencies: [],
          time: '',
          template_variables: ['[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]']
        },
        contact: null,
        user: null
      },
      rules: {
        type: [
          {
            required: true,
            message: 'Please select a type for this event',
            trigger: 'change'
          }
        ],
        date: [
          {
            required: true,
            message: 'Please select a date for this event',
            trigger: 'change'
          }
        ],
        time: [
          {
            required: true,
            message: 'Please select a time for this event',
            trigger: 'change'
          }
        ],
        contact: [
          {
            validator: '' // this.contactValidator
          }
        ]
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['addAppointmentOpen']),
    onHidden () {
      this.addAppointmentOpen(false)
      this.appointment.smsReminder.enabled = false
      this.setSmsReminderBody()
      this.resetForm()
    },
    onSubmit () {
      this.isSaving = true
      talk2Api.V1.contact[(this.id ? 'updateEngagement' : 'addEngagement')](this.contact.id, this.getParams())
        .then(() => {
          this.$generalNotification(`Event has been ${(this.id ? 'updated.' : 'added.')}`)
          this.onHidden()
        }).catch(error => {
          console.log(error)
          this.$generalNotification(`Error while ${(this.id ? 'adding' : 'updating')} event.`, 'error')
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
        user: this.profile,
        called_from: 'contact',
        // TODO change when updating an appointment
        status: CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW,
        user_timezone: window.timezone
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
    resetForm () {
      this.appointment = {
        date: window.moment().format('MM/DD/YYYY'),
        time: '',
        duration: '',
        timezone: '',
        body: '',
        type: 12,
        smsReminder: {
          enabled: false,
          body: '',
          campaign_id: '',
          frequencies: [],
          time: '',
          template_variables: ['[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]']
        },
        contact: null,
        user: null
      }
      this.setSmsReminderBody()
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
    timeSelected (time) {
      this.appointment.time = time.value
    },
    dateSelected (value) {
      this.appointment.date = window.moment(value).format('MM/DD/YYYY')
      // Enable this once the datetimepicker bug is resolved
      // this.appointment.time = window.moment(value).format('hh:mm')
    },
    smsReminderTimeSelected (time) {
      this.appointment.smsReminder.time = time.value
    },
    smsReminderFrequencySelected (frequencies) {
      this.appointment.smsReminder.frequencies = frequencies
    },
    appendSmsReminderTemplateVariable (variable) {
      this.appointment.smsReminder.body = `${(this.appointment.smsReminder.body ?? '')} ${variable}`
    },
    setSmsReminderBody () {
      this.appointment.smsReminder.body = this.currentCompany ? this.currentCompany.sms_reminder_default_text : ''
    }
  },
  watch: {
    'isAddAppointmentOpen': function (value) {
      this.isOpen = value
    }
  },
  mounted () {
    this.setSmsReminderBody()
  }
}
</script>
