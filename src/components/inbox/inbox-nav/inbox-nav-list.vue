<template>
  <div class="inbox-nav-list" :class="{'inbox-nav-list--closed': closed}">
    <nav-item v-for="item in items"
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
              badge-value="20"
              badge-color="danger"
              @click="onItemClicked" />
    <hr>
    <hr>
    <nav-item icon="inbox"
              value="inbox"
              label="Inbox" />

    <nav-item icon=""
              value=""
              label="Personal Views"
              :group="true"
              class="nav-list-group-title" />

    <nav-item icon=""
              :value="filter.name"
              :label="filter.name"
              :isActive="isActive(filter.name)"
              :key="filter.name"
              v-for="filter in personalFilters"
              @click="onSelectFilter()" />

    <nav-item icon=""
              value=""
              label="Company Views"
              :group="true"
              class="nav-list-group-title" />

    <nav-item icon=""
              :value="filter.name"
              :label="filter.name"
              :isActive="isActive(filter.name)"
              :key="filter.name"
              v-for="filter in companyFilters" />
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { pick } from 'lodash'

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
    ...mapState('inbox', ['items', 'activeChannel']),

    isShowActive () {
      return !this.$q.screen.lt.md || (this.$q.screen.lt.md && ['Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact', 'Inbox Contact Communication', 'Inbox Channel'].includes(this.$route.name))
    }
  },

  data () {
    return {
      active: this.value,
      filter: {},
      personalFilters: [],
      companyFilters: [],
      isGettingFilters: false,
      filterFields: [
        'campaigns',
        'ring_groups',
        'direction',
        'answer_status',
        'min_talk_time',
        'transfer_type',
        'callback_status',
        'tags',
        'call_dispositions',
        'first_time_only',
        'untagged_only',
        'exclude_automated_communications',
        'incoming_numbers',
        'users',
        'workflows',
        'contact_owner',
        'my_contact',
        'from_date',
        'to_date',
        'creator_type'
      ]
    }
  },

  created () {
    this.getFilters()
  },

  methods: {
    ...mapActions('inbox', ['setActiveChannel']),

    onItemClicked (nextActive) {
      if (!this.activeChannel) {
        return
      }

      if (this.activeChannel.value === nextActive) {
        this.$q.screen.lt.md && this.$emit('toInbox')
        return
      }

      this.active = nextActive
      const channel = this.items.find(item => item.value === nextActive)
      this.setActiveChannel(channel)

      if (this.active !== 'inbox') {
        this.$router.push({
          name: 'Inbox Channel',
          params: {
            channel: this.active
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })

        return
      }

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
    },

    isActive (value) {
      return this.isShowActive && this.activeChannel && this.activeChannel.value === value
    },

    getFilters () {
      this.isGettingFilters = true

      return talk2Api.V2.inbox.filters.get().then(response => {
        this.personalFilters = response.data.data.user || []
        this.companyFilters = response.data.data.company || []
        this.isGettingFilters = false
      })
    },

    onSelectFilter (filter) {
      console.log(filter)
      this.setSelectedFilter(filter)

      // combine default filter values with the selected one
      const personalFilterObject = filter.filter
      this.filter = {
        ...this.defaultFilterModel.filter,
        ...pick(personalFilterObject, this.filterFields)
      }

      this.applyFilter()
    },

    applyFilter () {
      if (!this.selectedFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
      }

      this.filter = {
        ...this.filter,
        untagged_only: +this.filter.untagged_only,
        first_time_only: +this.filter.first_time_only,
        exclude_automated_communications: +this.filter.exclude_automated_communications,
        my_contact: +this.filter.my_contact
      }

      setTimeout(() => {
        this.refreshTagSelector()
      }, 1000)
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
