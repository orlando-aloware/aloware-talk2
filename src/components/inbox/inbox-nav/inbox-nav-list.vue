<template>
  <div class="inbox-nav-list h-100 overflow-y-scroll overflow-x-hidden"
       :class="{'inbox-nav-list--closed': closed}">
    <nav-item badge-value="20"
              badge-color="danger"
              :key="item.name"
              :label="item.label"
              :value="item.value"
              :icon="item.icon"
              :group="item.group"
              :isActive="isActive(item.value)"
              :closed="closed"
              :badge="true"
              :openCount="openCount"
              :pending-count="pendingCount"
              v-for="item in items"
              @click="onItemClicked"/>
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'

export default {
  name: 'inbox-nav-list',

  mixins: [
    inboxRoutesMixin
  ],

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
    ...mapState('inbox', ['items', 'activeChannel']),

    isShowActive () {
      const isMobileInboxRoutes = this.$q.screen.lt.md && this.inboxTaskAndCommRoutes.includes(this.$route.name)

      return !this.$q.screen.lt.md || isMobileInboxRoutes
    }
  },

  data () {
    return {
      active: this.value
    }
  },

  methods: {
    ...mapActions('inbox', ['setActiveChannel']),

    onItemClicked (nextActive) {
      if (!this.activeChannel) {
        return
      }

      if (this.activeChannel.value === nextActive && this.$q.screen.lt.md) {
        this.$emit('toInbox')

        return
      }

      this.active = nextActive
      const channel = this.items.find(item => item.value === nextActive)
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
          this.$handleErrors(err.response)
        })
      } else {
        this.$router.push({
          name: 'Inbox Channel',
          params: {
            channel: this.active
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
      }
    },

    isActive (value) {
      return this.isShowActive && this.activeChannel && this.activeChannel.value === value
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
