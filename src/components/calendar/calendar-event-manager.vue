<template>
  <b-modal :id="modalId"
           size="lg"
           body-class="p-0"
           no-close-on-backdrop
           no-close-on-esc
           :scrollable="!loading"
           :hide-footer="loading"
           :visible="showManager"
           @hidden="closeFiltersMenu">
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
      <b-row>
        <b-col>
          <b-form-group class="form-label"
                        label="Title">
            <b-form-input
              type="text"
              placeholder="Add title"
              v-model="schedule.text"
              :disabled="!isEditable">
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row v-if="!hideEventTypeSelector">
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

      <b-row v-if="mode === 'add' && !hideContactSelector">
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

      <b-row v-else-if="mode === 'edit'">
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
               v-if="showSendContactReminderNotification">
          <b-form-group class="checkbox-wrapper ml-1">
            <b-form-checkbox :value="true"
                             :unchecked-value="false"
                             v-model="schedule.send_contact_reminder">
              <span>Send reminder notification to the contact</span>
            </b-form-checkbox>
          </b-form-group>
        </b-col>
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

            <div class="alert alert-warning px-2 py-1 mt-1 small"
                 v-if="scheduleDateInCurrentTimezone && isEventTypeSelected && isContactSelected">
              <strong>In your local time:</strong> {{ scheduleDateInCurrentTimezone }}
            </div>
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

      <b-row v-if="!hideSmsReminder && isAppointment && shouldShowSmsReminder">
        <b-col>
          <h6 class="form-title">SMS Reminder</h6>
        </b-col>
        <b-col cols="12">
          <b-form-group class="checkbox-wrapper">
            <b-form-checkbox :value="true"
                             :unchecked-value="false"
                             v-model="sms_reminder_fields.enabled"
                             @change="onSmsReminderToggle">
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
                                   v-model="$v.sms_reminder_fields.campaign_id.$model"
                                   @select="lineSelected"
                                   @loaded="onLineComponentLoaded">
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
               lg="6">
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
                    @click.prevent="onCancelClicked">
              {{ cancelButtonText }}
            </button>
            <button class="btn btn-sm bg-primary text-white"
                    :disabled="isSaving || !isValid"
                    @click.prevent="saveSchedule">
              <q-spinner-bars color="white"
                              v-if="isSaving" />
              {{ isSaving ? savingText : saveButtonText }}
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
import { mapGetters, mapState, mapActions } from 'vuex'
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
import { getDateInBrowserTimeZone } from 'src/utils'
import talk2Api from 'src/plugins/api/api'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
require('vue-multiselect/dist/vue-multiselect.min.css')

const DATE_FORMAT = 'MM/DD/YYYY'
const HOUR_FORMAT = 'HH:mm'

const DEFAULT_HOUR = '06:00'
const DEFAULT_HOUR_REMINDER = '10:00'

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
    // Modal configuration
    modalId: {
      type: String,
      default: 'calendar-manager-modal'
    },

    // Context configuration
    calledFrom: {
      type: String,
      required: false,
      default: 'calendar' // calendar, contact, appointment-modal
    },

    // Contact prop for appointment-form-modal compatibility
    contact: {
      type: Object,
      required: false,
      default: null
    },

    // Team inbox props
    fromTeamInbox: {
      type: Boolean,
      default: false
    },

    teamInboxId: {
      type: [String, Number],
      default: null
    },

    teamInbox: {
      type: Object,
      default: null
    },

    // UI customization
    hideEventTypeSelector: {
      type: Boolean,
      default: false
    },

    hideContactSelector: {
      type: Boolean,
      default: false
    },

    defaultEventType: {
      type: Number,
      default: null
    },

    // Button text customization
    saveButtonText: {
      type: String,
      default: 'Save Event'
    },

    savingText: {
      type: String,
      default: 'Saving...'
    },

    cancelButtonText: {
      type: String,
      default: 'Cancel'
    },

    // For simple appointment modal mode
    simpleMode: {
      type: Boolean,
      default: false
    },

    // Hide SMS reminder section
    hideSmsReminder: {
      type: Boolean,
      default: false
    }
  },

  validations () {
    return {
      schedule: {
        type: {
          required: requiredIf(function () {
            return !this.hideEventTypeSelector
          })
        },
        time: {
          required
        },
        contact: {
          required: requiredIf(function () {
            return !this.hideContactSelector
          })
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
    }
  },

  data () {
    return {
      showManager: false,
      loading: false,
      isSaving: false,
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
        date: moment().format(DATE_FORMAT),
        time: DEFAULT_HOUR,
        type: null,
        send_contact_reminder: false,
        duration: 15
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
        frequencies: [1], // Changed from ['1'] to [1] to match validation rule
        time: DEFAULT_HOUR_REMINDER
      },
      // Store user's SMS reminder preference
      userSmsReminderPreference: true,
      title: 'Add Event',
      confirmDialogParams: {
        okTitle: 'Ok',
        cancelTitle: 'Cancel',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'primary',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        noCloseOnBackdrop: true,
        noCloseOnEsc: true,
        centered: true
      },
      isSubmitted: false,
      CommunicationDispositionStatus,
      CommunicationTypes
    }
  },

  computed: {
    ...mapGetters('auth', ['profile', 'user']),
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('contacts', ['isAddAppointmentOpen']),

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
        },
        {
          label: 'Missed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_MISSED
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
        },
        {
          label: 'Missed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW
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
        if (this.hasRole(['Company Admin', 'Company Supervisor'])) {
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
    },

    scheduleDateInCurrentTimezone () {
      if (!this.schedule.date || !this.schedule.time) {
        return ''
      }

      const dateTimeInBrowserTimeZone = getDateInBrowserTimeZone(moment.tz(`${this.schedule.date} ${this.schedule.time}`, `${DATE_FORMAT} ${HOUR_FORMAT}`, this.schedule.timezone))

      return this.schedule.date !== dateTimeInBrowserTimeZone.format(DATE_FORMAT) || this.schedule.time !== dateTimeInBrowserTimeZone.format(HOUR_FORMAT)
        ? dateTimeInBrowserTimeZone.format('LLL')
        : ''
    },

    isEventTypeSelected () {
      return this.schedule.type
    },

    isContactSelected () {
      return this.schedule.contact?.id
    },

    showSendContactReminderNotification () {
      return !this.isAppointment && this.mode === 'add'
    },

    shouldShowSmsReminder () {
      // Show SMS reminder for appointments that are not in the past
      // or for new appointments being created
      if (this.mode === 'add') {
        return true // Always show for new appointments
      }

      // For edit mode, check if the event is not in the past
      return !this.schedule.is_past
    },

    isValid () {
      if (this.simpleMode) {
        return this.schedule.date &&
          this.schedule.date !== 'Invalid date' &&
          this.schedule.time &&
          this.schedule.timezone &&
          this.schedule.contact
      }

      return !this.$v.$invalid
    }
  },

  mounted () {
    // Preset sms reminder text
    this.setDefaultSmsReminderFields()

    this.sms_reminder_fields.enabled = this.profile?.company?.sms_reminder_enabled || this.currentCompany?.sms_reminder_enabled

    // Handle contact prop for appointment-form-modal compatibility
    if (this.contact) {
      this.schedule.contact = this.contact
      this.schedule.timezone = this.contact.timezone || this.schedule.timezone

      // Set default type for appointment modal
      if (this.defaultEventType) {
        this.schedule.type = this.defaultEventType
      } else if (this.calledFrom === 'contact' || this.simpleMode) {
        this.schedule.type = CommunicationTypes.APPOINTMENT
      }
    }

    // Watch for appointment modal open state
    if (this.calledFrom === 'appointment-modal' || this.simpleMode) {
      this.$watch('isAddAppointmentOpen', (newVal) => {
        if (newVal) {
          this.showForAppointmentModal()
        }
      }, { immediate: true })
    }

    // Initialize is_past status
    this.updateIsPastStatus()
  },

  methods: {
    ...mapActions('contacts', ['addAppointmentOpen']),

    validateState (input, prop = 'schedule') {
      if (this.simpleMode) {
        return null // Skip validation display in simple mode
      }

      const { $dirty, $error } = this.$v[prop][input]
      return $dirty ? !$error : null
    },

    isFuture (date) {
      return moment(date).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')
    },

    editSchedule (sched) {
      this.loading = true
      this.isSubmitted = false
      let date = moment(sched.start_date_original)

      this.originalSchedule = {
        id: sched.id,
        type: sched.type,
        date: date.format(DATE_FORMAT),
        time: date.format(HOUR_FORMAT),
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
      this.updateIsPastStatus()
    },

    addSchedule (date) {
      let d = moment(date)

      // Presets
      this.startDate = d
      let contact = this.contact || {}
      let type = this.defaultEventType || null
      let timezone = null

      if (this.calledFrom === 'contact' || this.contact) {
        contact = this.contact || this.schedule.contact
        type = this.defaultEventType || CommunicationTypes.APPOINTMENT
        timezone = contact.timezone || this.schedule.timezone
      }

      this.originalSchedule = {
        id: null,
        type: type,
        date: d.format(DATE_FORMAT),
        time: '06:00',
        duration: 15,
        contact: contact,
        user: this.user?.profile || this.profile,
        status: CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW,
        body: '',
        date_time: 1,
        timezone: timezone
      }

      this.schedule = _.clone(this.originalSchedule)

      this.mode = 'add'
      this.title = 'Add Event'
      this.showManager = true
      this.updateIsPastStatus()

      if (this.calledFrom === 'contact' || this.simpleMode) {
        this.title = 'Add Appointment'
      }
    },

    // New method for appointment-form-modal compatibility
    showForAppointmentModal () {
      // Don't call resetForm() here as it resets SMS reminder settings
      this.$v.$reset()

      // Reset only the schedule data, not SMS reminder fields
      this.schedule = {
        contact: this.contact || {},
        user: this.profile,
        calendar_response: 1,
        disposition_status2: null,
        is_past: true,
        text: '',
        timezone: this.contact?.timezone || this.profile?.timezone,
        date: moment().format(DATE_FORMAT),
        time: DEFAULT_HOUR,
        type: this.defaultEventType || CommunicationTypes.APPOINTMENT,
        send_contact_reminder: false,
        duration: 15
      }

      this.mode = 'add'
      this.title = 'Add Appointment'
      this.showManager = true
      this.updateIsPastStatus()
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

    async saveSchedule () {
      if (!this.simpleMode) {
        this.$v.$touch()
        if (this.$v.$invalid) {
          return
        }
      }

      const contactId = this.schedule.contact.id
      const eventId = this.schedule.id

      if (this.mode === 'add') {
        if (contactId !== null && (this.schedule.type !== null || this.hideEventTypeSelector)) {
          this.loading = !this.simpleMode
          this.isSaving = true

          // If event type is APPOINTMENT and sms reminder option is enabled
          // - include sms reminder option
          if (this.isAppointment && this.sms_reminder_fields.enabled) {
            this.schedule.sms_reminder = this.sms_reminder_fields

            // Debug: Log what's being sent
            console.log('SMS Reminder Data being sent:', {
              enabled: this.sms_reminder_fields.enabled,
              body: this.sms_reminder_fields.body,
              campaign_id: this.sms_reminder_fields.campaign_id,
              frequencies: this.sms_reminder_fields.frequencies,
              time: this.sms_reminder_fields.time,
              frequencies_type: typeof this.sms_reminder_fields.frequencies[0]
            })
          }

          let postData = _.cloneDeep(this.schedule)
          postData.called_from = this.calledFrom === 'appointment-modal' ? 'contact' : this.calledFrom
          postData.user_timezone = window.timezone

          // Add ring_group_id when in Team Inbox context
          if ((this.teamInbox || this.fromTeamInbox) && this.teamInboxId) {
            postData.ring_group_id = this.teamInboxId
          }

          try {
            let res
            if (this.simpleMode || this.calledFrom === 'appointment-modal') {
              // Use simpler API call for appointment modal
              const apiCall = this.teamInbox || this.fromTeamInbox
                ? talk2TeamInboxApi.calendar.createEvent(contactId, postData)
                : talk2Api.V1.contact.addEngagement(contactId, postData)
              res = await apiCall
            } else {
              res = await this.$axios.post(`/api/v1/calendar/events/contact/${contactId}/create`, postData)
            }

            this.loading = false
            this.isSaving = false

            this.$emit('render-schedule', {
              data: res.data,
              action: 'add'
            })

            this.$emit('saved')

            this.showManager = false
            this.isSubmitted = true

            this.$generalNotification('Event added.')

            if (this.simpleMode || this.calledFrom === 'appointment-modal') {
              this.addAppointmentOpen(false)
            }
          } catch (err) {
            this.loading = false
            this.isSaving = false

            if (this.simpleMode || this.calledFrom === 'appointment-modal') {
              const separator = '<br>- '
              const errorMessage = 'Error while adding event.'
              const validationErrors = err.response?.data?.errors
                ? `${separator}${Object.values(err.response.data.errors).join(separator)}`
                : ''

              this.$generalNotification(`${errorMessage}${validationErrors}`, 'error', 5000, true)
            } else {
              this.$handleErrors(err.response)
            }
          }
        }
      } else {
        if (contactId != null && eventId != null) {
          this.loading = true
          this.isSaving = true

          if (this.isAppointment && this.sms_reminder_fields.enabled) {
            this.schedule.sms_reminder = this.sms_reminder_fields

            // Debug: Log what's being sent
            console.log('SMS Reminder Data being sent (update):', {
              enabled: this.sms_reminder_fields.enabled,
              body: this.sms_reminder_fields.body,
              campaign_id: this.sms_reminder_fields.campaign_id,
              frequencies: this.sms_reminder_fields.frequencies,
              time: this.sms_reminder_fields.time,
              frequencies_type: typeof this.sms_reminder_fields.frequencies[0]
            })
          }

          let postData = _.cloneDeep(this.schedule)
          postData.called_from = this.calledFrom === 'appointment-modal' ? 'contact' : this.calledFrom
          postData.user_timezone = window.timezone
          postData.entity_type = 'event' // it means entity id for events table

          this.$axios.post(`/api/v1/calendar/events/contact/${contactId}/update/${eventId}`, postData).then(res => {
            this.loading = false
            this.isSaving = false

            this.$emit('render-schedule', {
              data: res.data,
              action: 'update'
            })

            this.$emit('saved')

            this.showManager = false
            this.isSubmitted = true

            this.$generalNotification('Event updated.')
          }).catch(err => {
            this.loading = false
            this.isSaving = false
            this.$handleErrors(err.response)
          })
        }
      }
    },

    resetForm () {
      this.$v.$reset()

      if (this.calledFrom === 'contact' || this.contact) {
        this.schedule.user = this.user?.profile || this.profile
        this.schedule.calendar_response = 1
        this.schedule.contact = this.contact || {}
        this.schedule.timezone = this.contact?.timezone || this.profile?.timezone
      } else if (this.calledFrom === 'calendar') {
        this.schedule = {
          contact: {},
          user: this.user?.profile || this.profile,
          calendar_response: 1
        }
      }

      this.resetSmsReminder()
    },

    closeFiltersMenu (bvModalEvent) {
      if (this.simpleMode || this.calledFrom === 'appointment-modal') {
        // Don't reset SMS reminder fields for simple mode
        this.$v.$reset()
        this.resetSchedule()
        this.showManager = false
        this.addAppointmentOpen(false)
        this.$emit('close-filters-menu')
        return
      }

      if (_.isEqual(this.schedule, this.originalSchedule) || this.isSubmitted) {
        this.resetForm()
        this.resetSchedule()
        this.showManager = false
        this.$emit('close-filters-menu')
        return
      }

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
            this.resetSchedule()

            return this.$nextTick(() => {
              this.showManager = false
              this.$emit('close-filters-menu')
              this.$bvModal.hide(this.modalId)
            })
          }

          this.showManager = true
        })
    },

    onCancelClicked () {
      this.showManager = false

      if (this.simpleMode || this.calledFrom === 'appointment-modal') {
        this.addAppointmentOpen(false)
      }
    },

    updateSmsReminderVariables () {
      if (this.schedule.time) {
        this.sms_reminder_fields.time = this.schedule.time
      }

      this.setDefaultSmsReminderFields()
    },

    setDefaultSmsReminderFields () {
      const company = this.profile?.company || this.currentCompany

      this.sms_reminder_fields.body = company?.sms_reminder_default_text || ''

      // use personal line or default campaign_id
      this.sms_reminder_fields.campaign_id = !company?.sms_reminder_use_personal_line
        ? company?.sms_reminder_default_campaign_id
        : this.profile?.campaign_id

      // update time if its set in account config
      if (company?.sms_reminder_default_time) {
        this.sms_reminder_fields.time = company.sms_reminder_default_time
      }

      // update frequency if its set in account config
      if (company?.sms_reminder_default_send_before_days) {
        this.sms_reminder_fields.frequencies = company.sms_reminder_default_send_before_days.split(',').map(v => parseInt(v, 10))
      } else {
        // Ensure frequencies is always an array of integers
        this.sms_reminder_fields.frequencies = [1]
      }

      // Preserve the enabled state based on user preference
      this.sms_reminder_fields.enabled = this.userSmsReminderPreference
    },

    setSmsReminderFields (smsReminder) {
      this.sms_reminder_fields = {
        ...this.sms_reminder_fields,
        enabled: true,
        body: smsReminder.body,
        campaign_id: smsReminder.campaign_id,
        frequencies: smsReminder.frequencies.map(frequency => parseInt(frequency, 10)), // Ensure integers
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
        enabled: this.userSmsReminderPreference,
        template_variables: [
          '[FirstName]', '[CompanyName]', '[AgentName]', '[DateTime]', '[TimeLeft]'
        ],
        body: '',
        campaign_id: null,
        frequencies: [1], // Changed from ['1'] to [1] to match validation rule
        time: '10:00'
      }

      this.setDefaultSmsReminderFields()
    },

    dateSelected (value) {
      this.schedule.date = value ? moment(value).format(DATE_FORMAT) : null
      this.updateIsPastStatus()
    },

    timeSelected (time) {
      this.schedule.time = time.value
      this.updateIsPastStatus()
    },

    timezoneSelected (timezone) {
      this.schedule.timezone = timezone.value
      this.updateIsPastStatus()
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

    resetSchedule () {
      this.schedule = {
        contact: this.contact || {},
        user: this.user?.profile || this.profile,
        calendar_response: 1,
        timezone: this.contact?.timezone || this.profile?.timezone
      }
      this.originalSchedule = {}
    },

    onContactsLoaded () {
      this.loading = false
    },

    onContactChange (contact) {
      // use contact's timezone if defined
      if (contact?.timezone) {
        this.schedule.timezone = contact.timezone
      }
    },

    updateIsPastStatus () {
      if (this.schedule.date && this.schedule.time) {
        const eventDateTime = moment.tz(`${this.schedule.date} ${this.schedule.time}`, `${DATE_FORMAT} ${HOUR_FORMAT}`, this.schedule.timezone || 'UTC')
        this.schedule.is_past = eventDateTime.isBefore(moment())
      }
    },

    onSmsReminderToggle (enabled) {
      // Save user's preference for future form opens
      this.userSmsReminderPreference = enabled
    },

    onLineComponentLoaded (lines) {
      // When the line selector loads and preselects the first item,
      // ensure that our data model is updated to match the displayed selection
      if (lines && lines.length > 0 && !this.sms_reminder_fields.campaign_id) {
        // Update the campaign_id to match what's visually displayed as selected
        this.sms_reminder_fields.campaign_id = lines[0].id
      }
    }
  },

  watch: {
    isAddAppointmentOpen (value) {
      if (this.simpleMode || this.calledFrom === 'appointment-modal') {
        this.showManager = value
      }
    }
  }
}
</script>
