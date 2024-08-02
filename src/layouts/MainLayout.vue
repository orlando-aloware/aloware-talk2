<template>
  <div class="h-100"
       :class="mainLayoutClass"
       v-if="isShowPage">
    <div class=" h-100 w-100 d-flex align-items-center justify-content-center text-center unsupported">
      <span>This screen size is not supported.</span>
    </div>
    <template v-if="isAuthenticated && !loading && companyHasTrialStatus">
      <trial-expired-modal v-if="isTrialExpired"/>
      <cancelled-account-modal v-else-if="isCancelledAccount"/>
      <trial-banner v-else-if="isTrialKYC"/>
    </template>
    <div class="page h-100">
      <q-layout class="page-layout position-relative overflow-hidden-y h-100"
                view="lHh Lpr lff"
                :class="pageLayoutHeightClass"
                style="min-height: 0 !important;">
        <div class="h-100 position-relative"
             :class="headerContainerClass">
          <q-header class="page-header bg-white text-black no-box-shadow position-absolute"
                    :class="pageHeaderClass"
                    v-if="showHeader">
            <mobile-live-call-bar v-if="!mobilePhoneDrawer && !suspended"
                                  @shown="onShowMobileLiveCallBar"/>
            <app-header v-if="isShowAppHeader"
                        @toggleSidebar="toggleSidebar"/>
          </q-header>
          <q-page-container ref="page-container"
                            :class="pageContainerClasses">
            <section class="main-content section h-100">
              <template v-if="!loading || suspended">
                <router-view></router-view>
              </template>
              <div class="d-flex justify-content-center align-items-center text-center text-black h-100"
                   v-else-if="loading && !suspended">
                <div class="container">
                  <q-spinner-bars color="primary"
                                  size="40px">
                  </q-spinner-bars>
                  <div>
                    <div v-if="!onlineStatus">
                      <span>Network is <b>offline</b></span>
                    </div>
                    <div v-else-if="!authCheckStatus && !loading">
                      <span>Checking authentication</span>
                      <div class="container"
                           v-if="showRefreshButton">
                        <b-button type="is-link"
                                  expanded
                                  @click="refreshPage">
                          Refresh
                        </b-button>
                      </div>
                    </div>
                    <div v-else>
                      <span>Loading</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <dialer v-if="authenticated && !suspended && !isWidget"/>
          </q-page-container>
        </div>
        <q-drawer class="h-100 sidebar-wrapper d-block position-absolute top-0"
                  content-class="sidebar"
                  :breakpoint="0"
                  :width="64"
                  v-model="sidebarVisible"
                  v-if="authenticated && !suspended && !isWidget">
          <q-list>
            <app-sidebar class="page-sidebar"
                         :lightMode="lightMode"
                         :xmasEnabled="isXmasEnabled"
                         @toggleMode="toggleMode">
            </app-sidebar>
          </q-list>
        </q-drawer>
        <q-drawer class="mobile-phone-drawer position-relative h-100 overflow-hidden"
                  ref="mobilePhone"
                  side="right"
                  bordered
                  no-swipe-close
                  :overlay="false"
                  :class="mobilePhoneDrawerClass"
                  :breakpoint="789"
                  v-model="mobilePhoneDrawer"
                  v-if="authenticated && !suspended && !isWidget"
                  @hide="onCloseMobilePhone">
          <q-header class="page-header bg-white text-black no-box-shadow dialer-header"
                    v-if="!isPhoneVisible && isMobile">
            <app-header force-page-title="Phone"
                        :no-padding="true"
                        :title-only="true"/>
          </q-header>
          <phone :isMobile="isMobile"
                 :class="{ 'hide': !mobilePhoneDrawer }"
                 @onPhoneVisible="onPhoneVisible">
          </phone>
          <dialer-form ref="dialerForm"
                       class="dialerForm"
                       :class="{ 'hide': (isPhoneVisible || !mobilePhoneDrawer) }"
                       v-model="mobilePhoneDrawer"
                       v-if="isMobile">
          </dialer-form>
        </q-drawer>
        <app-footer class="page-footer row d-block w-100 m-0 px-1 flex-grow-0"
                    ref="appFooter"
                    v-if="authenticated && !isWidget && !loading && isMobile && !suspended && showMobileFooter"
                    @toggleMobilePhone="toggleMobilePhone">
        </app-footer>
      </q-layout>
      <q-dialog transition-show="scale"
                transition-hide="scale"
                persistent
                v-model="showNewVersionDialog">
        <q-card class="bg-blue text-white"
                style="width: 300px">
          <q-card-section>
            <div class="text-h6">Update Available</div>
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-html="updateDialogText">
          </q-card-section>

          <q-card-actions align="right"
                          class="bg-white">
            <q-btn label="Close"
                   text-color="blue"
                   v-close-popup flat>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog transition-show="scale"
                transition-hide="scale"
                persistent
                v-model="showUpdateErrorDialog">
        <q-card class="bg-red text-white width-300">
          <q-card-section>
            <div class="text-h6">Download Failed</div>
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-html="updateDialogText">
          </q-card-section>

          <q-card-actions align="right"
                          class="bg-white">
            <q-btn label="Close"
                   text-color="blue"
                   v-close-popup
                   flat>
            </q-btn>
            <q-btn label="Quit"
                   text-color="red"
                   flat
                   @click="quitApp">
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog transition-show="scale"
                transition-hide="scale"
                persistent
                v-model="showUpdateDownloadedDialog">
        <q-card class="bg-green-7 text-white"
                style="width: 300px">
          <q-card-section>
            <div class="text-h6">Update Downloaded</div>
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-html="updateDialogText">
          </q-card-section>

          <q-card-actions align="right"
                          class="bg-white">
            <q-btn label="Close"
                   text-color="blue"
                   flat
                   v-close-popup>
            </q-btn>
            <q-btn label="Restart"
                   text-color="green-7"
                   flat
                   @click="restartApp">
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <Modal id="missed-call-modal"
             size="xs">
        <template #title>
          <h2>Missed Call</h2>
        </template>
        <p>You missed a call, so we marked your current status as busy.</p>
        <p>Do you want your status to be available?</p>
        <template #footer>
          <div class="w-100">
            <b-button size="sm"
                      class="float-left"
                      variant="outline-dark"
                      @click="stayBusy">
              Stay Busy
            </b-button>
            <b-button size="sm"
                      class="float-right"
                      variant="primary"
                      @click="goAvailable">
              Go Available
            </b-button>
          </div>
        </template>
      </Modal>

      <pro-feature-dialog/>

      <kyc-fill-dialog :show="shouldShowKycFillDialog"
                       v-if="shouldShowKycFillDialog"/>
      <kyc-reload-dialog :show="shouldShowKycReloadDialog" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import {
  aclMixin,
  htmlMixin,
  webrtcMixin,
  notificationMixin,
  notificationQueueMixin,
  broadcastMixin,
  parkCallMixin,
  visibilityMixin,
  unownedContactTaskMixin,
  agentMixin,
  contactV2AttributesMixin,
  kycMixin,
  simpsocialMixin,
  userMixin,
  settingsMixin,
  broadcastsMixin
} from 'src/boot/mixins'
import AppHeader from 'src/components/layout/app-header'
import AppFooter from 'src/components/layout/app-footer'
import AppSidebar from 'src/components/layout/app-sidebar'
import Dialer from 'src/components/dialer/dialer'
import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as MetricOptionGroups from 'src/constants/metric-option-groups'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import * as CommunicationDirection from 'src/constants/communication-direction'
import {
  CURRENT_STATUS_HOLD_NEW,
  CURRENT_STATUS_INPROGRESS_NEW,
  CURRENT_STATUS_COMPLETED_NEW,
  INCOMING_STATUSES,
  ALL_INPROGRESS_STATUSES,
  COMPLETED_STATUSES,
  INPROGRESS_UNCONNECTED_STATUSES
} from 'src/constants/communication-current-status'
import _ from 'lodash'
import DialerForm from 'components/dialer/dialer-form'
import Phone from 'components/dialer/phone'
import MobileLiveCallBar from 'components/dialer/mobile-live-call-bar'
import * as storage from 'src/plugins/helpers/storage'
import { ALL_DIRECTIONS } from 'src/constants/communication-direction'
import ProFeatureDialog from 'components/pro-feature-dialog.vue'
import KycFillDialog from 'components/kyc-fill-dialog.vue'
import KycReloadDialog from 'components/kyc-reload-dialog.vue'
import store from 'src/store'
import {
  TYPE_EXPORT_POWER_DIALER_LIST_ITEMS,
  TYPE_EXPORT_CONTACT_LIST_ITEMS
} from 'src/constants/export-types-default'
import Modal from 'components/modal.vue'
import talk2Api from 'src/plugins/api/api'
import {
  MAX_SCREEN_WIDTH_MOBILE_HEADER
} from 'src/constants/viewport-sizes'
import TrialBanner from 'components/trial-banner.vue'
import * as TrialStatus from 'src/constants/trial-account-status'
import TrialExpiredModal from 'src/components/trial-expired-modal.vue'
import CancelledAccountModal from 'src/components/cancelled-account-modal.vue'

export default {
  name: 'MyLayout',

  props: {
    api_key: {
      type: String,
      required: false,
      default: null
    }
  },

  components: {
    MobileLiveCallBar,
    DialerForm,
    AppHeader,
    AppFooter,
    AppSidebar,
    Dialer,
    Phone,
    ProFeatureDialog,
    KycFillDialog,
    KycReloadDialog,
    Modal,
    TrialBanner,
    TrialExpiredModal,
    CancelledAccountModal
  },

  mixins: [
    webrtcMixin,
    htmlMixin,
    aclMixin,
    notificationMixin,
    notificationQueueMixin,
    broadcastMixin,
    parkCallMixin,
    visibilityMixin,
    unownedContactTaskMixin,
    agentMixin,
    contactV2AttributesMixin,
    kycMixin,
    simpsocialMixin,
    userMixin,
    settingsMixin,
    broadcastsMixin
  ],

  data () {
    return {
      loading: true,
      loadingCampaigns: false,
      loadingRingGroups: false,
      loadingUsers: false,
      loadingTags: false,
      loadingWorkflows: false,
      loadingDispositionStatuses: false,
      loadingCallDispositionStatuses: false,
      loadingActivityTypes: false,
      loadingScripts: false,
      loadingTemplates: false,
      loadingBroadcasts: false,
      loadingAvailableMetrics: false,
      loadingMetricGroups: false,
      loadingLeadSources: false,
      transitionName: null,
      prevHeight: 0,
      push: null,
      minVersion: null,
      version: null,
      showNewVersionDialog: false,
      showUpdateDownloadedDialog: false,
      showUpdateErrorDialog: false,
      onlineStatus: 'offline',
      authCheckStatus: false,
      showRefreshButton: false,
      updateDialogText: null,
      sidebarVisible: false,
      lightMode: true,
      mobilePhoneDrawer: false,
      isPhoneVisible: false,
      metricsDataLoaded: false,
      checkDebounce: null,
      userSuspended: false,
      accountSuspended: false,
      allowedExports: [
        TYPE_EXPORT_CONTACT_LIST_ITEMS,
        TYPE_EXPORT_POWER_DIALER_LIST_ITEMS
      ],
      mainListeners: {},
      isElectronEventsStarted: false,
      isMainEventsStarted: false,
      showMobileFooter: false,
      showHeader: true,
      mobileLiveCallBarShown: false,
      CommunicationTypes,
      MetricOptionGroups,
      AppDefaultLogin,
      isFirstLoading: true
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany',
      'timezones'
    ]),

    ...mapState([
      'dialer',
      'campaigns',
      'isMobile',
      'ringGroups',
      'notifications',
      'showPhone',
      'suspended',
      'parkedCalls',
      'leadSources',
      'isIntroVideoVisible',
      'showedKycDialog',
      'showedKycReloadDialog',
      'statics',
      'isWidget'
    ]),

    ...mapState('auth', [
      'profile',
      'authenticated'
    ]),

    ...mapState('stats', [
      'availableMetrics'
    ]),

    ...mapState('contacts', [
      'showContactsHeader'
    ]),

    ...mapState('inbox', [
      'selectedContact',
      'liveContacts'
    ]),

    ...mapState('powerDialer', [
      'ongoingSession'
    ]),

    ...mapState(['xmasEnabled']),

    ...mapFields('powerDialer', [
      'sessionPaused'
    ]),

    isGuest () {
      return _.get(this.$route.meta, 'isGuest', false)
    },

    isTrialExpired () {
      return this.currentCompany && [TrialStatus.TRIAL_STATUS_EXPIRED, TrialStatus.TRIAL_STATUS_PURGE_ELIGIBLE].includes(this.currentCompany.trial_status)
    },

    isCancelledAccount () {
      return this.currentCompany && this.currentCompany.subscription?.status === 'cancelled' && !this.currentCompany.is_whitelabel
    },

    companyHasTrialStatus () {
      return this.currentCompany?.trial_status
    },

    pageClass () {
      const pageSlug = _.get(this.$route.meta, 'title', this.$route.name).toLowerCase()

      return pageSlug.replace(/ /g, '_') + '-page'
    },

    isMobilePhoneClosed () {
      return this.mobilePhoneDrawer && !this.isPhoneVisible
    },

    pageLayoutHeightClass () {
      const isPhoneVisible = (this.$route.name === 'Phone' && !this.isPhoneVisible)

      if (!this.isMobile || this.isMobilePhoneClosed || isPhoneVisible) {
        return ['h-100']
      }

      const statuses = ['RECEIVED_CALL_INVITE', 'WRAP_UP']
      const isCallInProgress = this.dialer.call && !statuses.includes(this.dialer.currentStatus)
      const callInProgressWithoutParkedCall = isCallInProgress && !this.dialer.parkedCall
      const noCallInProgress = !this.dialer.call || statuses.includes(this.dialer.currentStatus)
      const noCallInProgressWithParkedCall = noCallInProgress && this.dialer.parkedCall

      if (callInProgressWithoutParkedCall || noCallInProgressWithParkedCall) {
        return ['h-1-livebar']
      }

      if (this.dialer.call && !statuses.includes(this.dialer.currentStatus) && this.dialer.parkedCall) {
        return ['h-2-livebar']
      }

      return ['h-100']
    },

    pageContainerClasses () {
      return {
        'page-container h-100': true
      }
    },

    mobilePhoneDrawerClass () {
      return {
        'hidden': !this.mobilePhoneDrawer,
        'mobile-phone-visible': this.isPhoneVisible
      }
    },

    isSamePDListId () {
      return this.$route.params.id === this.ongoingSession.listId
    },

    isNotInInbox () {
      const inboxRoutes = ['Inbox', 'Inbox Channel Task Status', 'Inbox Contact Task']

      return this.$route.path.indexOf('channels/inbox') === -1 && !inboxRoutes.includes(this.$route.name)
    },

    mainLayoutClass () {
      const pageClass = this.authenticated && !this.suspended ? `dashboard ${this.pageClass}` : 'guest'
      const modeClass = this.lightMode ? 'light-mode' : 'night-mode'

      return [
        pageClass,
        modeClass
      ]
    },

    isShowPage () {
      const isUnauthenticated = this.isGuest && !this.authenticated

      return this.isAuthenticated || isUnauthenticated || this.suspended
    },

    headerContainerClass () {
      const sidebarClass = this.sidebarVisible ? 'sidebar-active' : ''
      const mobilePhoneClass = this.mobilePhoneDrawer ? 'hidden' : ''

      return [
        sidebarClass,
        mobilePhoneClass
      ]
    },

    screenWidth () {
      return this.$q.screen.width
    },

    isShowAppHeader () {
      let showForMobile = false

      if ((this.isMobile && !this.mobilePhoneDrawer) || !this.isMobile) {
        showForMobile = true
      }

      return this.authenticated && !this.isWidget && !this.loading &&
        this.showContactsHeader && !this.suspended && showForMobile
    },

    pageHeaderClass () {
      return !this.isShowAppHeader || !this.mobileLiveCallBarShown
        ? 'h-auto' : ''
    },

    isDemoCompany () {
      return Object.values(process.env.DEMO_COMPANY_IDS).includes(this.currentCompany.id)
    },

    shouldShowKycFillDialog () {
      return this.isAuthenticated &&
             this.isIntroVideoVisible === null &&
             !this.isFirstLoading &&
             !this.showedKycDialog &&
             this.profile?.company?.kyc_filled === false &&
             !this.$router.currentRoute.name.includes('Business Information')
    },

    shouldShowKycReloadDialog () {
      return this.isAuthenticated &&
            !this.isFirstLoading &&
            this.showedKycReloadDialog &&
            this.profile?.company?.is_trial
    },

    isAuthenticated () {
      return !this.isGuest && this.authenticated
    }
  },

  created () {
    if (this.api_key) {
      localStorage.setItem('api_token', this.api_key)
    }

    this.showMobileFooter = this.isMobile
    this.checkDebounce = _.debounce(this.check, 1000)

    if (this.$route.name === 'Suspended') {
      this.setSuspended(true)
    }

    this.setNotificationAudio()
    this.setFishingModeNotificationAudio()

    if (this.$route.name === 'Phone' && !this.isMobile) {
      this.$router.replace({ path: '/' })
    }

    this.resetCall()
    this.resetNotifications()

    // Quasar global config
    this.$q.iconSet.arrow.dropdown = 'o_expand_more'

    window.handleOpenURL = (url) => {
      this.processDeepLinkActions(url)
    }

    this.mainListeners.hideMobileFooter = (shouldHide) => {
      if (!shouldHide) {
        this.showMobileFooter = this.isMobile

        return
      }

      this.showMobileFooter = !shouldHide
    }

    if (this.$q.platform.is.electron) {
      this.$q.electron.ipcRenderer.send('app_version')

      this.mainListeners.openUrl = (event, data) => {
        this.processDeepLinkActions(data)
      }

      this.mainListeners.updateAvailable = (event, data) => {
        this.updateDialogText = data
        this.showUpdateDownloadedDialog = false
        this.showUpdateErrorDialog = false
        this.showNewVersionDialog = true
      }

      this.mainListeners.updateDownloaded = (event, data) => {
        this.updateDialogText = data
        this.showNewVersionDialog = false
        this.showUpdateErrorDialog = false
        this.showUpdateDownloadedDialog = true
      }

      this.mainListeners.updateError = (event, data) => {
        this.updateDialogText = data
        this.showNewVersionDialog = false
        this.showUpdateDownloadedDialog = false
        this.showUpdateErrorDialog = true
      }

      this.mainListeners.appVersion = (event, data) => {
        this.version = data.version
        storage.local.setItem('version', this.version)
        window.axios.defaults.headers.common['Version'] = this.version
        this.$axios = window.axios
      }

      this.mainListeners.bounceDock = () => {
        this.bounceDock()
      }

      this.mainListeners.setBadge = (badgeText) => {
        if (badgeText === undefined) {
          return
        }
        this.setBadge(badgeText.toString())
      }

      this.mainListeners.increaseBadge = (count) => {
        this.increaseAppBadge(count)
      }

      this.mainListeners.decreaseBadge = (count) => {
        this.decreaseAppBadge(count)
      }

      if (!this.isElectronEventsStarted) {
        this.isElectronEventsStarted = true
        this.startElectronEvents()
      }
    }

    // new in-app contact assigned notification
    // this.$VueEvent.listen('new_in_app_contact_assigned', (contact) => {
    //   if (this.checkContactMatchesUserAccessibility(contact) && !this.profile.sleep_mode) {
    //     this.handleInAppContactNotification(contact)
    //   }
    // })

    // new in-app appointment notification
    // this.$VueEvent.listen('new_in_app_appointment', ({engagement, contact, time_diff, unit}) => {
    //   if (!this.profile.sleep_mode) {
    //     this.handleInAppAppointmentNotification(engagement, contact, time_diff, unit)
    //   }
    // })

    // new in-app reminder notification
    // this.$VueEvent.listen('new_in_app_reminder', ({engagement, contact, time_diff, unit}) => {
    //   if (!this.profile.sleep_mode) {
    //     this.handleInAppReminderNotification(engagement, contact, time_diff, unit)
    //   }
    // })

    this.mainListeners.newInAppCall = (communication) => {
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)
      const isFishingMode = ringGroup && ringGroup.should_queue && ringGroup.fishing_mode

      if (!isFishingMode && !this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      const communicationType = communication.current_status2 === CURRENT_STATUS_COMPLETED_NEW &&
      communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW
        ? 'missed call'
        : 'call'

      // ignore call notifications if the call is not fishing mode and the user is in sleep mode
      if ((isFishingMode || communication.is_call_waiting) || !this.profile.sleep_mode) {
        this.processActionNotification(communication, communicationType)
      }
    }

    this.mainListeners.newInAppSms = (communication) => {
      if (!this.checkCommunicationMatchesUserAccessibility(communication) || this.profile.sleep_mode) {
        return
      }

      this.processActionNotification(communication, 'sms')
    }

    this.mainListeners.newDesktopHighSmsVolume = (data) => {
      if (this.profile.sleep_mode) {
        return
      }
      this.handleDesktopHighSmsVolumeNotification(data.incomingNumber, data.contact, data.direction)
    }

    this.mainListeners.newInAppVoicemail = (communication) => {
      if (!this.checkCommunicationMatchesUserAccessibility(communication) || this.profile.sleep_mode) {
        return
      }

      this.processActionNotification(communication, 'missed voicemail')
    }

    this.mainListeners.newDesktopContactAssigned = (contact) => {
      if (!this.checkContactMatchesUserAccessibility(contact)) {
        return
      }

      this.handleDesktopContactNotification(contact)
    }

    this.mainListeners.newDesktopAppointment = ({ engagement, contact, timeDiff, unit }) => {
      this.handleDesktopAppointmentNotification(engagement, contact, timeDiff, unit)
    }

    this.mainListeners.newDesktopReminder = ({ engagement, contact, timeDiff, unit }) => {
      this.handleDesktopReminderNotification(engagement, contact, timeDiff, unit)
    }

    this.mainListeners.newDesktopCall = (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    }

    this.mainListeners.answeredDesktopCall = (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    }

    this.mainListeners.newDesktopSms = (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    }

    this.mainListeners.newDesktopFax = (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    }

    this.mainListeners.newDesktopVoicemail = (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopVoicemailNotification(communication)
      }
    }

    this.mainListeners.mention = (data) => {
      if (this.checkMentionMatchesUserAccessibility(data)) {
        this.processActionNotification(data, 'mention')
      }
    }

    this.mainListeners.updateCommunication = (communication) => {
      const parkedCall = _.get(this.dialer, 'parkedCall', null)
      const isCommunicationHasUnownedContact = this.isNotOwned(communication.contact.user_id)
      const parkedCallFound = this.parkedCalls.find(comm => comm.id === communication.id)

      this.removeQueuedNotification(communication.id, communication.disposition_status2, communication.current_status2)

      // update unowned parked call contact's last communication
      if (isCommunicationHasUnownedContact && parkedCallFound) {
        this.updateLiveContactLastCommProperties({
          id: communication.contact_id,
          status: communication.current_status2,
          user_id: communication.user_id
        })
      }

      // remove the parked call if the caller was disconnected
      if (communication.current_status2 === CURRENT_STATUS_COMPLETED_NEW &&
        parkedCall && parkedCall.id === communication.id) {
        this.setDialerParkedCall()
        this.removeParkedCall(communication.id)
      }

      if (!this.checkCommunicationMatchesUserAccessibility(communication) && !isCommunicationHasUnownedContact) {
        return
      }

      // if disposition status is not in-progress
      // or current status is not queued / ring all, close call notification
      if (communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ||
        !INCOMING_STATUSES.includes(communication.current_status2)) {
        this.closeCallNotifications(this.getNotificationType(communication.ring_group_id), communication.id)
      }

      if (!this.isNotInInbox || !communication.contact_id) {
        return
      }

      const newCommunication = this.$jsonClone(communication)

      const isActiveInLiveContactsIndex = this.liveContacts.findIndex(item => item.id === communication.contact_id &&
        ALL_INPROGRESS_STATUSES.includes(item.last_communication.current_status2))

      if (isActiveInLiveContactsIndex >= 0 && this.liveContacts[isActiveInLiveContactsIndex].last_communication.id === communication.id) {
        const liveContacts = _.cloneDeep(this.liveContacts)

        const contactWithV2Attributes = this.addV2ContactAttributes(communication.contact, newCommunication, liveContacts[isActiveInLiveContactsIndex])

        // add the v2 contact attributes that we need
        Object.assign(liveContacts[isActiveInLiveContactsIndex], contactWithV2Attributes)

        // if type is call and completed/voicemail then remove from live calls
        if (ALL_DIRECTIONS.includes(communication.direction) &&
          communication.type === CommunicationTypes.CALL &&
          COMPLETED_STATUSES.includes(communication.current_status2)) {
          liveContacts.splice(isActiveInLiveContactsIndex, 1)
        }

        this.processLiveContacts(liveContacts)

        return
      }

      if (isActiveInLiveContactsIndex >= 0) {
        return
      }

      const index = this.liveContacts.findIndex(item => item.id === communication.contact_id)

      if (index >= 0) {
        const liveContacts = _.cloneDeep(this.liveContacts)
        // add the v2 contact attributes that we need
        Object.assign(liveContacts[index], this.addV2ContactAttributes(communication.contact, newCommunication, liveContacts[index]))

        this.processLiveContacts(liveContacts)
      }
    }

    this.mainListeners.newVersion = () => {
      // if (this.isWidget) {
      //  return
      // }

      // const data = {
      //   title: 'System Updates',
      //   message: 'Refresh your screen',
      //   messageIcon: null,
      //   attachment: null,
      //   type: 'system'
      // }
      // this.$actionNotification(data)
    }

    this.mainListeners.contactUpdated = (data) => {
      const contact = this.$jsonClone(data)
      // add the v2 contact attributes that we need
      Object.assign(contact, this.addV2ContactAttributes(contact))

      // only fetch the latest contact data when updated contact is also the selected contact
      // this is to avoid swarm of api request when numbers of contacts get updated
      if (this.$route.path.indexOf('channels/inbox') === -1 && this.selectedContact &&
        parseInt(this.selectedContact.id) === parseInt(data.id)) {
        // just update the contact attributes
        const updatedContact = this.$jsonClone(this.selectedContact)
        Object.assign(updatedContact, contact)
        this.setSelectedContact(updatedContact)
      }

      // update contact in group
      this.$VueEvent.fire('update-contact-in-group', contact)
    }

    this.mainListeners.newCommunication = (communication) => {
      if (!this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      if (this.isNotInInbox) {
        // Do not alter live contacts if it's in active mode
        const isActiveInLiveContactsIndex = this.liveContacts.findIndex(item => item.id === communication.contact_id &&
          ALL_INPROGRESS_STATUSES.includes(item.last_communication.current_status2))

        if (isActiveInLiveContactsIndex >= 0) {
          return
        }

        const contact = this.$jsonClone(communication.contact)
        const newCommunication = this.$jsonClone(communication)
        const contactsWithV2Attributes = this.addV2ContactAttributes(contact, newCommunication, contact)
        // add the v2 contact attributes that we need
        Object.assign(contact, contactsWithV2Attributes)

        const isInLiveContacts = this.liveContacts.find(item => item.id === contact.id)

        // check if communication is a live call
        if (communication.type === CommunicationTypes.CALL &&
          ALL_DIRECTIONS.includes(communication.direction) &&
          ALL_INPROGRESS_STATUSES.includes(communication.current_status2)) {
          const liveContacts = _.cloneDeep(this.liveContacts)

          if (!isInLiveContacts) {
            liveContacts.push(contact)
          }

          this.processLiveContacts(liveContacts)
        }
      }
    }

    this.mainListeners.userUpdated = (user) => {
      this.checkSuspended(user, true)

      // if (this.profile && user.id === this.profile.id && this.profile.agent_status !== user.agent_status) {
      if (this.profile && user.id === this.profile.id) {
        // this.setAgentStatus(user.agent_status)
        this.setProfile(user)
        /* eslint-disable */console.log(...oo_oo(`925746293_960_8_960_72_4`,'Changed agent status [event]: ', user.agent_status))
      }
    }

    this.mainListeners.companyUpdated = (company) => {
      this.checkSuspended(company)
    }

    this.mainListeners.kycStatusUpdated = (company) => {
      if (this.isTrialKYC && this.isNotSimpsocial && !this.isModGen) {
        this.setShowedKycReloadDialog(true)
      }
    }

    this.mainListeners.agentStatusUpdated = (event) => {
      this.updateUserStatus(event)

      if (this.currentCompany && event.company_id && event.company_id === this.currentCompany.id &&
        this.profile && event.user_id === this.profile.id && this.profile.agent_status !== event.agent_status) {
        this.setAgentStatus(event.agent_status)
        /* eslint-disable */console.log(...oo_oo(`925746293_980_8_980_73_4`,'Changed agent status [event]: ', event.agent_status))
      }
    }

    this.mainListeners.changeAgentStatus = (agentStatus, signature = 'Talk-MainListeners-ChangeAgentStatus') => {
      this.changeAgentStatus(agentStatus, false, 1, signature)
    }

    this.mainListeners.exportEventCreate = (task) => {
      if (!this.allowedExports.includes(task.export.type) || task.export.user_id !== this.profile.id) {
        return
      }

      const type = task.export.type === TYPE_EXPORT_POWER_DIALER_LIST_ITEMS ? 'Power Dialer' : 'Contacts'
      this.$generalNotification(`${type} list is being exported. Please wait for a while.`, 'success')
    }

    this.mainListeners.exportEventUpdate = (task) => {
      if (!this.allowedExports.includes(task.export.type) || task.export.user_id !== this.profile.id) {
        return
      }

      const listText = task.export.type === TYPE_EXPORT_POWER_DIALER_LIST_ITEMS ? 'Power Dialer list' : 'Contacts list'
      this.$generalNotification(
        `Your ${listText} export is now available.<a id="${task.export.uuid}" href="${task.export.url}" style="opacity: 0; height: 0; width: 0;" download target="_blank"></a>`,
        'export-csv',
        0,
        true,
        {
          uuid: task.export.uuid,
          filename: `${task.export.uuid}.csv`
        }
      )
    }

    this.mainListeners.exportEventDelete = (task) => {
      if (!this.allowedExports.includes(task.export.type) || task.export.user_id !== this.profile.id) {
        return
      }

      /* eslint-disable */console.log(...oo_oo(`925746293_1020_6_1020_86_4`,' %c EXPORT EVENT DELETE : ', 'background: red; color: #fff;', task))
    }

    this.mainListeners.bulkContactsDeleted = (event) => {
      if ('success' in event && !event.success) {
        this.$generalNotification(event.message, 'error')
        return
      }

      this.$generalNotification(event.message)
    }

    this.mainListeners.contactListBulkCreated = (event) => {
      // Save the event to vuex
      this.storeBulkActionNotification(event)

      // Verify if we're in the contact list page
      const isContactsListPage = this.$route.meta?.id === 'power-dialer-list-filter'
      const isIdMatch = this.$route.params.id === event.contact_list_id
      if (isContactsListPage && isIdMatch) {
        // Notify user of finish and push user to power dialer list
        this.$generalNotification('Contacts were added to your Power Dialer list', null, null, false, {
          path: `/power-dialer/list/${event.contact_list_id}/in-queue`
        })
      }
    }

    // new in-app fax notification
    // this.$VueEvent.listen('new_in_app_fax', (communication) => {
    //   if (this.checkCommunicationMatchesUserAccessibility(communication) && !this.profile.sleep_mode) {
    //     this.handleInAppCommunicationNotification(communication)
    //   }
    // })

    // update agent status every 2 minutes
    // disabled by Sohrab on July 26th, 2022
    /*
    const statusInterval = 2 * 60 * 1000
    if (!window.agentStatusIntervalId) {
      window.agentStatusIntervalId = setInterval(() => {
        const now = new Date().getTime()
        const lastRun = localStorage.getItem('agentStatusIntervalLastRun') || 0

        // only runs if last run was at least the defined time ago (to avoid multiple tabs running multiple requests)
        if (now - lastRun >= statusInterval) {
          // this is a recursive agent status check with 3 retries
          this.getAgentStatus()
          localStorage.setItem('agentStatusIntervalLastRun', now)
        }
      }, statusInterval)
    }
    */

    if (!this.isMainEventsStarted) {
      this.isMainEventsStarted = true
      this.startMainEvents()
    }

    if (this.$q.platform.is.electron) {
      this.$q.notify.setDefaults({
        position: 'top',
        color: 'white',
        textColor: 'black'
      })
    } else {
      this.$q.notify.setDefaults({
        position: 'top-right',
        color: 'white',
        textColor: 'black'
      })
    }

    if (this.authenticated) {
      this.initAuth()
      this.fetchAllParkedCalls()
    } else {
      this.check().then(() => {
        this.loading = false
        this.authCheckStatus = true
        this.showRefreshButton = false
      }).catch(() => {
        if (!this.isGuest) {
          const route = {
            name: 'Login'
          }

          if (this.$route.fullPath !== '/') {
            route.query = {
              redirect: this.$route.fullPath
            }
          }

          this.$router.push(route).catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1113_12_1113_28_4`,err))
            this.showRefreshButton = true
          })
        }

        if (this.currentCompany && this.isGuest) {
          this.getStatics()
        }

        this.loading = false
        this.authCheckStatus = false
      })
    }

    window.addEventListener('resize', this.resizeHandler)

    if (!this.isMobile) {
      this.setShowContactsHeader(true)
    }

    this.resetPowerDialerSession(this.$route)

    // temporary
    if (this.$route.name === 'Broadcasts' && !this.canUseBroadcast) {
      this.$router.push({ path: '/' })
    }
  },

  mounted () {
    if (this.authenticated) {
      this.sidebarVisible = true
    }

    // check auth every 5 minutes
    const checkInterval = 5 * 60 * 1000

    if (!window.sessionIntervalId) {
      window.sessionIntervalId = setInterval(() => {
        const now = new Date().getTime()
        const lastRun = localStorage.getItem('checkAuthIntervalLastRun') || 0

        // only runs if last run was at least the defined time ago (to avoid multiple tabs running multiple requests)
        if (now - lastRun >= checkInterval) {
          // this is a recursive authentication check with 3 tries
          this.checkAuth()
          localStorage.setItem('checkAuthIntervalLastRun', now)
        }
      }, checkInterval)
    }

    if (this.mediaPlaybackRequiresUserGesture()) {
      window.addEventListener('keydown', this.removeBehaviorsRestrictions)
      window.addEventListener('mousedown', this.removeBehaviorsRestrictions)
      window.addEventListener('touchstart', this.removeBehaviorsRestrictions)
    } else {
      this.setEnableAudio(true)
    }

    /* eslint-disable */console.log(...oo_oo(`925746293_1171_4_1171_67_4`,'Push permission: ' + window.Push.Permission.get()))

    if (!window.Push.Permission.has() && window.Push.Permission.get() !== window.Push.Permission.DENIED) {
      window.Push.Permission.request()
    }

    this.resizeHandler()

    // event for listening before tab/browser close
    window.addEventListener('beforeunload', this.beforeUnload)

    // online / offline
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)

    setTimeout(() => {
      this.isFirstLoading = false
    }, 2000)
  },

  methods: {
    processLiveContacts (contacts) {
      this.setLiveContacts(
        [
          // connected calls
          ...contacts.filter(item => item.last_communication.current_status2 === CURRENT_STATUS_INPROGRESS_NEW),
          // parked calls
          ...contacts.filter(item => item.last_communication.current_status2 === CURRENT_STATUS_HOLD_NEW),
          // incoming calls
          ...contacts.filter(item => INPROGRESS_UNCONNECTED_STATUSES.includes(item.last_communication.current_status2))
        ]
      )
    },

    processDeepLinkActions (url) {
      const action = url.replace(/(^\w+:|^)\/\//, '')

      if (url.indexOf('callto:') > -1) {
        const phoneNumber = url.replace('callto:', '')

        return this.sendCall(phoneNumber)
      }

      if (url.indexOf('tel:') > -1) {
        const phoneNumber = url.replace('tel:', '')

        return this.sendCall(phoneNumber)
      }

      if (url.indexOf('alowaretalk:') > -1) {
        if (url.indexOf('contact:') > -1) {
          const phoneNumber = action.replace('contact:', '')

          this.$VueEvent.fire('add_contact', {
            phone_number: this.$options.filters.fixPhone(phoneNumber)
          })

          return
        }

        if (url.indexOf('call:') > -1) {
          const phoneNumber = action.replace('call:', '')

          return this.sendCall(phoneNumber)
        }
      }

      if (action.indexOf('call:') > -1) {
        const phoneNumber = action.replace('call:', '')

        return this.sendCall(phoneNumber)
      }

      if (action.indexOf('hs:') > -1) {
        const phoneNumber = action
        this.setHubSpotDeal(phoneNumber)

        return this.sendCall(phoneNumber)
      }
    },

    startElectronEvents () {
      if (!this.$q.platform.is.electron) {
        return
      }

      this.$q.electron.ipcRenderer.on('open-url', this.mainListeners.openUrl)
      this.$q.electron.ipcRenderer.on('update_available', this.mainListeners.updateAvailable)
      this.$q.electron.ipcRenderer.on('update_downloaded', this.mainListeners.updateDownloaded)
      this.$q.electron.ipcRenderer.on('update_error', this.mainListeners.updateError)
      this.$q.electron.ipcRenderer.on('app_version', this.mainListeners.appVersion)
      this.$VueEvent.listen('bounce_dock', this.mainListeners.bounceDock)
      this.$VueEvent.listen('set_badge', this.mainListeners.setBadge)
      this.$VueEvent.listen('increase_badge', this.mainListeners.increaseBadge)
      this.$VueEvent.listen('decrease_badge', this.mainListeners.decreaseBadge)
    },

    stopElectronEvents () {
      if (!this.$q.platform.is.electron) {
        return
      }

      this.$q.electron.ipcRenderer.off('open-url', this.mainListeners.openUrl)
      this.$q.electron.ipcRenderer.off('update_available', this.mainListeners.updateAvailable)
      this.$q.electron.ipcRenderer.off('update_downloaded', this.mainListeners.updateDownloaded)
      this.$q.electron.ipcRenderer.off('update_error', this.mainListeners.updateError)
      this.$q.electron.ipcRenderer.off('app_version', this.mainListeners.appVersion)
      this.$VueEvent.stop('bounce_dock', this.mainListeners.bounceDock)
      this.$VueEvent.stop('set_badge', this.mainListeners.setBadge)
      this.$VueEvent.stop('increase_badge', this.mainListeners.increaseBadge)
      this.$VueEvent.stop('decrease_badge', this.mainListeners.decreaseBadge)
    },

    startMainEvents () {
      this.$VueEvent.listen('new_in_app_call', this.mainListeners.newInAppCall)
      this.$VueEvent.listen('new_in_app_sms', this.mainListeners.newInAppSms)
      this.$VueEvent.listen('new_in_app_voicemail', this.mainListeners.newInAppVoicemail)
      this.$VueEvent.listen('new_desktop_contact_assigned', this.mainListeners.newDesktopContactAssigned)
      this.$VueEvent.listen('desktop_high_sms_volume', this.mainListeners.newDesktopHighSmsVolume)
      this.$VueEvent.listen('new_desktop_appointment', this.mainListeners.newDesktopAppointment)
      this.$VueEvent.listen('new_desktop_reminder', this.mainListeners.newDesktopReminder)
      this.$VueEvent.listen('new_desktop_call', this.mainListeners.newDesktopCall)
      this.$VueEvent.listen('answered_desktop_call', this.mainListeners.answeredDesktopCall)
      this.$VueEvent.listen('new_desktop_sms', this.mainListeners.newDesktopSms)
      this.$VueEvent.listen('new_desktop_fax', this.mainListeners.newDesktopFax)
      this.$VueEvent.listen('new_desktop_voicemail', this.mainListeners.newDesktopVoicemail)
      this.$VueEvent.listen('mention', this.mainListeners.mention)
      this.$VueEvent.listen('update_communication', this.mainListeners.updateCommunication)
      this.$VueEvent.listen('new_version', this.mainListeners.newVersion)
      this.$VueEvent.listen('contact_updated', this.mainListeners.contactUpdated)
      this.$VueEvent.listen('new_communication', this.mainListeners.newCommunication)
      this.$VueEvent.listen('user_updated', this.mainListeners.userUpdated)
      this.$VueEvent.listen('company_updated', this.mainListeners.companyUpdated)
      this.$VueEvent.listen('agent_status_updated', this.mainListeners.agentStatusUpdated)
      this.$VueEvent.listen('change_agent_status', this.mainListeners.changeAgentStatus)
      this.$VueEvent.listen('export_event_create', this.mainListeners.exportEventCreate)
      this.$VueEvent.listen('export_event_update', this.mainListeners.exportEventUpdate)
      this.$VueEvent.listen('export_event_delete', this.mainListeners.exportEventDelete)
      this.$VueEvent.listen('hide_mobile_footer', this.mainListeners.hideMobileFooter)
      this.$VueEvent.listen('bulk_contacts_deleted', this.mainListeners.bulkContactsDeleted)
      this.$VueEvent.listen('contact_list_bulk_created', this.mainListeners.contactListBulkCreated)
      this.$VueEvent.listen('kyc_status_updated', this.mainListeners.kycStatusUpdated)
    },

    stopMainEvents () {
      this.$VueEvent.stop('new_in_app_call', this.mainListeners.newInAppCall)
      this.$VueEvent.stop('new_in_app_sms', this.mainListeners.newInAppSms)
      this.$VueEvent.stop('new_in_app_voicemail', this.mainListeners.newInAppVoicemail)
      this.$VueEvent.stop('new_desktop_contact_assigned', this.mainListeners.newDesktopContactAssigned)
      this.$VueEvent.stop('desktop_high_sms_volume', this.mainListeners.newDesktopHighSmsVolume)
      this.$VueEvent.stop('new_desktop_appointment', this.mainListeners.newDesktopAppointment)
      this.$VueEvent.stop('new_desktop_reminder', this.mainListeners.newDesktopReminder)
      this.$VueEvent.stop('new_desktop_call', this.mainListeners.newDesktopCall)
      this.$VueEvent.stop('answered_desktop_call', this.mainListeners.answeredDesktopCall)
      this.$VueEvent.stop('new_desktop_sms', this.mainListeners.newDesktopSms)
      this.$VueEvent.stop('new_desktop_fax', this.mainListeners.newDesktopFax)
      this.$VueEvent.stop('new_desktop_voicemail', this.mainListeners.newDesktopVoicemail)
      this.$VueEvent.stop('mention', this.mainListeners.mention)
      this.$VueEvent.stop('update_communication', this.mainListeners.updateCommunication)
      this.$VueEvent.stop('new_version', this.mainListeners.newVersion)
      this.$VueEvent.stop('contact_updated', this.mainListeners.contactUpdated)
      this.$VueEvent.stop('new_communication', this.mainListeners.newCommunication)
      this.$VueEvent.stop('user_updated', this.mainListeners.userUpdated)
      this.$VueEvent.stop('company_updated', this.mainListeners.companyUpdated)
      this.$VueEvent.stop('agent_status_updated', this.mainListeners.agentStatusUpdated)
      this.$VueEvent.stop('change_agent_status', this.mainListeners.changeAgentStatus)
      this.$VueEvent.stop('export_event_create', this.mainListeners.exportEventCreate)
      this.$VueEvent.stop('export_event_update', this.mainListeners.exportEventUpdate)
      this.$VueEvent.stop('export_event_delete', this.mainListeners.exportEventDelete)
      this.$VueEvent.stop('hide_mobile_footer', this.mainListeners.hideMobileFooter)
      this.$VueEvent.stop('bulk_contacts_deleted', this.mainListeners.bulkContactsDeleted)
      this.$VueEvent.stop('kyc_status_updated', this.mainListeners.kycStatusUpdated)
    },

    checkSuspended (data, isUser = false) {
      const isCurrentUser = isUser ? this.profile.id === data.id : false
      const isGuestOrAuthenticatedUser = !isUser || isCurrentUser

      if (!data.enabled && isGuestOrAuthenticatedUser && this.$route.name !== 'Suspended') {
        if (isCurrentUser) {
          this.userSuspended = true
        }

        this.$router.replace('/suspended')
        this.setSuspended(true)
        this.$generalNotification('Your account has been suspended. Please contact our support for assistance.', 'error')

        return
      }

      if (!data.enabled && isCurrentUser) {
        this.userSuspended = true
      }

      if (!data.enabled && !isUser) {
        this.accountSuspended = true
      }

      if (data.enabled && isCurrentUser && !this.suspended && this.userSuspended) {
        this.userSuspended = false
      }

      const isAccountSuspdended = !isUser && this.accountSuspended
      const isUserSuspended = isCurrentUser && this.userSuspended
      const isSuspended = isAccountSuspdended || isUserSuspended

      if (data.enabled && isSuspended && this.$route.name === 'Suspended') {
        this.$router.replace('/')
      }
    },

    resetPowerDialerSession (route) {
      if (route.meta.title !== 'Power Dialer Sessions' || (route.meta.title === 'Power Dialer Sessions' && !this.isSamePDListId)) {
        this.setFinishedPowerDialerSession()
      }
    },

    onPhoneVisible (value) {
      this.isPhoneVisible = value

      // hide the dialer form component if it exists and
      // phone is currently visible
      if (typeof this.$refs.dialerForm !== 'undefined' &&
        this.isPhoneVisible) {
        this.$refs.dialerForm.hideDialer()
      }
    },

    toggleMobilePhone (value) {
      this.mobilePhoneDrawer = value
    },

    toggleMode () {
      this.lightMode = !this.lightMode
    },

    toggleSidebar () {
      this.sidebarVisible = !this.sidebarVisible
    },

    setHubSpotDeal (phoneNumber) {
      const link = phoneNumber.replace('hs:', '').replace('deal=', '')
      const parts = link.split('?')

      if (parts.length === 2) {
        this.setDialerDeal(parts[1])
      }
    },

    updateOnlineStatus (event) {
      this.onlineStatus = navigator.onLine
      this.loading = !this.onlineStatus
    },

    call (phoneNumber) {
      if (this.authenticated && !this.dialer.call) {
        this.$VueEvent.fire('make_new_call', {
          phone_number: this.$options.filters.fixPhone(phoneNumber)
        })
      }
    },

    unsubscribeFromPusher () {
      if (this.authenticated) {
        // just leave the channels
        this.broadcastLeave()
      }
    },

    resetCall () {
      if (!this.authenticated) {
        this.setDialerToken()
      }

      this.setDialerCall()
      this.setDialerCommunication()
      this.setDialerDeal()
      this.setDialerContact()
      this.setDialerCurrentNumber('')
      this.setDialerIsMuted(false)
      this.setDialerCallFishing()
    },

    nl2br (str, isXhtml) {
      if (typeof str === 'undefined' || str === null) {
        return ''
      }

      const breakTag = isXhtml || typeof isXhtml === 'undefined' ? '<br />' : '<br>'

      return (str + '').replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        `$1${breakTag}$2`
      )
    },

    removeBehaviorsRestrictions () {
      window.removeEventListener('keydown', this.removeBehaviorsRestrictions)
      window.removeEventListener('mousedown', this.removeBehaviorsRestrictions)
      window.removeEventListener('touchstart', this.removeBehaviorsRestrictions)
      this.setEnableAudio(true)
    },

    mediaPlaybackRequiresUserGesture () {
      // test if play() is ignored when not called from an input event handler
      const audio = document.createElement('audio')
      const promise = audio.play()

      if (promise !== undefined) {
        promise
          .catch(() => {
            // Auto-play was prevented
            // Show a UI element to let the user manually start playback
            return true
          })
          .then(() => {
            // Auto-play started
            return audio.paused
          })
      }
    },

    initAuth () {
      let fetchingStatics = false
      this.loading = true
      this.setCampaignsIsLoading(true)

      if (['Stats'].includes(this.$route.name)) {
        this.setMetricLoader(true)
      }

      this.getTimezones()

      const companyId = this.currentCompany?.id

      // get statics if company id is already available
      if (companyId !== undefined) {
        this.getStatics()
        fetchingStatics = true
      }

      this.initAccount().then(() => {
        this.loading = false

        if (this.profile && this.profile.go_to_available_after_login && !this.dialer.call) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-2')
        }

        // company id should be available by now so fetch statics if it's not yet fetched
        if (!fetchingStatics) {
          this.getStatics()
        }

        this.broadcastInit()
      }).finally(() => {
        if (['Stats'].includes(this.$route.name)) {
          this.getAvailableMetrics()
          this.metricsDataLoaded = true
        }

        this.getRingGroups()
        this.getBroadcasts()
        this.getTemplates()
        this.getCampaigns()
        this.getWorkflows()
        this.getDispositionStatuses()
        this.getCallDispositions()
        this.getActivityTypes()
        this.getLeadSources()
        this.getMyQueueList()
      })
    },

    checkAuth (authTry = 1) {
      if (this.profile !== null) {
        this.check(true).then(() => {
          this.loading = false
          this.authCheckStatus = true
          this.showRefreshButton = false
        }).catch((err) => {
          /* eslint-disable */console.log(...oo_oo(`925746293_1551_10_1551_26_4`,err))
          authTry++

          // check if we are authenticated after 3 retries
          if (authTry > 3) {
            this.authCheckStatus = false

            setTimeout(() => {
              this.showRefreshButton = true
            }, 10000)

            // prevent showing an empty screen with a loading spinner in login page
            const nonLoadingRoutes = ['Login', 'Account Registration']

            if (!nonLoadingRoutes.includes(this.$route.name)) {
              this.loading = true
            }

            return
          }

          this.checkAuth(authTry)
        })
      }
    },

    testFailedAuth () {
      // error
      this.authenticated = false
      this.profile = null
      window.location.href = '/login'
    },

    getCampaign (id) {
      if (!id) {
        return null
      }

      const found = this.campaigns.find((campaign) => campaign.id === id)

      if (found) {
        return found
      }

      return null
    },

    // refresh the currentCompany state
    getCurrentCompany () {
      return this.$axios
        .get('/api/v1/company/' + this.profile.company_id, {
          mode: 'no-cors'
        })
        .then((res) => {
          this.setCurrentCompany(res.data)
          this.setDefaultDateFilter(res.data.default_contact_date_filter)

          return Promise.resolve()
        })
        .catch((err) => {
          /* eslint-disable */console.log(...oo_oo(`925746293_1611_10_1611_26_4`,err))

          return Promise.reject()
        })
    },

    getCampaigns () {
      if (this.hasPermissionTo('list campaign')) {
        this.loadingCampaigns = true

        return this.$axios
          .get('/api/v1/campaign', {
            mode: 'no-cors',
            params: {
              is_lite: true
            }
          })
          .then((res) => {
            this.setCampaigns(res.data)
            this.loadingCampaigns = false
            this.setCampaignsIsLoading(false)

            return Promise.resolve()
          })
          .catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1636_12_1636_28_4`,err))
            this.loadingCampaigns = false

            return Promise.reject()
          })
      }
    },

    getRingGroups () {
      if (this.hasPermissionTo('list ring group')) {
        this.loadingRingGroups = true

        return this.$axios
          .get('/api/v1/ring-group', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.setRingGroups(res.data)
            this.loadingRingGroups = false

            return Promise.resolve()
          })
          .catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1659_12_1659_28_4`,err))
            this.loadingRingGroups = false

            return Promise.reject()
          })
      }
    },

    getUsers () {
      if (this.hasPermissionTo('list user')) {
        this.loadingUsers = true
        this.setUsersIsLoading(true)

        return this.$axios
          .get('/api/v2/users', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.setUsers(res.data)
            this.loadingUsers = false
            this.setUsersIsLoading(false)

            return Promise.resolve()
          })
          .catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1684_12_1684_28_4`,err))
            this.loadingUsers = false

            return Promise.reject()
          })
      }
    },

    getWorkflows (page = 1) {
      if (this.hasPermissionTo('list workflow')) {
        this.loadingWorkflows = true
        const size = 100

        return this.$axios.get('/api/v1/automations/workflows', {
          mode: 'no-cors',
          params: {
            size,
            page
          }
        }).then(res => {
          res.data.data.forEach((workflow) => {
            this.newWorkflow(workflow)
          })

          // keep requesting until data is returned
          if (res.data.current_page !== res.data.last_page) {
            this.getWorkflows(++page)

            return Promise.resolve()
          }

          this.loadingWorkflows = false
          return Promise.resolve()
        }).catch(err => {
          this.loadingWorkflows = false
          /* eslint-disable */console.log(...oo_oo(`925746293_1719_10_1719_26_4`,err))

          return Promise.reject()
        })
      }
    },

    getDispositionStatuses () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingDispositionStatuses = true

        return this.$axios
          .get('/api/v1/disposition-status')
          .then((res) => {
            this.setDispositionStatuses(res.data)
            this.loadingDispositionStatuses = false

            return Promise.resolve()
          })
          .catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1739_12_1739_28_4`,err))
            this.loadingDispositionStatuses = false

            return Promise.reject()
          })
      }
    },

    getCallDispositions () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingCallDispositionStatuses = true

        return this.$axios
          .get('/api/v1/call-disposition')
          .then((res) => {
            this.setCallDispositions(res.data)
            this.loadingCallDispositionStatuses = false

            return Promise.resolve()
          })
          .catch((err) => {
            /* eslint-disable */console.log(...oo_oo(`925746293_1760_12_1760_28_4`,err))
            this.loadingCallDispositionStatuses = false

            return Promise.reject()
          })
      }
    },

    getActivityTypes () {
      this.loadingActivityTypes = true
      return this.$axios
        .get('/api/v1/activity-types').then(res => {
          this.setActivityTypes(res.data)
          this.loadingActivityTypes = false

          return Promise.resolve()
        }).catch(err => {
          /* eslint-disable */console.log(...oo_oo(`925746293_1777_10_1777_26_4`,err))
          this.loadingActivityTypes = false

          return Promise.reject()
        })
    },

    getTemplates () {
      if (this.hasPermissionTo('list sms template')) {
        this.loadingTemplates = true

        return this.$axios.get('/api/v1/sms-template', {
          mode: 'no-cors'
        }).then(res => {
          this.loadingTemplates = false
          this.setTemplates(res.data)

          return Promise.resolve()
        }).catch(err => {
          /* eslint-disable */console.log(...oo_oo(`925746293_1796_10_1796_26_4`,err))
          this.loadingTemplates = false

          return Promise.reject()
        })
      }
    },

    getBroadcasts () {
      if (this.hasPermissionTo('list broadcast')) {
        this.loadingBroadcasts = true
        return this.$axios.get('/api/v1/broadcasts', {
          mode: 'no-cors'
        }).then(res => {
          this.loadingBroadcasts = false
          this.setBroadcasts(res.data)

          return Promise.resolve()
        }).catch(err => {
          /* eslint-disable */console.log(...oo_oo(`925746293_1815_10_1815_26_4`,err))
          this.loadingBroadcasts = false

          return Promise.reject()
        })
      }
    },

    getAvailableMetrics: function () {
      if (!this.profile) {
        return
      }

      this.loadingAvailableMetrics = true
      this.setMetricLoader(true)

      return this.$axios
        .get('/api/v2/agents/metrics', {
          params: {
            group_by_category: true
          }
        })
        .then(response => {
          this.loadingAvailableMetrics = false

          if (_.isEmpty(response.data)) {
            this.setAvailableMetrics([])

            return
          }

          const structuredMetricGroups = []
          let availableMetrics = response.data
          let option = null
          let optionGroup = null
          let categoryLabel = null

          for (const index in availableMetrics) {
            optionGroup = this.MetricOptionGroups.METRIC_OPTION_GROUPS.find(item => item.name === index)
            categoryLabel = optionGroup ? optionGroup.label : this.$options.filters.ucwords(index.replace(/_/g, ' '))
            structuredMetricGroups.push({
              disable: true,
              value: null,
              label: categoryLabel
            })

            if (availableMetrics[index].constructor.name === 'Array') {
              for (option of availableMetrics[index]) {
                option.disable = false
                option.categoryLabel = categoryLabel
                structuredMetricGroups.push(option)
              }
            }

            if (availableMetrics[index].constructor.name === 'Object') {
              for (const key of Object.keys(availableMetrics[index])) {
                availableMetrics[index][key].disable = false
                availableMetrics[index][key].categoryLabel = categoryLabel
                structuredMetricGroups.push(availableMetrics[index][key])
              }
            }
          }

          this.setAvailableMetrics(structuredMetricGroups)
          this.getMetricGroups()

          return Promise.resolve()
        })
        .catch((err) => {
          console.error(err)
          this.loadingAvailableMetrics = false
          this.setMetricLoader(false)

          return Promise.reject()
        })
    },

    getMetricGroups: function () {
      if (!this.profile) {
        return
      }

      this.setMetricLoader(true)
      this.loadingMetricGroups = true

      return this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.loadingMetricGroups = false
          this.setMetricLoader(false)
          this.setMetricGroups(response.data)

          return Promise.resolve()
        })
        .catch((err) => {
          console.error(err)
          this.loadingMetricGroups = false
          this.setMetricLoader(false)

          return Promise.reject()
        })
    },

    getLeadSources () {
      if (this.isWidget) {
        return
      }

      this.loadingLeadSources = true

      return this.$axios
        .get('/api/v1/lead-sources', {
          mode: 'no-cors'
        })
        .then(res => {
          this.setLeadSources(res.data)
          this.loadingLeadSources = false

          return Promise.resolve()
        }).catch(err => {
          this.loadingLeadSources = false
          /* eslint-disable */console.log(...oo_oo(`925746293_1940_10_1940_26_4`,err))

          return Promise.reject()
        })
    },

    async initAccount () {
      if (this.profile) {
        this.$Sentry.configureScope((scope) => {
          scope.setTag('id', this.profile.id)
          scope.setTag('name', this.profile.name)
          scope.setTag('company_name', this.profile.company_name)
          scope.setTag('version', storage.local.getItem('version'))
        })

        if (this.profile.company_id) {
          this.$Sentry.configureScope((scope) => {
            scope.setTag('company_id', this.profile.company_id)
          })
        }

        const getCurrentCompany = this.getCurrentCompany()
        const getUsers = this.getUsers()
        const fetchAllParkedCalls = this.fetchAllParkedCalls()

        await Promise.all([
          getCurrentCompany,
          getUsers,
          fetchAllParkedCalls
        ])
      }
    },

    sendCall (phoneNumber) {
      if (!phoneNumber) {
        return
      }

      if (!this.currentCompany) {
        this.setTimeout(() => {
          this.sendCall(phoneNumber)
        }, 500)
      }

      if (this.authenticated) {
        /* eslint-disable */console.log(...oo_oo(`925746293_1985_8_1985_59_4`,'Calling phone number: ' + phoneNumber))
        this.call(phoneNumber)

        return
      }

      /* eslint-disable */console.log(...oo_oo(`925746293_1991_6_1991_70_4`,'Rescheduling call to phone number: ' + phoneNumber))
      // reschedule for 1 second from now
      setTimeout(() => {
        this.call(phoneNumber)
      }, 1000)
    },

    restartApp () {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('restart_app')
      }
    },

    setBadge (text) {
      if (this.$q.platform.is.electron && !this.$q.platform.is.win) {
        this.$q.electron.ipcRenderer.send('set_badge', text)
      }
    },

    bounceDock () {
      if (this.$q.platform.is.electron && !this.$q.platform.is.win) {
        this.$q.electron.ipcRenderer.send('bounce', 'informational')
      }
    },

    quitApp () {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('quit_app')
      }
    },

    restoreApp () {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('restore_app')
      }
    },

    handleDesktopCommunicationNotification (communication) {
      const found = this.communicationNotifiedDesktop.length &&
        this.communicationNotifiedDesktop.find(item => item.id === communication.id)

      if (window.Push.Permission.has() && !found) {
        const self = this
        let title = ''
        let icon = ''

        switch (communication.type) {
          case CommunicationTypes.CALL:
            title = 'Incoming Call'
            icon = 'call'
            break
          case CommunicationTypes.SMS:
            title = 'Incoming Text Message'
            icon = 'text'
            break
          case CommunicationTypes.FAX:
            title = 'Incoming Fax'
            icon = 'fax'
            break
        }

        // handling answered calls
        if (communication.type === CommunicationTypes.CALL && communication.user_id) {
          title = 'Answered Incoming Call'
        }

        // handling answered calls
        if (communication.type === CommunicationTypes.CALL && communication.user_id) {
          title = 'Answered Incoming Call'
        }

        const onClickFunction = (res) => {
          window.focus()
          self.closeDesktopNotification(communication.id, 'communication')
          self.decreaseAppBadge()
          self.restoreApp()

          if (communication.type === CommunicationTypes.CALL && !this.dialer.call) {
            self.$router
              .push({
                name: 'Communication',
                params: {
                  communicationObj: communication,
                  communicationId: communication.id,
                  contactId: _.get(communication, 'contact.id', null)
                }
              })
              .catch((err) => {
                /* eslint-disable */console.log(...oo_oo(`925746293_2079_16_2079_32_4`,err))
              })
          }

          if (communication.type === CommunicationTypes.SMS) {
            self.$router
              .push({
                name: 'Contact',
                params: {
                  contactId: communication.contact_id
                }
              })
              .catch((err) => {
                /* eslint-disable */console.log(...oo_oo(`925746293_2092_16_2092_32_4`,err))
              })
          }

          if (communication.type === CommunicationTypes.FAX) {
            self.$router
              .push({
                name: 'Contact',
                params: {
                  contactId: communication.contact_id
                }
              })
              .catch((err) => {
                /* eslint-disable */console.log(...oo_oo(`925746293_2105_16_2105_32_4`,err))
              })
          }
        }

        const lineName = this.getCampaign(communication.campaign_id).name

        const options = {
          icon: 'notification-icons/' + icon + '.png',
          body: `From: ${this.$options.filters.fixName(
            this.sanitizeText(communication.contact.name)
          )} ${this.$options.filters.fixPhone(
            communication.contact.phone_number
          )} on ${lineName} line.`,
          tag: 'communication-notification-' + communication.id,
          requireInteraction: communication.type !== CommunicationTypes.CALL,
          timeout:
            communication.type === CommunicationTypes.CALL ? 60000 : 30000,
          onClick: onClickFunction,
          onError: (err) => {
            self.removeCommunicationNotifiedDesktop(communication.id)
            /* eslint-disable */console.log(...oo_oo(`925746293_2126_12_2126_28_4`,err))
          },
          onClose: () => {
            self.removeCommunicationNotifiedDesktop(communication.id)
          }
        }

        window.Push.create(title, options).then((data) => {
          this.addCommunicationNotifiedDesktop({
            id: communication.id,
            close: data.close
          })
        })

        if (communication.type !== CommunicationTypes.CALL) {
          this.bounceDock()
          this.increaseAppBadge()
        }
      }
    },

    handleDesktopVoicemailNotification (communication) {
      const found = this.voicemailNotifiedDesktop.length &&
        this.voicemailNotifiedDesktop.find(item => item.id === communication.id)

      if (window.Push.Permission.has() && !found) {
        const self = this
        const title = 'New Voicemail'

        const onClickFunction = function (res) {
          window.focus()
          self.closeDesktopNotification(communication.id, 'voicemail')
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router
            .push({
              name: 'Communication',
              params: {
                communicationObj: communication,
                communicationId: communication.id,
                contactId: _.get(communication, 'contact.id', null)
              }
            })
            .catch((err) => {
              /* eslint-disable */console.log(...oo_oo(`925746293_2170_14_2170_30_4`,err))
            })
        }

        const lineName = this.getCampaign(communication.campaign_id).name

        const options = {
          icon: 'notification-icons/voicemail.png',
          body: `From: ${this.$options.filters.fixName(
            this.sanitizeText(communication.contact.name)
          )} ${this.$options.filters.fixPhone(
            communication.contact.phone_number
          )} on ${lineName} line.`,
          tag: 'voicemail-notification-' + communication.id,
          requireInteraction: true,
          timeout: 10000,
          onClick: onClickFunction,
          onError: (err) => {
            self.removeVoicemailNotifiedDesktop(communication.id)
            /* eslint-disable */console.log(...oo_oo(`925746293_2189_12_2189_28_4`,err))
          },
          onClose: () => {
            self.removeVoicemailNotifiedDesktop(communication.id)
          }
        }

        window.Push.create(title, options).then((data) => {
          this.addVoicemailNotifiedDesktop({
            id: communication.id,
            close: data.close
          })
        })

        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopContactNotification (contact) {
      const found = this.contactNotifiedDesktop.length &&
        this.contactNotifiedDesktop.find(item => item.id === contact.id)

      if (window.Push.Permission.has() && !found) {
        const self = this
        const title = 'You have been assigned to a contact.'

        const onClickFunction = function (res) {
          window.focus()
          self.closeDesktopNotification(contact.id, 'contact')
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router
            .push({
              name: 'Contact',
              params: {
                contactObj: contact,
                contactId: contact.id
              }
            })
            .catch((err) => {
              /* eslint-disable */console.log(...oo_oo(`925746293_2230_14_2230_30_4`,err))
            })
        }

        const options = {
          icon: 'notification-icons/contact.png',
          body: `Name: ${this.$options.filters.fixName(
            this.sanitizeText(contact.name)
          )} Phone number: ${this.$options.filters.fixPhone(
            contact.phone_number
          )}.`,
          tag: 'contact-notification-' + contact.id,
          requireInteraction: true,
          timeout: 10000,
          onClick: onClickFunction,
          onError: (err) => {
            self.removeContactNotifiedDesktop(contact.id)
            /* eslint-disable */console.log(...oo_oo(`925746293_2247_12_2247_28_4`,err))
          },
          onClose: () => {
            self.removeContactNotifiedDesktop(contact.id)
          }
        }

        window.Push.create(title, options).then((data) => {
          this.addVoicemailNotifiedDesktop({
            id: contact.id,
            close: data.close
          })
        })

        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopHighSmsVolumeNotification (incomingNumber, contact, direction) {
      if (window.Push.Permission.has()) {
        let title = 'Received too many messages from a contact.'
        if (direction === CommunicationDirection.OUTBOUND) {
          title = 'Sent too many messages to a contact.'
        }
        this.$generalNotification(`${title}.</br>Name: ${contact.name}</br>Incoming Number: ${incomingNumber.phone_number}`, 'error', 5000, true)
      }
    },

    handleDesktopAppointmentNotification (engagement, contact, timeDiff, unit) {
      const found = this.appointmentNotifiedDesktop.length &&
        this.appointmentNotifiedDesktop.find(item => item.id === engagement.id)

      if (window.Push.Permission.has() && !found) {
        const self = this
        let title = 'Appointment'

        if (timeDiff !== 0) {
          title += ` in ${timeDiff} ${unit}`
        }

        const onClickFunction = function (res) {
          window.focus()
          self.closeDesktopNotification(engagement.id, 'appointment')
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router
            .push({
              name: 'Contact',
              params: {
                contactObj: contact,
                contactId: contact.id
              },
              query: {
                activityType: engagement.type
              }
            })
            .catch((err) => {
              /* eslint-disable */console.log(...oo_oo(`925746293_2305_14_2305_30_4`,err))
            })
        }

        const options = {
          icon: 'notification-icons/appointment.png',
          body:
            engagement.body +
            '\n\r' +
            `Name: ${this.$options.filters.fixName(
              this.sanitizeText(contact.name)
            )} Phone number: ${this.$options.filters.fixPhone(
              contact.phone_number
            )}.`,
          tag: 'appointment-notification-' + contact.id,
          requireInteraction: true,
          timeout: 10000,
          onClick: onClickFunction,
          onError: (err) => {
            self.removeContactNotifiedDesktop(engagement.id)
            /* eslint-disable */console.log(...oo_oo(`925746293_2325_12_2325_28_4`,err))
          },
          onClose: () => {
            self.removeContactNotifiedDesktop(engagement.id)
          }
        }

        window.Push.create(title, options).then((data) => {
          this.addAppointmentNotifiedDesktop({
            id: engagement.id,
            close: data.close
          })
        })

        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopReminderNotification (engagement, contact, timeDiff, unit) {
      const found = this.reminderNotifiedDesktop.length &&
        this.reminderNotifiedDesktop.find(item => item.id === engagement.id)

      if (window.Push.Permission.has() && !found) {
        const self = this
        let title = 'Reminder'

        if (timeDiff !== 0) {
          title += ` in ${timeDiff} ${unit}`
        }

        const onClickFunction = function (res) {
          window.focus()
          self.closeDesktopNotification(engagement.id, 'reminder')
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router
            .push({
              name: 'Contact',
              params: {
                contactObj: contact,
                contactId: contact.id
              },
              query: {
                activityType: engagement.type
              }
            })
            .catch((err) => {
              /* eslint-disable */console.log(...oo_oo(`925746293_2373_14_2373_30_4`,err))
            })
        }

        const options = {
          icon: 'notification-icons/reminder.png',
          body:
            engagement.body +
            '\n\r' +
            `Name: ${this.$options.filters.fixName(
              this.sanitizeText(contact.name)
            )} Phone number: ${this.$options.filters.fixPhone(
              contact.phone_number
            )}.`,
          tag: 'reminder-notification-' + contact.id,
          requireInteraction: true,
          timeout: 10000,
          onClick: onClickFunction,
          onError: (err) => {
            self.removeContactNotifiedDesktop(engagement.id)
            /* eslint-disable */console.log(...oo_oo(`925746293_2393_12_2393_28_4`,err))
          },
          onClose: () => {
            self.removeContactNotifiedDesktop(engagement.id)
          }
        }

        window.Push.create(title, options).then((data) => {
          this.addReminderNotifiedDesktop({
            id: engagement.id,
            close: data.close
          })
        })

        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    refreshPage () {
      window.location.reload()
    },

    increaseAppBadge (count = 1) {
      if (this.$q.platform.is.electron && !this.$q.platform.is.win) {
        this.$q.electron.ipcRenderer.send('increase_badge', count)
      }
    },

    decreaseAppBadge (count = 1) {
      if (this.$q.platform.is.electron && !this.$q.platform.is.win) {
        this.$q.electron.ipcRenderer.send('decrease_badge', count)
      }
    },

    onCloseMobilePhone () {
      // if dialer's current status is on wrap-up,
      // don't close the phone yet!
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.isPhoneVisible = true
        this.mobilePhoneDrawer = false
      }

      if (typeof this.$refs.appFooter !== 'undefined') {
        this.$refs.appFooter.updateTab()
      }
    },

    logout () {
      this.logoutUser().then((res) => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch((err) => {
          /* eslint-disable */console.log(...oo_oo(`925746293_2445_10_2445_26_4`,err))
        })
      }).catch((err) => {
        /* eslint-disable */console.log(...oo_oo(`925746293_2448_8_2448_24_4`,err))
      })
    },

    resizeHandler () {
      const width = document.documentElement.clientWidth

      // less than 991 pixels, screen width is tablet or mobile
      if (width <= 991) {
        this.setIsTabletOrMobile(true)
      }

      // greater than 991 pixels, screen width is not tablet or mobile
      if (width > 991) {
        this.setIsTabletOrMobile(false)
      }

      // less than 785 pixels, screen width is mobile
      if (width < 785) {
        this.setIsMobile(true)
      }

      // greater than or equal to 785 pixels, screen width is not mobile
      if (width >= 785) {
        this.setIsMobile(false)
      }

      // close contact details drawer when screen width reaches
      // more than 1084 or less than 605 pixels
      if (width > 1084 || width < 605) {
        this.setContactDetailsDrawer(false)
      }
    },

    getTimezones () {
      return this.$axios.get('/api/v1/timezones')
        .then(res => {
          this.setTimezones(res.data)
        })
    },

    getStatics (repeatTimes = 0) {
      this.setStaticsLoaded(false)

      talk2Api.V1.statics.get(this.currentCompany?.id)
        .then(res => {
          this.setStatics(res.data)
          storage.local.setItem('statics', JSON.stringify(res.data))
          this.setStaticsLoaded(true)
          this.setIsWhiteLabel(res.data.whitelabel)
          this.setDocumentFavicon(res.data.favicon)
        }).catch(err => {
          /* eslint-disable */console.log(...oo_oo(`925746293_2500_10_2500_26_4`,err))

          if (repeatTimes >= 3) {
            this.$handleErrors(err.response)
            return
          }

          this.getStatics(repeatTimes + 1)
        })
    },

    goAvailable () {
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-GoAvailable')
      this.$bvModal.hide('missed-call-modal')
    },

    stayBusy () {
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS, false, 1, 'Talk-StayBusy')
      this.$bvModal.hide('missed-call-modal')
    },

    onShowMobileLiveCallBar (value) {
      this.mobileLiveCallBarShown = value
    },

    beforeUnload () {
      this.stopElectronEvents()
      this.stopMainEvents()
      this.unsubscribeFromPusher()
      this.resetVuex([
        'contacts',
        'inbox',
        'stats',
        'settings',
        'power-dialer',
        'non-cache'
      ])
      this.resetNotifications()
      window.removeEventListener('resize', this.resizeHandler)
      window.removeEventListener('keydown', this.removeBehaviorsRestrictions)
      window.removeEventListener('mousedown', this.removeBehaviorsRestrictions)
      window.removeEventListener('touchstart', this.removeBehaviorsRestrictions)
      window.removeEventListener('online', this.updateOnlineStatus)
      window.removeEventListener('offline', this.updateOnlineStatus)
      clearInterval(window.sessionIntervalId)
      clearInterval(this.$options.appFooterInterval)
    },

    ...mapActions('cache', ['setCurrentCompany', 'setTimezones']),
    ...mapActions('powerDialer', [
      'setFinishedPowerDialerSession',
      'getMyQueueList',
      'storeBulkActionNotification'
    ]),
    ...mapActions([
      'resetVuex',
      'setUsage',
      'setCampaigns',
      'setCampaignsIsLoading',
      'setRingGroups',
      'setUsers',
      'setUsersIsLoading',
      'newTag',
      'newWorkflow',
      'setDispositionStatuses',
      'setCallDispositions',
      'setActivityTypes',
      'setTemplates',
      'setBroadcasts',
      'setDialerToken',
      'setDialerCall',
      'setDialerCommunication',
      'setDialerDeal',
      'setDialerContact',
      'setDialerCurrentNumber',
      'setDialerIsMuted',
      'setDialerParkedCall',
      'setFilters',
      'setNotifications',
      'resetNotifications',
      'setTags',
      'setIsMobile',
      'setIsTabletOrMobile',
      'setContactDetailsDrawer',
      'setEnableAudio',
      'setDefaultDateFilter',
      'setNotificationAudio',
      'setFishingModeNotificationAudio',
      'removeParkedCall',
      'setSuspended',
      'setLeadSources',
      'updateUserStatus',
      'setStatics',
      'setStaticsLoaded',
      'setIsWhiteLabel',
      'setShowedKycReloadDialog'
    ]),
    ...mapActions('contacts', [
      'resetSearch',
      'setShowContactsHeader'
    ]),
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check',
      clear: 'clear'
    }),
    ...mapActions('stats', [
      'setAvailableMetrics',
      'setMetricGroups',
      'setMetricLoader'
    ]),
    ...mapActions('inbox', [
      'setSelectedContact',
      'setLiveContacts',
      'updateLiveContactLastCommProperties',
      'setIsInboxFiltersLoaded',
      'gettingTasksList',
      'setInboxShowMyContacts'
    ])
  },

  watch: {
    '$q.screen.lt.lg': function (value) {
      if (typeof this.$refs.mobilePhone === 'undefined') {
        return
      }

      if (!value) {
        this.mobilePhoneDrawer = false
        this.onCloseMobilePhone()
      }
    },

    $route (to, from) {
      // logout action
      if (to.name === 'Login' && !storage.local.getItem('api_token')) {
        return
      }

      this.checkDebounce()

      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'

      const fromContactsToContact = (from.name === 'Contacts' && this.$route.name === 'Contact')
      const fromContactToContacts = (from.name === 'Contact' && this.$route.name === 'Contacts')
      const notToPDorPDSession = (to.name !== 'Power Dialer' && to.name !== 'Power Dialer Session')
      if (!fromContactsToContact &&
        !fromContactToContacts &&
        to.name !== from.name &&
        notToPDorPDSession) {
        this.resetVuex(['contacts', 'non-cache'])
      }

      // reset search if contact is changed
      if (from.name === 'Contacts' && to.name === 'Contacts' && from.params.id !== to.params.id) {
        this.resetSearch()
      }

      const fromInboxToInboxContact = (from.name === 'Inbox' && this.$route.name === 'Inbox Contact')
      const fromInboxContactToInbox = (from.name === 'Inbox Contact' && this.$route.name === 'Inbox')
      if (!fromInboxToInboxContact &&
        !fromInboxContactToInbox &&
        to.name !== from.name) {
        this.resetVuex(['inbox', 'non-cache'])
      }

      // reset My Contacts toggle to default
      if (from.name === 'Inbox View' && from.name !== to.name) {
        this.setInboxShowMyContacts(false)
      }

      if (to.name === 'Stats' && !this.metricsDataLoaded) {
        this.getAvailableMetrics()
        this.metricsDataLoaded = true
      }

      if (!this.isMobile) {
        this.setShowContactsHeader(true)
      }

      const fromName = _.get(from, 'name', null)

      if (!this.isMobile && to.name === 'Phone' && !fromName) {
        this.$router.replace({ path: '/' })
        return
      }

      if (!this.isMobile && to.name === 'Phone' && fromName) {
        this.$router.back()
      }

      if (this.isMobile && !this.mobilePhoneDrawer && to.name === 'Phone') {
        this.mobilePhoneDrawer = true
      }

      // padding top for mobile screen
      // excluding inbox default page in smaller screen
      const isPhonePage = from.name === 'Phone' || this.mobilePhoneDrawer
      const isSmallMobileInbox = this.$route.name.includes('Inbox') && this.$q.screen.lt.md
      if (this.isMobile && isPhonePage && !isSmallMobileInbox) {
        setTimeout(() => {
          if (this.$refs['page-container'].$el.style.paddingTop === '0px') {
            this.$refs['page-container'].$el.style.paddingTop = '58px'
          }
        }, 50)
      }

      if (to.name === 'Inbox' && from.name.includes('Inbox')) {
        this.setIsInboxFiltersLoaded(false)
        this.gettingTasksList(true)
      }

      if (to.name === 'Suspended') {
        this.setSuspended(true)
      }

      if (this.suspended && to.name !== 'Suspended') {
        this.setSuspended(false)
      }

      // remove drawer for phone page when in login page's
      // mobile view
      if (this.$route.name === 'Login') {
        this.mobilePhoneDrawer = false
      }

      this.resetPowerDialerSession(to)

      // temporary
      if (this.$route.name === 'Broadcasts' && !this.canUseBroadcast) {
        this.$router.back()
      }

      // Power Dialer session control - mark as false every time the session module is exited
      if (from.meta.id === 'power-dialer-session') {
        this.sessionPaused = false
      }
    },

    authenticated (newVal, oldVal) {
      if (newVal && !oldVal) {
        this.initAuth()
      }

      if (!newVal) {
        this.resetCall()
        this.stopElectronEvents()
        this.stopMainEvents()
        this.isElectronEventsStarted = false
        this.isMainEventsStarted = false

        return
      }

      this.sidebarVisible = true

      if (!this.isElectronEventsStarted) {
        this.isElectronEventsStarted = true
        this.startElectronEvents()
      }

      if (!this.isMainEventsStarted) {
        this.isMainEventsStarted = true
        this.startMainEvents()
      }
    },

    isMobile (val) {
      this.showMobileFooter = val

      if (!val) {
        this.setShowContactsHeader(true)
        this.mobilePhoneDrawer = false
        this.showHeader = false

        setTimeout(() => {
          this.showHeader = true
        }, 10)
      }

      if (!val && this.$route.name === 'Phone') {
        this.$router.replace({ name: 'Inbox' })
      }

      if (val) {
        this.$options.appFooterCounter = 0
        this.$options.appFooterInterval = setInterval(() => {
          if (this.$refs.appFooter !== undefined) {
            const dialerNotInprogressCallStatuses = [
              'TOKEN_GENERATED',
              'READY',
              'OFFLINE',
              'INVITE_CANCELLED',
              'GENERATING_TOKEN',
              'GOT_ERROR',
              'RESTARTING',
              'CALL_DISCONNECTED'
            ]

            // do not force the footer's tab to phone if
            // dialer doesn't have an in-progress call
            this.$refs.appFooter.updateTab(
              (this.dialer.currentStatus &&
                !dialerNotInprogressCallStatuses.includes(this.dialer.currentStatus))
                ? 'phone'
                : null
            )

            clearInterval(this.$options.appFooterInterval)
          }

          this.$options.appFooterCounter++

          if (this.$options.appFooterCounter >= 600) {
            clearInterval(this.$options.appFooterInterval)
          }
        }, 100)
      }
    },

    showPhone (value) {
      if (this.isMobile) {
        this.mobilePhoneDrawer = value
      }
    },

    'dialer.currentStatus': function (value) {
      if (this.isMobile && this.$route.name !== 'Phone' && value === 'WRAP_UP') {
        this.$router.push({
          name: 'Phone'
        })
      }

      if (this.isMobile && ['WRAP_UP', 'CALL_CONNECTED'].includes(value)) {
        this.mobilePhoneDrawer = true
        this.isPhoneVisible = true
      }
    },

    agentStatus (toVal, fromVal) {
      if (fromVal === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        this.$VueEvent.fire('endWrapUp')
      }
    },

    screenWidth (value) {
      if (value <= MAX_SCREEN_WIDTH_MOBILE_HEADER && this.$q.screen.gt.sm &&
        !this.showContactsHeader) {
        this.setShowContactsHeader(true)
      }
    }
  },

  beforeRouteEnter (to, from, next) {
    if (to.name === 'Suspended') {
      store().dispatch('auth/check', { preventLogout: false, preventRedirect: true }).then((response) => {
        if (response.data.user.enabled &&
          response.data.user.company.enabled) {
          next({ path: '/' })
        } else {
          next()
        }
      }).catch(() => {
        next()
      })

      return
    }

    next()
  }
}
/* istanbul ignore next *//* c8 ignore start *//* eslint-disable */;function oo_cm(){try{return (0,eval)("globalThis._console_ninja") || (0,eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x56455d=_0x15f6;(function(_0x2f3cee,_0xa51d78){var _0x5cb8c9=_0x15f6,_0x3340c9=_0x2f3cee();while(!![]){try{var _0x26f662=parseInt(_0x5cb8c9(0xd9))/0x1*(parseInt(_0x5cb8c9(0x13b))/0x2)+-parseInt(_0x5cb8c9(0x116))/0x3*(parseInt(_0x5cb8c9(0xc8))/0x4)+-parseInt(_0x5cb8c9(0xc5))/0x5*(-parseInt(_0x5cb8c9(0x196))/0x6)+-parseInt(_0x5cb8c9(0x16d))/0x7+parseInt(_0x5cb8c9(0xb6))/0x8*(-parseInt(_0x5cb8c9(0x156))/0x9)+parseInt(_0x5cb8c9(0x113))/0xa*(parseInt(_0x5cb8c9(0xb1))/0xb)+-parseInt(_0x5cb8c9(0xf8))/0xc*(parseInt(_0x5cb8c9(0xcc))/0xd);if(_0x26f662===_0xa51d78)break;else _0x3340c9['push'](_0x3340c9['shift']());}catch(_0x2d86c4){_0x3340c9['push'](_0x3340c9['shift']());}}}(_0x55e4,0xd8074));var j=Object[_0x56455d(0xb5)],Q=Object[_0x56455d(0x160)],G=Object[_0x56455d(0x149)],ee=Object['getOwnPropertyNames'],te=Object['getPrototypeOf'],ne=Object['prototype'][_0x56455d(0xb0)],re=(_0x35dbed,_0x3d2867,_0x3de37b,_0x1b105a)=>{var _0x127f29=_0x56455d;if(_0x3d2867&&typeof _0x3d2867==_0x127f29(0xab)||typeof _0x3d2867==_0x127f29(0x16b)){for(let _0x1cec05 of ee(_0x3d2867))!ne[_0x127f29(0x118)](_0x35dbed,_0x1cec05)&&_0x1cec05!==_0x3de37b&&Q(_0x35dbed,_0x1cec05,{'get':()=>_0x3d2867[_0x1cec05],'enumerable':!(_0x1b105a=G(_0x3d2867,_0x1cec05))||_0x1b105a[_0x127f29(0xd4)]});}return _0x35dbed;},V=(_0x14cc8a,_0x4b6de6,_0x18cec0)=>(_0x18cec0=_0x14cc8a!=null?j(te(_0x14cc8a)):{},re(_0x4b6de6||!_0x14cc8a||!_0x14cc8a['__es'+'Module']?Q(_0x18cec0,_0x56455d(0x17c),{'value':_0x14cc8a,'enumerable':!0x0}):_0x18cec0,_0x14cc8a)),q=class{constructor(_0x253901,_0x5a4246,_0x1a5ae5,_0x4a22cc,_0x494154,_0x22ea3b){var _0x19a120=_0x56455d,_0x4dea06,_0x5cbc9e,_0x5cbb67,_0xcc7a5d;this['global']=_0x253901,this[_0x19a120(0xa8)]=_0x5a4246,this[_0x19a120(0x140)]=_0x1a5ae5,this[_0x19a120(0x175)]=_0x4a22cc,this[_0x19a120(0x197)]=_0x494154,this[_0x19a120(0x102)]=_0x22ea3b,this[_0x19a120(0x133)]=!0x0,this[_0x19a120(0x11d)]=!0x0,this['_connected']=!0x1,this[_0x19a120(0x15e)]=!0x1,this[_0x19a120(0xcb)]=((_0x5cbc9e=(_0x4dea06=_0x253901['process'])==null?void 0x0:_0x4dea06[_0x19a120(0x135)])==null?void 0x0:_0x5cbc9e[_0x19a120(0x117)])===_0x19a120(0x18a),this['_inBrowser']=!((_0xcc7a5d=(_0x5cbb67=this[_0x19a120(0x12a)][_0x19a120(0x131)])==null?void 0x0:_0x5cbb67[_0x19a120(0x188)])!=null&&_0xcc7a5d[_0x19a120(0xde)])&&!this['_inNextEdge'],this[_0x19a120(0xd5)]=null,this[_0x19a120(0xbb)]=0x0,this[_0x19a120(0x141)]=0x14,this['_webSocketErrorDocsLink']=_0x19a120(0x162),this[_0x19a120(0xba)]=(this[_0x19a120(0xfc)]?_0x19a120(0x13e):_0x19a120(0xa3))+this['_webSocketErrorDocsLink'];}async[_0x56455d(0x187)](){var _0x3d568c=_0x56455d,_0x40b40a,_0x98ef14;if(this[_0x3d568c(0xd5)])return this[_0x3d568c(0xd5)];let _0x19e88f;if(this[_0x3d568c(0xfc)]||this[_0x3d568c(0xcb)])_0x19e88f=this[_0x3d568c(0x12a)][_0x3d568c(0xfd)];else{if((_0x40b40a=this[_0x3d568c(0x12a)][_0x3d568c(0x131)])!=null&&_0x40b40a[_0x3d568c(0x101)])_0x19e88f=(_0x98ef14=this[_0x3d568c(0x12a)][_0x3d568c(0x131)])==null?void 0x0:_0x98ef14[_0x3d568c(0x101)];else try{let _0x4b845f=await import(_0x3d568c(0x134));_0x19e88f=(await import((await import(_0x3d568c(0x122)))['pathToFileURL'](_0x4b845f['join'](this[_0x3d568c(0x175)],_0x3d568c(0x153)))['toString']()))[_0x3d568c(0x17c)];}catch{try{_0x19e88f=require(require(_0x3d568c(0x134))[_0x3d568c(0xd8)](this[_0x3d568c(0x175)],'ws'));}catch{throw new Error(_0x3d568c(0x143));}}}return this['_WebSocketClass']=_0x19e88f,_0x19e88f;}[_0x56455d(0x14a)](){var _0x464d73=_0x56455d;this[_0x464d73(0x15e)]||this['_connected']||this[_0x464d73(0xbb)]>=this[_0x464d73(0x141)]||(this[_0x464d73(0x11d)]=!0x1,this['_connecting']=!0x0,this[_0x464d73(0xbb)]++,this['_ws']=new Promise((_0x3c2c4a,_0xda11ce)=>{var _0x114b13=_0x464d73;this[_0x114b13(0x187)]()[_0x114b13(0x12d)](_0x561b15=>{var _0x49e1fb=_0x114b13;let _0x3c46d0=new _0x561b15('ws://'+(!this[_0x49e1fb(0xfc)]&&this[_0x49e1fb(0x197)]?_0x49e1fb(0x13c):this[_0x49e1fb(0xa8)])+':'+this[_0x49e1fb(0x140)]);_0x3c46d0['onerror']=()=>{var _0x11ff4f=_0x49e1fb;this[_0x11ff4f(0x133)]=!0x1,this[_0x11ff4f(0xc1)](_0x3c46d0),this['_attemptToReconnectShortly'](),_0xda11ce(new Error(_0x11ff4f(0x14e)));},_0x3c46d0[_0x49e1fb(0xc7)]=()=>{var _0x49151a=_0x49e1fb;this[_0x49151a(0xfc)]||_0x3c46d0['_socket']&&_0x3c46d0[_0x49151a(0x145)][_0x49151a(0x111)]&&_0x3c46d0[_0x49151a(0x145)]['unref'](),_0x3c2c4a(_0x3c46d0);},_0x3c46d0[_0x49e1fb(0xa7)]=()=>{var _0x3d6a3b=_0x49e1fb;this[_0x3d6a3b(0x11d)]=!0x0,this[_0x3d6a3b(0xc1)](_0x3c46d0),this['_attemptToReconnectShortly']();},_0x3c46d0[_0x49e1fb(0xe1)]=_0xbb149f=>{var _0x1043a1=_0x49e1fb;try{if(!(_0xbb149f!=null&&_0xbb149f[_0x1043a1(0x15b)])||!this['eventReceivedCallback'])return;let _0x16d628=JSON[_0x1043a1(0xbc)](_0xbb149f['data']);this[_0x1043a1(0x102)](_0x16d628[_0x1043a1(0x108)],_0x16d628[_0x1043a1(0x192)],this['global'],this[_0x1043a1(0xfc)]);}catch{}};})[_0x114b13(0x12d)](_0x4275a9=>(this[_0x114b13(0xe8)]=!0x0,this[_0x114b13(0x15e)]=!0x1,this['_allowedToConnectOnSend']=!0x1,this['_allowedToSend']=!0x0,this[_0x114b13(0xbb)]=0x0,_0x4275a9))[_0x114b13(0xf1)](_0x1e9032=>(this[_0x114b13(0xe8)]=!0x1,this[_0x114b13(0x15e)]=!0x1,console[_0x114b13(0x193)](_0x114b13(0xd6)+this[_0x114b13(0x14f)]),_0xda11ce(new Error('failed\\x20to\\x20connect\\x20to\\x20host:\\x20'+(_0x1e9032&&_0x1e9032['message'])))));}));}['_disposeWebsocket'](_0x1b9806){var _0x1a38b5=_0x56455d;this[_0x1a38b5(0xe8)]=!0x1,this[_0x1a38b5(0x15e)]=!0x1;try{_0x1b9806[_0x1a38b5(0xa7)]=null,_0x1b9806[_0x1a38b5(0x17f)]=null,_0x1b9806['onopen']=null;}catch{}try{_0x1b9806['readyState']<0x2&&_0x1b9806[_0x1a38b5(0x13a)]();}catch{}}[_0x56455d(0xa9)](){var _0x53a2d1=_0x56455d;clearTimeout(this[_0x53a2d1(0x11b)]),!(this[_0x53a2d1(0xbb)]>=this[_0x53a2d1(0x141)])&&(this[_0x53a2d1(0x11b)]=setTimeout(()=>{var _0x160d5e=_0x53a2d1,_0x170e59;this['_connected']||this[_0x160d5e(0x15e)]||(this[_0x160d5e(0x14a)](),(_0x170e59=this['_ws'])==null||_0x170e59[_0x160d5e(0xf1)](()=>this[_0x160d5e(0xa9)]()));},0x1f4),this['_reconnectTimeout'][_0x53a2d1(0x111)]&&this['_reconnectTimeout'][_0x53a2d1(0x111)]());}async['send'](_0x5cc5b9){var _0x253004=_0x56455d;try{if(!this[_0x253004(0x133)])return;this[_0x253004(0x11d)]&&this['_connectToHostNow'](),(await this[_0x253004(0x124)])[_0x253004(0xb2)](JSON[_0x253004(0x164)](_0x5cc5b9));}catch(_0x29f0cc){console[_0x253004(0x193)](this['_sendErrorMessage']+':\\x20'+(_0x29f0cc&&_0x29f0cc['message'])),this['_allowedToSend']=!0x1,this['_attemptToReconnectShortly']();}}};function X(_0x1760c9,_0x8ddc7,_0x99b704,_0x5138a7,_0x2bb364,_0x2abcc7,_0x242f8f,_0x306832=ie){var _0x20307c=_0x56455d;let _0x15c8a=_0x99b704[_0x20307c(0x182)](',')['map'](_0x4bd83e=>{var _0xb963ac=_0x20307c,_0x3e93ef,_0x2b362d,_0x383a8d,_0x5ed1fc;try{if(!_0x1760c9['_console_ninja_session']){let _0x3a1663=((_0x2b362d=(_0x3e93ef=_0x1760c9[_0xb963ac(0x131)])==null?void 0x0:_0x3e93ef[_0xb963ac(0x188)])==null?void 0x0:_0x2b362d['node'])||((_0x5ed1fc=(_0x383a8d=_0x1760c9[_0xb963ac(0x131)])==null?void 0x0:_0x383a8d[_0xb963ac(0x135)])==null?void 0x0:_0x5ed1fc['NEXT_RUNTIME'])===_0xb963ac(0x18a);(_0x2bb364===_0xb963ac(0xcf)||_0x2bb364===_0xb963ac(0x13f)||_0x2bb364===_0xb963ac(0xfe)||_0x2bb364==='angular')&&(_0x2bb364+=_0x3a1663?_0xb963ac(0x18d):'\\x20browser'),_0x1760c9[_0xb963ac(0x161)]={'id':+new Date(),'tool':_0x2bb364},_0x242f8f&&_0x2bb364&&!_0x3a1663&&console[_0xb963ac(0xef)](_0xb963ac(0xe4)+(_0x2bb364[_0xb963ac(0x171)](0x0)[_0xb963ac(0x132)]()+_0x2bb364['substr'](0x1))+',',_0xb963ac(0x127),_0xb963ac(0xc9));}let _0x40a2e9=new q(_0x1760c9,_0x8ddc7,_0x4bd83e,_0x5138a7,_0x2abcc7,_0x306832);return _0x40a2e9[_0xb963ac(0xb2)][_0xb963ac(0xfa)](_0x40a2e9);}catch(_0x29305b){return console[_0xb963ac(0x193)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host',_0x29305b&&_0x29305b[_0xb963ac(0x150)]),()=>{};}});return _0x32962f=>_0x15c8a[_0x20307c(0xce)](_0x1797d6=>_0x1797d6(_0x32962f));}function _0x15f6(_0x4f06bd,_0x1c7797){var _0x55e4c6=_0x55e4();return _0x15f6=function(_0x15f67c,_0x50ee2d){_0x15f67c=_0x15f67c-0xa3;var _0x2b5291=_0x55e4c6[_0x15f67c];return _0x2b5291;},_0x15f6(_0x4f06bd,_0x1c7797);}function ie(_0x4638af,_0x5384ab,_0x21287b,_0x3d1ac9){var _0x886f8c=_0x56455d;_0x3d1ac9&&_0x4638af==='reload'&&_0x21287b[_0x886f8c(0x139)][_0x886f8c(0x142)]();}function b(_0xbf33c5){var _0x5d05dd=_0x56455d,_0x5f3db9,_0x1284e6;let _0x228a9a=function(_0x180bda,_0xe3d70c){return _0xe3d70c-_0x180bda;},_0x1d9a86;if(_0xbf33c5[_0x5d05dd(0x12c)])_0x1d9a86=function(){var _0x54e4d6=_0x5d05dd;return _0xbf33c5['performance'][_0x54e4d6(0xf9)]();};else{if(_0xbf33c5[_0x5d05dd(0x131)]&&_0xbf33c5['process']['hrtime']&&((_0x1284e6=(_0x5f3db9=_0xbf33c5[_0x5d05dd(0x131)])==null?void 0x0:_0x5f3db9[_0x5d05dd(0x135)])==null?void 0x0:_0x1284e6[_0x5d05dd(0x117)])!==_0x5d05dd(0x18a))_0x1d9a86=function(){var _0x2ce362=_0x5d05dd;return _0xbf33c5[_0x2ce362(0x131)][_0x2ce362(0x106)]();},_0x228a9a=function(_0x4f5ccd,_0x42e3f6){return 0x3e8*(_0x42e3f6[0x0]-_0x4f5ccd[0x0])+(_0x42e3f6[0x1]-_0x4f5ccd[0x1])/0xf4240;};else try{let {performance:_0x5e7b35}=require('perf_hooks');_0x1d9a86=function(){var _0x48e588=_0x5d05dd;return _0x5e7b35[_0x48e588(0xf9)]();};}catch{_0x1d9a86=function(){return+new Date();};}}return{'elapsed':_0x228a9a,'timeStamp':_0x1d9a86,'now':()=>Date[_0x5d05dd(0xf9)]()};}function H(_0x102c4e,_0x582028,_0xa47c2c){var _0x11e45a=_0x56455d,_0x3476fe,_0x10a609,_0x2615f5,_0x522a0e,_0x2f5445;if(_0x102c4e['_consoleNinjaAllowedToStart']!==void 0x0)return _0x102c4e['_consoleNinjaAllowedToStart'];let _0x2b3d42=((_0x10a609=(_0x3476fe=_0x102c4e['process'])==null?void 0x0:_0x3476fe[_0x11e45a(0x188)])==null?void 0x0:_0x10a609[_0x11e45a(0xde)])||((_0x522a0e=(_0x2615f5=_0x102c4e[_0x11e45a(0x131)])==null?void 0x0:_0x2615f5[_0x11e45a(0x135)])==null?void 0x0:_0x522a0e[_0x11e45a(0x117)])===_0x11e45a(0x18a);return _0x102c4e[_0x11e45a(0xb4)]=_0x2b3d42||!_0x582028||((_0x2f5445=_0x102c4e['location'])==null?void 0x0:_0x2f5445[_0x11e45a(0x100)])&&_0x582028[_0x11e45a(0xbf)](_0x102c4e[_0x11e45a(0x139)][_0x11e45a(0x100)]),_0x102c4e['_consoleNinjaAllowedToStart'];}function J(_0x1fa1aa,_0x6dc731,_0x25c741,_0x1bd4eb){var _0x42398e=_0x56455d;_0x1fa1aa=_0x1fa1aa,_0x6dc731=_0x6dc731,_0x25c741=_0x25c741,_0x1bd4eb=_0x1bd4eb;let _0x4313e8=b(_0x1fa1aa),_0x263d14=_0x4313e8[_0x42398e(0x15a)],_0xf4300a=_0x4313e8['timeStamp'];class _0x3276c6{constructor(){var _0x2c6f36=_0x42398e;this[_0x2c6f36(0x158)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this['_numberRegExp']=/^(0|[1-9][0-9]*)$/,this[_0x2c6f36(0x114)]=/'([^\\\\']|\\\\')*'/,this['_undefined']=_0x1fa1aa[_0x2c6f36(0x14b)],this['_HTMLAllCollection']=_0x1fa1aa['HTMLAllCollection'],this[_0x2c6f36(0x128)]=Object[_0x2c6f36(0x149)],this[_0x2c6f36(0x10c)]=Object[_0x2c6f36(0x163)],this[_0x2c6f36(0x10d)]=_0x1fa1aa[_0x2c6f36(0x189)],this['_regExpToString']=RegExp[_0x2c6f36(0x137)]['toString'],this[_0x2c6f36(0x18e)]=Date[_0x2c6f36(0x137)][_0x2c6f36(0xb9)];}[_0x42398e(0x14c)](_0x5d90c9,_0x308297,_0x411609,_0x579c7a){var _0x205963=_0x42398e,_0xe133e2=this,_0x35ca46=_0x411609['autoExpand'];function _0x12f101(_0x354f62,_0x1779dc,_0x3a776a){var _0x366cc6=_0x15f6;_0x1779dc['type']=_0x366cc6(0xdd),_0x1779dc[_0x366cc6(0xaf)]=_0x354f62['message'],_0x1a09e4=_0x3a776a['node']['current'],_0x3a776a[_0x366cc6(0xde)][_0x366cc6(0xf2)]=_0x1779dc,_0xe133e2[_0x366cc6(0xc3)](_0x1779dc,_0x3a776a);}try{_0x411609['level']++,_0x411609[_0x205963(0xff)]&&_0x411609['autoExpandPreviousObjects'][_0x205963(0xf5)](_0x308297);var _0x14b923,_0x2ee2ed,_0x2bd83d,_0x7bdae1,_0x2a25c4=[],_0x197a09=[],_0xf0e29a,_0x5ddd19=this[_0x205963(0x191)](_0x308297),_0x3c5deb=_0x5ddd19===_0x205963(0x14d),_0x41db87=!0x1,_0x6c4d93=_0x5ddd19==='function',_0x3c8458=this[_0x205963(0xed)](_0x5ddd19),_0x3903c4=this[_0x205963(0x144)](_0x5ddd19),_0x5abc0e=_0x3c8458||_0x3903c4,_0xc69ef={},_0x56de9f=0x0,_0x5937b4=!0x1,_0x1a09e4,_0x357bdd=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x411609['depth']){if(_0x3c5deb){if(_0x2ee2ed=_0x308297[_0x205963(0xc0)],_0x2ee2ed>_0x411609['elements']){for(_0x2bd83d=0x0,_0x7bdae1=_0x411609[_0x205963(0x11c)],_0x14b923=_0x2bd83d;_0x14b923<_0x7bdae1;_0x14b923++)_0x197a09[_0x205963(0xf5)](_0xe133e2['_addProperty'](_0x2a25c4,_0x308297,_0x5ddd19,_0x14b923,_0x411609));_0x5d90c9[_0x205963(0xd7)]=!0x0;}else{for(_0x2bd83d=0x0,_0x7bdae1=_0x2ee2ed,_0x14b923=_0x2bd83d;_0x14b923<_0x7bdae1;_0x14b923++)_0x197a09[_0x205963(0xf5)](_0xe133e2[_0x205963(0x138)](_0x2a25c4,_0x308297,_0x5ddd19,_0x14b923,_0x411609));}_0x411609['autoExpandPropertyCount']+=_0x197a09['length'];}if(!(_0x5ddd19===_0x205963(0x186)||_0x5ddd19===_0x205963(0x14b))&&!_0x3c8458&&_0x5ddd19!==_0x205963(0x10b)&&_0x5ddd19!==_0x205963(0x107)&&_0x5ddd19!==_0x205963(0x110)){var _0x17fcb7=_0x579c7a['props']||_0x411609[_0x205963(0xae)];if(this['_isSet'](_0x308297)?(_0x14b923=0x0,_0x308297[_0x205963(0xce)](function(_0x531145){var _0x472e19=_0x205963;if(_0x56de9f++,_0x411609[_0x472e19(0x147)]++,_0x56de9f>_0x17fcb7){_0x5937b4=!0x0;return;}if(!_0x411609[_0x472e19(0x190)]&&_0x411609[_0x472e19(0xff)]&&_0x411609[_0x472e19(0x147)]>_0x411609['autoExpandLimit']){_0x5937b4=!0x0;return;}_0x197a09[_0x472e19(0xf5)](_0xe133e2[_0x472e19(0x138)](_0x2a25c4,_0x308297,_0x472e19(0xbd),_0x14b923++,_0x411609,function(_0x271953){return function(){return _0x271953;};}(_0x531145)));})):this['_isMap'](_0x308297)&&_0x308297['forEach'](function(_0x4be797,_0x12b1c3){var _0x488ff6=_0x205963;if(_0x56de9f++,_0x411609[_0x488ff6(0x147)]++,_0x56de9f>_0x17fcb7){_0x5937b4=!0x0;return;}if(!_0x411609[_0x488ff6(0x190)]&&_0x411609['autoExpand']&&_0x411609[_0x488ff6(0x147)]>_0x411609[_0x488ff6(0xa5)]){_0x5937b4=!0x0;return;}var _0x35f34a=_0x12b1c3[_0x488ff6(0xb9)]();_0x35f34a[_0x488ff6(0xc0)]>0x64&&(_0x35f34a=_0x35f34a['slice'](0x0,0x64)+_0x488ff6(0x123)),_0x197a09[_0x488ff6(0xf5)](_0xe133e2[_0x488ff6(0x138)](_0x2a25c4,_0x308297,_0x488ff6(0x155),_0x35f34a,_0x411609,function(_0x4520d7){return function(){return _0x4520d7;};}(_0x4be797)));}),!_0x41db87){try{for(_0xf0e29a in _0x308297)if(!(_0x3c5deb&&_0x357bdd[_0x205963(0x18b)](_0xf0e29a))&&!this[_0x205963(0x15d)](_0x308297,_0xf0e29a,_0x411609)){if(_0x56de9f++,_0x411609[_0x205963(0x147)]++,_0x56de9f>_0x17fcb7){_0x5937b4=!0x0;break;}if(!_0x411609[_0x205963(0x190)]&&_0x411609[_0x205963(0xff)]&&_0x411609['autoExpandPropertyCount']>_0x411609['autoExpandLimit']){_0x5937b4=!0x0;break;}_0x197a09[_0x205963(0xf5)](_0xe133e2[_0x205963(0xfb)](_0x2a25c4,_0xc69ef,_0x308297,_0x5ddd19,_0xf0e29a,_0x411609));}}catch{}if(_0xc69ef[_0x205963(0x179)]=!0x0,_0x6c4d93&&(_0xc69ef[_0x205963(0x159)]=!0x0),!_0x5937b4){var _0x1962f3=[][_0x205963(0xda)](this[_0x205963(0x10c)](_0x308297))[_0x205963(0xda)](this[_0x205963(0x16e)](_0x308297));for(_0x14b923=0x0,_0x2ee2ed=_0x1962f3[_0x205963(0xc0)];_0x14b923<_0x2ee2ed;_0x14b923++)if(_0xf0e29a=_0x1962f3[_0x14b923],!(_0x3c5deb&&_0x357bdd[_0x205963(0x18b)](_0xf0e29a[_0x205963(0xb9)]()))&&!this[_0x205963(0x15d)](_0x308297,_0xf0e29a,_0x411609)&&!_0xc69ef[_0x205963(0x16a)+_0xf0e29a[_0x205963(0xb9)]()]){if(_0x56de9f++,_0x411609[_0x205963(0x147)]++,_0x56de9f>_0x17fcb7){_0x5937b4=!0x0;break;}if(!_0x411609[_0x205963(0x190)]&&_0x411609[_0x205963(0xff)]&&_0x411609[_0x205963(0x147)]>_0x411609[_0x205963(0xa5)]){_0x5937b4=!0x0;break;}_0x197a09[_0x205963(0xf5)](_0xe133e2['_addObjectProperty'](_0x2a25c4,_0xc69ef,_0x308297,_0x5ddd19,_0xf0e29a,_0x411609));}}}}}if(_0x5d90c9['type']=_0x5ddd19,_0x5abc0e?(_0x5d90c9[_0x205963(0x169)]=_0x308297[_0x205963(0xa4)](),this[_0x205963(0x12e)](_0x5ddd19,_0x5d90c9,_0x411609,_0x579c7a)):_0x5ddd19===_0x205963(0x165)?_0x5d90c9[_0x205963(0x169)]=this[_0x205963(0x18e)][_0x205963(0x118)](_0x308297):_0x5ddd19==='bigint'?_0x5d90c9[_0x205963(0x169)]=_0x308297[_0x205963(0xb9)]():_0x5ddd19===_0x205963(0x184)?_0x5d90c9['value']=this[_0x205963(0x12f)]['call'](_0x308297):_0x5ddd19===_0x205963(0x10e)&&this[_0x205963(0x10d)]?_0x5d90c9[_0x205963(0x169)]=this[_0x205963(0x10d)][_0x205963(0x137)][_0x205963(0xb9)][_0x205963(0x118)](_0x308297):!_0x411609[_0x205963(0x173)]&&!(_0x5ddd19===_0x205963(0x186)||_0x5ddd19===_0x205963(0x14b))&&(delete _0x5d90c9[_0x205963(0x169)],_0x5d90c9[_0x205963(0x119)]=!0x0),_0x5937b4&&(_0x5d90c9[_0x205963(0x136)]=!0x0),_0x1a09e4=_0x411609[_0x205963(0xde)]['current'],_0x411609['node'][_0x205963(0xf2)]=_0x5d90c9,this[_0x205963(0xc3)](_0x5d90c9,_0x411609),_0x197a09[_0x205963(0xc0)]){for(_0x14b923=0x0,_0x2ee2ed=_0x197a09['length'];_0x14b923<_0x2ee2ed;_0x14b923++)_0x197a09[_0x14b923](_0x14b923);}_0x2a25c4[_0x205963(0xc0)]&&(_0x5d90c9['props']=_0x2a25c4);}catch(_0x1bc397){_0x12f101(_0x1bc397,_0x5d90c9,_0x411609);}return this['_additionalMetadata'](_0x308297,_0x5d90c9),this[_0x205963(0xea)](_0x5d90c9,_0x411609),_0x411609[_0x205963(0xde)]['current']=_0x1a09e4,_0x411609[_0x205963(0x11a)]--,_0x411609[_0x205963(0xff)]=_0x35ca46,_0x411609[_0x205963(0xff)]&&_0x411609[_0x205963(0xe5)][_0x205963(0xdc)](),_0x5d90c9;}['_getOwnPropertySymbols'](_0x3ccb7a){var _0x1467de=_0x42398e;return Object['getOwnPropertySymbols']?Object[_0x1467de(0x12b)](_0x3ccb7a):[];}[_0x42398e(0x121)](_0x93ab1a){var _0x4263a4=_0x42398e;return!!(_0x93ab1a&&_0x1fa1aa[_0x4263a4(0xbd)]&&this[_0x4263a4(0x194)](_0x93ab1a)==='[object\\x20Set]'&&_0x93ab1a[_0x4263a4(0xce)]);}[_0x42398e(0x15d)](_0x132306,_0x3fde98,_0x48c6a8){var _0x4e36b8=_0x42398e;return _0x48c6a8[_0x4e36b8(0xb7)]?typeof _0x132306[_0x3fde98]==_0x4e36b8(0x16b):!0x1;}[_0x42398e(0x191)](_0x3f193a){var _0x1bf1db=_0x42398e,_0x1f4dd6='';return _0x1f4dd6=typeof _0x3f193a,_0x1f4dd6===_0x1bf1db(0xab)?this[_0x1bf1db(0x194)](_0x3f193a)===_0x1bf1db(0xd0)?_0x1f4dd6='array':this[_0x1bf1db(0x194)](_0x3f193a)===_0x1bf1db(0xca)?_0x1f4dd6=_0x1bf1db(0x165):this[_0x1bf1db(0x194)](_0x3f193a)==='[object\\x20BigInt]'?_0x1f4dd6='bigint':_0x3f193a===null?_0x1f4dd6=_0x1bf1db(0x186):_0x3f193a[_0x1bf1db(0xcd)]&&(_0x1f4dd6=_0x3f193a[_0x1bf1db(0xcd)][_0x1bf1db(0xb3)]||_0x1f4dd6):_0x1f4dd6===_0x1bf1db(0x14b)&&this[_0x1bf1db(0x18c)]&&_0x3f193a instanceof this['_HTMLAllCollection']&&(_0x1f4dd6='HTMLAllCollection'),_0x1f4dd6;}[_0x42398e(0x194)](_0xd9808c){var _0x13ee55=_0x42398e;return Object[_0x13ee55(0x137)][_0x13ee55(0xb9)][_0x13ee55(0x118)](_0xd9808c);}[_0x42398e(0xed)](_0x5bb6d5){var _0x162f9d=_0x42398e;return _0x5bb6d5==='boolean'||_0x5bb6d5===_0x162f9d(0xeb)||_0x5bb6d5===_0x162f9d(0x18f);}['_isPrimitiveWrapperType'](_0x2e4fa2){var _0x418b45=_0x42398e;return _0x2e4fa2===_0x418b45(0x17a)||_0x2e4fa2==='String'||_0x2e4fa2===_0x418b45(0xe9);}[_0x42398e(0x138)](_0x315538,_0x53e1e3,_0x26a7ae,_0x2a9896,_0x36a47d,_0x5aeaf9){var _0x517c9f=this;return function(_0x54b11f){var _0x32f6fa=_0x15f6,_0x55a1ba=_0x36a47d[_0x32f6fa(0xde)][_0x32f6fa(0xf2)],_0xae7a51=_0x36a47d[_0x32f6fa(0xde)]['index'],_0x5cfc73=_0x36a47d[_0x32f6fa(0xde)][_0x32f6fa(0x181)];_0x36a47d[_0x32f6fa(0xde)]['parent']=_0x55a1ba,_0x36a47d[_0x32f6fa(0xde)][_0x32f6fa(0x168)]=typeof _0x2a9896==_0x32f6fa(0x18f)?_0x2a9896:_0x54b11f,_0x315538['push'](_0x517c9f[_0x32f6fa(0xd1)](_0x53e1e3,_0x26a7ae,_0x2a9896,_0x36a47d,_0x5aeaf9)),_0x36a47d[_0x32f6fa(0xde)]['parent']=_0x5cfc73,_0x36a47d[_0x32f6fa(0xde)][_0x32f6fa(0x168)]=_0xae7a51;};}[_0x42398e(0xfb)](_0x102540,_0x28b951,_0x37b0d2,_0x1f43da,_0x4c16b9,_0x43a32c,_0x33fd6d){var _0x848e81=this;return _0x28b951['_p_'+_0x4c16b9['toString']()]=!0x0,function(_0x5d0f41){var _0x3446a1=_0x15f6,_0x37915c=_0x43a32c[_0x3446a1(0xde)][_0x3446a1(0xf2)],_0x491f6f=_0x43a32c[_0x3446a1(0xde)][_0x3446a1(0x168)],_0x49f445=_0x43a32c[_0x3446a1(0xde)][_0x3446a1(0x181)];_0x43a32c[_0x3446a1(0xde)]['parent']=_0x37915c,_0x43a32c[_0x3446a1(0xde)][_0x3446a1(0x168)]=_0x5d0f41,_0x102540[_0x3446a1(0xf5)](_0x848e81[_0x3446a1(0xd1)](_0x37b0d2,_0x1f43da,_0x4c16b9,_0x43a32c,_0x33fd6d)),_0x43a32c[_0x3446a1(0xde)][_0x3446a1(0x181)]=_0x49f445,_0x43a32c['node'][_0x3446a1(0x168)]=_0x491f6f;};}[_0x42398e(0xd1)](_0x3ecc34,_0x164e9b,_0x5853f4,_0x5021cc,_0x29aa4f){var _0x1c8cca=_0x42398e,_0x4bcb30=this;_0x29aa4f||(_0x29aa4f=function(_0x40face,_0x52de5c){return _0x40face[_0x52de5c];});var _0x15dc6a=_0x5853f4[_0x1c8cca(0xb9)](),_0x43cf2f=_0x5021cc[_0x1c8cca(0xd2)]||{},_0x288c5d=_0x5021cc[_0x1c8cca(0x173)],_0x3aa860=_0x5021cc['isExpressionToEvaluate'];try{var _0x4ddca7=this[_0x1c8cca(0xe6)](_0x3ecc34),_0x57d48d=_0x15dc6a;_0x4ddca7&&_0x57d48d[0x0]==='\\x27'&&(_0x57d48d=_0x57d48d[_0x1c8cca(0x170)](0x1,_0x57d48d[_0x1c8cca(0xc0)]-0x2));var _0x34aa5d=_0x5021cc[_0x1c8cca(0xd2)]=_0x43cf2f[_0x1c8cca(0x16a)+_0x57d48d];_0x34aa5d&&(_0x5021cc[_0x1c8cca(0x173)]=_0x5021cc['depth']+0x1),_0x5021cc[_0x1c8cca(0x190)]=!!_0x34aa5d;var _0x57e6e5=typeof _0x5853f4=='symbol',_0x320fd2={'name':_0x57e6e5||_0x4ddca7?_0x15dc6a:this[_0x1c8cca(0xdb)](_0x15dc6a)};if(_0x57e6e5&&(_0x320fd2[_0x1c8cca(0x10e)]=!0x0),!(_0x164e9b===_0x1c8cca(0x14d)||_0x164e9b==='Error')){var _0x452736=this['_getOwnPropertyDescriptor'](_0x3ecc34,_0x5853f4);if(_0x452736&&(_0x452736[_0x1c8cca(0x180)]&&(_0x320fd2[_0x1c8cca(0x151)]=!0x0),_0x452736[_0x1c8cca(0x129)]&&!_0x34aa5d&&!_0x5021cc[_0x1c8cca(0x176)]))return _0x320fd2[_0x1c8cca(0x130)]=!0x0,this['_processTreeNodeResult'](_0x320fd2,_0x5021cc),_0x320fd2;}var _0x29a3a2;try{_0x29a3a2=_0x29aa4f(_0x3ecc34,_0x5853f4);}catch(_0x323a9e){return _0x320fd2={'name':_0x15dc6a,'type':_0x1c8cca(0xdd),'error':_0x323a9e[_0x1c8cca(0x150)]},this['_processTreeNodeResult'](_0x320fd2,_0x5021cc),_0x320fd2;}var _0x331d64=this[_0x1c8cca(0x191)](_0x29a3a2),_0x4c472a=this[_0x1c8cca(0xed)](_0x331d64);if(_0x320fd2[_0x1c8cca(0x16c)]=_0x331d64,_0x4c472a)this[_0x1c8cca(0x10a)](_0x320fd2,_0x5021cc,_0x29a3a2,function(){var _0x1e62ef=_0x1c8cca;_0x320fd2[_0x1e62ef(0x169)]=_0x29a3a2[_0x1e62ef(0xa4)](),!_0x34aa5d&&_0x4bcb30[_0x1e62ef(0x12e)](_0x331d64,_0x320fd2,_0x5021cc,{});});else{var _0x3ef656=_0x5021cc[_0x1c8cca(0xff)]&&_0x5021cc[_0x1c8cca(0x11a)]<_0x5021cc[_0x1c8cca(0x112)]&&_0x5021cc[_0x1c8cca(0xe5)]['indexOf'](_0x29a3a2)<0x0&&_0x331d64!=='function'&&_0x5021cc[_0x1c8cca(0x147)]<_0x5021cc[_0x1c8cca(0xa5)];_0x3ef656||_0x5021cc[_0x1c8cca(0x11a)]<_0x288c5d||_0x34aa5d?(this[_0x1c8cca(0x14c)](_0x320fd2,_0x29a3a2,_0x5021cc,_0x34aa5d||{}),this['_additionalMetadata'](_0x29a3a2,_0x320fd2)):this[_0x1c8cca(0x10a)](_0x320fd2,_0x5021cc,_0x29a3a2,function(){var _0x360af2=_0x1c8cca;_0x331d64===_0x360af2(0x186)||_0x331d64===_0x360af2(0x14b)||(delete _0x320fd2[_0x360af2(0x169)],_0x320fd2[_0x360af2(0x119)]=!0x0);});}return _0x320fd2;}finally{_0x5021cc['expressionsToEvaluate']=_0x43cf2f,_0x5021cc['depth']=_0x288c5d,_0x5021cc[_0x1c8cca(0x190)]=_0x3aa860;}}[_0x42398e(0x12e)](_0x4dbd9c,_0x22ef58,_0x2e67fe,_0x59e98f){var _0x3bf59c=_0x42398e,_0x5cdbf3=_0x59e98f['strLength']||_0x2e67fe[_0x3bf59c(0x195)];if((_0x4dbd9c==='string'||_0x4dbd9c===_0x3bf59c(0x10b))&&_0x22ef58['value']){let _0x4facd7=_0x22ef58[_0x3bf59c(0x169)][_0x3bf59c(0xc0)];_0x2e67fe[_0x3bf59c(0x10f)]+=_0x4facd7,_0x2e67fe['allStrLength']>_0x2e67fe['totalStrLength']?(_0x22ef58[_0x3bf59c(0x119)]='',delete _0x22ef58[_0x3bf59c(0x169)]):_0x4facd7>_0x5cdbf3&&(_0x22ef58['capped']=_0x22ef58[_0x3bf59c(0x169)]['substr'](0x0,_0x5cdbf3),delete _0x22ef58['value']);}}[_0x42398e(0xe6)](_0x39c338){var _0x5b0ed6=_0x42398e;return!!(_0x39c338&&_0x1fa1aa[_0x5b0ed6(0x155)]&&this[_0x5b0ed6(0x194)](_0x39c338)===_0x5b0ed6(0x126)&&_0x39c338[_0x5b0ed6(0xce)]);}[_0x42398e(0xdb)](_0x379fc7){var _0x541cc9=_0x42398e;if(_0x379fc7[_0x541cc9(0xf7)](/^\\d+$/))return _0x379fc7;var _0x3040b9;try{_0x3040b9=JSON[_0x541cc9(0x164)](''+_0x379fc7);}catch{_0x3040b9='\\x22'+this[_0x541cc9(0x194)](_0x379fc7)+'\\x22';}return _0x3040b9[_0x541cc9(0xf7)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x3040b9=_0x3040b9[_0x541cc9(0x170)](0x1,_0x3040b9['length']-0x2):_0x3040b9=_0x3040b9[_0x541cc9(0x172)](/'/g,'\\x5c\\x27')[_0x541cc9(0x172)](/\\\\\"/g,'\\x22')[_0x541cc9(0x172)](/(^\"|\"$)/g,'\\x27'),_0x3040b9;}[_0x42398e(0x10a)](_0x4602a3,_0x2102be,_0x32ea79,_0x1ef98f){var _0x257f96=_0x42398e;this[_0x257f96(0xc3)](_0x4602a3,_0x2102be),_0x1ef98f&&_0x1ef98f(),this[_0x257f96(0xe3)](_0x32ea79,_0x4602a3),this[_0x257f96(0xea)](_0x4602a3,_0x2102be);}[_0x42398e(0xc3)](_0xcb63a4,_0x4f5d89){var _0x229660=_0x42398e;this[_0x229660(0x17b)](_0xcb63a4,_0x4f5d89),this['_setNodeQueryPath'](_0xcb63a4,_0x4f5d89),this[_0x229660(0x166)](_0xcb63a4,_0x4f5d89),this[_0x229660(0x103)](_0xcb63a4,_0x4f5d89);}[_0x42398e(0x17b)](_0x163355,_0x565bf5){}[_0x42398e(0x174)](_0x1a6919,_0x600e3a){}[_0x42398e(0xa6)](_0x3564f5,_0xa86bc4){}[_0x42398e(0x11f)](_0x3eb71a){var _0x40e6e7=_0x42398e;return _0x3eb71a===this[_0x40e6e7(0x185)];}[_0x42398e(0xea)](_0xadd117,_0xcbad20){var _0x444e60=_0x42398e;this['_setNodeLabel'](_0xadd117,_0xcbad20),this[_0x444e60(0x115)](_0xadd117),_0xcbad20[_0x444e60(0xdf)]&&this[_0x444e60(0xac)](_0xadd117),this[_0x444e60(0xf0)](_0xadd117,_0xcbad20),this[_0x444e60(0x177)](_0xadd117,_0xcbad20),this[_0x444e60(0xee)](_0xadd117);}[_0x42398e(0xe3)](_0x3d23ae,_0x113eec){var _0x1810ad=_0x42398e;let _0x1746da;try{_0x1fa1aa[_0x1810ad(0x109)]&&(_0x1746da=_0x1fa1aa[_0x1810ad(0x109)][_0x1810ad(0xaf)],_0x1fa1aa['console']['error']=function(){}),_0x3d23ae&&typeof _0x3d23ae[_0x1810ad(0xc0)]=='number'&&(_0x113eec['length']=_0x3d23ae[_0x1810ad(0xc0)]);}catch{}finally{_0x1746da&&(_0x1fa1aa[_0x1810ad(0x109)][_0x1810ad(0xaf)]=_0x1746da);}if(_0x113eec[_0x1810ad(0x16c)]===_0x1810ad(0x18f)||_0x113eec['type']===_0x1810ad(0xe9)){if(isNaN(_0x113eec[_0x1810ad(0x169)]))_0x113eec[_0x1810ad(0xd3)]=!0x0,delete _0x113eec[_0x1810ad(0x169)];else switch(_0x113eec[_0x1810ad(0x169)]){case Number[_0x1810ad(0xbe)]:_0x113eec['positiveInfinity']=!0x0,delete _0x113eec[_0x1810ad(0x169)];break;case Number[_0x1810ad(0x105)]:_0x113eec[_0x1810ad(0x17e)]=!0x0,delete _0x113eec[_0x1810ad(0x169)];break;case 0x0:this[_0x1810ad(0xc6)](_0x113eec['value'])&&(_0x113eec['negativeZero']=!0x0);break;}}else _0x113eec[_0x1810ad(0x16c)]==='function'&&typeof _0x3d23ae[_0x1810ad(0xb3)]==_0x1810ad(0xeb)&&_0x3d23ae[_0x1810ad(0xb3)]&&_0x113eec[_0x1810ad(0xb3)]&&_0x3d23ae[_0x1810ad(0xb3)]!==_0x113eec[_0x1810ad(0xb3)]&&(_0x113eec[_0x1810ad(0xe2)]=_0x3d23ae[_0x1810ad(0xb3)]);}['_isNegativeZero'](_0x4be0a5){return 0x1/_0x4be0a5===Number['NEGATIVE_INFINITY'];}[_0x42398e(0xac)](_0x2afc6f){var _0x218be8=_0x42398e;!_0x2afc6f[_0x218be8(0xae)]||!_0x2afc6f['props'][_0x218be8(0xc0)]||_0x2afc6f[_0x218be8(0x16c)]==='array'||_0x2afc6f['type']===_0x218be8(0x155)||_0x2afc6f[_0x218be8(0x16c)]===_0x218be8(0xbd)||_0x2afc6f[_0x218be8(0xae)][_0x218be8(0x154)](function(_0x270618,_0x56ff62){var _0x6c3871=_0x218be8,_0x346599=_0x270618['name']['toLowerCase'](),_0x308534=_0x56ff62[_0x6c3871(0xb3)][_0x6c3871(0xb8)]();return _0x346599<_0x308534?-0x1:_0x346599>_0x308534?0x1:0x0;});}[_0x42398e(0xf0)](_0x4817a0,_0x511b51){var _0x73c91a=_0x42398e;if(!(_0x511b51[_0x73c91a(0xb7)]||!_0x4817a0[_0x73c91a(0xae)]||!_0x4817a0[_0x73c91a(0xae)][_0x73c91a(0xc0)])){for(var _0x579f3a=[],_0x216629=[],_0x483a70=0x0,_0x1077d2=_0x4817a0['props'][_0x73c91a(0xc0)];_0x483a70<_0x1077d2;_0x483a70++){var _0x5aafce=_0x4817a0['props'][_0x483a70];_0x5aafce['type']==='function'?_0x579f3a[_0x73c91a(0xf5)](_0x5aafce):_0x216629[_0x73c91a(0xf5)](_0x5aafce);}if(!(!_0x216629[_0x73c91a(0xc0)]||_0x579f3a['length']<=0x1)){_0x4817a0[_0x73c91a(0xae)]=_0x216629;var _0x56a001={'functionsNode':!0x0,'props':_0x579f3a};this[_0x73c91a(0x17b)](_0x56a001,_0x511b51),this[_0x73c91a(0xa6)](_0x56a001,_0x511b51),this['_setNodeExpandableState'](_0x56a001),this[_0x73c91a(0x103)](_0x56a001,_0x511b51),_0x56a001['id']+='\\x20f',_0x4817a0[_0x73c91a(0xae)][_0x73c91a(0x146)](_0x56a001);}}}[_0x42398e(0x177)](_0x52ec54,_0x1b03c8){}[_0x42398e(0x115)](_0x373f4b){}[_0x42398e(0x120)](_0x494ae3){var _0x21dd10=_0x42398e;return Array[_0x21dd10(0x152)](_0x494ae3)||typeof _0x494ae3==_0x21dd10(0xab)&&this['_objectToString'](_0x494ae3)===_0x21dd10(0xd0);}[_0x42398e(0x103)](_0x40053e,_0x5ed3d6){}['_cleanNode'](_0x3a1b5c){var _0x2f9dd2=_0x42398e;delete _0x3a1b5c[_0x2f9dd2(0x13d)],delete _0x3a1b5c[_0x2f9dd2(0x148)],delete _0x3a1b5c['_hasMapOnItsPath'];}[_0x42398e(0x166)](_0x798f23,_0x3efada){}}let _0x4c7a63=new _0x3276c6(),_0x19cf1b={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x3b151c={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2};function _0x463c5b(_0xbd2986,_0x160277,_0x57abd3,_0x133479,_0x2a9121,_0x49d7af){var _0x20fba2=_0x42398e;let _0x7e007b,_0xafcbf9;try{_0xafcbf9=_0xf4300a(),_0x7e007b=_0x25c741[_0x160277],!_0x7e007b||_0xafcbf9-_0x7e007b['ts']>0x1f4&&_0x7e007b['count']&&_0x7e007b['time']/_0x7e007b['count']<0x64?(_0x25c741[_0x160277]=_0x7e007b={'count':0x0,'time':0x0,'ts':_0xafcbf9},_0x25c741[_0x20fba2(0x178)]={}):_0xafcbf9-_0x25c741['hits']['ts']>0x32&&_0x25c741[_0x20fba2(0x178)][_0x20fba2(0xad)]&&_0x25c741[_0x20fba2(0x178)][_0x20fba2(0x17d)]/_0x25c741[_0x20fba2(0x178)][_0x20fba2(0xad)]<0x64&&(_0x25c741[_0x20fba2(0x178)]={});let _0x1a0767=[],_0x301137=_0x7e007b[_0x20fba2(0xe0)]||_0x25c741[_0x20fba2(0x178)][_0x20fba2(0xe0)]?_0x3b151c:_0x19cf1b,_0xabddb=_0x129e7e=>{var _0x1e8e78=_0x20fba2;let _0x4eae92={};return _0x4eae92[_0x1e8e78(0xae)]=_0x129e7e[_0x1e8e78(0xae)],_0x4eae92[_0x1e8e78(0x11c)]=_0x129e7e[_0x1e8e78(0x11c)],_0x4eae92[_0x1e8e78(0x195)]=_0x129e7e[_0x1e8e78(0x195)],_0x4eae92['totalStrLength']=_0x129e7e['totalStrLength'],_0x4eae92[_0x1e8e78(0xa5)]=_0x129e7e[_0x1e8e78(0xa5)],_0x4eae92[_0x1e8e78(0x112)]=_0x129e7e[_0x1e8e78(0x112)],_0x4eae92[_0x1e8e78(0xdf)]=!0x1,_0x4eae92[_0x1e8e78(0xb7)]=!_0x6dc731,_0x4eae92[_0x1e8e78(0x173)]=0x1,_0x4eae92[_0x1e8e78(0x11a)]=0x0,_0x4eae92[_0x1e8e78(0x11e)]=_0x1e8e78(0x104),_0x4eae92['rootExpression']=_0x1e8e78(0x15f),_0x4eae92[_0x1e8e78(0xff)]=!0x0,_0x4eae92['autoExpandPreviousObjects']=[],_0x4eae92[_0x1e8e78(0x147)]=0x0,_0x4eae92[_0x1e8e78(0x176)]=!0x0,_0x4eae92[_0x1e8e78(0x10f)]=0x0,_0x4eae92[_0x1e8e78(0xde)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x4eae92;};for(var _0x2077f5=0x0;_0x2077f5<_0x2a9121[_0x20fba2(0xc0)];_0x2077f5++)_0x1a0767[_0x20fba2(0xf5)](_0x4c7a63[_0x20fba2(0x14c)]({'timeNode':_0xbd2986===_0x20fba2(0x17d)||void 0x0},_0x2a9121[_0x2077f5],_0xabddb(_0x301137),{}));if(_0xbd2986==='trace'){let _0x2cfcd4=Error[_0x20fba2(0xc2)];try{Error[_0x20fba2(0xc2)]=0x1/0x0,_0x1a0767[_0x20fba2(0xf5)](_0x4c7a63['serialize']({'stackNode':!0x0},new Error()[_0x20fba2(0xec)],_0xabddb(_0x301137),{'strLength':0x1/0x0}));}finally{Error['stackTraceLimit']=_0x2cfcd4;}}return{'method':_0x20fba2(0xef),'version':_0x1bd4eb,'args':[{'ts':_0x57abd3,'session':_0x133479,'args':_0x1a0767,'id':_0x160277,'context':_0x49d7af}]};}catch(_0x178591){return{'method':'log','version':_0x1bd4eb,'args':[{'ts':_0x57abd3,'session':_0x133479,'args':[{'type':_0x20fba2(0xdd),'error':_0x178591&&_0x178591['message']}],'id':_0x160277,'context':_0x49d7af}]};}finally{try{if(_0x7e007b&&_0xafcbf9){let _0x4a34f4=_0xf4300a();_0x7e007b[_0x20fba2(0xad)]++,_0x7e007b[_0x20fba2(0x17d)]+=_0x263d14(_0xafcbf9,_0x4a34f4),_0x7e007b['ts']=_0x4a34f4,_0x25c741[_0x20fba2(0x178)][_0x20fba2(0xad)]++,_0x25c741[_0x20fba2(0x178)][_0x20fba2(0x17d)]+=_0x263d14(_0xafcbf9,_0x4a34f4),_0x25c741[_0x20fba2(0x178)]['ts']=_0x4a34f4,(_0x7e007b[_0x20fba2(0xad)]>0x32||_0x7e007b[_0x20fba2(0x17d)]>0x64)&&(_0x7e007b[_0x20fba2(0xe0)]=!0x0),(_0x25c741[_0x20fba2(0x178)]['count']>0x3e8||_0x25c741[_0x20fba2(0x178)][_0x20fba2(0x17d)]>0x12c)&&(_0x25c741[_0x20fba2(0x178)][_0x20fba2(0xe0)]=!0x0);}}catch{}}}return _0x463c5b;}function _0x55e4(){var _0x3749cd=['_getOwnPropertyDescriptor','get','global','getOwnPropertySymbols','performance','then','_capIfString','_regExpToString','getter','process','toUpperCase','_allowedToSend','path','env','cappedProps','prototype','_addProperty','location','close','2VuKCBo','gateway.docker.internal','_hasSymbolPropertyOnItsPath','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','remix','port','_maxConnectAttemptCount','reload','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','_isPrimitiveWrapperType','_socket','unshift','autoExpandPropertyCount','_hasSetOnItsPath','getOwnPropertyDescriptor','_connectToHostNow','undefined','serialize','array','logger\\x20websocket\\x20error','_webSocketErrorDocsLink','message','setter','isArray','ws/index.js','sort','Map','18LRgzAM','','_keyStrRegExp','_p_name','elapsed','data','origin','_blacklistedProperty','_connecting','root_exp','defineProperty','_console_ninja_session','https://tinyurl.com/37x8b79t','getOwnPropertyNames','stringify','date','_setNodeExpressionPath','webpack','index','value','_p_','function','type','9360351zOghSB','_getOwnPropertySymbols','trace','substr','charAt','replace','depth','_setNodeQueryPath','nodeModules','resolveGetters','_addLoadNode','hits','_p_length','Boolean','_setNodeId','default','time','negativeInfinity','onerror','set','parent','split',\"c:\\\\Users\\\\Nestor\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-1.0.337\\\\node_modules\",'RegExp','_undefined','null','getWebSocketClass','versions','Symbol','edge','test','_HTMLAllCollection','\\x20server','_dateToString','number','isExpressionToEvaluate','_type','args','warn','_objectToString','strLength','6sgXWng','dockerizedApp','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20','valueOf','autoExpandLimit','_setNodeLabel','onclose','host','_attemptToReconnectShortly','1.0.0','object','_sortProps','count','props','error','hasOwnProperty','9196bYiyiB','send','name','_consoleNinjaAllowedToStart','create','1396160wbqKve','noFunctions','toLowerCase','toString','_sendErrorMessage','_connectAttemptCount','parse','Set','POSITIVE_INFINITY','includes','length','_disposeWebsocket','stackTraceLimit','_treeNodePropertiesBeforeFullValue','_console_ninja','6923195mprhDB','_isNegativeZero','onopen','4iquURE','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','[object\\x20Date]','_inNextEdge','143oOEdhK','constructor','forEach','next.js','[object\\x20Array]','_property','expressionsToEvaluate','nan','enumerable','_WebSocketClass','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20','cappedElements','join','1664859lGBvlL','concat','_propertyName','pop','unknown','node','sortProps','reduceLimits','onmessage','funcName','_additionalMetadata','%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20','autoExpandPreviousObjects','_isMap','1','_connected','Number','_treeNodePropertiesAfterFullValue','string','stack','_isPrimitiveType','_cleanNode','log','_addFunctionsNode','catch','current','52039','disabledTrace','push','coverage','match','1377072llktZt','now','bind','_addObjectProperty','_inBrowser','WebSocket','astro','autoExpand','hostname','_WebSocket','eventReceivedCallback','_setNodePermissions','root_exp_id','NEGATIVE_INFINITY','hrtime','Buffer','method','console','_processTreeNodeResult','String','_getOwnPropertyNames','_Symbol','symbol','allStrLength','bigint','unref','autoExpandMaxDepth','20990tSacgM','_quotedRegExp','_setNodeExpandableState','2912583ZSZJTv','NEXT_RUNTIME','call','capped','level','_reconnectTimeout','elements','_allowedToConnectOnSend','expId','_isUndefined','_isArray','_isSet','url','...','_ws','timeStamp','[object\\x20Map]','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)'];_0x55e4=function(){return _0x3749cd;};return _0x55e4();}((_0x315bef,_0x51fcc7,_0x3f2f9c,_0x747322,_0x2fa032,_0xa528c2,_0x2545d3,_0x54b223,_0x26dcd8,_0xacbbdf,_0x136c7b)=>{var _0x2b35cd=_0x56455d;if(_0x315bef[_0x2b35cd(0xc4)])return _0x315bef[_0x2b35cd(0xc4)];if(!H(_0x315bef,_0x54b223,_0x2fa032))return _0x315bef[_0x2b35cd(0xc4)]={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x315bef['_console_ninja'];let _0x593cd7=b(_0x315bef),_0xcc02d4=_0x593cd7['elapsed'],_0x481ec1=_0x593cd7[_0x2b35cd(0x125)],_0x321a00=_0x593cd7[_0x2b35cd(0xf9)],_0x4d73c6={'hits':{},'ts':{}},_0x2ae46d=J(_0x315bef,_0x26dcd8,_0x4d73c6,_0xa528c2),_0x40145a=_0x521d13=>{_0x4d73c6['ts'][_0x521d13]=_0x481ec1();},_0x141c60=(_0x36839e,_0x3a1c0c)=>{var _0x32a500=_0x2b35cd;let _0xcdfe24=_0x4d73c6['ts'][_0x3a1c0c];if(delete _0x4d73c6['ts'][_0x3a1c0c],_0xcdfe24){let _0x51f486=_0xcc02d4(_0xcdfe24,_0x481ec1());_0x1d4b78(_0x2ae46d(_0x32a500(0x17d),_0x36839e,_0x321a00(),_0x2bca30,[_0x51f486],_0x3a1c0c));}},_0x26e774=_0x387b4e=>{var _0x17661f=_0x2b35cd,_0x1709e9;return _0x2fa032===_0x17661f(0xcf)&&_0x315bef[_0x17661f(0x15c)]&&((_0x1709e9=_0x387b4e==null?void 0x0:_0x387b4e['args'])==null?void 0x0:_0x1709e9[_0x17661f(0xc0)])&&(_0x387b4e[_0x17661f(0x192)][0x0][_0x17661f(0x15c)]=_0x315bef['origin']),_0x387b4e;};_0x315bef[_0x2b35cd(0xc4)]={'consoleLog':(_0x485bf4,_0x553fd3)=>{var _0x5c0eaa=_0x2b35cd;_0x315bef[_0x5c0eaa(0x109)][_0x5c0eaa(0xef)][_0x5c0eaa(0xb3)]!=='disabledLog'&&_0x1d4b78(_0x2ae46d(_0x5c0eaa(0xef),_0x485bf4,_0x321a00(),_0x2bca30,_0x553fd3));},'consoleTrace':(_0x57af1b,_0x57b66e)=>{var _0x1dd540=_0x2b35cd;_0x315bef[_0x1dd540(0x109)][_0x1dd540(0xef)][_0x1dd540(0xb3)]!==_0x1dd540(0xf4)&&_0x1d4b78(_0x26e774(_0x2ae46d(_0x1dd540(0x16f),_0x57af1b,_0x321a00(),_0x2bca30,_0x57b66e)));},'consoleTime':_0xea0884=>{_0x40145a(_0xea0884);},'consoleTimeEnd':(_0x205f45,_0x504d14)=>{_0x141c60(_0x504d14,_0x205f45);},'autoLog':(_0x21e259,_0x35d417)=>{_0x1d4b78(_0x2ae46d('log',_0x35d417,_0x321a00(),_0x2bca30,[_0x21e259]));},'autoLogMany':(_0x285da4,_0x282146)=>{_0x1d4b78(_0x2ae46d('log',_0x285da4,_0x321a00(),_0x2bca30,_0x282146));},'autoTrace':(_0x178c0a,_0x38958e)=>{var _0x215e47=_0x2b35cd;_0x1d4b78(_0x26e774(_0x2ae46d(_0x215e47(0x16f),_0x38958e,_0x321a00(),_0x2bca30,[_0x178c0a])));},'autoTraceMany':(_0x81cf2d,_0x7c5a01)=>{var _0x4852e0=_0x2b35cd;_0x1d4b78(_0x26e774(_0x2ae46d(_0x4852e0(0x16f),_0x81cf2d,_0x321a00(),_0x2bca30,_0x7c5a01)));},'autoTime':(_0x1208ea,_0x4462bb,_0x2ca64b)=>{_0x40145a(_0x2ca64b);},'autoTimeEnd':(_0x2aa671,_0x5efa9c,_0x565d2f)=>{_0x141c60(_0x5efa9c,_0x565d2f);},'coverage':_0x4c0afc=>{var _0x6374b1=_0x2b35cd;_0x1d4b78({'method':_0x6374b1(0xf6),'version':_0xa528c2,'args':[{'id':_0x4c0afc}]});}};let _0x1d4b78=X(_0x315bef,_0x51fcc7,_0x3f2f9c,_0x747322,_0x2fa032,_0xacbbdf,_0x136c7b),_0x2bca30=_0x315bef[_0x2b35cd(0x161)];return _0x315bef['_console_ninja'];})(globalThis,'127.0.0.1',_0x56455d(0xf3),_0x56455d(0x183),_0x56455d(0x167),_0x56455d(0xaa),'1722628514271',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"DESKTOP-QJL4JBF\",\"172.31.48.1\",\"192.168.189.1\",\"192.168.59.1\",\"192.168.1.3\"],'',_0x56455d(0x157),_0x56455d(0xe7));");}catch(e){}};/* istanbul ignore next */function oo_oo(i,...v){try{oo_cm().consoleLog(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_tr(i,...v){try{oo_cm().consoleTrace(i, v);}catch(e){} return v};/* istanbul ignore next */function oo_ts(v){try{oo_cm().consoleTime(v);}catch(e){} return v;};/* istanbul ignore next */function oo_te(v, i){try{oo_cm().consoleTimeEnd(v, i);}catch(e){} return v;};/*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/</script>
