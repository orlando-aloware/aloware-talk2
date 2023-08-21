<template>
  <b-modal id="calendar-manager-modal"
           size="lg"
           body-class="p-0"
           no-close-on-esc
           no-close-on-backdrop
           :scrollable="!loading"
           :hide-footer="loading"
           :visible="showManager"
           @cancel="closeFiltersMenu"
           @close="closeFiltersMenu">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <template #modal-title>
      <h6>
        <i :class="['fa fa-circle mr-2', headerCircleClass]"
           v-if="mode === 'edit'">
        </i>
        {{ title }}
      </h6>
    </template>
    <b-form class="p-3"
            ref="scheduleForm">
      <b-row v-if="calledFrom !== 'contact'">
        <b-col>
          <b-form-group class="form-label"
                        label="Event Type"
                        invalid-feedback="Please select a type for this event"
                        :state="validateState('type')">
            <communication-type-selector :from="calledFrom"
                                         :disabled="mode === 'edit'"
                                         v-model="$v.schedule.type.$model">
            </communication-type-selector>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="mode === 'add'">
        <b-col>
          <b-form-group class="form-label"
                        label="Contact"
                        invalid-feedback="A contact is required"
                        :state="validateState('contact')">
            <q-tooltip anchor="top middle">
              Type at least 3 characters to search in contacts
            </q-tooltip>
            <contact-selector v-model="$v.schedule.contact.$model.id"
                              @change="onContactChange"/>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-else>
        <b-col>
          <b-form-group class="form-label"
                        label="User"
                        v-if="mode === 'edit'">
            <user-selector :disable="true"
                           v-model="schedule.user.id">
            </user-selector>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group class="form-label"
                        label="Contact"
                        invalid-feedback="A contact is required"
                        :state="validateState('contact')"
                        v-if="mode === 'edit' && schedule.contact">
            <contact-selector disabled
                              redirect-when-disabled
                              :contact-data="schedule.contact"
                              v-model="$v.schedule.contact.$model.id"
                              @loaded="onContactsLoaded">
            </contact-selector>
          </b-form-group>
          <b-form-group class="form-label"
                        label="Contact"
                        v-if="mode === 'edit' && !schedule.contact">
            <div class="card py-2 px-3"
                 style="line-height: 1.35">
              <div class="media-body">
                <strong class="mb-0 d-block">
                  {{ schedule.text }}
                </strong>
                <span>&nbsp;</span>
              </div>
            </div>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="schedule.type > 0 && schedule.contact && schedule.contact.id">
        <b-col md="12"
               :lg="isAppointment ? 4 : 6">
          <b-form-group class="form-label"
                        label="Date"
                        invalid-feedback="Please select a date for this event"
                        :state="validateState('date')">
            <date-selector :min-date="minDate"
                           v-model="$v.schedule.date.$model"
                           v-if="mode !== 'edit' || !schedule.is_past"
                           @dateSelected="dateSelected">
            </date-selector>
            <b-form-input disabled
                          v-model="$v.schedule.date.$model"
                          v-else>
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="12"
               :lg="isAppointment ? 4 : 6">
          <b-form-group class="form-label"
                        label="Start Time"
                        invalid-feedback="Please select a time for this event"
                        :state="validateState('time')">
            <predefined-time-selector v-model="$v.schedule.time.$model"
                                      v-if="mode !== 'edit' || !schedule.is_past"
                                      @select="timeSelected">
            </predefined-time-selector>
            <b-form-input disabled
                          v-model="schedule.time"
                          v-else>
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col md="12"
               :lg="isAppointment ? 4 : 6"
               v-if="isAppointment">
          <b-form-group class="form-label"
                        label="Duration (minutes)">
            <predefined-time-duration-selector v-model="schedule.duration"
                                               v-if="mode !== 'edit' || !schedule.is_past"
                                               @select="durationSelected">
            </predefined-time-duration-selector>
            <b-form-input disabled
                          v-model="schedule.duration"
                          v-else>
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-form-group class="form-label"
                        label="Timezone"
                        invalid-feedback="Please select a timezone for this event"
                        :state="validateState('timezone')">
            <timezone-selector v-model="$v.schedule.timezone.$model"
                               @select="timezoneSelected">
            </timezone-selector>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-form-group class="form-label"
                        label="Note">
            <b-form-textarea max-rows="4"
                             placeholder="Write a note for this event..."
                             v-model="schedule.body">
            </b-form-textarea>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="isAppointment && !schedule.is_past">
        <b-col>
          <h6 class="form-title">SMS Reminder</h6>
        </b-col>
        <b-col cols="12">
          <b-form-group class="checkbox-wrapper">
            <b-form-checkbox :value="true"
                             :unchecked-value="false"
                             v-model="sms_reminder_fields.enabled">
              <span class="sms-reminder-label">Enable SMS reminder</span>
            </b-form-checkbox>
          </b-form-group>
        </b-col>
        <b-col cols="12"
               v-show="sms_reminder_fields.enabled">
          <b-form-group label="Send From"
                        invalid-feedback="Please select a line for the SMS reminder"
                        :state="validateState('campaign_id', 'sms_reminder_fields')">
            <contact-line-selector :show-paused="false"
                                   :use-groups="false"
                                   preselect-first
                                   v-model="$v.sms_reminder_fields.campaign_id.$model"
                                   @select="lineSelected">
            </contact-line-selector>
          </b-form-group>

          <b-form-group label="Time">
            <predefined-time-selector v-model="sms_reminder_fields.time"
                                      @select="smsReminderTimeSelected">
            </predefined-time-selector>
          </b-form-group>

          <b-form-group label="Send (n) days before">
            <number-of-days-selector v-model="sms_reminder_fields.frequencies"
                                     @select="smsReminderFrequencySelected">
            </number-of-days-selector>
          </b-form-group>

          <b-form-group label="Template Variables"
                        invalid-feedback="Please write a text for the SMS reminder"
                        :state="validateState('body', 'sms_reminder_fields')">
            <div class="mb-1">
              <span class="text-danger sms-reminder-template-variables"
                    :key="item"
                    v-for="item in sms_reminder_fields.template_variables"
                    @click="appendSmsReminderTemplateVariable(item)">
                {{ item }}
              </span>
            </div>
            <b-form-textarea class="textarea-no-auto-shrink"
                             placeholder="Write a text"
                             rows="3"
                             max-rows="8"
                             no-auto-shrink
                             v-model="$v.sms_reminder_fields.body.$model">
            </b-form-textarea>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="mode === 'edit'">
        <b-col cols="12"
               lg="4">
          <b-form-group label="Status">
            <div class="text-center pb-1 b-b">
              <q-btn-toggle class="border w-100"
                            no-caps
                            dense
                            unelevated
                            toggle-color="primary"
                            color="white"
                            text-color="primary"
                            :options="appointmentOptions"
                            :disabled="!isEditable"
                            v-model="schedule.status"
                            v-if="isAppointment"/>
              <q-btn-toggle class="border w-100"
                            no-caps
                            dense
                            unelevated
                            toggle-color="primary"
                            color="white"
                            text-color="primary"
                            :options="reminderOptions"
                            :disabled="!isEditable"
                            v-model="schedule.status"
                            v-else/>
            </div>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <button class="btn btn-sm bg-danger text-white"
                v-if="isDeletable"
                @click="deleteSchedule(schedule.id)">
          Remove
        </button>
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    @click.prevent="closeFiltersMenu">
              Cancel
            </button>
            <button class="btn btn-sm bg-primary text-white"
                    @click.prevent="saveSchedule">
              Save Event
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import _ from 'lodash'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { aclMixin, dateMixin } from 'src/plugins/mixins'
import { mapGetters } from 'vuex'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CommunicationTypes from '../../constants/communication-types'
import CommunicationTypeSelector from '../generic-selectors/communication-type-selector'
import ContactLineSelector from 'components/contact-line-selector'
import ContactSelector from 'components/generic-selectors/contact-selector'
import DateSelector from 'components/date-selector'
import NumberOfDaysSelector from 'components/number-of-days-selector'
import PredefinedTimeDurationSelector from 'components/predefined-time-duration-selector'
import PredefinedTimeSelector from 'components/predefined-time-selector'
import TimezoneSelector from 'components/timezone-selector'
import UserSelector from 'components/generic-selectors/user-selector'
import moment from 'moment'
require('vue-multiselect/dist/vue-multiselect.min.css')

export default {
  name: 'calendar-event-manager',

  mixins: [
    aclMixin,
    dateMixin
  ],

  components: {
    CommunicationTypeSelector,
    ContactLineSelector,
    ContactSelector,
    DateSelector,
    NumberOfDaysSelector,
    PredefinedTimeDurationSelector,
    PredefinedTimeSelector,
    TimezoneSelector,
    UserSelector
  },

  props: {
    calledFrom: {
      type: String,
      required: false,
      default: 'calendar' // calendar, contact
    }
  },

  validations: {
    schedule: {
      type: {
        required
      },
      time: {
        required
      },
      contact: {
        required
      },
      date: {
        required,
        minValue (val) {
          // date regex and higher than today
          const regex = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(val)

          // if in edit mode, skip higher than today check
          return this.mode === 'edit'
            ? regex
            : regex && this.isFuture(val)
        }
      },
      timezone: {
        required
      }
    },
    sms_reminder_fields: {
      campaign_id: {
        required: requiredIf(function (model) {
          return model.enabled && this.isAppointment && this.mode === 'add'
        })
      },
      body: {
        required: requiredIf(function (model) {
          return model.enabled && this.isAppointment && this.mode === 'add'
        })
      }
    }
  },

  data () {
    return {
      showManager: false,
      loading: false,
      mode: 'add',
      date: new Date(),
      // not defined as camelCase because its used directly in API
      schedule: {
        contact: {},
        user: this.user,
        calendar_response: 1,
        disposition_status2: null,
        is_past: true,
        text: '',
        timezone: this.profile?.timezone,
        date: moment().format('MM/DD/YYYY'),
        time: '06:00',
        type: null
      },
      originalSchedule: {},
      // not defined as camelCase because its used directly in API
      sms_reminder_fields: {
        enabled: true,
        template_variables: [
          '[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]'
        ],
        body: '',
        campaign_id: null,
        frequencies: ['1'],
        time: '10:00'
      },
      title: 'Add Event',
      confirmDialogParams: {
        okTitle: 'Ok',
        cancelTitle: 'Cancel',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'primary',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: true
      },
      CommunicationDispositionStatus,
      CommunicationTypes
    }
  },

  computed: {
    ...mapGetters('auth', ['profile', 'user']),

    appointmentOptions () {
      return [
        {
          label: 'Set',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET
        },
        {
          label: 'Attended',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED
        },
        {
          label: 'Cancelled',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED
        }
      ]
    },

    reminderOptions () {
      return [
        {
          label: 'Pending',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW
        },
        {
          label: 'Completed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW
        },
        {
          label: 'Cancelled',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW
        }
      ]
    },

    isEditable () {
      if (this.mode === 'edit') {
        if (this.hasRole('Company Admin')) {
          return true
        }

        return this.schedule.user.id === this.profile.id
      }

      return this.mode === 'add'
    },

    isDeletable () {
      if (this.mode === 'edit') {
        if (this.hasRole('Company Admin')) {
          return true
        }

        return this.schedule.user.id === this.profile.id
      }

      return false
    },

    minDate () {
      return moment().format('YYYY-MM-DD')
    },

    isAppointment () {
      return this.schedule.type === CommunicationTypes.APPOINTMENT
    },

    headerCircleClass () {
      return 'event-color-type-' + this.schedule.type + ' status-' + this.schedule.status + ' ' + (this.schedule.is_past ? 'is_past' : '')
    }
  },

  mounted () {
    // Preset sms reminder text
    this.setDefaultSmsReminderFields()

    this.sms_reminder_fields.enabled = this.profile.company.sms_reminder_enabled
  },

  methods: {
    validateState (input, prop = 'schedule') {
      const { $dirty, $error } = this.$v[prop][input]
      return $dirty ? !$error : null
    },

    isFuture (date) {
      return moment(date).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')
    },

    editSchedule (sched) {
      this.loading = true
      let date = moment(sched.start_date)

      this.originalSchedule = {
        id: sched.id,
        type: sched.type,
        date: date.format('MM/DD/YYYY'),
        time: date.format('HH:mm'),
        duration: sched.duration,
        contact: sched.contact,
        user: sched.user,
        body: sched.body,
        status: sched.status,
        date_time: 1,
        is_past: sched.is_past,
        status_name: sched.status_name,
        text: sched.text,
        timezone: sched.contact_timezone || null
      }
      this.schedule = _.clone(this.originalSchedule)

      this.resetSmsReminder()

      if (sched.sms_reminders) {
        this.setSmsReminderFields(sched.sms_reminders)
      } else {
        this.sms_reminder_fields.enabled = false
      }

      this.showManager = true
      this.title = sched.status_name + ' - Edit Event'
      this.mode = 'edit'
    },

    addSchedule (date) {
      let d = moment(date)

      // Presets
      this.startDate = d
      let contact = {}
      let type = null
      let timezone = null

      if (this.calledFrom === 'contact') {
        contact = this.schedule.contact
        type = CommunicationTypes.APPOINTMENT
        timezone = this.schedule.contact.timezone
      }

      this.originalSchedule = {
        id: null,
        type: type,
        date: d.format('MM/DD/YYYY'),
        time: '06:00',
        duration: 15,
        contact: contact,
        user: this.user.profile,
        status: CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW,
        body: '',
        date_time: 1,
        timezone: timezone
      }

      this.schedule = _.clone(this.originalSchedule)

      this.mode = 'add'
      this.title = 'Add Event'
      this.showManager = true

      if (this.calledFrom === 'contact') {
        this.title = 'Add Appointment'
      }
    },

    deleteSchedule (scheduleId) {
      this.$bvModal.msgBoxConfirm('Are you sure you want to delete this event?', {
        ...this.confirmDialogParams,
        title: 'Confirmation',
        okTitle: 'Yes, Remove',
        cancelTitle: 'No, Keep'
      })
        .then(value => {
          if (value) {
            this.loading = true

            this.$axios.delete(`/api/v1/calendar/events/contact/${this.schedule.contact.id}/${scheduleId}`).then(r => {
              this.$emit('render-schedule', {
                data: r.data.data,
                action: 'delete'
              })
              this.loading = false
              this.showManager = false

              this.$generalNotification('Event removed.')
            }).catch(err => {
              this.loading = false
              this.showManager = false
              console.log(err)
            })
          }
        })
    },

    saveSchedule () {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      const contactId = this.schedule.contact.id
      const eventId = this.schedule.id

      if (this.mode === 'add') {
        if (contactId !== null && this.schedule.type !== null) {
          this.loading = true

          // If event type is APPOINTMENT and sms reminder option is enabled
          // - include sms reminder option
          if (this.isAppointment && this.sms_reminder_fields.enabled) {
            this.schedule.sms_reminder = this.sms_reminder_fields
          }

          let postData = _.cloneDeep(this.schedule)
          postData.called_from = this.calledFrom
          postData.user_timezone = window.timezone

          this.$axios.post(`/api/v1/calendar/events/contact/${contactId}/create`, postData).then(res => {
            this.loading = false

            this.$emit('render-schedule', {
              data: res.data,
              action: 'add'
            })
            this.showManager = false

            this.resetForm()

            this.$generalNotification('Event added.')
          }).catch(err => {
            this.loading = false
            this.$handleErrors(err.response)
          })
        }
      } else {
        if (contactId != null && eventId != null) {
          this.loading = true

          if (this.isAppointment && this.sms_reminder_fields.enabled) {
            this.schedule.sms_reminder = this.sms_reminder_fields
          }

          let postData = _.cloneDeep(this.schedule)
          postData.called_from = this.calledFrom
          postData.user_timezone = window.timezone
          postData.entity_type = 'event' // it means entity id for events table

          this.$axios.post(`/api/v1/calendar/events/contact/${contactId}/update/${eventId}`, postData).then(res => {
            this.loading = false

            this.$emit('render-schedule', {
              data: res.data,
              action: 'update'
            })
            this.showManager = false

            this.resetForm()

            this.$generalNotification('Event updated.')
          }).catch(err => {
            this.loading = false
            this.$handleErrors(err.response)
          })
        }
      }
    },

    resetForm () {
      this.$v.$reset()

      if (this.calledFrom === 'contact') {
        this.schedule.user = this.user.profile
        this.schedule.calendar_response = 1
      } else if (this.calledFrom === 'calendar') {
        this.schedule = {
          contact: {},
          user: this.user.profile,
          calendar_response: 1
        }
      }

      this.resetSmsReminder()
    },

    closeFiltersMenu (bvModalEvent) {
      if (_.isEqual(this.schedule, this.originalSchedule)) {
        this.resetForm()
        this.showManager = false
      } else {
        // prevent closing
        bvModalEvent.preventDefault()

        this.$bvModal.msgBoxConfirm('Are you sure you want to close this form?', {
          ...this.confirmDialogParams,
          title: 'Confirmation',
          okTitle: 'Yes, I\'m sure',
          cancelTitle: 'No, I\'m not'
        })
          .then(value => {
            if (value) {
              this.resetForm()

              this.$nextTick(() => {
                this.showManager = false
                this.$bvModal.hide('calendar-manager-modal')
              })
            }
          })
      }
    },

    updateSmsReminderVariables () {
      if (this.schedule.time) {
        this.sms_reminder_fields.time = this.schedule.time
      }

      // Set default time to 09:00 if reseller is SimpSocial
      if (this.profile.company.reseller_id === 357) {
        this.sms_reminder_fields.time = '09:00'
      }

      this.setDefaultSmsReminderFields()
    },

    setDefaultSmsReminderFields () {
      this.sms_reminder_fields.body = this.profile.company.sms_reminder_default_text || ''

      // use personal line or default campaign_id
      this.sms_reminder_fields.campaign_id = !this.profile.company.sms_reminder_use_personal_line
        ? this.profile.company.sms_reminder_default_campaign_id
        : this.profile.campaign_id

      // update time if its set in account config
      if (this.profile.company.sms_reminder_default_time) {
        this.sms_reminder_fields.time = this.profile.company.sms_reminder_default_time
      }

      // update frequency if its set in account config
      if (this.profile.company.sms_reminder_default_send_before_days) {
        this.sms_reminder_fields.frequencies = this.profile.company.sms_reminder_default_send_before_days.split(',').map(v => +v)
      }
    },

    setSmsReminderFields (smsReminder) {
      this.sms_reminder_fields = {
        ...this.sms_reminder_fields,
        enabled: true,
        body: smsReminder.body,
        campaign_id: smsReminder.campaign_id,
        frequencies: smsReminder.frequencies.map(frequency => +frequency),
        time: smsReminder.time
      }
    },

    addTemplateVariableToBody (variable) {
      let body = this.sms_reminder_fields.body ?? ''
      this.sms_reminder_fields.body = body + ' ' + variable
    },

    updateSmsReminderLine (line) {
      this.sms_reminder_fields.campaign_id = line
    },

    resetSmsReminder () {
      this.sms_reminder_fields = {
        enabled: true,
        template_variables: [
          '[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]'
        ],
        body: '',
        campaign_id: null,
        frequencies: ['1'],
        time: '10:00'
      }

      this.setDefaultSmsReminderFields()
    },

    dateSelected (value) {
      this.schedule.date = value ? moment(value).format('MM/DD/YYYY') : null
    },

    timeSelected (time) {
      this.schedule.time = time.value
    },

    timezoneSelected (timezone) {
      this.schedule.timezone = timezone.value
    },

    durationSelected (duration) {
      this.schedule.duration = duration.value
    },

    lineSelected (line) {
      this.sms_reminder_fields.campaign_id = line.id
    },

    smsReminderTimeSelected (time) {
      this.sms_reminder_fields.time = time.value
    },

    smsReminderFrequencySelected (frequencies) {
      this.sms_reminder_fields.frequencies = frequencies
    },

    appendSmsReminderTemplateVariable (variable) {
      this.sms_reminder_fields.body = `${(this.sms_reminder_fields.body ?? '')} ${variable}`
    },

    onContactsLoaded () {
      this.loading = false
    },

    onContactChange (contact) {
      // use contact's timezone if defined
      if (contact?.timezone) {
        this.schedule.timezone = contact.timezone
      }
    }
  }
}

</script>
