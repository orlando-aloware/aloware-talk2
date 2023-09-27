<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="d-flex w-100 h-100 animate__animated animate__fadeIn">
      <settings-side class="settings-side__left"
                     :class="{ 'settings-side__left--closed': isSettingsOpened }"/>
      <div class="flex-grow-1 overflow-y-scroll settings-content-wrapper settings-side__right pb-5"
           :class="contentClass"
           v-if="user">
        <b-row>
          <b-col class="settings-form-wrapper"
                 md="12">
            <general-information :statics="statics"
                                 v-if="!$route.params.tab || $route.params.tab === 'general-information'"/>
            <profile :user="user"
                     v-if="$route.params.tab === 'profile' && !isLoading"/>
            <notification-settings :user="user"
                                   v-if="$route.params.tab === 'notification' && !isLoading"/>
            <personalization :user="user"
                             v-if="$route.params.tab === 'personalization' && !isLoading"/>
            <visibility :user="user"
                        v-if="$route.params.tab === 'visibility' && hasRole('Company Admin') && !isLoading"/>
            <inbound-call :user="user"
                          :statics="statics"
                          v-if="$route.params.tab === 'inbound-call' && !isLoading"/>
            <outbound-call :user="user"
                           v-if="$route.params.tab === 'outbound-call' && !isLoading"/>
            <diagnosis :user="user"
                       v-if="$route.params.tab === 'diagnosis' && !isLoading"/>
            <sms-templates :user="user"
                           v-if="$route.params.tab === 'sms-templates' && !isLoading"/>
            <settings-save-bar :user="user"/>
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
    },

    contentClass () {
      const rightSideClass = this.isSettingsOpened ? 'settings-side__right--opened' : ''
      const otherSettingsRoutes = ['diagnosis', 'sms-templates']
      const flexClass = !otherSettingsRoutes.includes(this.$route.params.tab) ? 'flex' : ''

      return [
        rightSideClass,
        flexClass
      ]
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
      'setUserClone',
      'updateChangedUserProperties',
      'resetChangedUserProperties',
      'setUser'
    ]),

    getUser () {
      this.isLoading = true

      return talk2Api.V1.user.getById(this.profile.id)
        .then(response => {
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
    },

    unsavedSettingsAlert (to, from, next, changed) {
      if (changed.length > 0) {
        const msg = 'This action may cause your settings changes to be lost. Do you wish to continue?'
        const title = 'You have unsaved settings'
        this.$bvModal.msgBoxConfirm(msg, {
          title: title,
          size: 'md',
          noCloseOnBackdrop: true,
          noCloseOnEsc: true,
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        }).then(value => {
          if (value) {
            this.resetUserChanges()
            next()
            return
          }
          next(false)
        }).catch(err => {
          console.error(err)
          next(false)
        })
        return
      }
      next()
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
  },

  watch: {
    $route (to) {
      if (to.name === 'Settings') {
        this.onLoadShowSettings = false

        return
      }

      if (to.name !== 'Settings' && to.name.toLowerCase().includes('settings')) {
        this.onLoadShowSettings = true
      }
    }
  },

  beforeRouteUpdate (to, from, next) {
    this.unsavedSettingsAlert(to, from, next, this.changedUserProperties)
  },

  beforeRouteLeave (to, from, next) {
    this.unsavedSettingsAlert(to, from, next, this.changedUserProperties)
  }
}
</script>
