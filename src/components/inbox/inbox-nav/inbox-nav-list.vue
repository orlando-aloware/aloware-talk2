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
      :isActive="activeChannel && activeChannel.value === item.value"
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
import { mapActions, mapState } from 'vuex'

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

  computed: {
    ...mapState('inbox', ['items', 'activeChannel'])
  },

  data () {
    return {
      active: this.value
    }
  },

  methods: {
    ...mapActions('inbox', ['setActiveChannel']),
    onItemClicked (nextActive) {
      this.active = nextActive
      let channel = this.items.find(item => item.value === nextActive)
      this.setActiveChannel(channel)
      if (this.active === 'inbox') {
        this.$router.push({
          name: 'Inbox Channel Task Status',
          params: {
            channel: this.active,
            status: 'open'
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.$router.push({
          name: 'Inbox Channel',
          params: {
            channel: this.active
          }
        }).catch(err => {
          console.log(err)
        })
      }
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
