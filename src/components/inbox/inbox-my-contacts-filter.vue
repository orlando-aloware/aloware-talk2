<template>
  <div class="d-inline-flex align-items-center"
       v-if="isShown">
    <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center mr-1"
                 :disabled="isInboxRefreshBtnLoading"
                 @clicked="refreshInbox">
      <refresh-icon />
      Refresh
    </compact-btn>

    <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                     size="sm"
                     switch
                     :class="myContactsToggleClass"
                     :disabled="myContactsToggleEnabled"
                     v-model="inboxShowMyContactsFilter">
      <q-tooltip content-class="bg-grey-light11">Toggle My Contacts</q-tooltip>
    </b-form-checkbox>
    <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
           :class="myContactsToggleClass"
           @click="myContactsFilterChange">
      <span class="label-my-contacts"
            :class="{ hidden: $q.screen.width < 390 }"
            v-if="$q.screen.width > 300">
        My Contacts
      </span>
    </label>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'
import CompactBtn from 'components/compact-btn'
import RefreshIcon from 'components/icons/refresh-icon'

export default {
  name: 'inbox-my-contacts-filter',

  mixins: [
    inboxRoutesMixin
  ],

  components: {
    CompactBtn,
    RefreshIcon
  },

  computed: {
    ...mapState('inbox', [
      'inboxShowMyContacts',
      'isInboxFiltersLoaded',
      'isGettingTasksList',
      'isFetchingContacts',
      'isInboxRefreshBtnLoading'
    ]),

    isShown () {
      return this.$route.name === 'Inbox' ||
        (this.$route?.meta?.title === 'Communications' &&
          this.$route.params.channel !== 'mentions')
    },

    myContactsToggleClass () {
      return { disabled: this.myContactsToggleEnabled }
    },

    myContactsToggleEnabled () {
      return !this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts
    }
  },

  data () {
    return {
      inboxShowMyContactsFilter: false
    }
  },

  created () {
    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
  },

  methods: {
    ...mapActions('inbox', [
      'setInboxShowMyContacts',
      'setIsInboxRefreshBtnLoading'
    ]),

    myContactsFilterChange () {
      if (!this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts) {
        return
      }

      this.inboxShowMyContactsFilter = !this.inboxShowMyContactsFilter
    },

    onMyContactsChange () {
      this.setInboxShowMyContacts(this.inboxShowMyContactsFilter)

      if (this.inboxTaskRoutes.includes(this.$route.name)) {
        this.$VueEvent.fire('inbox_load_contacts', this.inboxShowMyContactsFilter)
        return
      }

      // for inbox channels
      this.$VueEvent.fire('inbox_load_communications', this.inboxShowMyContactsFilter)
    },

    refreshInbox () {
      this.setIsInboxRefreshBtnLoading(true)
      this.$VueEvent.fire('fetchInbox')
    }
  },

  watch: {
    inboxShowMyContacts (value) {
      if (value !== this.inboxShowMyContactsFilter) {
        this.inboxShowMyContactsFilter = value
      }
    },

    inboxShowMyContactsFilter () {
      this.onMyContactsChange()
    }
  }
}
</script>
