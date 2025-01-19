<template>
  <div class="d-inline-flex align-items-center"
       v-if="isShown"
       data-testid="inbox-toggle-filters-wrapper">
    <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center mr-1"
                 :disabled="isInboxRefreshBtnLoading"
                 data-testid="inbox-toggle-filters-compact-btn"
                 @clicked="refreshInbox">
      <refresh-icon :class="$q.screen.width < MOBILE_LARGE_WIDTH ? 'm-0': ''" data-testid="inbox-toggle-filters-refresh-icon"/>
      {{ refreshButtonLabel }}
    </compact-btn>

    <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                     size="sm"
                     switch
                     data-testid="inbox-my-contacts-filter-form-checkbox"
                     :class="toggleFiltersClass"
                     :disabled="toggleFiltersEnabled"
                     v-model="inboxShowMyContactsFilter">
      <q-tooltip content-class="bg-grey-10 text-white"
                 anchor="bottom left"
                 self="top middle">
        Toggle My Contacts
      </q-tooltip>
    </b-form-checkbox>
    <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
          :class="toggleFiltersClass"
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
                       :class="toggleFiltersClass"
                       :disabled="toggleFiltersEnabled"
                       v-model="inboxShowUnreadsFilter">
        <q-tooltip content-class="bg-grey-10 text-white"
                   anchor="bottom left"
                   self="top middle">
          Toggle Unreads
        </q-tooltip>
      </b-form-checkbox>
      <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
             :class="toggleFiltersClass"
             data-testid="inbox-unreads-filter-my-contacts-label"
             @click="unreadsFilterChange">
        <span class="label-my-contacts"
              :class="{ hidden: $q.screen.width < EXTRA_SMALL_MOBILE_WIDTH }"
              v-if="$q.screen.width > 300">
          Unreads
        </span>
      </label>
    </div>

    <div class="d-flex align-items-center ml-3" v-if="showNewInboxToggle">
      <b-form-checkbox class="mt-1 cursor-pointer"
                      size="sm"
                      switch
                      data-testid="inbox-new-experience-checkbox"
                      :class="toggleFiltersClass"
                      :disabled="isTogglingNewInbox"
                      v-model="newInboxEnabled"
                      @change="toggleNewInbox">
        <q-tooltip content-class="bg-grey-10 text-white"
                  anchor="bottom left"
                  self="top middle">
          Toggle New Inbox Experience
        </q-tooltip>
      </b-form-checkbox>
      <label class="text-primary mt-2 cursor-pointer text-nowrap text-13 text-sm-14"
             :class="[toggleFiltersClass, { 'text-danger': newInboxEnabled }]"
             data-testid="inbox-new-experience-label">
        <template v-if="newInboxEnabled">
          Roll back to old inbox
        </template>
        <template v-else>
          Try new inbox experience
        </template>
      </label>
    </div>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'
import CompactBtn from 'components/compact-btn'
import RefreshIcon from 'components/icons/refresh-icon'
import { MOBILE_LARGE_WIDTH, EXTRA_SMALL_MOBILE_WIDTH } from 'src/constants/viewport-sizes'
import api from 'src/plugins/api/api'

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

  data () {
    return {
      inboxShowMyContactsFilter: false,
      inboxShowUnreadsFilter: false,
      MOBILE_LARGE_WIDTH,
      EXTRA_SMALL_MOBILE_WIDTH,
      isTogglingNewInbox: false
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
    ...mapState('cache', ['currentCompany']),

    isShown () {
      return (this.$route?.meta?.title === 'Inboxes' && this.$route.params.channel !== 'mentions')
    },

    toggleFiltersClass () {
      return { disabled: this.toggleFiltersEnabled }
    },

    toggleFiltersEnabled () {
      return !this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts
    },

    refreshButtonLabel () {
      return this.$q.screen.width < MOBILE_LARGE_WIDTH ? '' : 'Refresh'
    },

    newInboxEnabled: {
      get () {
        return this.currentCompany?.new_inbox || false
      },
      set () {
        // Handled by toggleNewInbox method
      }
    },

    showNewInboxToggle () {
      return this.isShown
    }
  },

  methods: {
    ...mapActions('inbox', [
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
      'setIsInboxRefreshBtnLoading'
    ]),
    ...mapActions('cache', ['setCurrentCompany']),

    myContactsFilterChange () {
      if (!this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts) {
        return
      }

      this.inboxShowMyContactsFilter = !this.inboxShowMyContactsFilter
    },

    fireInboxLoadEvent () {
      if (this.inboxTaskRoutes.includes(this.$route.name)) {
        this.$VueEvent.fire('inbox_load_contacts', this.inboxShowMyContactsFilter, this.inboxShowUnreadsFilter)
        return
      }

      this.$VueEvent.fire('inbox_load_communications', this.inboxShowMyContactsFilter, this.inboxShowUnreadsFilter)
    },

    onMyContactsChange () {
      this.setInboxShowMyContacts(this.inboxShowMyContactsFilter)
      this.fireInboxLoadEvent()
    },

    onUnreadsChange () {
      this.setInboxShowUnreads(this.inboxShowUnreadsFilter)
      this.fireInboxLoadEvent()
    },

    unreadsFilterChange () {
      if (!this.isInboxFiltersLoaded || this.isGettingTasksList || this.isFetchingContacts) {
        return
      }

      this.inboxShowUnreadsFilter = !this.inboxShowUnreadsFilter
    },

    refreshInbox () {
      this.setIsInboxRefreshBtnLoading(true)
      this.$VueEvent.fire('fetchInbox')
    },

    async toggleNewInbox () {
      try {
        this.isTogglingNewInbox = true
        const response = await api.V2.companies.toggleFeature(
          this.currentCompany.id,
          'inbox'
        )

        if (response.data.success) {
          await this.setCurrentCompany({
            ...this.currentCompany,
            new_inbox: response.data.enabled
          })

          this.$q.notify({
            type: 'positive',
            message: response.data.enabled
              ? 'New inbox experience enabled'
              : 'Rolled back to classic inbox',
            position: 'top'
          })

          this.refreshInbox()
        }
      } catch (error) {
        console.error('Failed to toggle new inbox:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update inbox preference',
          position: 'top'
        })
      } finally {
        this.isTogglingNewInbox = false
      }
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
  },

  created () {
    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
    this.inboxShowUnreadsFilter = this.inboxShowUnreads
  }
}
</script>

<style lang="scss" scoped>
// Add any additional styles if needed
</style>
