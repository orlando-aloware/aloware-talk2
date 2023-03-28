<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> Notification Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Communication Notifications</h5>
            <p class="form-helper-text">Notify me when the following events happen:</p>
          </div>

          <b-form-group label=""
                        :id="`${SettingsMap.my_calls.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myCalls"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myCalls')">
              Call to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_texts.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myTexts"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myTexts')">
              Text message to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_voicemail.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myVoicemails"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myVoicemails')">
              Voicemail to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_faxes.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myFaxes"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myFaxes')">
              Fax to personal line
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_mentions.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myMentions"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myMentions')">
              When this user is mentioned
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_contacts.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myContacts"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myContacts')">
              When a contact is assigned to this user
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_appointments.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myAppointments"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myAppointments')">
              When an appointment is assigned to this user
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.my_reminders.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myReminders"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'myReminders')">
              When a reminder is assigned to this user
            </b-form-checkbox>
          </b-form-group>

        </b-col>
      </b-form-row>

      <b-form-row v-if="hasAdminRole"
                  class="mt-4"
                  :id="`${SettingsMap.account_level_notifications.hash_keyword}-container`">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Account Level Notifications (Admins Only)</h5>
            <p class="form-helper-text">Receive daily emails for account activity:</p>
          </div>

          <b-form-group label=""
                        v-if="isBillingAdmin">
            <b-form-checkbox switch
                             v-model="user.enabled_billing_warnings"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_billing_warnings')">
              Billing Warnings
            </b-form-checkbox>
            <div class="account-level-notification-tooltip-wrapper">
              <information-circle-icon color="#2F80ED">
              </information-circle-icon>
              <q-tooltip anchor="center start"
                         self="center left"
                         :offset="[-20, 10]">
                Only enabled for billing admins
              </q-tooltip>
            </div>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_integration_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_integration_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_integration_reports')">
              Integration Reports
            </b-form-checkbox>
            <div class="account-level-notification-tooltip-wrapper">
              <information-circle-icon color="#2F80ED">
              </information-circle-icon>
              <q-tooltip anchor="center start"
                         self="center left"
                         :offset="[-20, 10]">
                <p class="font-weight-bold">Integration Reports include:</p>
                <p class="mt-1 mb-0">- Push/Pull Users Sync</p>
                <p class="mt-0 mb-0">- Contacts Sync</p>
                <p class="mt-0 mb-0">- Contact Dispositions Sync</p>
                <p class="mt-0 mb-0">- Call Disposition Sync</p>
                <p class="mt-0 mb-0">- Failed Integration Connection Status</p>
              </q-tooltip>
            </div>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_account_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_account_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_account_reports')">
              Account Reports
            </b-form-checkbox>
            <div class="account-level-notification-tooltip-wrapper">
              <information-circle-icon color="#2F80ED">
              </information-circle-icon>
              <q-tooltip anchor="center start"
                         self="center left"
                         :offset="[-20, 10]">
                <p class="font-weight-bold">Account Reports include:</p>
                <p class="mt-1 mb-0">- Daily Activity Reports</p>
                <p class="mt-0 mb-0">- Daily Inbound SMS Report</p>
                <p class="mt-0 mb-0">- Daily Outbound SMS Report</p>
                <p class="mt-0 mb-0">- Daily Spending Report</p>
              </q-tooltip>
            </div>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_other_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_other_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_other_reports')">
              Other Notifications
            </b-form-checkbox>
            <div class="account-level-notification-tooltip-wrapper">
              <information-circle-icon color="#2F80ED">
              </information-circle-icon>
              <q-tooltip anchor="center start"
                         self="center left"
                         :offset="[-20, 10]">
                <p class="font-weight-bold">Other Notifications:</p>
                <p class="mt-1 mb-0">- Imports/Exports Reports</p>
                <p class="mt-0 pt-0">- Webhook Failure Reports</p>
              </q-tooltip>
            </div>
          </b-form-group>

        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" :id="`${SettingsMap.reminders_options.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Event Notifications</h5>
            <p class="form-helper-text">Notify this user when the following appointment or reminder event occurs:</p>
          </div>

          <b-form-checkbox-group
            stacked
            class="mb-3"
            value-field="value"
            text-field="title"
            v-model="user.reminders_options"
            :options="reminderOptions"
            @change="(eventPayload) => onUpdateFields(eventPayload, 'reminders_options')">
          </b-form-checkbox-group>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.line_notifications.hash_keyword}-container`">
        <b-form-row class="mt-4">
          <b-col sm="12"
                 md="12">
            <div>
              <h5 class="form-label">Line Notifications</h5>
              <p class="form-helper-text">Get extra notifications from the lines you choose below.</p>
            </div>

            <b-form-group label="">
              <b-form-checkbox switch
                               :value="true"
                               :unchecked-value="false"
                               v-model="shouldObserve">
                Receive notifications from lines
              </b-form-checkbox>
            </b-form-group>

          </b-col>
        </b-form-row>
        <b-form-row class="mt-4"
                    v-if="shouldObserve">
          <b-col sm="12"
                 md="12">
            <b-form-group
              label="Select the lines to get notified from"
              class="form-label"
            >
              <line-selector v-model="user.observing_campaigns"
                             :class="[$v.user['observing_campaigns'].$invalid ? 'is-invalid' : '']"
                             :has-error="$v.user['observing_campaigns'].$invalid"
                             :multiple="true"
                             :use-chips="true"
                             :generic-styling="false"
                             :generic-multiselect="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'observing_campaigns')">
              </line-selector>
              <b-form-invalid-feedback v-if="!$v.user.observing_campaigns.required">Please select lines to get notified from.</b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-form-row>
      </div>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.notifications_channel.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Notification Channels</h5>
            <p class="form-helper-text">Choose what channels you want this user to get notified on.</p>
          </div>

          <b-form-group label="" :id="`${SettingsMap.inAppNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="inAppNotifications"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'inAppNotifications')">
              In-App
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.desktopNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="desktopNotifications"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'desktopNotifications')">
              Desktop
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.mobileNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="mobileNotifications"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'mobileNotifications')">
              Mobile
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.emailNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="emailNotifications"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'emailNotifications')">
              Email
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.textNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="textNotifications"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'textNotifications')">
              Text Message
            </b-form-checkbox>
          </b-form-group>
          <hr v-if="textNotifications"/>

          <b-form-group v-if="textNotifications"
                        class="form-label">
            <b-form-checkbox switch
                             :value="true"
                             :unchecked-value="false"
                             v-model="setCustomNotificationPhoneNumber"
                             @change="onChangeCustomNotificationPhoneNumber">
              Send text to custom number
            </b-form-checkbox>
          </b-form-group>
          <b-form-group v-if="textNotifications && setCustomNotificationPhoneNumber"
                        class="form-label">
            <b-form-input
              type="text"
              ref="notificationPhoneNumberInput"
              placeholder="(123) 456-7890"
              v-model.trim="$v.user.notification_phone_number.$model"
              :state="validateState('notification_phone_number')"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'notification_phone_number')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.notification_phone_number.required">Enter phone number.</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.user.notification_phone_number.validPhone">Enter valid phone number (e.g. (123) 456-7890).</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import { mapActions } from 'vuex'
import SettingsMap from 'components/settings/settings-map'
import { aclMixin, settingsMixin } from 'src/plugins/mixins'
import { required } from 'vuelidate/lib/validators'
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'notification-settings',

  mixins: [aclMixin, settingsMixin],

  components: { InformationCircleIcon, LineSelector },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    isCompanyAdmin () {
      return this.user.role_names.includes('Company Admin')
    },
    isBillingAdmin () {
      return this.user.role_names.includes('Billing Admin')
    },
    hasAdminRole () {
      return this.user && (this.isCompanyAdmin || this.isBillingAdmin)
    },
    rules () {
      const rulesObject = { data: {} }

      if (this.shouldObserve) {
        rulesObject.data = { ...rulesObject.data,
          observing_campaigns: {
            required
          }
        }
      }

      if (this.setCustomNotificationPhoneNumber) {
        rulesObject.data = { ...rulesObject.data,
          notification_phone_number: {
            required,
            validPhone: (value) => this.$options.filters.fixPhone(value) !== false
          }
        }
      }

      return rulesObject.data
    }
  },

  validations () {
    return {
      user: this.rules
    }
  },

  data () {
    return {
      options: [
        { text: 'Admin', value: '1' },
        { text: 'Agent', value: '2' }
      ],
      communicationNotificationOptions: [
        { text: 'Call to personal line or to the ring groups this user belongs to', value: '1' },
        { text: 'Text message to personal line or to the ring groups this user belongs to', value: '2' },
        { text: 'Voicemail to personal line or to the ring groups this user belongs to', value: '3' },
        { text: 'When this user is mentioned', value: '4' },
        { text: 'When an appointment is assigned to this user', value: '5' },
        { text: 'When a reminder is assigned to this user', value: '6' }
      ],
      reminderOptions: [
        {
          value: 'now',
          title: 'It is created'
        },
        {
          value: 'one_minute_before',
          title: 'One minute before'
        },
        {
          value: 'fifteen_minutes_before',
          title: 'Fifteen minutes before'
        },
        {
          value: 'one_hour_before',
          title: 'One hour before'
        },
        {
          value: 'one_day_before',
          title: 'One day before'
        }
      ],
      myCalls: false,
      myTexts: false,
      myVoicemails: false,
      myContacts: false,
      myAppointments: false,
      myReminders: false,
      myMentions: false,
      myFaxes: false,
      inAppNotifications: false,
      emailNotifications: false,
      desktopNotifications: false,
      mobileNotifications: false,
      textNotifications: false,
      shouldObserve: false,
      SettingsMap
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties', 'setFormValidity']),
    onUpdateFields (value, prop) {
      if (!['shouldObserve', 'myCalls', 'myTexts', 'myVoicemails', 'myContacts', 'myAppointments', 'myFaxes', 'myReminders', 'myMentions'].includes(prop)) {
        this.user[prop] = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if ([
        'myCalls',
        'myTexts',
        'myVoicemails',
        'myContacts',
        'myAppointments',
        'myFaxes',
        'myReminders',
        'myMentions',
        'inAppNotifications',
        'desktopNotifications',
        'mobileNotifications',
        'emailNotifications',
        'textNotifications',
        'notification_phone_number'
      ].includes(prop)) {
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })

        if (prop === 'textNotifications' && !value) {
          this.setCustomNotificationPhoneNumber = false
        }

        this.user.calls_inapp_notifs = this.inAppNotifications && this.myCalls
        this.user.calls_desktop_notifs = this.desktopNotifications && this.myCalls
        this.user.calls_push_notifs = this.mobileNotifications && this.myCalls
        this.user.calls_email_notifs = this.emailNotifications && this.myCalls
        this.user.calls_text_notifs = this.textNotifications && this.myCalls

        this.user.texts_inapp_notifs = this.inAppNotifications && this.myTexts
        this.user.texts_desktop_notifs = this.desktopNotifications && this.myTexts
        this.user.texts_push_notifs = this.mobileNotifications && this.myTexts
        this.user.texts_email_notifs = this.emailNotifications && this.myTexts
        this.user.texts_text_notifs = this.textNotifications && this.myTexts

        this.user.voicemails_inapp_notifs = this.inAppNotifications && this.myVoicemails
        this.user.voicemails_desktop_notifs = this.desktopNotifications && this.myVoicemails
        this.user.voicemails_push_notifs = this.mobileNotifications && this.myVoicemails
        this.user.voicemails_email_notifs = this.emailNotifications && this.myVoicemails
        this.user.voicemails_text_notifs = this.textNotifications && this.myVoicemails

        this.user.contacts_inapp_notifs = this.inAppNotifications && this.myContacts
        this.user.contacts_desktop_notifs = this.desktopNotifications && this.myContacts
        this.user.contacts_push_notifs = this.mobileNotifications && this.myContacts
        this.user.contacts_email_notifs = this.emailNotifications && this.myContacts
        this.user.contacts_text_notifs = this.textNotifications && this.myContacts

        this.user.appointments_inapp_notifs = this.inAppNotifications && this.myAppointments
        this.user.appointments_desktop_notifs = this.desktopNotifications && this.myAppointments
        this.user.appointments_push_notifs = this.mobileNotifications && this.myAppointments
        this.user.appointments_email_notifs = this.emailNotifications && this.myAppointments

        this.user.faxes_inapp_notifs = this.inAppNotifications && this.myFaxes
        this.user.faxes_desktop_notifs = this.desktopNotifications && this.myFaxes
        this.user.faxes_push_notifs = this.mobileNotifications && this.myFaxes
        this.user.faxes_email_notifs = this.emailNotifications && this.myFaxes
        this.user.faxes_text_notifs = this.textNotifications && this.myFaxes

        this.user.reminders_inapp_notifs = this.inAppNotifications && this.myReminders
        this.user.reminders_desktop_notifs = this.desktopNotifications && this.myReminders
        this.user.reminders_push_notifs = this.mobileNotifications && this.myReminders
        this.user.reminders_email_notifs = this.emailNotifications && this.myReminders

        this.user.mentions_inapp_notifs = this.inAppNotifications && this.myMentions
        this.user.mentions_desktop_notifs = this.desktopNotifications && this.myMentions
        this.user.mentions_push_notifs = this.mobileNotifications && this.myMentions
        this.user.mentions_email_notifs = this.emailNotifications && this.myMentions
        this.user.mentions_text_notifs = this.textNotifications && this.myMentions
      }
      this.updateFormValidity()
    },

    onChangeCustomNotificationPhoneNumber () {
      this.user.notification_phone_number = !this.setCustomNotificationPhoneNumber ? null : this.userClone.notification_phone_number
      this.updateChangedUserProperties({
        name: 'notification_phone_number',
        value: this.userClone.secondary_phone_number
      })

      if (this.setCustomNotificationPhoneNumber) {
        this.$refs.notificationPhoneNumberInput.focus()
      }

      this.updateFormValidity()
    }
  },

  mounted () {
    this.shouldObserve = !!this.user.observing_campaigns.length

    this.setCustomNotificationPhoneNumber = !!this.user.notification_phone_number

    this.myCalls = this.user.calls_inapp_notifs || this.user.calls_desktop_notifs || this.user.calls_push_notifs || this.user.calls_email_notifs || this.user.calls_text_notifs
    this.myTexts = this.user.texts_inapp_notifs || this.user.texts_desktop_notifs || this.user.texts_push_notifs || this.user.texts_email_notifs || this.user.texts_text_notifs
    this.myVoicemails = this.user.voicemails_inapp_notifs || this.user.voicemails_desktop_notifs || this.user.voicemails_push_notifs || this.user.voicemails_email_notifs || this.user.voicemails_text_notifs
    this.myContacts = this.user.contacts_inapp_notifs || this.user.contacts_desktop_notifs || this.user.contacts_push_notifs || this.user.contacts_email_notifs || this.user.contacts_text_notifs
    this.myAppointments = this.user.appointments_inapp_notifs || this.user.appointments_desktop_notifs || this.user.appointments_push_notifs || this.user.appointments_email_notifs
    this.myReminders = this.user.reminders_inapp_notifs || this.user.reminders_desktop_notifs || this.user.reminders_push_notifs || this.user.reminders_email_notifs
    this.myFaxes = this.user.faxes_inapp_notifs || this.user.faxes_desktop_notifs || this.user.faxes_push_notifs || this.user.faxes_email_notifs || this.user.faxes_text_notifs
    this.myMentions = this.user.mentions_inapp_notifs || this.user.mentions_desktop_notifs || this.user.mentions_push_notifs || this.user.mentions_email_notifs || this.user.mentions_text_notifs

    this.inAppNotifications = this.user.calls_inapp_notifs || this.user.texts_inapp_notifs || this.user.voicemails_inapp_notifs || this.user.contacts_inapp_notifs || this.user.appointments_inapp_notifs || this.user.reminders_inapp_notifs || this.user.faxes_inapp_notifs || this.user.mentions_inapp_notifs
    this.desktopNotifications = this.user.calls_desktop_notifs || this.user.texts_desktop_notifs || this.user.voicemails_desktop_notifs || this.user.contacts_desktop_notifs || this.user.appointments_desktop_notifs || this.user.reminders_desktop_notifs || this.user.faxes_desktop_notifs || this.user.mentions_desktop_notifs
    this.mobileNotifications = this.user.calls_push_notifs || this.user.texts_push_notifs || this.user.voicemails_push_notifs || this.user.contacts_push_notifs || this.user.appointments_push_notifs || this.user.reminders_push_notifs || this.user.faxes_push_notifs || this.user.mentions_push_notifs
    this.emailNotifications = this.user.calls_email_notifs || this.user.texts_email_notifs || this.user.voicemails_email_notifs || this.user.contacts_email_notifs || this.user.appointments_email_notifs || this.user.reminders_email_notifs || this.user.faxes_email_notifs || this.user.mentions_email_notifs
    this.textNotifications = this.user.calls_text_notifs || this.user.texts_text_notifs || this.user.voicemails_text_notifs || this.user.contacts_text_notifs || this.user.faxes_text_notifs || this.user.mentions_text_notifs

    this.$VueEvent.listen('resetSettingsForm', () => {
      this.myCalls = this.user.calls_inapp_notifs || this.user.calls_desktop_notifs || this.user.calls_push_notifs || this.user.calls_email_notifs || this.user.calls_text_notifs
      this.myTexts = this.user.texts_inapp_notifs || this.user.texts_desktop_notifs || this.user.texts_push_notifs || this.user.texts_email_notifs || this.user.texts_text_notifs
      this.myVoicemails = this.user.voicemails_inapp_notifs || this.user.voicemails_desktop_notifs || this.user.voicemails_push_notifs || this.user.voicemails_email_notifs || this.user.voicemails_text_notifs
      this.myContacts = this.user.contacts_inapp_notifs || this.user.contacts_desktop_notifs || this.user.contacts_push_notifs || this.user.contacts_email_notifs || this.user.contacts_text_notifs
      this.myAppointments = this.user.appointments_inapp_notifs || this.user.appointments_desktop_notifs || this.user.appointments_push_notifs || this.user.appointments_email_notifs
      this.myReminders = this.user.reminders_inapp_notifs || this.user.reminders_desktop_notifs || this.user.reminders_push_notifs || this.user.reminders_email_notifs
      this.myFaxes = this.user.faxes_inapp_notifs || this.user.faxes_desktop_notifs || this.user.faxes_push_notifs || this.user.faxes_email_notifs || this.user.faxes_text_notifs
      this.myMentions = this.user.mentions_inapp_notifs || this.user.mentions_desktop_notifs || this.user.mentions_push_notifs || this.user.mentions_email_notifs || this.user.mentions_text_notifs

      this.inAppNotifications = this.user.calls_inapp_notifs || this.user.texts_inapp_notifs || this.user.voicemails_inapp_notifs || this.user.contacts_inapp_notifs || this.user.appointments_inapp_notifs || this.user.reminders_inapp_notifs || this.user.faxes_inapp_notifs || this.user.mentions_inapp_notifs
      this.desktopNotifications = this.user.calls_desktop_notifs || this.user.texts_desktop_notifs || this.user.voicemails_desktop_notifs || this.user.contacts_desktop_notifs || this.user.appointments_desktop_notifs || this.user.reminders_desktop_notifs || this.user.faxes_desktop_notifs || this.user.mentions_desktop_notifs
      this.mobileNotifications = this.user.calls_push_notifs || this.user.texts_push_notifs || this.user.voicemails_push_notifs || this.user.contacts_push_notifs || this.user.appointments_push_notifs || this.user.reminders_push_notifs || this.user.faxes_push_notifs || this.user.mentions_push_notifs
      this.emailNotifications = this.user.calls_email_notifs || this.user.texts_email_notifs || this.user.voicemails_email_notifs || this.user.contacts_email_notifs || this.user.appointments_email_notifs || this.user.reminders_email_notifs || this.user.faxes_email_notifs || this.user.mentions_email_notifs
      this.textNotifications = this.user.calls_text_notifs || this.user.texts_text_notifs || this.user.voicemails_text_notifs || this.user.contacts_text_notifs || this.user.faxes_text_notifs || this.user.mentions_text_notifs

      this.user.notification_phone_number = this.userClone.notification_phone_number
      this.setCustomNotificationPhoneNumber = !!this.user.notification_phone_number
    })
  }
}
</script>
