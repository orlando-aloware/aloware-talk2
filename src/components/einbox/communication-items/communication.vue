<template>
  <div :class="['communication', { active: isActive, 'live-call-item': isLiveCall }]">
    <div class="communication__avatar">
      <div class="position-relative"
           role="button">
        <b-badge class="avatar__unread-badge position-absolute"
                 variant="danger"
                 data-testid="inbox-tasks-item-badge"
                 pill
                 v-if="totalUnreads > 0">
          <span v-if="totalUnreads < 99">{{ totalUnreads }}</span>
          <span v-else>99<sup>+</sup></span>
        </b-badge>
        <avatar width="34"
                height="34"
                :color-module-id="contactId"
                :name="contactName || defaultEmptyName">
        </avatar>
      </div>
    </div>

    <div class="communication__contact-name">
      <contact-name :name="contactName || defaultEmptyName"
                    :repeats="repeats" />
    </div>

    <div class="communication__phone-number">
      <phone-number :phone-number="contactPhoneNumber" />
    </div>

    <div class="communication__communication-type">
      <last-communication :disposition-status="dispositionStatus"
                          :type="type"
                          :direction="direction"
                          :callback-status="callbackStatus"
                          :body="body"
                          :total-unreads="totalUnreads"
                          :is-live-call-item="isLiveCall"
                          v-if="type" />
    </div>

    <div class="communication__campaign"
         v-if="campaignId">
      <campaign :campaign-id="campaignId" />
    </div>

    <div class="communication__time">
      <last-communication-date :date="date"
                               :last-communication-type="type"
                               :last-communication-current-status="currentStatus"
                               v-if="date" />
    </div>
  </div>
</template>

<script>
import Avatar from './avatar.vue'
import Campaign from './campaign.vue'
import ContactName from './contact-name.vue'
import LastCommunication from './last-communication.vue'
import LastCommunicationDate from './last-communication-date.vue'
import PhoneNumber from './phone-number.vue'
import { avatarMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    avatarMixin
  ],

  components: {
    Avatar,
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

    totalUnreads: {
      type: [Number, String],
      required: true
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

    isLiveCall: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.communication {
  display: grid;
  grid-template-columns: 0.5fr 2.2fr 0.3fr;
  grid-template-rows: 1fr 1fr 1fr; // only 3 because campaign can be null
  gap: 0px 5px;
  grid-template-areas:
    "communication__avatar communication__contact-name communication__time"
    "communication__avatar communication__phone-number communication__time"
    "communication__avatar communication__communication-type communication__time"
    "communication__avatar communication__campaign communication__time";

  padding: 8px 0px 8px 16px;
  min-height: 64px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;

  &__avatar {
    grid-area: communication__avatar;
    display: flex;
    justify-content: center;
    align-items: center;

    .avatar {
      &__unread-badge {
        top: -2px;
        right: -2px;
        padding: 2px;
        font-size: 9px;
        font-weight: 500;
      }
    }
  }

  &__contact-name {
    grid-area: communication__contact-name;
  }

  &__communication-type {
    grid-area: communication__communication-type;
  }

  &__time {
    grid-area: communication__time;
  }

  &__phone-number {
    grid-area: communication__phone-number;
  }

  &__campaign {
    grid-area: communication__campaign;
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
