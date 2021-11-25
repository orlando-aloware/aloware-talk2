<template>
  <q-chip
    :outline="outline"
    :color="statusColor"
    text-color="red"
    :size="size"
    class="p-0 m-0">
    {{ taskStatus }}
  </q-chip>
</template>

<script>

export default {
  name: 'StatusChip',
  props: {
    status: {
      type: [String, Number],
      default: ''
    },
    color: {
      type: String,
      default: 'grey-80'
    },
    outline: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md'
    },
    textColor: {
      type: String,
      default: 'black'
    }
  },
  computed: {
    taskStatus () {
      if (this.status === '1' || this.status === 1) return 'Queued'
      else if (this.status === '2' || this.status === 2) return 'In-Progress'
      else if (this.status === '3' || this.status === 3) return 'Completed'
      else if (this.status === '4' || this.status === 4) return 'Failed'
      else return 'Scheduled'
    },
    statusColor () {
      if (!this.color) {
        return this.color
      } else {
        if (this.taskStatus === 'Queued') {
          return 'grey-90'
        } else if (this.taskStatus === 'Called') {
          return 'success'
        } else if (this.taskStatus === 'Failed') {
          return 'red'
        } else {
          return 'primary'
        }
      }
    }
  }
}
</script>
