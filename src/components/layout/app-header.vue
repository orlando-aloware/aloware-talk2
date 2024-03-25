<template>
  <q-toolbar class="page-header"
             :class="{ 'pl-2 pr-2': !noPadding }">
    <div class="d-flex h-100 align-items-center">
      <back-button class="mobile-back-btn-global-header"
                   v-if="['Contact', 'Settings Tab'].includes($route.name)"
                   @click="navigateBack"/>
      <router-link class="btn-header-nav-back"
                   :to="backRoute"
                   v-if="['Communication'].includes($route.name)">
        <button class="more-details font-weight-light-bold btn btn-sm">
          <i class="fa fa-chevron-left" />
        </button>
      </router-link>
      <h1 v-if="isMainTitle">{{ $route.meta && $route.meta.title ? $route.meta.title : $route.name }}</h1>
      <h1 v-if="forcePageTitle">{{ forcePageTitle }}</h1>
      <h1 v-if="$q.screen.lt.md && ['Settings Tab'].includes($route.name)">{{ settingsTabHeaderName }}</h1>
      <contact-app-header v-if="['Contact'].includes($route.name) && !titleOnly"></contact-app-header>
      <contact-list-navigation v-if="['Contact'].includes($route.name) && !titleOnly" />
      <inbox-list-navigation v-if="(['Inbox', 'Inbox Contact Task'].includes($route.name) || ['/channels/inbox/open', '/channels/inbox/pending', '/channels/inbox/closed'].includes($route.path)) && !titleOnly" />
      <inbox-channel-navigation v-if="(['Inbox Contact', 'Inbox Contact Communication', 'Inbox Channel'].includes($route.name) || ['/channels/mentions/received', '/channels/mentions/sent'].includes($route.path)) && !titleOnly" />

      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center"
                   :disabled="loading"
                   v-if="$route.name === 'Stats' && !titleOnly"
                   @clicked="refreshMetricGroup">
        <refresh-icon :class="hideRefreshLabelClass"/>
        {{ refreshButtonLabel }}
      </compact-btn>

      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center"
                   :disabled="loading || contactsRefreshIsDisabled"
                   v-if="$route.name === 'Contacts'"
                   @clicked="refreshContacts">
        <refresh-icon :class="hideRefreshLabelClass"/>
        {{ refreshButtonLabel }}
      </compact-btn>

      <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center align-items-center"
                   :disabled="loading"
                   v-if="isInPowerDialerPage"
                   @clicked="refreshPowerDialerListItems">
        <refresh-icon :class="hideRefreshLabelClass"/>
        {{ refreshButtonLabel }}
      </compact-btn>

      <a href="https://support.aloware.com/exploring-aloware-talks-broadcast"
         target="_blank"
         v-if="$route.name === 'Broadcasts'">
        <information-circle-icon class="ml-2 cursor-pointer"/>
        <q-tooltip>
          Check the article how to use the Broadcast
        </q-tooltip>
      </a>

      <inbox-my-contacts-filter v-if="(!isMobile || !$q.screen.lt.md) && isInInboxPage"/>
    </div>

    <tutorial-video-button />

    <!--div class="ml-auto d-none d-lg-block h-100"-->
    <div class="ml-auto d-block h-100">
      <div class="d-flex h-100 align-items-center justify-content-end ml-1">

        <shared-login-menu v-if="!isElectron" />

        <header-help v-if="!isTrialKYC" />

        <q-item v-if="!statics.whitelabel">
          <q-item-section class="nav-item dropdown">
            <div class="hyperlink-color nav-link ak-trigger pl-0 cursor-pointer">
              <span class="fa fa-bullhorn changelog-trigger pointer"
                    style="font-size: 1.2rem">
              </span>
              <AnnounceKit style="position: fixed;"
                           catchClick=".ak-trigger"
                           :user="currentUser"
                           :widget="akWidgetUrl" />
            </div>
          </q-item-section>
        </q-item>

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
            <p>Click here to reconnect or please check the <a href="https://support.aloware.com/understanding-and-fixing-common-dialer-errors-in-aloware-a-comprehensive-guide" target="_blank">troubleshooting guide here</a>.</p>
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
            <a href="https://support.aloware.com/troubleshooting-tip-audio-issues-during-calls-heres-how-to-fix-it" target="_blank"
               v-if="dialer.error.code === 31208">
              See fix
            </a>
          </b-popover>
        </q-item>
      </div>
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">

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
  kycMixin
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
import InboxMyContactsFilter from 'components/inbox/inbox-my-contacts-filter'
import DialerErrorIcon from 'components/icons/dialer-error-icon'
import DialerIcon from 'components/icons/dialer-icon'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import * as Roles from 'src/constants/roles'
import { PHONE_USAGE_ERRORS } from 'src/constants/twilio-error-codes'
import * as storage from 'src/plugins/helpers/storage'
import AnnounceKit from 'announcekit-vue'
import TutorialVideoButton from 'components/tutorial-video-button'
import { MOBILE_HEADER_TRANSITION_WIDTH } from 'src/constants/viewport-sizes'

export default {
  name: 'app-header',

  mixins: [
    aclMixin,
    simpsocialMixin,
    avatarMixin,
    goBackMixin,
    contactsListFiltersMixin,
    userMixin,
    kycMixin
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
    InboxMyContactsFilter,
    AnnounceKit,
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
      PHONE_USAGE_ERRORS
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

    akWidgetUrl () {
      return storage.local.getItem('ak_widget_url')
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
        return {
          name: 'Contact',
          params: {
            id: this.$route.params.contactId
          }
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

    isInPowerDialerPage () {
      return this.$route.name === 'Power Dialer' && this.$route.meta?.id !== 'power-dialer-session'
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

      if (previousPage &&
        previousPage.replace(' ', '') === 'PowerDialer') {
        if (previousList) {
          this.$router.push(`/power-dialer/list/${previousList}`)
        } else {
          this.$router.push(`/power-dialer`)
        }
        return
      }

      if (this.$route.name === 'Settings Tab') {
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
      this.$VueEvent.fire('fetchContacts', { fromRefresh: true })
      this.$VueEvent.fire('fetchContactsLists')
    },

    onDialerErrorStatus () {
      if (this.dialer.error.code === 31208) {
        window.open('https://support.aloware.com/troubleshooting-tip-audio-issues-during-calls-heres-how-to-fix-it')
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
          phone_number: this.$options.filters.fixPhone(this.$route.query.call)
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
