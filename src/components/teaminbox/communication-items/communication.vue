<template>
  <div :class="['communication', 'd-flex', 'flex-row', { active: isActive, 'live-call-item': isLiveCall }]">
    <div class="communication__avatar pr-3">
      <avatar width="34"
              height="34"
              :color-module-id="contactId"
              :name="contactName || defaultEmptyName">
        <unread-counter
              :unread-properties="unreadProperties" />
      </avatar>
    </div>
    <div class="d-flex flex-column flex-grow-1 overflow-hidden">
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

      <div v-if="campaignId || campaign">
        <campaign :campaign-id="campaignId"
                  :campaign="campaign"
                  :team-inbox-id="teamInboxId"
                  :from-team-inbox="fromTeamInbox" />
      </div>

      <!-- Inbox name display for "All Inboxes" view -->
      <div v-if="shouldShowInboxName"
           class="d-flex align-items-center mt-1"
           data-testid="communication-inbox-name">
        <div class="communication__inbox-name d-flex align-items-center border bg-white rounded overflow-hidden">
          <inbox-o-icon width="15"
                        height="15"
                        class="flex-shrink-0 mr-1" />
          <span class="text-muted text-truncate">{{ inboxName }}</span>
        </div>
      </div>
    </div>
    <div class="pr-2"
         v-if="!isLiveCall">
      <last-communication-date :date="date"
                               :last-communication-type="type"
                               :last-communication-current-status="currentStatus"
                               v-if="date" />
    </div>
    <div class="d-flex align-items-center pr-2"
         v-if="isLiveCall">
      <live-call-controls :communication="communication"
                          :contact="contact" />
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
import InboxOIcon from 'components/icons/inbox-o-icon'
import { avatarMixin, liveCallsMixin, teamInboxPropsMixin } from 'src/plugins/mixins'
import LiveCallControls from 'components/shared/live-call-controls'
import { mapState } from 'vuex'

export default {
  mixins: [
    avatarMixin,
    liveCallsMixin,
    teamInboxPropsMixin
  ],

  components: {
    Avatar,
    UnreadCounter,
    Campaign,
    ContactName,
    LastCommunication,
    LastCommunicationDate,
    PhoneNumber,
    LiveCallControls,
    InboxOIcon
  },

  props: {
    contactId: {
      type: [Number, String],
      default: 0
    },

    communicationId: {
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

    campaign: {
      type: Object,
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

    contact: {
      type: Object,
      default: null
    },

    lastCallSource: {
      type: String,
      default: null
    },

    isFishingModeCall: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('TeamInbox', ['inboxes']),

    communication () {
      return {
        id: this.communicationId,
        type: this.type,
        direction: this.direction,
        campaign_id: this.campaignId,
        ring_group_id: this.teamInboxId,
        current_status2: this.currentStatus,
        disposition_status2: this.dispositionStatus,
        last_call_source: this.lastCallSource,
        is_fishing_mode: this.isFishingModeCall
      }
    },

    inboxName () {
      // Only show inbox name when in "all" inboxes view
      if (!this.isAllInboxesRoute) {
        return null
      }

      // Find the inbox by ring_group_id
      const inbox = this.inboxes.find(inbox => inbox.id === this.teamInboxId)
      return inbox ? inbox.name : null
    },

    shouldShowInboxName () {
      return this.isAllInboxesRoute && this.inboxName
    }
  },

  methods: {
    getCampaign (campaignId) {
      return this.campaigns.find(campaign => campaign.id === campaignId)
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

  &__inbox-name {
    padding: 2px 5px;

    span {
      font-size: 11px;
      line-height: 0.875em;
    }
  }
}
</style>
