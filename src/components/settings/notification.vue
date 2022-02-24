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

      <b-form-row class="mt-4" v-if="hasAdminRole">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Account Level Notifications (Admins Only)</h5>
            <p class="form-helper-text">Receive daily emails for account activity:</p>
          </div>

          <b-form-group label="" :id="`${SettingsMap.enabled_billing_warnings.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_billing_warnings"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_billing_warnings')">
              Billing Warnings
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_sync_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_sync_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_sync_reports')">
              Integration Sync Report
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_account_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_account_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_account_reports')">
              Account Reports
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_other_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_other_reports"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_other_reports')">
              Other Notifications
            </b-form-checkbox>
          </b-form-group>

        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" :id="`${SettingsMap.reminder_options.hash_keyword}-container`">
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
            v-model="user.reminder_options"
            :options="reminderOptions"
            @change="(eventPayload) => onUpdateFields(eventPayload, 'reminder_options')">
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
                             v-model="inAppNotifications">
              In-App
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.desktopNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="desktopNotifications">
              Desktop
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.mobileNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="mobileNotifications">
              Mobile
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.emailNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="emailNotifications">
              Email
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.textNotifications.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="textNotifications">
              Text Message
            </b-form-checkbox>
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
import { settingsMixin } from 'src/plugins/mixins'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'notification-settings',

  mixins: [settingsMixin],

  components: { LineSelector },

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
      return this.isCompanyAdmin || this.isBillingAdmin
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
    ...mapActions('settings', ['updateChangedUserProperties']),
    onUpdateFields (value, prop) {
      if (!['shouldObserve', 'myCalls', 'myTexts', 'myVoicemails', 'myContacts', 'myAppointments', 'myFaxes', 'myReminders', 'myMentions'].includes(prop)) {
        this.user[prop] = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      // if (prop === 'shouldObserve' && !this.user[prop]) {
      //   this.user.observing_campaigns = this.userClone.observing_campaigns
      //   this.updateChangedUserProperties({
      //     name: 'observing_campaigns',
      //     value: this.userClone.observing_campaigns
      //   })
      // }

      if (prop === 'myCalls') {
        this.user.calls_inapp_notifs = this.inAppNotifications && this.myCalls
        this.updateChangedUserProperties({
          name: 'calls_inapp_notifs',
          value: value
        })

        this.user.calls_desktop_notifs = this.desktopNotifications && this.myCalls
        this.updateChangedUserProperties({
          name: 'calls_desktop_notifs',
          value: value
        })

        this.user.calls_push_notifs = this.mobileNotifications && this.myCalls
        this.updateChangedUserProperties({
          name: 'calls_push_notifs',
          value: value
        })

        this.user.calls_email_notifs = this.emailNotifications && this.myCalls
        this.updateChangedUserProperties({
          name: 'calls_email_notifs',
          value: value
        })

        this.user.calls_text_notifs = this.textNotifications && this.myCalls
        this.updateChangedUserProperties({
          name: 'calls_text_notifs',
          value: value
        })
      }

      if (prop === 'myTexts') {
        this.user.texts_inapp_notifs = this.inAppNotifications && this.myTexts
        this.updateChangedUserProperties({
          name: 'texts_inapp_notifs',
          value: value
        })

        this.user.texts_desktop_notifs = this.desktopNotifications && this.myTexts
        this.updateChangedUserProperties({
          name: 'texts_desktop_notifs',
          value: value
        })

        this.user.texts_push_notifs = this.mobileNotifications && this.myTexts
        this.updateChangedUserProperties({
          name: 'texts_push_notifs',
          value: value
        })

        this.user.texts_email_notifs = this.emailNotifications && this.myTexts
        this.updateChangedUserProperties({
          name: 'texts_email_notifs',
          value: value
        })

        this.user.texts_text_notifs = this.textNotifications && this.myTexts
        this.updateChangedUserProperties({
          name: 'texts_text_notifs',
          value: value
        })
      }

      if (prop === 'myVoicemails') {
        this.user.voicemails_inapp_notifs = this.inAppNotifications && this.myVoicemails
        this.updateChangedUserProperties({
          name: 'voicemails_inapp_notifs',
          value: value
        })

        this.user.voicemails_desktop_notifs = this.desktopNotifications && this.myVoicemails
        this.updateChangedUserProperties({
          name: 'voicemails_desktop_notifs',
          value: value
        })

        this.user.voicemails_push_notifs = this.mobileNotifications && this.myVoicemails
        this.updateChangedUserProperties({
          name: 'voicemails_push_notifs',
          value: value
        })

        this.user.voicemails_email_notifs = this.emailNotifications && this.myVoicemails
        this.updateChangedUserProperties({
          name: 'voicemails_email_notifs',
          value: value
        })

        this.user.voicemails_text_notifs = this.textNotifications && this.myVoicemails
        this.updateChangedUserProperties({
          name: 'voicemails_text_notifs',
          value: value
        })
      }

      if (prop === 'myContacts') {
        this.user.contacts_inapp_notifs = this.inAppNotifications && this.myContacts
        this.updateChangedUserProperties({
          name: 'contacts_inapp_notifs',
          value: value
        })

        this.user.contacts_desktop_notifs = this.desktopNotifications && this.myContacts
        this.updateChangedUserProperties({
          name: 'contacts_desktop_notifs',
          value: value
        })

        this.user.contacts_push_notifs = this.mobileNotifications && this.myContacts
        this.updateChangedUserProperties({
          name: 'contacts_push_notifs',
          value: value
        })

        this.user.contacts_email_notifs = this.emailNotifications && this.myContacts
        this.updateChangedUserProperties({
          name: 'contacts_email_notifs',
          value: value
        })

        this.user.contacts_text_notifs = this.textNotifications && this.myContacts
        this.updateChangedUserProperties({
          name: 'contacts_text_notifs',
          value: value
        })
      }

      if (prop === 'myAppointments') {
        this.user.appointments_inapp_notifs = this.inAppNotifications && this.myAppointments
        this.updateChangedUserProperties({
          name: 'appointments_inapp_notifs',
          value: value
        })

        this.user.appointments_desktop_notifs = this.desktopNotifications && this.myAppointments
        this.updateChangedUserProperties({
          name: 'appointments_desktop_notifs',
          value: value
        })

        this.user.appointments_push_notifs = this.mobileNotifications && this.myAppointments
        this.updateChangedUserProperties({
          name: 'appointments_push_notifs',
          value: value
        })

        this.user.appointments_email_notifs = this.emailNotifications && this.myAppointments
        this.updateChangedUserProperties({
          name: 'appointments_email_notifs',
          value: value
        })
      }

      if (prop === 'myFaxes') {
        this.user.faxes_inapp_notifs = this.inAppNotifications && this.myFaxes
        this.updateChangedUserProperties({
          name: 'faxes_inapp_notifs',
          value: value
        })

        this.user.faxes_desktop_notifs = this.desktopNotifications && this.myFaxes
        this.updateChangedUserProperties({
          name: 'faxes_desktop_notifs',
          value: value
        })

        this.user.faxes_push_notifs = this.mobileNotifications && this.myFaxes
        this.updateChangedUserProperties({
          name: 'faxes_push_notifs',
          value: value
        })

        this.user.faxes_email_notifs = this.emailNotifications && this.myFaxes
        this.updateChangedUserProperties({
          name: 'faxes_email_notifs',
          value: value
        })

        this.user.faxes_text_notifs = this.textNotifications && this.myFaxes
        this.updateChangedUserProperties({
          name: 'faxes_text_notifs',
          value: value
        })
      }

      if (prop === 'myReminders') {
        this.user.reminders_inapp_notifs = this.inAppNotifications && this.myReminders
        this.updateChangedUserProperties({
          name: 'reminders_inapp_notifs',
          value: value
        })

        this.user.reminders_desktop_notifs = this.desktopNotifications && this.myReminders
        this.updateChangedUserProperties({
          name: 'reminders_desktop_notifs',
          value: value
        })

        this.user.reminders_push_notifs = this.mobileNotifications && this.myReminders
        this.updateChangedUserProperties({
          name: 'reminders_push_notifs',
          value: value
        })

        this.user.reminders_email_notifs = this.emailNotifications && this.myReminders
        this.updateChangedUserProperties({
          name: 'reminders_email_notifs',
          value: value
        })
      }

      if (prop === 'myMentions') {
        this.user.mentions_inapp_notifs = this.inAppNotifications && this.myMentions
        this.updateChangedUserProperties({
          name: 'mentions_inapp_notifs',
          value: value
        })

        this.user.mentions_desktop_notifs = this.desktopNotifications && this.myMentions
        this.updateChangedUserProperties({
          name: 'mentions_desktop_notifs',
          value: value
        })

        this.user.mentions_push_notifs = this.mobileNotifications && this.myMentions
        this.updateChangedUserProperties({
          name: 'mentions_push_notifs',
          value: value
        })

        this.user.mentions_email_notifs = this.emailNotifications && this.myMentions
        this.updateChangedUserProperties({
          name: 'mentions_email_notifs',
          value: value
        })

        this.user.mentions_text_notifs = this.textNotifications && this.myMentions
        this.updateChangedUserProperties({
          name: 'mentions_text_notifs',
          value: value
        })
      }

      this.updateFormValidity()
    }
  },

  mounted () {
    this.shouldObserve = !!this.user.observing_campaigns.length

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
  }
}
</script>
