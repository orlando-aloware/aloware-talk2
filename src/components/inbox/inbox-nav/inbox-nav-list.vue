<template>
  <div class="inbox-nav-list" :class="{'inbox-nav-list--closed': closed}">
    <nav-item
      v-for="item in items"
      :key="item.name"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
      :is-active="active === item.value"
      :closed="closed"
      :badge="true"
      badge-value="20"
      badge-color="danger"
      @click="onItemClicked"
    />
  </div>
</template>

<script>
import NavItem from './inbox-nav-item.vue'

export default {
  name: 'inbox-nav-list.vue',
  methods: {
    onItemClicked (nextActive) {
      this.active = nextActive
    }
  },
  data: function () {
    return {
      active: 'inbox',
      items: [
        {
          label: 'Inbox',
          value: 'inbox',
          icon: 'inbox'
        },
        {
          label: 'Calls',
          value: 'calls',
          icon: 'call'
        },
        {
          label: 'Messages',
          value: 'messages',
          icon: 'message'
        },
        {
          label: 'Mentions',
          value: 'mentions',
          icon: 'mention'
        },
        {
          label: 'Voicemails',
          value: 'voicemails',
          icon: 'voicemail'
        },
        {
          label: 'Recordings',
          value: 'recordings',
          icon: 'record'
        }
      ]
    }
  },
  components: {
    NavItem
  },
  props: {
    closed: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-nav-list {
  display: flex;
  flex-direction: column;
  &--closed {
    max-width: 40px;
    overflow: hidden;
  }
}
</style>
