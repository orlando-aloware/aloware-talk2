<template>
  <div class="message-item">
    <!-- Status indicator -->
    <div class="status-dot-wrapper">
      <div class="status-dot" :class="{ unread: comm.status !== 'read' }" />
    </div>

    <!-- Main content -->
    <div class="message-content">
      <!-- Header: Sender and Time -->
      <div class="message-header">
        <span class="sender text-weight-medium">{{ comm.sender || 'Unknown' }}</span>
        <span class="time">{{ formatTime(comm.created_at) }}</span>
      </div>
      <!-- Message Body -->
      <div class="message-body">
        {{ comm.body || 'No message content' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageItem',

  props: {
    comm: {
      type: Object,
      required: true
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
</style>
