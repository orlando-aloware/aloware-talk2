<template>
  <div class="d-inline-flex align-items-center flex-grow-1"
       v-if="isShown"
       data-testid="inbox-toggle-filters-wrapper">
    <!-- Left side group -->
    <div class="d-flex align-items-center">
      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center mr-1"
                   :disabled="isInboxRefreshBtnLoading"
                   data-testid="inbox-toggle-filters-compact-btn"
                   @clicked="refreshInbox">
        <refresh-icon data-testid="inbox-toggle-filters-refresh-icon"
                      :class="$q.screen.width < MOBILE_LARGE_WIDTH ? 'm-0': ''"/>
        {{ refreshButtonLabel }}
      </compact-btn>
    </div>

    <div class="d-flex align-items-center"
         v-if="!isNewInbox">
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
    </div>
  </div>
</template>

<script>
import VueCookies from 'vue-cookies'
import { mapActions, mapState } from 'vuex'
import { inboxRoutesMixin, userMixin, EinboxMixin } from 'src/plugins/mixins'
import CompactBtn from 'components/compact-btn'
import RefreshIcon from 'components/icons/refresh-icon'
import { MOBILE_LARGE_WIDTH, EXTRA_SMALL_MOBILE_WIDTH } from 'src/constants/viewport-sizes'

export default {
  name: 'inbox-toggle-filters',

  mixins: [
    inboxRoutesMixin,
    userMixin,
    EinboxMixin
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
    ...mapState('Einbox', ['activeInboxId']),
    ...mapState('cache', ['currentCompany']),

    isShown () {
      const isInboxRoute = this.$route?.meta?.isInbox
      const notMentionsChannel = this.$route.params.channel !== 'mentions'
      return isInboxRoute && notMentionsChannel
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

    isNewInbox () {
      return this.$route.path.substring(0, 7) === '/einbox'
    }
  },

  methods: {
    ...mapActions('inbox', [
      'setInboxShowMyContacts',
      'setInboxShowUnreads',
      'setIsInboxRefreshBtnLoading'
    ]),

    ...mapActions('Einbox', [
      'resetItems'
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

    async refreshInbox () {
      this.setIsInboxRefreshBtnLoading(true)

      if (this.isNewInbox) {
        this.resetItems()
        await this.fetchItems(this.activeInboxId)

        this.setIsInboxRefreshBtnLoading(false)
      } else {
        this.$VueEvent.fire('fetchInbox')
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
    this.$cookies = VueCookies

    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
    this.inboxShowUnreadsFilter = this.inboxShowUnreads
  }
}
</script>

<style>
  .custom-switch.einbox-toggle .custom-control-input:checked ~ .custom-control-label::before {
    background-color: #256eff !important;
  }
</style>
