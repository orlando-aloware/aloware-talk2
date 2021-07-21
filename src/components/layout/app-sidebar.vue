<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn flat
             icon="img:app-icons/menu/logo_white.svg"
             size="1.1rem"
             align="center"
             to="/"
             class="w-100 p-2">
      </q-btn>
    </div>
    <q-btn flat
           icon="img:app-icons/menu/inbox_gray.svg"
           size="0.75rem"
           align="center"
           :to="{ name: 'Inbox' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Inbox') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/contacts_gray.svg"
           size="0.75rem"
           align="center"
           :to="{ name: 'Contacts' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Contacts') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/power_dialer_gray.svg"
           size="0.75rem"
           align="center"
           :to="{ name: 'Power Dialer' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Power Dialer') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/stats_gray.svg"
           size="0.75rem"
           align="center"
           :to="{ name: 'Dashboard' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Dashboard') ? 'active' : '' ]"/>
    <div class="mt-auto w-100">
      <q-separator class="separator-blur mt-1"
                   color="white"/>
      <q-btn flat
             :icon="modeIcon"
             size="0.75rem"
             align="center"
             class="nav-icons w-100 pt-2 pb-2"
             :class="[ isActive('Dashboard') ? 'active' : '' ]"
             @click="$emit('toggleMode')"/>
      <q-separator class="separator-blur"
                   color="white"/>
      <q-btn flat
             icon="img:app-icons/menu/settings_gray.svg"
             size="0.75rem"
             align="center"
             class="nav-icons w-100 pt-2 pb-2"
             :class="[ isActive('Dashboard') ? 'active' : '' ]">
        <q-menu fit anchor="top right"
                elf="bottom left"
                :offset="[10, 0]">
          <q-item clickable
                  class="pl-3 pr-3"
                  v-close-popup>
            <q-item-section>
              Profile
            </q-item-section>
          </q-item>
          <q-separator class="separator-blur"
                       color="black"/>
          <q-item clickable
                  v-close-popup
                  @click="logoutAction"
                  class="pl-3 pr-3">
            <q-item-section>
              Log-out
            </q-item-section>
          </q-item>
        </q-menu>
      </q-btn>
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

  data () {
    return {
      modeIcon: 'img:app-icons/menu/mode_gray.svg'
    }
  },

  methods: {
    isActive (name) {
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
