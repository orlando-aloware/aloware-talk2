<template>
  <q-toolbar class="page-header pl-4 pr-4">
    <div class="d-flex h-100 align-items-center">
      <h1>{{ $route.name }}</h1>
    </div>
    <div class="ml-auto d-none d-lg-block h-100">
      <div class="d-flex h-100 align-items-center">
        <q-item>
          <q-item-section>
            <q-item-label class="text-regular _500">{{ user.profile.first_name }}</q-item-label>
          </q-item-section>
          <q-item-section class="profile-menu"
                          avatar>
            <q-btn-dropdown :ripple="false"
                            :disabled="loadingAgentStatus || ['RECEIVED_CALL_INVITE', 'CALL_CONNECTED'].includes(dialer.currentStatus)"
                            :menu-offset="[4, 16]"
                            class="tab-dropdown"
                            ref="menu"
                            auto-close
                            flat>
              <template v-slot:label>
                <q-avatar size="34px"
                          v-if="user.profile"
                          :style="avatarStyle(user.profile.name)">
                  {{ user.profile.name | fixName | initials }}
                  <q-badge :color="color(user.profile.agent_status)"
                           class="availability-status"
                           floating>
                  </q-badge>
                </q-avatar>
              </template>

              <q-list class="tab-dropdown-list no-select">
                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_OFFLINE)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'text-primary _500' : '']"
                        dense
                        clickable>
                  <div class="d-flex align-items-center">
                    <q-badge :color="color(AgentStatus.AGENT_STATUS_OFFLINE)"
                             class="rounded-badge q-mr-sm">
                    </q-badge>
                    Offline
                  </div>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'text-primary _500' : '']"
                        dense
                        clickable>
                  <div class="d-flex align-items-center">
                    <q-badge :color="color(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                             class="rounded-badge q-mr-sm">
                    </q-badge>
                    Available
                  </div>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'text-primary _500' : '']"
                        dense
                        clickable>
                  <div class="d-flex align-items-center">
                    <q-badge :color="color(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                             class="rounded-badge q-mr-sm">
                    </q-badge>
                    Busy
                  </div>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK ? 'text-primary _500' : '']"
                        dense
                        clickable>
                  <div class="d-flex align-items-center">
                    <q-badge :color="color(AgentStatus.AGENT_STATUS_ON_BREAK)"
                             class="rounded-badge q-mr-sm">
                    </q-badge>
                    On-break
                  </div>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-item-section>
        </q-item>

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <q-item>
          <q-btn :ripple="false"
                 :icon="dialerIcon"
                 size="40px"
                 padding="none"
                 align="center"
                 flat>
            <q-menu :offset="[0, 10]"
                    anchor="bottom end"
                    self="top right"
                    @before-show="showDialer"
                    @before-hide="hideDialer">
              <div class="row no-wrap q-pa-md width-290">
                <div class="col no-padding max-width-266">
                  <line-selector></line-selector>

                  <div class="tab-links d-inline-flex w-100">
                    <b-link href="#"
                            :class="{ active : mode === 'call' }"
                            @click="setMode('call')">
                      Call
                    </b-link>
                    <b-link href="#"
                            :class="{ active : mode === 'text' }"
                            @click="setMode('text')">
                      Text
                    </b-link>
                  </div>
                  <div class="d-inline-flex align-items-center justify-content-between w-100">
                    <b-form-group :label="label"
                                  class="mt-2 mb-0">
                      <b-form-input v-model="phoneNumber"
                                    type="text"
                                    class="width-214 important"
                                    placeholder="Enter a phone number"
                                    required>
                      </b-form-input>
                    </b-form-group>
                    <q-btn :ripple="true"
                           icon="img:app-icons/dialer/call_btn_small.svg"
                           size="36px"
                           class="icon-btn auto-size"
                           align="right"
                           padding="none"
                           flat>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
        </q-item>
      </div>
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">

      </div>
    </div>
  </q-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import * as AgentStatus from '../../constants/agent-status'
import { aclMixin, agentMixin, avatarMixin } from 'src/plugins/mixins'
import LineSelector from 'components/dialer/line-selector'

export default {
  name: 'app-header',
  components: { LineSelector },
  mixins: [aclMixin, avatarMixin, agentMixin],

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false,
      label: 'Call a number',
      mode: 'call',
      phoneNumber: '',
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

    personalPhoneNumber () {
      let found = this.campaigns.find(campaign => campaign.id === this.user.profile.campaign_id)
      if (found && found.incoming_numbers.length) {
        return found.incoming_numbers[0].phone_number
      }
      return ''
    }
  },

  methods: {
    toggleSidebar () {
      this.$emit('toggleSidebar')
    },

    showDialer () {
      this.dialerStatus = true
      this.dialerIcon = 'img:app-icons/header/dialer_active.svg'
      this.$emit('showDialer')
    },

    hideDialer () {
      this.dialerStatus = false
      this.dialerIcon = 'img:app-icons/header/dialer_gray.svg'
      this.$emit('hideDialer')
    },

    changeStatus (status) {
      this.changeAgentStatus(status)
      this.$refs.menu.hide()
    },

    setMode (mode) {
      this.mode = mode
      switch (mode) {
        case 'call':
          this.label = 'Call a number'
          break
        case 'text':
          this.label = 'Text a number'
          break
      }
    }
  }
}
</script>
