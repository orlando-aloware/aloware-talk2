<template>
  <div>
    {{ shouldShowIncomingCallMenu ? 'S' : 'N' }}
    <!-- Incoming Call-->
    <!-- only show this if call is incoming and is not a parked call-->
    <div class="text-grey-90 d-flex flex-row justify-center"
         v-if="shouldShowIncomingCallMenu">
      <!-- show reject button if call is not parked-->
      <div class="pl-0">
        <b-button variant="light"
                  size="sm"
                  class="bg-transparent no-border no-box-shadow p-0"
                  v-if="isShowIgnoreCallIcon || isShowCancelCallIcon"
                  data-testid="item-reject-btn"
                  @click="onRejectCall">
          <q-tooltip anchor="top middle"
                     self="center middle"
                     v-if="!isShowIgnoreCallIcon || tooltipMessage">
            {{ isShowIgnoreCallIcon ? tooltipMessage : 'Decline' }}
          </q-tooltip>
          <!-- show remove icon for call fishing mode -->
          <ignore-call-icon height="24"
                            width="24"
                            data-testid="item-ignore-call-icon"
                            v-if="isShowIgnoreCallIcon" />
          <!-- only show reject button if -->
          <cancel-call-icon data-testid="item-cancel-call-icon" v-else-if="isShowCancelCallIcon" />
        </b-button>
      </div>
      <div v-if="isIncomingCall"
           class="pl-1 pr-0">
        <b-button variant="light"
                  size="sm"
                  class="bg-transparent no-border no-box-shadow p-0"
                  data-testid="item-answer-btn"
                  @click="onAcceptCall">
          <q-tooltip anchor="top middle"
                     self="center middle"
                     data-testid="item-answer-tooltip"
                     v-if="!showIncomingCallMenu">
            Answer
          </q-tooltip>
          <accept-call-icon data-testid="item-accept-call-icon" />
          <q-menu content-class="live-call-options"
                  anchor="top right"
                  self="top left"
                  fit
                  :offset="[5, 9]"
                  data-testid="item-answer-menu"
                  v-model="showIncomingCallMenu"
                  v-if="isDialerOrAgentOnCall"
                  @hide="showIncomingCallMenu = false">
            <q-list>
              <q-item clickable
                      v-close-popup
                      data-testid="item-current-call-answer-item"
                      @click="onParkCurrentCallAndAnswer">
                <q-item-section class="d-inline-flex">
                  <park-call-icon color="#9B51E0"
                                  class="park-call-icon"
                                  width="11.7"
                                  data-testid="item-park-call-icon"
                                  height="12.35" />
                  <span>Park Current Call &amp; Answer</span>
                </q-item-section>
              </q-item>
              <q-item clickable
                      v-close-popup
                      data-testid="item-hang-up-call-answer-item"
                      @click="onHangUpCurrentCallAndAnswer">
                <q-item-section>
                  <hangup-icon width="16"
                               height="16"
                               data-testid="item-hang-up-icon"
                               class="hangup-icon" />
                  <span>Hang up Current Call &amp; Answer</span>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </b-button>
      </div>
    </div>

    <!-- Answered / In Progress Call-->
    <div class="text-grey-90 d-flex flex-row justify-center"
         v-else-if="shouldShowAnsweredCallMenu">
      <div class="pl-0">
        <b-button variant="light"
                  size="sm"
                  class="bg-transparent no-border no-box-shadow p-0"
                  data-testid="item-hang-up-btn-call"
                  @click="onHangUpCall">
          <q-tooltip anchor="top middle"
                     self="center middle">
            Hang up
          </q-tooltip>
          <cancel-call-icon />
        </b-button>
      </div>
    </div>

    <!-- Parked Call-->
    <div class="text-grey-90 d-flex flex-row justify-center"
         v-else-if="shouldShowParkedCallMenu">
      <div class="pl-0">
        <b-button variant="light"
                  size="sm"
                  class="bg-transparent no-border no-box-shadow p-0"
                  data-testid="item-unpark-btn"
                  @click="onUnparkCall">
          <parked-call-icon />
          <q-tooltip anchor="top middle"
                     self="center middle"
                     data-testid="item-unpark-tooltip"
                     v-if="!showParkedCallMenu">
            Unpark
          </q-tooltip>
          <q-menu content-class="live-call-options"
                  anchor="top right"
                  self="top left"
                  fit
                  :offset="[5, 9]"
                  v-model="showParkedCallMenu"
                  v-if="isDialerOrAgentOnCall"
                  data-testid="item-parked-menu"
                  @hide="showParkedCallMenu = false">
            <q-list>
              <q-item clickable
                      v-close-popup
                      data-testid="item-park-call-connect-item"
                      @click="onParkCurrentCallAndConnect">
                <q-item-section class="d-inline-flex">
                  <park-call-icon color="#9B51E0"
                                  class="park-call-icon"
                                  width="11.7"
                                  height="12.35" />
                  <span>Park Current Call &amp; Connect</span>
                </q-item-section>
              </q-item>
              <q-item clickable
                      v-close-popup
                      data-testid="item-hang-up-call-connect-item"
                      @click="onHangupCurrentCallAndConnect">
                <q-item-section>
                  <hangup-icon width="16"
                               height="16"
                               data-testid="item-hangup-icon"
                               class="hangup-icon" />
                  <span>Hang up Current Call &amp; Connect</span>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import ParkedCallIcon from 'components/icons/parked-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import { liveCallsMixin } from 'src/plugins/mixins'
// import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  name: 'live-call-controls',

  mixins: [liveCallsMixin],

  components: {
    IgnoreCallIcon,
    ParkCallIcon,
    HangupIcon,
    ParkedCallIcon,
    AcceptCallIcon,
    CancelCallIcon
  },

  props: {
    communication: {
      type: Object,
      default: null
    },

    contact: {
      type: Object,
      default: null
    }
  },

  computed: {
    isIncomingCall () {
      return this.isIncomingLiveCall
      // const isCallFishing = this.isCallFishingMode && this.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
      // const isIncomingCall = !this.isCallFishingMode && this.isIncomingLiveCall

      // return isCallFishing || isIncomingCall
    },

    tooltipMessage () {
      if (!this.communication || !this.communication.campaign) {
        return ''
      }

      return this.isPersonalInbox ? 'Reject' : 'Ignore'
    }
  }
}
</script>
