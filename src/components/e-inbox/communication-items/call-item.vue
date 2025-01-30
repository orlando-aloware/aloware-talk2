<template>
  <div class="row no-wrap items-center">
    <!-- Status indicator -->
    <div class="col-auto q-mr-sm">
      <div class="status-dot" :class="{ unread: comm.status !== 'read' }" />
    </div>

    <!-- Main content -->
    <div class="col-grow">
      <div class="row no-wrap justify-between items-center">
        <!-- Contact info -->
        <div class="col-grow text-body2 ellipsis">
          {{ comm.sender || 'Unknown' }}
        </div>
        <!-- Duration -->
        <div class="col-auto text-caption text-grey q-ml-sm">
          {{ formatDuration(comm.duration) }}
        </div>
      </div>
      <!-- Call details -->
      <div class="row no-wrap items-center q-mt-xs">
        <q-icon
          :name="getCallIcon(comm.call_type)"
          size="xs"
          :color="getCallColor(comm.call_status)"
          class="q-mr-xs"
        />
        <span class="text-caption text-grey">
          {{ formatTime(comm.created_at) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallItem',

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
    },

    formatDuration (seconds) {
      if (!seconds) return '0:00'
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    getCallIcon (callType) {
      switch (callType) {
        case 'incoming': return 'call_received'
        case 'outgoing': return 'call_made'
        case 'missed': return 'call_missed'
        default: return 'call'
      }
    },

    getCallColor (status) {
      switch (status) {
        case 'missed': return 'negative'
        case 'completed': return 'positive'
        default: return 'grey'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;

  &.unread {
    background-color: #1976d2;
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
