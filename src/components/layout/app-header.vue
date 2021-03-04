<template>
  <q-toolbar class="header">
    <div class="d-flex h-100 align-items-center">
      <q-btn flat
             @click="toggleSidebar"
             round
             dense
             icon="img:app-icons/header/nav_icon-burger.svg"
             class="mobile-menu mr-2" />
      <img :src="pageIcon"
           class="page-icon pr-1"/>
      <div class="page-title font-weight-bold">
        {{ $route.name }}
      </div>
    </div>
    <div class="ml-auto d-flex h-100 align-items-center">
      <q-btn flat
             @click="toggleSidebar"
             round
             dense
             icon="img:app-icons/header/nav_icon-dialer.svg"
             class="mr-2 ml-auto"
             style="color: #202125;" />
      <q-btn flat
             @click="toggleSidebar"
             round
             dense
             icon="img:app-icons/header/nav_icon-notification.svg"
             class="mr-2 ml-auto"
             style="color: #202125;" />
      <q-btn-dropdown avatar
                      flat
                      round
                      dropdown-icon="img:app-icons/header/arrow-down.svg"
                      class="profile-menu ml-auto"
                      content-style="{ padding: '0' }">
        <template v-if="auth.user.profile"
                  v-slot:label>
          <div class="items-center no-wrap">
            <div class="text-center">
              <span class="w-40 avatar agent-avatar grey-300"
                    v-bind:style="avatarStyle(auth.user.profile.name)">
                  <span>{{ auth.user.profile.name | initials }}</span>
                  <i class="b-white bottom"
                     :class="[ $options.filters.agentStatusClass(auth.user.profile.agent_status) ]">
                  </i>
              </span>
            </div>
          </div>
        </template>
        <q-list class="list-drp">
          <q-item class="pl-3 pr-3"
                  v-close-popup
                  clickable>
            <q-item-section>
              Test 1
            </q-item-section>
          </q-item>
          <q-item class="pl-3 pr-3"
                  v-close-popup
                  clickable>
            Test 2
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </q-toolbar>
</template>

<script>
import { avatarMixin } from '../../boot/mixins'
import auth from 'boot/auth'

export default {
  name: 'app-header',

  mixins: [
    avatarMixin
  ],

  data () {
    return {
      auth: auth,
      pageIcons: {
        inbox: 'app-icons/menu/active/inbox.svg',
        contacts: 'app-icons/menu/active/contacts.svg',
        powerdialer: 'app-icons/menu/active/powerdialer.svg',
        dashboard: 'app-icons/menu/active/dashboard.svg'
      },
      pageIcon: null
    }
  },

  created () {
    this.updatePageIcon()
  },

  methods: {
    updatePageIcon () {
      if (this.$route.name) {
        let pageIndex = this.$route.name.toLowerCase().replace(' ')
        this.pageIcon = this.pageIcons[pageIndex]
      }
    },

    toggleSidebar () {
      this.$emit('toggleSidebar')
    }
  }
}
</script>
