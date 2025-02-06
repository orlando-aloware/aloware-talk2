<template>
  <div class="message-item" :class="{ active: isActive }">
    <!-- Status indicator -->
    <div class="status-dot-wrapper">
      <div class="status-dot" :class="{ unread: comm.status !== 'read' }" />
    </div>

    <!-- Main content -->
    <div class="message-content">
      <!-- Header: Sender and Time -->
      <div class="message-header">
        <div class="sender-wrapper">
          <span class="sender text-weight-medium">{{ contactName }}</span>
          <q-icon
            :name="direction === 'Inbound' ? 'arrow_downward' : 'arrow_upward'"
            :class="direction === 'Inbound' ? 'text-green' : 'text-blue'"
            size="xs"
            class="q-ml-xs"
          />
        </div>
        <span class="time">
          <task-item-time :from-time="comm.last_communication_at"
                        :update-interval="6000">
          </task-item-time>
        </span>
      </div>

      <!-- Message Body -->
      <div class="message-body">
        {{ comm.last_communication_body || '' }}
      </div>
    </div>
  </div>
</template>

<script>
import TaskItemTime from 'src/components/inbox/channel-tasks/task-item-time.vue'

export default {
  name: 'MessageItem',

  components: {
    TaskItemTime
  },

  props: {
    comm: {
      type: Object,
      required: true
    },
    direction: {
      type: String,
      required: true,
      validator: value => ['Inbound', 'Outbound'].includes(value)
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    contactName () {
      if (this.comm.first_name && this.comm.last_name) {
        return this.comm.first_name + ' ' + this.comm.last_name
      } else if (this.comm.first_name) {
        return this.comm.first_name
      } else {
        return 'No Name'
      }
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
  grid-template-columns: 20px 1fr;
  gap: 12px;
  padding: 8px 16px;
  min-height: 64px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;

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
