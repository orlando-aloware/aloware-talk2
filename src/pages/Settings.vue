<template>
  <div class="h-100"
       v-if="authenticated">
    <!--div class="call-active">
    </div-->
    <div class="d-flex w-100 h-100 animate__animated animate__fadeIn position-relative">
      <settings-side class="settings-side__left"
                     :class="{ 'settings-side__left--closed': isSettingsOpened }">
      </settings-side>
      <div class="d-flex flex-grow-1 overflow-y-scroll settings-content-wrapper settings-side__right"
           :class="{ 'settings-side__right--opened': isSettingsOpened }"
           v-if="user">
        <b-row>
          <b-col md="12" class="settings-form-wrapper">
            <general-information :statics="statics" v-if="!$route.params.tab || $route.params.tab === 'general-information'"></general-information>
            <profile :user="user" v-if="$route.params.tab === 'profile' && !isLoading"></profile>
            <notification-settings :user="user" v-if="$route.params.tab === 'notification' && !isLoading"></notification-settings>
            <personalization :user="user" v-if="$route.params.tab === 'personalization' && !isLoading"></personalization>
            <visibility :user="user" v-if="$route.params.tab === 'visibility' && hasRole('Company Admin') && !isLoading"></visibility>
            <inbound-call :user="user" :statics="statics" v-if="$route.params.tab === 'inbound-call' && !isLoading"></inbound-call>
            <outbound-call :user="user" v-if="$route.params.tab === 'outbound-call' && !isLoading"></outbound-call>
            <diagnosis :user="user" v-if="$route.params.tab === 'diagnosis' && !isLoading"></diagnosis>
            <sms-templates :user="user" v-if="$route.params.tab === 'sms-templates' && !isLoading"></sms-templates>
            <settings-save-bar  :user="user"></settings-save-bar>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { aclMixin, settingsMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as AnswerTypes from 'src/constants/answer-types'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import _ from 'lodash'
import SettingsSide from 'components/settings/settings-side'
import GeneralInformation from 'components/settings/general-information'
import Profile from 'components/settings/profile'
import NotificationSettings from 'components/settings/notification'
import Personalization from 'components/settings/personalization'
import Visibility from 'components/settings/visibility'
import InboundCall from 'components/settings/inbound-call'
import OutboundCall from 'components/settings/outbound-call'
import Diagnosis from 'components/settings/diagnosis'
import SmsTemplates from 'components/settings/sms-templates'
import talk2Api from 'src/plugins/api/api'
import SettingsSaveBar from 'components/settings/settings-save-bar'

export default {
  name: 'Settings',

  mixins: [aclMixin, settingsMixin],

  components: { SettingsSaveBar, SmsTemplates, Diagnosis, OutboundCall, InboundCall, Visibility, Personalization, NotificationSettings, Profile, GeneralInformation, SettingsSide },

  computed: {
    ...mapGetters('auth', ['authenticated', 'profile']),
    ...mapState('settings', ['user', 'userClone']),
    ...mapGetters('settings', ['changedUserProperties']),
    isSettingsOpened () {
      return !this.$q.screen.lt.md || this.onLoadShowSettings || (this.$route.name !== 'Settings' && this.$route.name.toLowerCase().includes('settings') && this.$q.screen.lt.md)
    }
  },

  data () {
    return {
      localUser: null,
      isLoading: false,
      loadingOperatingHours: false,
      statics: {
        logo: null,
        logo_inverse: null,
        logo_square: null,
        logo_square_inverse: null,
        host: null,
        referer: null,
        name: null,
        domain: null,
        whitelabel: false,
        path: null
      },
      onLoadShowSettings: true
    }
  },

  methods: {
    ...mapActions('settings', ['setItems', 'setUserClone', 'updateChangedUserProperties', 'resetChangedUserProperties', 'setUser']),
    getUser () {
      this.isLoading = true
      return talk2Api.V1.user.getById(this.profile.id).then(response => {
        this.localUser = response.data
        this.setupUser()
        this.isLoading = false
      })
    },
    setupUser () {
      if (typeof this.localUser.operating_hours === 'string') {
        this.localUser.operating_hours = JSON.parse(this.localUser.operating_hours)

        this.fixOperatingHours()
      }

      if (typeof this.localUser.operating_states_limit === 'string') {
        this.localUser.operating_states_limit = JSON.parse(this.localUser.operating_states_limit)
      }

      if (typeof this.localUser.operating_area_codes_limit === 'string') {
        this.localUser.operating_area_codes_limit = JSON.parse(this.localUser.operating_area_codes_limit)
      }

      if (typeof this.localUser.sip_details === 'string') {
        this.localUser.sip_details = JSON.parse(this.localUser.sip_details)
      }

      if (typeof this.localUser.reminders_options === 'string') {
        this.localUser.reminders_options = JSON.parse(this.localUser.reminders_options)
      }

      if (this.localUser.reminders_options === null) {
        this.localUser.reminders_options = [
          'now',
          'one_minute_before',
          'fifteen_minutes_before',
          'one_hour_before',
          'one_day_before'
        ]
      }

      if (!this.localUser.operating_states_limit || this.localUser.operating_states_limit.length === 0) {
        this.localUser.operating_states_limit = {
          us: [],
          ca: []
        }
      }

      if (!this.localUser.operating_area_codes_limit || this.localUser.operating_area_codes_limit.length === 0) {
        this.localUser.operating_area_codes_limit = []
      }

      if (typeof this.localUser.observing_campaigns === 'string') {
        this.localUser.observing_campaigns = JSON.parse(this.localUser.observing_campaigns)
      }

      if (!this.localUser.observing_campaigns) {
        this.localUser.observing_campaigns = []
      }

      if (this.localUser.phone_number && this.localUser.answer_by === AnswerTypes.BY_BROWSER) {
        this.localUser.phone_number_as_backup = true
      }

      if (this.localUser.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && this.localUser.default_outbound_campaign_id) {
        this.localUser.outbound_calling_selector = 1
      } else if (this.localUser.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.localUser.outbound_calling_selector = 3
      } else {
        this.localUser.outbound_calling_selector = 2
      }

      this.localUser.selected_campaign_ids = []
      this.localUser.selected_user_ids = []

      if (this.localUser.line_access_limit && this.localUser.accessible_campaigns && this.localUser.accessible_campaigns.length > 0) {
        this.localUser.selected_campaign_ids = this.localUser.accessible_campaigns
      }

      if (this.localUser.user_access_limit && this.localUser.accessible_users && this.localUser.accessible_users.length > 0) {
        this.localUser.selected_user_ids = this.localUser.accessible_users
      }

      this.localUser.ring_group_ids = _.uniq(this.localUser.ring_group_ids)
      this.localUser.password = ''
      this.localUser.password_confirmation = ''

      this.setUserClone(_.cloneDeep(this.localUser))
      this.setUser(_.cloneDeep(this.userClone))
    },
    fixOperatingHours () {
      this.loadingOperatingHours = true
      // fixes null issue
      for (let day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        for (let item in this.localUser.operating_hours[day]) {
          if (!this.localUser.operating_hours[day][item].open) {
            this.localUser.operating_hours[day][item].open = ''
          }

          if (!this.localUser.operating_hours[day][item].close) {
            this.localUser.operating_hours[day][item].close = ''
          }

          if (this.localUser.operating_hours[day][item].isOpen && this.localUser.operating_hours[day][item].open === '') {
            this.localUser.operating_hours[day][item].open = '24hrs'
          }

          if (this.localUser.operating_hours[day][item].isOpen && this.localUser.operating_hours[day][item].close === '') {
            this.localUser.operating_hours[day][item].close = '24hrs'
          }

          if (this.localUser.operating_hours[day][item].isOpen && this.localUser.operating_hours[day][item].open !== '24hrs' && this.localUser.operating_hours[day][item].close === '24hrs') {
            this.localUser.operating_hours[day][item].open = '24hrs'
          }
        }
      }

      // fixes the order of weekdays
      this.localUser.operating_hours = {
        monday: this.localUser.operating_hours.monday,
        tuesday: this.localUser.operating_hours.tuesday,
        wednesday: this.localUser.operating_hours.wednesday,
        thursday: this.localUser.operating_hours.thursday,
        friday: this.localUser.operating_hours.friday,
        saturday: this.localUser.operating_hours.saturday,
        sunday: this.localUser.operating_hours.sunday
      }

      this.loadingOperatingHours = false
    },
    getStatics () {
      return talk2Api.V1.statics.get().then(response => {
        this.statics = response.data
      })
    },
    resetUserChanges () {
      this.setUser(_.cloneDeep(this.userClone))
      this.resetChangedUserProperties()
    },
    onUpdateFields (value, prop) {
      this.profile[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })
    }
  },

  mounted () {
    this.setUser(null)
    this.getUser()
    this.resetChangedUserProperties()
  },

  created () {
    if (!this.isAdmin && this.$route.path === '/settings/visibility') {
      this.$router.push(`/settings`)
    }

    this.getStatics()
    this.setItems([
      {
        label: 'General',
        value: 'general-information',
        icon: 'document',
        disabled: false
      },
      {
        label: 'Profile',
        value: 'profile',
        icon: 'person',
        disabled: false
      },
      {
        label: 'Visibility',
        value: 'visibility',
        icon: 'eye',
        height: 16,
        width: 16,
        disabled: false
      },
      {
        label: 'Personalization',
        value: 'personalization',
        icon: 'personalization',
        disabled: false
      },
      {
        label: 'Inbound Call',
        value: 'inbound-call',
        icon: 'inbound',
        height: 14,
        width: 14,
        disabled: false
      },
      {
        label: 'Outbound Call',
        value: 'outbound-call',
        icon: 'outbound',
        disabled: false
      },
      {
        label: 'Notification',
        value: 'notification',
        icon: 'notification',
        disabled: false
      },
      {
        label: 'SMS Templates',
        value: 'sms-templates',
        icon: 'message',
        disabled: false
      },
      {
        label: 'Diagnosis',
        value: 'diagnosis',
        icon: 'diagnosis',
        disabled: false
      }
    ])
  },

  watch: {
    $route (to, from) {
      if (to.name.includes('Settings')) {
        this.onLoadShowTasks = false
      }
    }
  }
}
</script>
