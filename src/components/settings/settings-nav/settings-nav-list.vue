<template>
  <div class="page-side-menubar-list inbox-nav-list" :class="{'inbox-nav-list--closed': closed}">
    <nav-item
      v-for="item in items"
      :key="item.name"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
      :height="item.height"
      :width="item.width"
      :group="item.group"
      :isActive="true"
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
import NavItem from './settings-nav-item'
import { mapState } from 'vuex'

export default {
  name: 'settings-nav-list',

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
    ...mapState('settings', ['items'])
  },

  data () {
    return {
      active: this.value
    }
  },

  methods: {
    onItemClicked (nextActive) {
      this.active = nextActive
      let tab = this.items.find(item => item.value === nextActive)
      this.$router.push({
        name: 'Settings Tab',
        params: {
          tab: tab.value
        }
      }).catch(err => {
        console.log(err)
      })
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
