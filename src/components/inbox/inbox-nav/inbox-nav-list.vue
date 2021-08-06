<template>
  <div class="inbox-nav-list" :class="{'inbox-nav-list--closed': closed}">
    <nav-item
      v-for="item in items"
      :key="item.name"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
      :group="item.group"
      :disabled="item.disabled"
      :isActive="active === item.value"
      :closed="closed"
      :badge="true"
      :openCount="openCount"
      :pending-count="pendingCount"
      badge-value="20"
      badge-color="danger"
      @click="onItemClicked"
    />
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'

export default {
  name: 'inbox-nav-list',

  components: {
    NavItem
  },

  props: {
    value: {
      required: false
    },

    closed: {
      type: Boolean,
      default: false
    },

    openCount: {
      required: false,
      default: 0
    },

    pendingCount: {
      required: false,
      default: 0
    }
  },

  data () {
    return {
      active: this.value,
      items: [
        {
          label: 'Inbox',
          value: 'inbox',
          icon: 'inbox',
          disabled: false
        },
        {
          label: 'Channels',
          group: true,
          value: '',
          class: 'nav-list-group-title',
          icon: '',
          disabled: false
        },
        {
          label: 'Calls',
          value: 'calls',
          icon: 'call',
          disabled: false,
          type: 'call',
          answerStatus: 'all'
        },
        {
          label: 'Messages',
          value: 'messages',
          icon: 'message',
          disabled: false,
          type: 'sms',
          answerStatus: 'all'
        },
        {
          label: 'Mentions',
          value: 'mentions',
          icon: 'mention',
          disabled: true
        },
        {
          label: 'Voicemails',
          value: 'voicemails',
          icon: 'voicemail',
          disabled: false,
          type: 'call',
          answerStatus: 'voicemail'
        },
        {
          label: 'Recordings',
          value: 'recordings',
          icon: 'record',
          disabled: false,
          type: 'call',
          answerStatus: 'recorded'
        }
      ]
    }
  },

  methods: {
    onItemClicked (nextActive) {
      this.active = nextActive
    }
  },

  watch: {
    value () {
      this.active = this.value
    },

    active (val) {
      if (this.value !== undefined && this.active !== this.value) {
        this.$emit('active', this.items.find(item => item.value === val))
        this.$emit('update:value', val)
      }
    }
  }
}
</script>
