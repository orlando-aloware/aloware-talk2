<template>
  <q-chip
    :outline="outline"
    :color="statusColor"
    text-color="red"
    icon="event"
    :size="size"
    v-html="status"
    class="p-0 m-0">
  </q-chip>
</template>

<script>

export default {
  name: 'StatusChip',
  props: {
    status: {
      type: String,
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
    statusColor () {
      if (!this.color) {
        return this.color
      } else {
        if (this.status === 'In Queue') {
          return 'grey-90'
        } else if (this.status === 'Called') {
          return 'success'
        } else if (this.status === 'Failed') {
          return 'red'
        } else {
          return 'primary'
        }
      }
    }
  }
}
</script>
