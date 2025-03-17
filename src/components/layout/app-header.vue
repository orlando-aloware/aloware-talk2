<template>
  <q-toolbar class="page-header"
             :class="{ 'pl-2 pr-2': !noPadding }">
    <div class="d-flex h-100 align-items-center flex-grow-1">
      <back-button class="mobile-back-btn-global-header"
                   v-if="['Contact', 'Settings Tab', EINBOXES_MENU_ITEMS_TITLE, EINBOXES_MENU_COMMUNICATIONS_TITLE].includes($route.name)"
                   @click="navigateBack"/>
      <router-link class="btn-header-nav-back"
                   :to="backRoute"
                   v-if="['Communication'].includes($route.name)">
        <button class="more-details font-weight-light-bold btn btn-sm">
          <i class="fa fa-chevron-left" />
        </button>
      </router-link>
      <h1 v-if="isMainTitle" class="flex-grow-2">{{ mainTitle }}</h1>
      <h1 v-if="forcePageTitle" class="flex-grow-2">{{ forcePageTitle }}</h1>
      <h1 v-if="$q.screen.lt.md && ['Settings Tab'].includes($route.name)">{{ settingsTabHeaderName }}</h1>
      <contact-app-header v-if="['Contact'].includes($route.name) && !titleOnly"></contact-app-header>
      <contact-list-navigation v-if="['Contact'].includes($route.name) && !titleOnly" />
      <inbox-list-navigation v-if="(['Inbox', 'Inbox Contact Task'].includes($route.name) || ['/channels/inbox/open', '/channels/inbox/pending', '/channels/inbox/closed'].includes($route.path)) && !titleOnly" />
      <inbox-channel-navigation v-if="(['Inbox Contact', 'Inbox Contact Communication', 'Inbox Channel'].includes($route.name) || ['/channels/mentions/received', '/channels/mentions/sent'].includes($route.path)) && !titleOnly" />

      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center"
                   :disabled="isRefreshDisabled"
                   v-if="shouldShowRefreshButton"
                   @clicked="handleRefresh">
        <refresh-icon :class="hideRefreshLabelClass"/>
        {{ refreshButtonLabel }}
      </compact-btn>

      <a href="https://support.aloware.com/en/articles/9034203-exploring-aloware-talk-s-broadcast"
         target="_blank"
         v-if="$route.name === 'Broadcasts' && !isSimpSocial">
        <information-circle-icon class="ml-2 cursor-pointer"/>
        <q-tooltip>
          Check the article how to use the Broadcast
        </q-tooltip>
      </a>

      <inbox-toggle-filters :should-show-unreads-toggle="true"
                            v-if="(!isMobile || !$q.screen.lt.md) && isInInboxPage" />
    </div>

    <tutorial-video-button />

    <!--div class="ml-auto d-none d-lg-block h-100"-->
    <div class="ml-auto d-block h-100">
      <div class="d-flex h-100 align-items-center justify-content-end ml-1">

        <shared-login-menu v-if="!isElectron" />

        <header-help v-if="!isTrial && !isSimpSocial" />

        <profile :hideProfileInfo="isMobileTransitionWidth" />

        <phone v-if="!titleOnly" />

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <parked-call v-if="!isMobile" />

        <active-call v-if="!isMobile" />

        <q-item v-if="!titleOnly">
          <q-btn id="dialer-form-button"
                 size="40px"
                 padding="none"
                 align="center"
                 flat
                 :ripple="false"
                 :disable="isDialerDisabled"
                 @click="onDialerErrorStatus">
            <dialer-error-icon v-if="dialer.error.code">
            </dialer-error-icon>
            <dialer-icon :bg-color="dialerIconBGColor"
                         :text-color="dialerIconTextColor"
                         v-if="!dialer.error.code">
            </dialer-icon>
            <q-menu anchor="bottom end"
                    self="top right"
                    persistent
                    :offset="[0, 10]"
                    v-model="dialerStatus"
                    v-if="!dialer.error.code"
                    @before-show="showDialer"
                    @before-hide="hideDialer">
              <dialer-form v-model="dialerStatus"
                           v-if="!isMobile"
                           @hide="hideDialer">
              </dialer-form>
            </q-menu>
          </q-btn>
          <b-popover target="dialer-form-button"
                     triggers="hover"
                     placement="bottomleft"
                     v-if="dialer.error.code">
            <template #title>Connection timeout</template>
            <p>Click here to reconnect or please check the <a href="https://support.aloware.com/en/articles/9020342-understanding-and-fixing-common-dialer-errors-in-aloware-a-comprehensive-guide" target="_blank">troubleshooting guide here</a>.</p>
            <p>Error Code: [{{ dialer.error.code }}]</p>
            <q-btn class="start-dial-button p-0"
                   color="success"
                   no-caps
                   unelevated
                   v-if="PHONE_USAGE_ERRORS.includes(dialer.error.code)"
                   @click="reconnectDialer">
              <div class="button-label">
                Reconnect
              </div>
            </q-btn>
            <a href="https://support.aloware.com/en/articles/9037858-troubleshooting-tip-audio-issues-during-calls-here-s-how-to-fix-it" target="_blank"
               v-if="dialer.error.code === 31208">
              See fix
            </a>
          </b-popover>
        </q-item>
      </div>
    </div>
  </q-toolbar>
</template>

<script>
import _ from 'lodash'
import { Platform } from 'quasar'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  aclMixin,
  simpsocialMixin,
  avatarMixin,
  goBackMixin,
  contactsListFiltersMixin,
  userMixin,
  kycMixin,
  communicationsMixin
} from 'src/plugins/mixins'
import DialerForm from 'components/dialer/dialer-form'
import ActiveCall from 'components/dialer/active-call'
import Profile from 'components/profile'
import Phone from 'components/dialer/phone'
import CompactBtn from 'components/compact-btn'
import ContactListNavigation from 'components/contacts/contact-list-navigation'
import ContactAppHeader from 'components/contacts/contact-app-header'
import ParkedCall from 'components/dialer/parked-call'
import InboxListNavigation from 'components/inbox/inbox-list-navigation'
import InboxChannelNavigation from 'components/inbox/inbox-channel-navigation'
import RefreshIcon from 'components/icons/refresh-icon'
import SharedLoginMenu from 'components/shared-login-menu'
import BackButton from 'components/back-button'
import HeaderHelp from 'components/header-help'
import InboxToggleFilters from 'components/inbox/inbox-toggle-filters'
import DialerErrorIcon from 'components/icons/dialer-error-icon'
import DialerIcon from 'components/icons/dialer-icon'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import * as Roles from 'src/constants/roles'
import { PHONE_USAGE_ERRORS } from 'src/constants/twilio-error-codes'
import TutorialVideoButton from 'components/tutorial-video-button'
import { MOBILE_HEADER_TRANSITION_WIDTH } from 'src/constants/viewport-sizes'
import { COMMUNICATIONS_CHANNELS_ROUTE_NAME, EINBOXES_MENU_ITEMS_TITLE, EINBOXES_MENU_COMMUNICATIONS_TITLE } from 'src/router/routes'

export default {
  name: 'app-header',

  mixins: [
    aclMixin,
    simpsocialMixin,
    avatarMixin,
    goBackMixin,
    contactsListFiltersMixin,
    userMixin,
    kycMixin,
    communicationsMixin
  ],

  components: {
    DialerIcon,
    DialerErrorIcon,
    BackButton,
    SharedLoginMenu,
    InboxChannelNavigation,
    InboxListNavigation,
    ParkedCall,
    ContactAppHeader,
    ContactListNavigation,
    Phone,
    ActiveCall,
    DialerForm,
    Profile,
    CompactBtn,
    RefreshIcon,
    HeaderHelp,
    InboxToggleFilters,
    InformationCircleIcon,
    TutorialVideoButton
  },

  props: {
    forcePageTitle: {
      type: String,
      default: ''
    },

    noPadding: {
      type: Boolean,
      default: false
    },

    titleOnly: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      dialerStatus: false,
      loading: false,
      prevRoute: null,
      PHONE_USAGE_ERRORS,
      EINBOXES_MENU_ITEMS_TITLE,
      EINBOXES_MENU_COMMUNICATIONS_TITLE
    }
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('contacts', [
      'selectedList',
      'pinnedListsLoaded',
      'publicListsLoaded',
      'myListsLoaded',
      'listContactsLoaded',
      'previousListFilters',
      'previousListId'
    ]),

    ...mapState('stats', [
      'metricLoader',
      'groupMetricLoader'
    ]),

    ...mapState([
      'dialer',
      'dialerFormStatus',
      'isMobile',
      'statics'
    ]),

    isDialerReady () {
      return !this.dialer.call && this.dialer.isReady
    },

    isElectron () {
      return Platform.is.electron
    },

    isMainTitle () {
      if (['Settings Tab'].includes(this.$route.name) && !this.$q.screen.lt.md) {
        return true
      }

      if (['Settings Tab'].includes(this.$route.name) && this.$q.screen.lt.md) {
        return false
      }

      return !['Contact'].includes(this.$route.name) && !this.forcePageTitle
    },

    mainTitle () {
      return this.$route.meta?.title || ''
    },

    contactsRefreshIsDisabled () {
      return !this.pinnedListsLoaded ||
        !this.publicListsLoaded ||
        !this.myListsLoaded ||
        !this.listContactsLoaded
    },

    dialerIconBGColor () {
      return this.dialerStatus ? '#00BF4A' : '#F4F4F6'
    },

    dialerIconTextColor () {
      return this.dialerStatus ? '#FFFFFF' : '#95989E'
    },

    currentUser () {
      if (!this.profile) {
        return {}
      }

      return {
        id: this.profile.id,
        email: this.profile.email,
        name: this.profile.name
      }
    },

    backRoute () {
      if (this.$route.name === 'Communication') {
        if (this.$route.params.contactId) {
          return {
            name: 'Contact',
            params: {
              id: this.$route.params.contactId
            }
          }
        }

        return {
          name: 'Inbox'
        }
      }

      return {
        path: this.prevRoute
      }
    },

    isDialerDisabled () {
      return (!this.isDialerReady && !this.dialer.error.code) || this.hasRole(Roles.COMPANY_REPORTER_ACCESS)
    },

    isInInboxPage () {
      const path = this.$route.path
      return this.$route.name === 'Inbox' ||
        path.includes('inbox') ||
        path.includes('channels')
    },

    shouldShowUnreadsToggle () {
      return this.$route.path.includes('channels') && !this.$route.path.includes('inbox')
    },

    isStatsPage () {
      return this.$route.name === 'Stats'
    },

    isContactsPage () {
      return this.$route.name === 'Contacts' || (this.$route.name === 'Power Dialer' && ['power-dialer-add-queue-list', 'power-dialer-add-list'].includes(this.$route.meta?.id))
    },

    isInPowerDialerListPage () {
      return this.$route.name === 'Power Dialer' && !['power-dialer-session', 'power-dialer-add-list', 'power-dialer-add-queue-list'].includes(this.$route.meta?.id)
    },

    isCommunicationsPage () {
      return this.$route.name === COMMUNICATIONS_CHANNELS_ROUTE_NAME
    },

    settingsTabHeaderName () {
      if (!['Settings Tab'].includes(this.$route.name)) {
        return this.$route.name
      }

      let tab = this.$route.params.tab.replace('-', ' ')

      // specially formatted header name(s)
      if (['sms templates'].includes(tab)) {
        return 'SMS Templates'
      }

      if (['general information'].includes(tab)) {
        return 'General'
      }

      return this.$options.filters.ucwords(tab)
    },

    hideRefreshLabelClass () {
      return this.isMobileTransitionWidth ? 'm-0' : ''
    },

    refreshButtonLabel () {
      return this.isMobileTransitionWidth ? '' : 'Refresh'
    },

    isMobileTransitionWidth () {
      return this.$q.screen.width < MOBILE_HEADER_TRANSITION_WIDTH
    },

    shouldShowRefreshButton () {
      return this.isStatsPage ||
             this.isContactsPage ||
             this.isInPowerDialerListPage ||
             this.isCommunicationsPage
    },

    isRefreshDisabled () {
      if (this.isStatsPage) {
        return this.loading
      }
      if (this.isContactsPage) {
        return this.loading || (this.contactsRefreshIsDisabled && this.isInPowerDialerListPage)
      }
      if (this.isInPowerDialerListPage) {
        return this.loading
      }
      if (this.isCommunicationsPage) {
        return this.loading
      }
      return false
    }
  },

  created () {
    this.$VueEvent.listen('callContact', (data) => {
      this.showDialer()

      setTimeout(() => {
        this.$VueEvent.fire('changePhoneNumber', data)
      }, 100)
    })
  },

  methods: {
    ...mapActions('stats', [
      'setMetricGroups',
      'setMetricLoader'
    ]),

    ...mapActions('contacts', [
      'updateContactsListFilter'
    ]),

    ...mapActions(['setDialerFormStatus']),

    reconnectDialer () {
      this.$VueEvent.fire('reconnectDialer')
    },

    toggleSidebar () {
      this.$emit('toggleSidebar')
    },

    showDialer () {
      if (!this.isDialerDisabled) {
        this.dialerStatus = true
      }
    },

    hideDialer () {
      this.dialerStatus = false
    },

    navigateBack (e) {
      const previousPage = _.get(this.$route.query, 'previousPage', null)
      const previousList = _.get(this.$route.query, 'list', null)

      if (previousPage && previousPage.replace(' ', '') === 'PowerDialer') {
        if (previousList) {
          this.$router.push(`/power-dialer/list/${previousList}`)
        } else {
          this.$router.push(`/power-dialer`)
        }
        return
      }

      if (['Settings Tab', EINBOXES_MENU_ITEMS_TITLE, EINBOXES_MENU_COMMUNICATIONS_TITLE].includes(this.$route.name)) {
        this.$router.back()
        return
      }

      if (this.selectedList.id.toString() === 'all') {
        this.$router.push({
          name: 'Contacts'
        })
      } else if (this.selectedList.id) {
        this.$router.push({
          path: `list/${this.selectedList.id}`
        })
      } else {
        this.$router.back()
      }

      if (e) {
        e.preventDefault()
      }
    },

    handleRefresh () {
      if (this.isStatsPage) {
        this.refreshMetricGroup()
      } else if (this.isContactsPage) {
        this.refreshContacts()
      } else if (this.isInPowerDialerListPage) {
        this.refreshPowerDialerListItems()
      } else if (this.isCommunicationsPage) {
        this.resetCommunications()
        this.getCommunications(this.communicationFilters)
      }
    },

    refreshMetricGroup () {
      this.setMetricLoader(true)
      this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.setMetricLoader(false)
          this.setMetricGroups(response.data)
        })
        .catch((err) => {
          console.error(err)
          this.setMetricLoader(false)
          this.$generalNotification('Failed to fetch metric groups.', 'error')
        })
    },

    refreshContacts () {
      this.initiateUpdateContactsListFilter()
      this.$VueEvent.fire('fetchContacts', {
        fromRefresh: true,
        clear: true,
        skipCache: true
      })
      this.$VueEvent.fire('fetchContactsLists')
    },

    onDialerErrorStatus () {
      if (this.dialer.error.code === 31208) {
        window.open('https://support.aloware.com/en/articles/9037858-troubleshooting-tip-audio-issues-during-calls-here-s-how-to-fix-it')
      }
    },

    refreshPowerDialerListItems () {
      this.$VueEvent.fire('fetchPowerDialerListItems')
    }
  },

  watch: {
    authenticated () {
      if (!this.authenticated) {
        this.hideDialer()
      }
    },

    'isMobile': function () {
      if (this.isMobile) {
        this.dialerStatus = false
      }
    },

    metricLoader () {
      this.loading = this.metricLoader
    },

    groupMetricLoader () {
      this.loading = this.groupMetricLoader
    },

    dialerStatus () {
      this.setDialerFormStatus(this.dialerStatus)
    },

    dialerFormStatus () {
      this.dialerStatus = this.dialerFormStatus
    },

    isDialerReady (value) {
      if (value && this.$route.query && this.$route.query.call) {
        this.$VueEvent.fire('make_new_call', {
          phone_number: this.$options.filters.fixPhone(this.$route.query.call),
          open_contact_page: true
        })
        let query = Object.assign({}, this.$route.query)
        delete query.call
        this.$router.replace({ query })
      }
    },

    $route (to, from) {
      this.prevRoute = from.path
    }
  }
}
</script>
