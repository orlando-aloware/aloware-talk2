<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
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
                             value="true"
                             unchecked-value="false">
              Call to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_texts.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myTexts">
              Text message to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_voicemail.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myVoicemails">
              Voicemail to personal line or to the ring groups this user belongs to
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_faxes.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myFaxes">
              Fax to personal line
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_mentions.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myMentions">
              When this user is mentioned
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_contacts.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myContacts">
              When a contact is assigned to this user
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label=""
                        :id="`${SettingsMap.my_appointments.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myAppointments">
              When an appointment is assigned to this user
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.my_reminders.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="myReminders">
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
                             value="true"
                             unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_billing_warnings')">
              Billing Warnings
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_sync_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_sync_reports"
                             value="true"
                             unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_sync_reports')">
              Integration Sync Report
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_account_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_account_reports"
                             value="true"
                             unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_account_reports')">
              Account Reports
            </b-form-checkbox>
          </b-form-group>

          <b-form-group label="" :id="`${SettingsMap.enabled_other_reports.hash_keyword}-container`">
            <b-form-checkbox switch
                             v-model="user.enabled_other_reports"
                             value="true"
                             unchecked-value="false"
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
            v-model="user.reminder_options"
            :options="reminderOptions"
            class="mb-3"
            value-field="value"
            text-field="title"
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
                               value="true"
                               unchecked-value="false"
                               v-model="shouldObserve"
                               @change="(eventPayload) => onUpdateFields(eventPayload, 'shouldObserve')">
                Receive notifications from lines
              </b-form-checkbox>
            </b-form-group>

          </b-col>
        </b-form-row>
        <b-form-row class="mt-4"
                    v-if="shouldObserve">
          <b-col sm="12"
                 md="6">
            <b-form-group
              label="Select the lines to get notified from"
              class="form-label"
            >
              <line-selector v-model="user.observing_campaigns"
                             :multiple="true"
                             :use-chips="true"
                             :generic-styling="false"
                             :generic-multiselect="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'observing_campaigns')">
              </line-selector>
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

export default {
  name: 'notification-settings',

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
    }
  },

  data () {
    return {
      showPasswordFields: false,
      selected: '',
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
      if (!['shouldObserve'].includes(prop)) {
        this.user[prop] = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if (prop === 'myCalls' && this.user[prop] !== 1) {
        this.user.outbound_calling_selector = this.userClone.outbound_calling_selector
        this.updateChangedUserProperties({
          name: 'outbound_calling_selector',
          value: this.userClone.outbound_calling_selector
        })
      }

      if (prop === 'shouldObserve' && !this.user[prop]) {
        this.user.observing_campaigns = this.userClone.observing_campaigns
        this.updateChangedUserProperties({
          name: 'observing_campaigns',
          value: this.userClone.observing_campaigns
        })
      }
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
