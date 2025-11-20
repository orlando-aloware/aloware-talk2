<template>
  <div class="d-flex align-items-start flex-column h-100 w-100">
    <div class="w-100">
      <q-btn v-if="staticsLoaded"
             :icon="appLogo"
             align="center"
             class="app-logo w-100 p-2"
             flat
             size="1.1rem"
             to="/">
      </q-btn>
      <div v-else
           class="w-100 d-flex align-items-center justify-center px-1 flex-column"
           style="height: 61px;">
        <q-spinner-bars color="white"
                        size="18px">
        </q-spinner-bars>
      </div>
    </div>

    <app-sidebar-nav-link
      v-if="hasCompanyTeamInboxEnabled"
      :isActive="isActive(TEAMINBOXES_MENU_TITLE)"
      :isSidebarExpanded="isSidebarExpanded"
      :title="TEAMINBOXES_MENU_TITLE"
      :to="{ name: TEAMINBOXES_MENU_TITLE }"
      icon="multi_inbox"
      padding="10px 0px 10px 22px"
    >
      <template v-slot:icon>
        <div
          v-if="isSidebarExpanded"
          class="ml-auto mr-3"
        >
          <information-circle-icon
            id="teaminbox-helper-icon"
            :color="isActive('Team Inboxes') ? '#FFF' : '#9797AE'"
            height="20"
            width="20"
          />
          <b-tooltip
            boundary="#teaminbox-helper-icon"
            custom-class="talk-table__tooltip talk-table__tooltip--md"
            placement="right"
            target="teaminbox-helper-icon"
          >
            {{ TEAMINBOX_TOOLTIP_TEXT }}
          </b-tooltip>
        </div>
      </template>
    </app-sidebar-nav-link>

    <app-sidebar-nav-link
      :isActive="isActive(COMMUNICATIONS_MENU_TITLE)"
      :isSidebarExpanded="isSidebarExpanded"
      :title="COMMUNICATIONS_MENU_TITLE"
      :to="{name: DEFAULT_COMMUNICATIONS_ROUTE_NAME}"
      icon="communications"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Contacts')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Contacts'}"
      icon="contacts"
      title="Contacts"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Lists')"
      :isSidebarExpanded="isSidebarExpanded"
      icon="lists"
      padding="10px 20px"
      title="Lists"
      to="/lists-management"
    />

    <app-sidebar-nav-link
      v-if="profile.auto_dialer_enabled"
      :isActive="isActive('Power Dialer')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Power Dialer'}"
      icon="power_dialer"
      title="Power Dialer"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Wallboard')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Wallboard'}"
      icon="wallboard"
      padding="10px 22px"
      title="Wallboard"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Calendar')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Calendar', query: { view: 'month' }}"
      icon="calendar"
      padding="10px 22px"
      title="Calendar"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Tags')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Tags'}"
      icon="tags"
      padding="10px 22px"
      title="Tags"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Stats')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Stats'}"
      icon="stats"
      title="Stats"
    />

    <app-sidebar-nav-link
      :className="{'disabled': !canUseBroadcast}"
      :isActive="isActive('Broadcasts')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Broadcasts'}"
      icon="broadcast"
      title="Broadcasts"
      @click="handleBroadcastsClick"
    >
      <template v-slot:badge-expanded>
        <q-badge
          v-show="!canUseBroadcast"
          class="mb-2"
          color="orange"
          rounded
        />
      </template>
      <template v-slot:badge>
        <q-badge
          v-show="!canUseBroadcast"
          color="orange"
          floating
          rounded
          style="top:-5px; right: -5px"
        />
      </template>
    </app-sidebar-nav-link>

    <app-sidebar-nav-link
      :isActive="isActive('AloAi')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'AloAi'}"
      icon="aloai"
      padding="10px 20px"
      title="AloAi"
    />

    <app-sidebar-nav-link
      :isActive="isActive('Settings')"
      :isSidebarExpanded="isSidebarExpanded"
      :to="{name: 'Settings'}"
      icon="settings"
      title="Settings"
    />

    <div class="mt-auto w-100">
      <div class="width-40 margin-auto position-relative">
        <q-separator class="separator-blur mt-1"
                     color="white" />
      </div>
      <q-btn v-if="false"
             :icon="modeIcon"
             :ripple="false"
             align="center"
             class="nav-icons w-100"
             padding="none"
             size="0.75rem"
             @click="$emit('toggleMode')" />

      <q-btn :align="isSidebarExpanded ? 'right' : 'center'"
             :icon="sidebarIcon"
             :padding="isSidebarExpanded ? '10px 20px' : 'none'"
             :ripple="false"
             class="nav-icons w-100 text-menu-purple custom-rotate-90 bordered-menu-icon"
             size="0.75rem"
             @click="toggleSidebar">
        <q-tooltip :offset="[-5, 0]"
                   anchor="center right"
                   self="center left">
          <span
            class="font-weight-bold text-sm">{{ isSidebarExpanded ? 'Collapse the navigation' : 'Expand the navigation'
            }}</span>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as storage from 'src/plugins/helpers/storage'
import { broadcastsMixin, kycMixin, userMixin } from 'src/plugins/mixins'
import {
  COMMUNICATIONS_MENU_TITLE,
  DEFAULT_COMMUNICATIONS_ROUTE_NAME,
  INBOXES_MENU_TITLE,
  TEAMINBOXES_MENU_COMMUNICATIONS_TITLE,
  TEAMINBOXES_MENU_ITEMS_TITLE,
  TEAMINBOXES_MENU_TITLE
} from 'src/router/routes'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import AppSidebarNavLink from 'components/layout/app-sidebar-nav-link.vue'

const TEAMINBOX_TOOLTIP_TEXT = 'Team Inboxes is a centralized workspace where Ring Groups allow multiple agents to view and respond to conversations, ensuring faster replies, better collaboration, and no missed messages.'

export default {
  name: 'app-sidebar',

  components: {
    AppSidebarNavLink,
    InformationCircleIcon
  },

  props: {
    isSidebarExpanded: {
      type: Boolean,
      default: true
    },

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
    kycMixin,
    broadcastsMixin,
    userMixin
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
          if (this.isSidebarExpanded) {
            return `img:${this.statics.logo_inverse.replace(/\//, '')}` // replace first occurrence of '/'
          }
          return `img:${this.statics.logo_square.replace(/\//, '')}` // replace first occurrence of '/'
        case this.xmasEnabled:
          if (this.isSidebarExpanded) {
            return 'img:app-icons/menu/xmas/xmas-logo-inverse.png'
          }
          return 'img:app-icons/menu/xmas/logo_white.svg'
        default:
          if (this.isSidebarExpanded) {
            return 'img:app-icons/menu/aloware-logo-original-inverse.svg'
          }
          return 'img:app-icons/menu/logo_white.svg'
      }
    },

    sidebarIcon () {
      return this.isSidebarExpanded ? 'unfold_less' : 'unfold_more'
    }

  },

  data () {
    return {
      modeIcon: 'img:app-icons/menu/mode_gray.svg',
      COMMUNICATIONS_MENU_TITLE,
      INBOXES_MENU_TITLE,
      TEAMINBOX_TOOLTIP_TEXT,
      TEAMINBOXES_MENU_TITLE,
      TEAMINBOXES_MENU_ITEMS_TITLE,
      TEAMINBOXES_MENU_COMMUNICATIONS_TITLE,
      DEFAULT_COMMUNICATIONS_ROUTE_NAME
    }
  },

  methods: {
    handleBroadcastsClick (e) {
      if (!this.canUseBroadcast) {
        e.preventDefault()
        this.toggleProFeatureDialog(true)
      }
    },

    isActive (name) {
      if (this.$route.name === 'Contact' && name === 'Contacts') {
        return true
      }

      // make Lists active when navigating from lists management
      if (this.$route.meta?.isFromListsManagement) {
        return name === 'Lists'
      }

      if (['Inbox Contact', 'Inbox Channel', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact Communication', 'Inbox View', 'Inbox View Contact Task'].includes(this.$route.name) && name === 'Inbox') {
        return true
      }

      if ([TEAMINBOXES_MENU_ITEMS_TITLE, TEAMINBOXES_MENU_COMMUNICATIONS_TITLE].includes(this.$route.name) && name === TEAMINBOXES_MENU_TITLE) {
        return true
      }

      // if the route name includes Communications and name is Communications
      if (this.$route.meta?.title === COMMUNICATIONS_MENU_TITLE && name === 'Communications') {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && name === 'Settings') {
        return true
      }

      if (['Wallboard Agents', 'Wallboard Calls'].includes(this.$route.name) && name === 'Wallboard') {
        return true
      }

      if (this.$route.name === 'AloAi' && name === 'AloAi') {
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

    toggleSidebar () {
      this.$emit('toggleSidebarExpansion', this.isSidebarExpanded)
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
