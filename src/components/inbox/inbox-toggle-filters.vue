<template>
  <div class="d-inline-flex align-items-center"
       v-if="isShown"
       data-testid="inbox-toggle-filters-wrapper">
    <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center mr-1"
                 :disabled="isInboxRefreshBtnLoading"
                 data-testid="inbox-toggle-filters-compact-btn"
                 @clicked="refreshInbox">
      <refresh-icon :class="$q.screen.width < 450 ? 'm-0': ''" data-testid="inbox-toggle-filters-refresh-icon"/>
      {{ refreshButtonLabel }}
    </compact-btn>

    <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                     size="sm"
                     switch
                     data-testid="inbox-my-contacts-filter-form-checkbox"
                     :class="myContactsToggleClass"
                     :disabled="myContactsToggleEnabled"
                     v-model="inboxShowMyContactsFilter">
      <q-tooltip content-class="bg-grey-light11">Toggle My Contacts</q-tooltip>
    </b-form-checkbox>
    <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
          :class="myContactsToggleClass"
          data-testid="inbox-my-contacts-filter-my-contacts-label"
          @click="myContactsFilterChange">
      <span class="label-my-contacts"
            :class="{ hidden: $q.screen.width < 390 }"
            v-if="$q.screen.width > 300">
        My Contacts
      </span>
    </label>

    <div class="d-flex align-items-center ml-2"
         v-if="shouldShowUnreadsToggle">
      <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                       size="sm"
                       switch
                       data-testid="inbox-unreads-filter-form-checkbox"
                       :class="unreadsToggleClass"
                       :disabled="unreadsToggleEnabled"
                       v-model="inboxShowUnreadsFilter">
        <q-tooltip content-class="bg-grey-light11">Toggle Unreads</q-tooltip>
      </b-form-checkbox>
      <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
             :class="unreadsToggleClass"
             data-testid="inbox-unreads-filter-my-contacts-label"
             @click="unreadsFilterChange">
        <span class="label-my-contacts"
              :class="{ hidden: $q.screen.width < 390 }"
              v-if="$q.screen.width > 300">
          Unreads
        </span>
      </label>
    </div>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'
import CompactBtn from 'components/compact-btn'
import RefreshIcon from 'components/icons/refresh-icon'
import { MOBILE_HEADER_TRANSITION_WIDTH } from 'src/constants/viewport-sizes'

export default {
  name: 'inbox-toggle-filters',

  mixins: [
    inboxRoutesMixin
  ],

  components: {
    CompactBtn,
    RefreshIcon
  },

  props: {
    shouldShowUnreadsToggle: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState('inbox', [
      'inboxShowMyContacts',
      'inboxShowUnreads',
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
    },

    unreadsToggleClass () {
      return { disabled: this.unreadsToggleEnabled }
    },

    unreadsToggleEnabled () {
      return !this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts
    },

    refreshButtonLabel () {
      return this.$q.screen.width < MOBILE_HEADER_TRANSITION_WIDTH ? '' : 'Refresh'
    }
  },

  data () {
    return {
      inboxShowMyContactsFilter: false,
      inboxShowUnreadsFilter: false
    }
  },

  created () {
    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
    this.inboxShowUnreadsFilter = this.inboxShowUnreads
  },

  methods: {
    ...mapActions('inbox', [
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
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

    unreadsFilterChange () {
      if (!this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts) {
        return
      }

      this.inboxShowUnreadsFilter = !this.inboxShowUnreadsFilter
    },

    onUnreadsChange () {
      this.setInboxShowUnreads(this.inboxShowUnreadsFilter)

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
    },

    inboxShowUnreads (value) {
      if (value !== this.inboxShowUnreadsFilter) {
        this.inboxShowUnreadsFilter = value
      }
    },

    inboxShowUnreadsFilter () {
      this.onUnreadsChange()
    }
  }
}
</script>
