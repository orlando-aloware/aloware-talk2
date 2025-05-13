<template>
  <div :class="['communication', 'd-flex', 'flex-row', { active: isActive, 'live-call-item': isLiveCall}]">
    <div class="communication__avatar pr-3">
      <avatar width="34"
              height="34"
              :color-module-id="contactId"
              :name="contactName || defaultEmptyName">
        <unread-counter
              :unread-properties="unreadProperties" />
      </avatar>
    </div>
    <div class="d-flex flex-column flex-grow-1">
      <div>
        <contact-name :name="contactName || defaultEmptyName"
                      :repeats="repeats" />
      </div>

      <div>
        <phone-number :phone-number="contactPhoneNumber" />
      </div>

      <div>
        <last-communication :disposition-status="dispositionStatus"
                            :type="type"
                            :direction="direction"
                            :callback-status="callbackStatus"
                            :body="body"
                            :is-live-call-item="isLiveCall"
                            v-if="type" />
      </div>

      <div v-if="campaignId">
        <campaign :campaign-id="campaignId"
                  :team-inbox-id="teamInboxId" />
      </div>
    </div>
    <div class="pr-2"
         v-if="!isLiveCall">
      <last-communication-date :date="date"
                               :last-communication-type="type"
                               :last-communication-current-status="currentStatus"
                               v-if="date" />
    </div>
    <div class="d-flex align-items-center pr-2" v-if="isLiveCall">
      <div>
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
              <!-- show remove icon for call fishing mode -->
              <ignore-call-icon height="24"
                                width="24"
                                data-testid="item-ignore-call-icon"
                                v-if="isShowIgnoreCallIcon" />
              <q-tooltip anchor="top middle"
                         self="center middle">
                {{ isShowIgnoreCallIcon ? 'Ignore' : 'Decline' }}
              </q-tooltip>
              <!-- only show reject button if -->
              <cancel-call-icon data-testid="item-cancel-call-icon" v-if="isShowCancelCallIcon" />
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
             v-if="shouldShowAnsweredCallMenu">
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
             v-if="shouldShowParkedCallMenu">
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
    </div>
  </div>
</template>

<script>
import Avatar from './avatar.vue'
import UnreadCounter from './unread-counter.vue'
import Campaign from './campaign.vue'
import ContactName from './contact-name.vue'
import LastCommunication from './last-communication.vue'
import LastCommunicationDate from './last-communication-date.vue'
import PhoneNumber from './phone-number.vue'
import { avatarMixin, liveCallsMixin, teamInboxPropsMixin } from 'src/plugins/mixins'
import HangupIcon from 'components/icons/hangup-icon.vue'
import ParkCallIcon from 'components/icons/park-call-icon.vue'
import ParkedCallIcon from 'components/icons/parked-call-icon.vue'
import AcceptCallIcon from 'components/icons/accept-call-icon.vue'
import CancelCallIcon from 'components/icons/cancel-call-icon.vue'
import IgnoreCallIcon from 'components/icons/ignore-call-icon.vue'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  mixins: [
    avatarMixin,
    liveCallsMixin,
    teamInboxPropsMixin
  ],

  components: {
    IgnoreCallIcon,
    CancelCallIcon,
    AcceptCallIcon,
    ParkedCallIcon,
    ParkCallIcon,
    HangupIcon,
    Avatar,
    UnreadCounter,
    Campaign,
    ContactName,
    LastCommunication,
    LastCommunicationDate,
    PhoneNumber
  },

  props: {
    contactId: {
      type: [Number, String],
      default: 0
    },

    contactName: {
      type: String,
      default: null
    },

    contactPhoneNumber: {
      type: String,
      default: null
    },

    campaignId: {
      type: [Number, String],
      default: null
    },

    dispositionStatus: {
      type: [Number, String],
      required: true
    },

    type: {
      type: [Number, String],
      default: null
    },

    callbackStatus: {
      type: [Number, String],
      required: false
    },

    body: {
      type: String,
      default: ''
    },

    direction: {
      type: [String, Number],
      required: true
    },

    date: {
      type: String,
      default: null
    },

    currentStatus: {
      type: [String, Number],
      required: false
    },

    unreadProperties: {
      type: Object,
      required: false
    },

    isActive: {
      type: Boolean,
      default: false
    },

    repeats: {
      type: Number,
      required: false
    },

    defaultEmptyName: {
      type: String,
      default: 'No Name'
    },

    communication: {
      type: Object,
      default: null
    },

    contact: {
      type: Object,
      default: null
    }
  },

  methods: {
    isIncomingCall () {
      const isCallFishing = this.isCallFishingMode && this.currentStatus === CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
      const isIncomingCall = !this.isCallFishingMode && this.isIncomingLiveCall

      return isCallFishing || isIncomingCall
    }
  }
}
</script>

<style lang="scss" scoped>
.communication {
  padding: 8px 8px 8px 8px;
  min-height: 64px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;

  &__avatar {
    grid-area: communication__avatar;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.active {
    background-color: #E9F0FF;
  }

  &:hover {
    background-color: #E9F0FF;
  }

  &.live-call-item {
    background-color: #e1ebfe;
  }
}
</style>
