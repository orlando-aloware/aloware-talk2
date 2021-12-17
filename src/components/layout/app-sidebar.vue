<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn icon="img:app-icons/menu/logo_white.svg"
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
    </q-btn>
    <q-btn :to="{ name: 'Inbox' }"
           :ripple="false"
           icon="img:app-icons/menu/inbox_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Inbox')"
           flat>
    </q-btn>

    <q-btn :to="{ name: 'Contacts' }"
           :ripple="false"
           icon="img:app-icons/menu/contacts_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Contacts')"
           flat>
    </q-btn>
    <q-btn :to="{ name: 'Contacts' }"
           :ripple="false"
           icon="img:app-icons/menu/contacts_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Contacts')"
           flat>
    </q-btn>

    <q-btn :to="{ name: 'Power Dialer' }"
           :ripple="false"
           icon="img:app-icons/menu/power_dialer_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Power Dialer')"
           v-if="isProdEnv"
           flat>
    </q-btn>
    <q-btn :to="{ name: 'Power Dialer' }"
           :ripple="false"
           icon="img:app-icons/menu/power_dialer_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Power Dialer')"
           v-if="isProdEnv"
           flat>
    </q-btn>

    <q-btn :to="{ name: 'Stats' }"
           :ripple="false"
           icon="img:app-icons/menu/stats_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Stats')"
           flat>
    </q-btn>
    <q-btn :to="{ name: 'Stats' }"
           :ripple="false"
           icon="img:app-icons/menu/stats_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Stats')"
           flat>
    </q-btn>

    <q-btn :to="{ name: 'Settings' }"
           :ripple="false"
           icon="img:app-icons/menu/settings_active.svg"
           align="left"
           padding="none"
           class="nav-icons w-100"
           v-show="isActive('Settings')"
           flat>
    </q-btn>
    <q-btn :to="{ name: 'Settings' }"
           :ripple="false"
           icon="img:app-icons/menu/settings_gray.svg"
           align="center"
           padding="none"
           class="nav-icons w-100"
           v-show="!isActive('Settings')"
           flat>
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
import { mapActions } from 'vuex'

export default {
  name: 'app-sidebar',

  props: {
    lightMode: {
      required: false,
      type: Boolean
    }
  },

  computed: {
    isProdEnv () {
      return process.env.NODE_ENV === 'development'
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

      if (['Inbox Contact', 'Inbox Channel', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Mention Communication'].includes(this.$route.name) && name === 'Inbox') {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && name === 'Settings') {
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

    ...mapActions('auth', ['logout'])
  },

  watch: {
    lightMode () {
      this.modeIcon = this.lightMode ? 'img:app-icons/menu/mode_gray.svg' : 'img:app-icons/menu/mode_gray.svg'
    }
  }
}
</script>
