<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn flat
             icon="img:app-icons/misc/logo_icon_white.svg"
             size="1.1rem"
             align="center"
             to="/"
             class="w-100 p-2" />
      <q-separator class="separator-blur mt-1"
                   color="white" />
      <q-space class="p-2"/>
    </div>
    <q-btn flat
           icon="img:app-icons/menu/inbox_white.svg"
           size="0.9rem"
           align="center"
           :to="{ name: 'Inbox' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Inbox') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/contacts_white.svg"
           size="0.9rem"
           align="center"
           :to="{ name: 'Contacts' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Contacts') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/powerdialer_white.svg"
           size="0.9rem"
           align="center"
           :to="{ name: 'Power Dialer' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Power Dialer') ? 'active' : '' ]"/>
    <q-btn flat
           icon="img:app-icons/menu/dashboard_white.svg"
           size="0.9rem"
           align="center"
           :to="{ name: 'Dashboard' }"
           class="nav-icons w-100 pt-2 pb-2 mt-1 mb-1"
           :class="[ isActive('Dashboard') ? 'active' : '' ]"/>
    <div class="mt-auto w-100">
      <q-separator class="separator-blur mt-1"
                   color="white" />
      <q-btn flat
             :icon="mode_icon"
             size="0.9rem"
             align="center"
             class="nav-icons w-100 pt-2 pb-2"
             :class="[ isActive('Dashboard') ? 'active' : '' ]"
             @click="$emit('toggleMode')" />
      <q-separator class="separator-blur"
                   color="white" />
      <q-btn flat
             icon="img:app-icons/menu/settings_white.svg"
             size="0.9rem"
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
                       color="black" />
          <q-item clickable
                  v-close-popup
                  @click="logout"
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
import auth from 'boot/auth'

export default {
  name: 'app-sidebar',

  props: {
    light_mode: {
      required: false,
      type: Boolean
    }
  },

  data () {
    return {
      auth: auth,
      mode_icon: 'img:app-icons/menu/light_mode.svg'
    }
  },

  methods: {
    isActive (name) {
      return this.$route.name === name
    },

    logout () {
      let deviceInfo = null
      const isMobile = this.$q.platform.is.cordova
      if (isMobile) {
        deviceInfo = {
          registration_id: localStorage.getItem('registrationId'),
          registration_type: localStorage.getItem('registrationType'),
          model: window.device.model,
          platform: window.device.platform,
          is_virtual: window.device.isVirtual,
          uuid: window.device.uuid,
          version: window.device.version,
          manufacturer: window.device.manufacturer,
          serial: window.device.serial,
          app_version: localStorage.getItem('version')
        }
      }
      this.auth.logout(deviceInfo).then(res => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    }
  },

  watch: {
    light_mode () {
      this.mode_icon = this.light_mode ? 'img:app-icons/menu/light_mode.svg' : 'img:app-icons/menu/night_mode.svg'
    }
  }
}
</script>
