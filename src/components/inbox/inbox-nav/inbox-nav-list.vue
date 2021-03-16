<template>
  <div class="inbox-nav-list">
    <nav-item
      v-for="item in items"
      :key="item.name"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
      :is-active="active === item.value"
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
      active: 'tasks',
      items: [
        {
          label: 'Tasks',
          value: 'tasks',
          icon: 'task'
        },
        {
          label: 'Calls',
          value: 'calls',
          icon: 'phone'
        },
        {
          label: 'Messages',
          value: 'messages',
          icon: 'message'
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
  }
}
</script>

<style scoped>
.inbox-nav-list {
  display: flex;
  flex-direction: column;
}
</style>
