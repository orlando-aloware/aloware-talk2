<template>
  <div class="h-100"
       v-if="authenticated">
    <div class="call-active">
    </div>
    <div class="d-flex w-100 h-100 animate__animated animate__fadeIn position-relative">
      <settings-side></settings-side>
      <div class="d-flex flex-grow-1">
        <b-container>
          <b-row>
            <b-col md="8" offset-md="2" class="settings-form-wrapper pt-4">
              <general-information v-if="!$route.params.tab || $route.params.tab === 'general-information'"></general-information>
              <profile-settings v-if="$route.params.tab === 'profile-settings'"></profile-settings>
              <notification-settings v-if="$route.params.tab === 'notification-settings'"></notification-settings>
              <personalization v-if="$route.params.tab === 'personalization'"></personalization>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SettingsSide from 'components/settings/settings-side'
import GeneralInformation from 'components/settings/general-information'
import ProfileSettings from 'components/settings/profile-settings'
import NotificationSettings from 'components/settings/notification-settings'
import Personalization from 'components/settings/personalization'

export default {
  name: 'Settings',

  components: { Personalization, NotificationSettings, ProfileSettings, GeneralInformation, SettingsSide },

  computed: {
    ...mapGetters('auth', ['authenticated'])
  },

  data () {
    return {
      user: null
    }
  },

  methods: {
    ...mapActions('settings', ['setItems'])
  },

  created () {
    this.setItems([
      {
        label: 'General Information',
        value: 'general-information',
        icon: 'document',
        disabled: false
      },
      {
        label: 'Profile Settings',
        value: 'profile-settings',
        icon: 'person',
        disabled: false
      },
      {
        label: 'Visibility Settings',
        value: 'visibility-settings',
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
        label: 'Inbound Call Settings',
        value: 'inbound_call_settings',
        icon: 'inbound',
        height: 14,
        width: 14,
        disabled: false
      },
      {
        label: 'Outbound Call Settings',
        value: 'outbound-call-settings',
        icon: 'outbound',
        disabled: false
      },
      {
        label: 'Notification Settings',
        value: 'notification-settings',
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

  mounted () {
  }
}
</script>
