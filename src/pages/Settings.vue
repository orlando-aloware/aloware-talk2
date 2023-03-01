<template>
  <div class="h-100"
       v-if="authenticated">
    <!--div class="call-active">
    </div-->
    <div class="d-flex w-100 h-100 animate__animated animate__fadeIn position-relative">
      <settings-side class="settings-side__left"
                     :class="{ 'settings-side__left--closed': isSettingsOpened }">
      </settings-side>
      <div class="flex-grow-1 overflow-y-scroll settings-content-wrapper settings-side__right"
           :class="{ 'settings-side__right--opened': isSettingsOpened, 'flex' : !['diagnosis', 'sms-templates'].includes($route.params.tab)  }"
           v-if="user">
        <b-row>
          <b-col md="12" class="settings-form-wrapper">
            <general-information :statics="statics" v-if="!$route.params.tab || $route.params.tab === 'general-information'">
            </general-information>
            <profile :user="user" v-if="$route.params.tab === 'profile' && !isLoading">
            </profile>
            <notification-settings :user="user" v-if="$route.params.tab === 'notification' && !isLoading">
            </notification-settings>
            <personalization :user="user" v-if="$route.params.tab === 'personalization' && !isLoading">
            </personalization>
            <visibility :user="user" v-if="$route.params.tab === 'visibility' && hasRole('Company Admin') && !isLoading">
            </visibility>
            <inbound-call :user="user" :statics="statics" v-if="$route.params.tab === 'inbound-call' && !isLoading">
            </inbound-call>
            <outbound-call :user="user" v-if="$route.params.tab === 'outbound-call' && !isLoading">
            </outbound-call>
            <diagnosis :user="user" v-if="$route.params.tab === 'diagnosis' && !isLoading">
            </diagnosis>
            <sms-templates :user="user" v-if="$route.params.tab === 'sms-templates' && !isLoading">
            </sms-templates>
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

  components: {
    SettingsSaveBar,
    SmsTemplates,
    Diagnosis,
    OutboundCall,
    InboundCall,
    Visibility,
    Personalization,
    NotificationSettings,
    Profile,
    GeneralInformation,
    SettingsSide
  },

  computed: {
    ...mapState('settings', ['user']),

    ...mapState(['statics']),

    ...mapGetters('auth', ['authenticated', 'profile']),

    ...mapGetters('settings', ['changedUserProperties']),

    isSettingsOpened () {
      return !this.$q.screen.lt.md || this.onLoadShowSettings
    }
  },

  data () {
    return {
      isLoading: false,
      onLoadShowSettings: false
    }
  },

  methods: {
    ...mapActions('settings', [
      'setItems',
      'setUserClone',
      'updateChangedUserProperties',
      'resetChangedUserProperties',
      'setUser'
    ]),

    getUser () {
      this.isLoading = true
      return talk2Api.V1.user.getById(this.profile.id).then(response => {
        this.localUser = response.data
        this.setupUser()
        this.isLoading = false
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
    },

    back () {
      this.$router.push({
        name: 'Settings'
      })
      this.onLoadShowSettings = false
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

    if (this.$route.name !== 'Settings' && this.$route.name.toLowerCase().includes('settings')) {
      this.onLoadShowSettings = true
    }

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
      if (to.name === 'Settings') {
        this.onLoadShowSettings = false
        return
      }

      if (to.name !== 'Settings' && to.name.toLowerCase().includes('settings')) {
        this.onLoadShowSettings = true
      }
    }
  }
}
</script>
