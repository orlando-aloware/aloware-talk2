<template>
  <q-toolbar class="page-header">
    <div class="d-flex h-100 align-items-center">
      <q-btn flat
             @click="toggleSidebar"
             round
             dense
             icon="img:app-icons/header/nav_icon-burger.svg"
             class="mobile-menu d-none d-sm-block d-lg-none mr-2" />
      <q-img :src="pageIcon"
             height="20px"
             width="20px"
             class="page-icon mr-1 d-none d-sm-block d-lg-none" />
      <div class="page-title font-weight-bold">
        {{ $route.name }}
      </div>
    </div>
    <div class="ml-auto d-none d-lg-block">
      <div class="d-flex h-100 align-items-center">
<!--        <q-btn flat-->
<!--               @click="toggleSidebar"-->
<!--               round-->
<!--               dense-->
<!--               icon="img:app-icons/header/nav_icon-dialer.svg"-->
<!--               class="mr-2 ml-auto"-->
<!--               style="color: #202125;" />-->
        <call-active name="May Kerr" time="00:00" />
        <q-btn flat
               @click="toggleSidebar"
               round
               dense
               icon="img:app-icons/header/nav_icon-notification.svg"
               class="mr-2 ml-auto"
               style="color: #202125;" />
        <div v-if="user.profile"
             class="d-none d-lg-block mr-2 ml-auto">
          <span>
            <div class="small-text">
              <strong>{{ user.profile.name }}</strong>
              <template v-if="phoneNumber">
                | {{ phoneNumber | fixPhone }}
              </template>
            </div>
            <div class="xs-text inactive status-label w-100 text-right">{{ statusLabel }}</div>
          </span>
        </div>
        <q-btn-dropdown avatar
                        flat
                        round
                        dropdown-icon="img:app-icons/header/arrow-down.svg"
                        class="profile-menu ml-auto d-none d-lg-block"
                        content-style="{ padding: '0' }">
          <template v-if="user.profile"
                    v-slot:label>
            <div class="items-center no-wrap">
              <div class="text-center">
                <span class="d-flex justify-content-center align-items-center w-40 avatar agent-avatar grey-300"
                      v-bind:style="avatarStyle(user.profile.name)">
                    <span>{{ user.profile.name | initials }}</span>
                    <i class="b-white bottom"
                       :class="[ $options.filters.agentStatusClass(user.profile.agent_status) ]">
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
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">
        <q-btn flat
               round
               dense
               icon="img:app-icons/header/search.svg"
               class="mr-2 ml-auto"
               style="color: #202125;" />
        <q-btn flat
               @click="toggleSidebar"
               round
               dense
               icon="img:app-icons/header/inactive/notification.svg"
               class="mr-2 ml-auto"
               style="color: #202125;" />
      </div>
    </div>
  </q-toolbar>
</template>

<script>
import * as AgentStatus from '../../constants/agent-status'
import { avatarMixin } from '../../boot/mixins'
import { mapGetters, mapState } from 'vuex'

import CallActive from 'components/inbox/call-active/call-active'

export default {
  name: 'app-header',
  components: { CallActive },
  mixins: [
    avatarMixin
  ],
  data () {
    return {
      pageIcons: {
        inbox: 'app-icons/menu/inbox_green.svg',
        contacts: 'app-icons/menu/contacts_green.svg',
        powerdialer: 'app-icons/menu/powerdialer_green.svg',
        dashboard: 'app-icons/menu/dashboard_green.svg',
        account: 'app-icons/menu/account_green.svg',
        settings: 'app-icons/menu/settings_green.svg'
      },
      pageIcon: null,
      AgentStatus
    }
  },

  computed: {
    ...mapState(['dialer', 'campaigns']),
    ...mapGetters('auth', ['user']),
    statusLabel () {
      switch (this.user.profile.agent_status) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'Offline'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'Available'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'On-break'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
        case AgentStatus.AGENT_STATUS_ON_CALL:
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
        case AgentStatus.AGENT_STATUS_RINGING:
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'Busy'
        default:
          return 'Offline'
      }
    },

    phoneNumber () {
      let found = this.campaigns.find(campaign => campaign.id === this.user.profile.campaign_id)
      if (found && found.incoming_numbers.length) {
        return found.incoming_numbers[0].phone_number
      }
      return ''
    }
  },

  created () {
    this.updatePageIcon()
  },

  methods: {
    updatePageIcon () {
      if (this.$route.name) {
        let pageIndex = this.$route.name.toLowerCase().replace(' ', '')
        this.pageIcon = this.pageIcons[pageIndex]
      }
    },

    toggleSidebar () {
      this.$emit('toggleSidebar')
    }
  },

  watch: {
    '$route.name': function () {
      this.updatePageIcon()
    }
  }
}
</script>
