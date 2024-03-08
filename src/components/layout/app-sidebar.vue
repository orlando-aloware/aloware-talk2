<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn size="1.1rem"
             align="center"
             to="/"
             class="app-logo w-100 p-2"
             flat
             :icon="appLogo"
             v-if="staticsLoaded">
      </q-btn>
      <div class="w-100 d-flex align-items-center justify-center px-1 flex-column"
           style="height: 61px;"
           v-else>
        <q-spinner-bars color="white"
                        size="18px">
        </q-spinner-bars>
      </div>
    </div>
    <q-btn :to="{ name: 'Inbox' }"
           :ripple="false"
           icon="img:app-icons/menu/inbox_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Inbox')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Communications</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Inbox' }"
           :ripple="false"
           icon="img:app-icons/menu/inbox_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Inbox')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Communications</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Contacts' }"
           :ripple="false"
           icon="img:app-icons/menu/contacts_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Contacts')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Contacts</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Contacts' }"
           :ripple="false"
           icon="img:app-icons/menu/contacts_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Contacts')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Contacts</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ path: '/power-dialer' }"
           :ripple="false"
           icon="img:app-icons/menu/power_dialer_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Power Dialer') && profile.auto_dialer_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Power Dialer</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ path: '/power-dialer' }"
           :ripple="false"
           icon="img:app-icons/menu/power_dialer_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="(!isActive('Power Dialer') && profile.auto_dialer_enabled) || !profile.auto_dialer_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Power Dialer</span>
      </q-tooltip>
    </q-btn>

    <q-btn icon="img:app-icons/menu/wallboard_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           flat
           :to="{ name: 'Wallboard' }"
           :ripple="false"
           v-show="isActive('Wallboard')">
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Wallboard</span>
      </q-tooltip>
    </q-btn>
    <q-btn icon="img:app-icons/menu/wallboard_grey.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           flat
           :to="{ name: 'Wallboard' }"
           :ripple="false"
           v-show="!isActive('Wallboard')">
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Wallboard</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ path: '/calendar' }"
           :ripple="false"
           icon="img:app-icons/menu/calendar_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Calendar') && profile.calendar_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Calendar</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ path: '/calendar' }"
           :ripple="false"
           icon="img:app-icons/menu/calendar_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="(!isActive('Calendar') && profile.calendar_enabled) || !profile.calendar_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Calendar</span>
      </q-tooltip>
    </q-btn>

    <q-btn class="nav-icons w-100"
           padding="none"
           align="left"
           icon="img:app-icons/menu/tags_active.svg"
           flat
           :to="{ name: 'Tags' }"
           :ripple="false"
           v-show="isActive('Tags')">
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Tags</span>
      </q-tooltip>
    </q-btn>
    <q-btn icon="img:app-icons/menu/tags_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           :to="{ name: 'Tags' }"
           :ripple="false"
           v-show="!isActive('Tags')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Tags</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Stats' }"
           :ripple="false"
           icon="img:app-icons/menu/stats_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Stats')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Stats</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Stats' }"
           :ripple="false"
           icon="img:app-icons/menu/stats_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Stats')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Stats</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Messenger' }"
           :ripple="false"
           icon="img:app-icons/menu/messenger_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Messenger')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Messenger</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Messenger' }"
           :ripple="false"
           icon="img:app-icons/menu/messenger_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Messenger')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Messenger</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'DMS Equity' }"
           :ripple="false"
           icon="img:app-icons/menu/dms_equity_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('DMS Equity')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">DMS Equity</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'DMS Equity' }"
           :ripple="false"
           icon="img:app-icons/menu/dms_equity_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('DMS Equity')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">DMS Equity</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Digital Lead War' }"
           :ripple="false"
           icon="img:app-icons/menu/digital_lead_war_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Digital Lead War')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Digital Lead War</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Digital Lead War' }"
           :ripple="false"
           icon="img:app-icons/menu/digital_lead_war_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Digital Lead War')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Digital Lead War</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Email Blast' }"
           :ripple="false"
           icon="img:app-icons/menu/email_blast_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Email Blast')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Email Blast</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Email Blast' }"
           :ripple="false"
           icon="img:app-icons/menu/email_blast_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Email Blast')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Email Blast</span>
      </q-tooltip>
    </q-btn>

    <!--q-btn :to="{ name: 'Sold Report' }"
           :ripple="false"
           icon="img:app-icons/menu/sold_report_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Sold Report')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Sold Report</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Sold Report' }"
           :ripple="false"
           icon="img:app-icons/menu/sold_report_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Sold Report')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Sold Report</span>
      </q-tooltip>
    </q-btn-->

    <!--q-btn :to="{ name: 'Dealer Profile' }"
           :ripple="false"
           icon="img:app-icons/menu/dealer_profile_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Dealer Profile')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Dealer Profile</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Dealer Profile' }"
           :ripple="false"
           icon="img:app-icons/menu/dealer_profile_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Dealer Profile')"
           v-if="isSimpSocialIntegrationEnabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Dealer Profile</span>
      </q-tooltip>
    </q-btn-->

    <q-btn icon="img:app-icons/menu/broadcast_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100 disabled"
           flat
           :ripple="false"
           v-show="!isActive('Broadcasts') && !canUseBroadcast"
           @click="toggleProFeatureDialog(true)">
      <q-badge floating
               rounded
               color="orange">
      </q-badge>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Broadcasts</span>
      </q-tooltip>
    </q-btn>
    <q-btn icon="img:app-icons/menu/broadcast_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           flat
           :to="{ path: '/broadcasts' }"
           :ripple="false"
           v-show="isActive('Broadcasts') && canUseBroadcast">
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Broadcasts</span>
      </q-tooltip>
    </q-btn>
    <q-btn icon="img:app-icons/menu/broadcast_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           flat
           :to="{ path: '/broadcasts' }"
           :ripple="false"
           v-show="!isActive('Broadcasts') && canUseBroadcast">
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Broadcasts</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Settings' }"
           :ripple="false"
           icon="img:app-icons/menu/settings_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Settings')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Settings</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Settings' }"
           :ripple="false"
           icon="img:app-icons/menu/settings_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Settings')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Settings</span>
      </q-tooltip>
    </q-btn>
    <div class="mt-auto w-100"
         v-show="false">
      <div class="width-40 margin-auto position-relative">
        <q-separator class="separator-blur mt-1"
                     color="white"/>
      </div>
      <q-btn :icon="modeIcon"
             :ripple="false"
             padding="none"
             size="0.75rem"
             align="center"
             class="nav-icons w-100"
             @click="$emit('toggleMode')"/>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as storage from 'src/plugins/helpers/storage'
import { simpsocialMixin, kycMixin, broadcastsMixin } from 'src/plugins/mixins'
import * as KycLogs from 'src/constants/kyc-logs'

export default {
  name: 'app-sidebar',

  props: {
    lightMode: {
      required: false,
      type: Boolean
    },

    xmasEnabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  mixins: [
    simpsocialMixin,
    kycMixin,
    broadcastsMixin
  ],

  computed: {
    ...mapState('auth', ['profile']),

    ...mapState(['statics', 'staticsLoaded']),

    ...mapState('cache', ['currentCompany']),

    isProd () {
      return storage.local.getItem('env') === 'production'
    },

    envName () {
      return storage.local.getItem('env')
    },

    appLogo () {
      switch (true) {
        case this.statics.whitelabel:
          return `img:${this.statics.logo_square.replace(/\//, '')}` // replace first occurrence of '/'
        case this.xmasEnabled:
          return 'img:app-icons/menu/xmas/logo_white.svg'
        default:
          return 'img:app-icons/menu/logo_white.svg'
      }
    },

    isDemoCompany () {
      return Object.values(process.env.DEMO_COMPANY_IDS).includes(this.currentCompany.id)
    },

    isKycAccount () {
      const status = this.profile?.company?.kyc_status
      return status !== KycLogs.KYC_STATUS_NONE
    }
  },

  data () {
    return {
      modeIcon: 'img:app-icons/menu/mode_gray.svg'
    }
  },

  methods: {
    isActive (name) {
      if (this.$route.name === 'Contact' && name === 'Contacts') {
        return true
      }

      if (['Inbox Contact', 'Inbox Channel', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Communication', 'Inbox View', 'Inbox View Contact Task'].includes(this.$route.name) && name === 'Inbox') {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && name === 'Settings') {
        return true
      }

      if (['Wallboard Agents', 'Wallboard Calls'].includes(this.$route.name) && name === 'Wallboard') {
        return true
      }

      return this.$route.name === name
    },

    async logoutAction () {
      try {
        const response = await this.logout()

        this.response = response?.data

        await this.$router.push({ name: 'Login' })
      } catch (err) {
        console.error(err)
      }
    },

    ...mapActions(['toggleProFeatureDialog']),

    ...mapActions('auth', ['logout'])
  },

  watch: {
    lightMode () {
      this.modeIcon = this.lightMode ? 'img:app-icons/menu/mode_gray.svg' : 'img:app-icons/menu/mode_gray.svg'
    }
  }
}
</script>
