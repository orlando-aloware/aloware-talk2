<template>
  <div :class="['message-item', { active: isActive }]">
    <div class="message-item__avatar">
      <div class="avatar position-relative"
           role="button">
        <b-badge class="avatar__unread-badge position-absolute"
                 variant="danger"
                 data-testid="inbox-tasks-item-badge"
                 pill>
          <span v-if="contact.unread_comms < 99">{{ contact.unread_comms }}</span>
          <span v-else>99<sup>+</sup></span>
        </b-badge>
        <avatar width="34"
                height="34"
                :color-module-id="contact.id"
                :name="contact.name || defaultEmptyName">
        </avatar>
      </div>
    </div>

    <div class="message-item__contact-name">
      <contact-name :name="contact.name || defaultEmptyName" />
    </div>

    <div class="message-item__communication-type">
      <last-communication :dispositionStatus2="contact.last_communication_disposition_status2"
                          :type="contact.last_communication_type"
                          :direction="contact.last_communication_direction"
                          :callbackStatus="contact.last_communication_callback_status"
                          :body="contact.last_communication_body"
                          :totalUnreads="contact.unread_comms"
                          v-if="contact.last_communication_type" />
    </div>

    <div class="message-item__time">
      <last-communication-date :date="contact.last_communication_at"
                               :lastCommunicationType="contact.last_communication_type"
                               :lastCommunicationCurrentStatus="contact.last_communication_current_status2"
                               v-if="contact.last_communication_at" />
    </div>
  </div>
</template>

<script>
import Avatar from './avatar.vue'
import ContactName from './contact-name.vue'
import LastCommunication from './last-communication.vue'
import LastCommunicationDate from './last-communication-date.vue'
import { avatarMixin } from 'src/plugins/mixins'

export default {
  name: 'MessageItem',

  mixins: [
    avatarMixin
  ],

  components: {
    Avatar,
    ContactName,
    LastCommunication,
    LastCommunicationDate
  },

  props: {
    contact: {
      type: Object,
      required: true
    },

    direction: {
      type: [String, Number],
      required: true
    },

    isActive: {
      type: Boolean,
      default: false
    },

    defaultEmptyName: {
      type: String,
      default: 'No Name'
    }
  },

  methods: {
    formatTime (timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.message-item {
  display: grid;
  grid-template-columns: 0.5fr 2.3fr 0.2fr;
  grid-template-rows: 1fr 1fr;
  gap: 5px 5px;
  grid-template-areas:
    "message-item__avatar message-item__contact-name message-item__time"
    "message-item__avatar message-item__communication-type message-item__time";

  padding: 8px 4px 8px 16px;
  min-height: 64px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;

  &__avatar {
    grid-area: message-item__avatar;
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
    grid-area: message-item__contact-name;
  }

  &__communication-type {
    grid-area: message-item__communication-type;
  }

  &__time {
    grid-area: message-item__time;
  }

  &.active {
    background-color: #00BD50;
    color: #ffffff;

    .sender {
      color: #ffffff;
    }

    .time, .message-body, .status-dot {
      color: #eeeeee;
    }
  }

  &:hover {
    background-color: #99EBAA;
    color: #000000;

    .sender {
      color: #000000;
    }

    .time, .message-body, .status-dot {
      color: #333333;
    }
  }
}

.status-dot-wrapper {
  padding-top: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;

  &.unread {
    background-color: #1976d2;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; // Important for text truncation
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  line-height: 1.2;

  .sender-wrapper {
    display: flex;
    align-items: center;
  }

  .sender {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.87);
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.54);
    flex-shrink: 0;
  }
}

.message-body {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.54);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sender-wrapper {
  display: flex;
  align-items: center;
}
</style>
