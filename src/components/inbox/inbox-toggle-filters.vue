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
        <refresh-icon :class="$q.screen.width < MOBILE_LARGE_WIDTH ? 'm-0': ''" data-testid="inbox-toggle-filters-refresh-icon"/>
        {{ refreshButtonLabel }}
      </compact-btn>

      <div class="d-flex align-items-center mr-2" v-if="showNewInboxToggle">
        <b-form-checkbox class="mt-1 ml-2 cursor-pointer"
                        size="sm"
                        switch
                        data-testid="inbox-new-experience-checkbox"
                        :class="toggleFiltersClass"
                        :disabled="isTogglingNewInbox"
                        v-model="newInboxEnabled">
          <q-tooltip content-class="bg-grey-10 text-white"
                    anchor="bottom left"
                    self="top middle">
                    <zap-bold-icon class="ml-1" width="16" height="16" color="#FFB020" />Toggle New Inbox
          </q-tooltip>
        </b-form-checkbox>
        <label class="mt-2 cursor-pointer text-nowrap text-13 text-sm-14 inbox-effect-gradient-text"
              :class="[toggleFiltersClass, { 'text-grey-10': newInboxEnabled }]"
              data-testid="inbox-new-experience-label">
          <template v-if="newInboxEnabled">
            <zap-bold-icon class="ml-1" width="16" height="16" color="#FFB020" />
            <strong>New Inbox Enabled</strong>
          </template>
          <template v-else>
            <zap-bold-icon class="ml-1" width="16" height="16" color="#FFB020" />
            <strong>New Inbox Disabled</strong>
          </template>
        </label>
      </div>
    </div>

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
</template>

<script>
import VueCookies from 'vue-cookies'
import { mapActions, mapState, mapGetters } from 'vuex'
import { inboxRoutesMixin } from 'src/plugins/mixins'
import CompactBtn from 'components/compact-btn'
import RefreshIcon from 'components/icons/refresh-icon'
import { MOBILE_LARGE_WIDTH, EXTRA_SMALL_MOBILE_WIDTH } from 'src/constants/viewport-sizes'
// import { INBOXES_MENU_TITLE } from 'src/router/routes'
import ZapBoldIcon from 'components/icons/inbox/zap-bold-icon'

const COOKIE_NEW_INBOX = 'new_inbox_enabled'
const COOKIE_EXPIRES = 3650

export default {
  name: 'inbox-toggle-filters',

  mixins: [
    inboxRoutesMixin
  ],

  components: {
    CompactBtn,
    RefreshIcon,
    ZapBoldIcon
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

    ...mapGetters('eInbox', ['isNewInboxEnabled']),

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

    newInboxEnabled: {
      get () {
        return this.isNewInboxEnabled
      },
      set (value) {
        if (value !== this.isNewInboxEnabled) {
          this.handleNewInboxToggle()
        }
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

    ...mapActions('eInbox', [
      'toggleNewInbox',
      'initNewInbox'
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

    async handleNewInboxToggle () {
      try {
        this.$cookies = VueCookies
        this.isTogglingNewInbox = true
        const result = await this.toggleNewInbox()

        if (result.success) {
          // Handle cookie storage
          if (result.enabled) {
            this.$cookies.set(COOKIE_NEW_INBOX, 'true', COOKIE_EXPIRES)
            this.$router.push('/inboxes')
          } else {
            this.$cookies.remove(COOKIE_NEW_INBOX)
            this.$router.push('/')
          }

          this.$q.notify({
            type: 'positive',
            message: result.enabled
              ? 'New inbox experience enabled'
              : 'Rolled back to classic inbox',
            position: 'top'
          })
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
    this.$cookies = VueCookies

    this.inboxShowMyContactsFilter = this.inboxShowMyContacts
    this.inboxShowUnreadsFilter = this.inboxShowUnreads

    // Initialize from cookie
    const enabled = this.$cookies.get(COOKIE_NEW_INBOX) === 'true'
    this.initNewInbox(enabled)
  }
}
</script>
