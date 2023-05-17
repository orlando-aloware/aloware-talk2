<template>
  <span>
    <span class="broadcast-status-pill px-2 py-1 rounded-borders"
         :class="classes">
      {{ label }}
    </span>
  </span>
</template>
<script>
const STATUS_CLASS = {
  1: {
    classes: ['new border-primary'],
    label: 'New'
  },
  2: {
    classes: ['enrolling border-secondary'],
    label: 'Enrolling'
  },
  3: {
    classes: ['paused border-warning'],
    label: 'Paused'
  },
  4: {
    classes: ['done border-green'],
    label: 'Done'
  },
  5: {
    classes: ['stopped border-danger'],
    label: 'Stopped'
  }
}
export default {
  props: {
    status: {
      type: Number,
      required: true
    }
  },

  data: () => ({
    STATUS_CLASS
  }),

  computed: {
    classes () {
      return this.STATUS_CLASS[this.status]?.classes ?? ''
    },

    label () {
      return this.STATUS_CLASS[this.status]?.label ?? ''
    }
  }
}
</script>
