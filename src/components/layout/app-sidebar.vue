<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn :icon="appLogo"
             size="1.1rem"
             align="center"
             to="/"
             class="app-logo w-100 p-2"
             flat>
      </q-btn>
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

    <q-btn :ripple="false"
           icon="img:app-icons/menu/power_dialer_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100 disabled"
           v-show="!isActive('Power Dialer') && !profile.auto_dialer_enabled"
           flat
           @click="toggleProFeatureDialog(true)">
      <q-badge floating
               rounded
               color="orange">
      </q-badge>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Power Dialer</span>
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
           v-show="!isActive('Power Dialer') && profile.auto_dialer_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Power Dialer</span>
      </q-tooltip>
    </q-btn>

    <q-btn :to="{ name: 'Wallboard' }"
           :ripple="false"
           icon="img:app-icons/menu/wallboard_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Wallboard')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Wallboard</span>
      </q-tooltip>
    </q-btn>
    <q-btn :to="{ name: 'Wallboard' }"
           :ripple="false"
           icon="img:app-icons/menu/wallboard_grey.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Wallboard')"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Wallboard</span>
      </q-tooltip>
    </q-btn>

    <q-btn :ripple="false"
           icon="img:app-icons/menu/calendar_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100 disabled"
           v-show="!isActive('Calendar') && !profile.calendar_enabled"
           flat
           @click="toggleProFeatureDialog(true)">
      <q-badge floating
               rounded
               color="orange">
      </q-badge>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Calendar</span>
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
           v-show="!isActive('Calendar') && profile.calendar_enabled"
           flat>
      <q-tooltip anchor="center right"
                 self="center left"
                 :offset="[-5, 0]">
        <span class="font-weight-bold text-sm">Calendar</span>
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

  computed: {
    ...mapState('auth', ['profile']),
    isProd () {
      return storage.local.getItem('env') === 'production'
    },
    envName () {
      return storage.local.getItem('env')
    },
    appLogo () {
      return this.xmasEnabled
        ? 'img:app-icons/menu/xmas/logo_white.svg'
        : 'img:app-icons/menu/logo_white.svg'
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

      if (['Inbox Contact', 'Inbox Channel', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Communication'].includes(this.$route.name) && name === 'Inbox') {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && name === 'Settings') {
        return true
      }

      if (['Wallboard Users', 'Wallboard Calls'].includes(this.$route.name) && name === 'Wallboard') {
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
