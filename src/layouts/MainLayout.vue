<template>
  <div class="h-100"
       :class="mainLayoutClass"
       v-if="isShowPage">
    <div class=" h-100 w-100 d-flex align-items-center justify-content-center text-center unsupported">
      <span>This screen size is not supported.</span>
    </div>
    <div class="page h-100">
      <mobile-live-call-bar v-if="!mobilePhoneDrawer && !suspended"/>
      <q-layout class="page-layout"
                view="lHh Lpr lff"
                :class="pageLayoutHeightClass"
                :height="'100%'">
        <div class="h-100"
             :class="headerContainerClass">
          <q-header class="page-header bg-white text-black no-box-shadow"
                    v-if="isShowAppHeader">
            <app-header @toggleSidebar="toggleSidebar"/>
          </q-header>
          <q-page-container :style="`${!isShowAppHeader ? 'padding-top: 0 !important;' : ''}`"
                            :class="pageContainerClasses">
            <section class="main-content section h-100">
              <template v-if="!loading || suspended">
                <transition :name="transitionName"
                            mode="out-in">
                  <!-- <keep-alive> -->
                  <router-view></router-view>
                  <!-- </keep-alive> -->
                </transition>
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
            <dialer v-if="authenticated && !suspended"/>
          </q-page-container>
        </div>
        <q-drawer class="h-100 sidebar-wrapper d-block"
                  content-class="sidebar"
                  :breakpoint="0"
                  :width="64"
                  v-model="sidebarVisible"
                  v-if="authenticated && !suspended">
          <q-list>
            <app-sidebar class="page-sidebar"
                         :lightMode="lightMode"
                         @toggleMode="toggleMode">
            </app-sidebar>
          </q-list>
        </q-drawer>
        <q-drawer class="mobile-phone-drawer position-relative"
                  ref="mobilePhone"
                  side="right"
                  bordered
                  no-swipe-close
                  :overlay="false"
                  :class="mobilePhoneDrawerClass"
                  :breakpoint="789"
                  v-model="mobilePhoneDrawer"
                  v-if="authenticated && !suspended"
                  @hide="onCloseMobilePhone">
          <q-header class="page-header bg-white text-black no-box-shadow dialer-header"
                    v-if="!isPhoneVisible && isMobile">
            <app-header force-page-title="Phone"
                        :no-padding="true"
                        :title-only="true"/>
          </q-header>
          <phone :isMobile="isMobile"
                 :class="{ 'hidden': mobilePhoneDrawer }"
                 @onPhoneVisible="onPhoneVisible">
          </phone>
          <dialer-form ref="dialerForm"
                       class="dialerForm"
                       :class="{ 'hide': (isPhoneVisible || !mobilePhoneDrawer) }"
                       v-model="mobilePhoneDrawer"
                       v-if="isMobile">
          </dialer-form>
        </q-drawer>
        <app-footer class="page-footer row d-block w-100 m-0 px-1"
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
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  aclMixin,
  htmlMixin,
  webrtcMixin,
  notificationMixin,
  broadcastMixin,
  parkCallMixin,
  visibilityMixin,
  unownedContactTaskMixin,
  agentMixin,
  contactV2AttributesMixin
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

export default {
  name: 'MyLayout',

  components: {
    MobileLiveCallBar,
    DialerForm,
    AppHeader,
    AppFooter,
    AppSidebar,
    Dialer,
    Phone,
    ProFeatureDialog,
    Modal
  },

  mixins: [
    webrtcMixin,
    htmlMixin,
    aclMixin,
    notificationMixin,
    broadcastMixin,
    parkCallMixin,
    visibilityMixin,
    unownedContactTaskMixin,
    agentMixin,
    contactV2AttributesMixin
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
      loadingScripts: false,
      loadingTemplates: false,
      loadingBroadcasts: false,
      loadingAvailableMetrics: false,
      loadingMetricGroups: false,
      loadingLeadSources: false,
      isWidget: false,
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
      CommunicationTypes,
      MetricOptionGroups,
      AppDefaultLogin
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
      'leadSources'
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

    isGuest () {
      return _.get(this.$route.meta, 'isGuest', false)
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
      const isAuthenticated = !this.isGuest && this.authenticated
      const isUnauthenticated = this.isGuest && !this.authenticated

      return isAuthenticated || isUnauthenticated || this.suspended
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
    }
  },

  created () {
    this.showMobileFooter = this.isMobile
    this.checkDebounce = _.debounce(this.check, 1000)

    if (this.$route.name === 'Suspended') {
      this.setSuspended(true)
    }

    this.setNotificationAudio()

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
      if (!this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)
      const isFishingMode = ringGroup && ringGroup.should_queue && ringGroup.fishing_mode
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

    this.mainListeners.newInAppHighSmsVolume = (data) => {
      if (this.profile.sleep_mode) {
        return
      }
      this.handleInAppHighSmsVolumeNotification(data.incoming_number, data.contact, data.direction)
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
        console.log('Changed agent status [event]: ', user.agent_status)
      }
    }

    this.mainListeners.companyUpdated = (company) => {
      this.checkSuspended(company)
    }

    this.mainListeners.agentStatusUpdated = (event) => {
      this.updateUserStatus(event)

      if (this.currentCompany && event.company_id && event.company_id === this.currentCompany.id &&
        this.profile && event.user_id === this.profile.id && this.profile.agent_status !== event.agent_status) {
        this.setAgentStatus(event.agent_status)
        console.log('Changed agent status [event]: ', event.agent_status)
      }
    }

    this.mainListeners.changeAgentStatus = (agentStatus) => {
      this.changeAgentStatus(agentStatus)
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

      console.log(' %c EXPORT EVENT DELETE : ', 'background: red; color: #fff;', task)
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
            console.log(err)
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

    if (this.$route.name.includes('Inbox')) {
      setTimeout(() => {
        this.$VueEvent.fire('inbox_route_name_change')
      }, 1000)
    }

    this.resetPowerDialerSession(this.$route)
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

    console.log('Push permission: ' + window.Push.Permission.get())

    if (!window.Push.Permission.has() && window.Push.Permission.get() !== window.Push.Permission.DENIED) {
      window.Push.Permission.request()
    }

    this.resizeHandler()

    // event for listening before tab/browser close
    window.addEventListener('beforeunload', this.beforeUnload)

    // online / offline
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
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
      this.$VueEvent.listen('new_in_app_high_sms_volume', this.mainListeners.newInAppHighSmsVolume)
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
    },

    stopMainEvents () {
      this.$VueEvent.stop('new_in_app_call', this.mainListeners.newInAppCall)
      this.$VueEvent.stop('new_in_app_sms', this.mainListeners.newInAppSms)
      this.$VueEvent.stop('new_in_app_voicemail', this.mainListeners.newInAppVoicemail)
      this.$VueEvent.stop('new_desktop_contact_assigned', this.mainListeners.newDesktopContactAssigned)
      this.$VueEvent.stop('new_in_app_high_sms_volume', this.mainListeners.newInAppHighSmsVolume)
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
      this.setTagsFullyLoaded(true)

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

        if (this.profile && this.profile.live_calls === 0 && this.dialer.call &&
          !this.profile.go_to_available_after_login) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_OFFLINE)
        }

        if (this.profile && this.profile.go_to_available_after_login && !this.dialer.call) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)
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
        this.getFullTags()
        // this.getTags()
        this.getWorkflows()

        this.getDispositionStatuses()
        this.getCallDispositions()
        this.getLeadSources()
      })
    },

    checkAuth (authTry = 1) {
      if (this.profile !== null) {
        this.check(true).then(() => {
          this.loading = false
          this.authCheckStatus = true
          this.showRefreshButton = false
        }).catch((err) => {
          console.log(err)
          authTry++

          // check if we are authenticated after 3 retries
          if (authTry > 3) {
            this.authCheckStatus = false

            setTimeout(() => {
              this.showRefreshButton = true
            }, 10000)

            // prevent showing an empty screen with a loading spinner in login page
            if (this.$route.name !== 'Login') {
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
          console.log(err)

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
            console.log(err)
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
            console.log(err)
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
            console.log(err)
            this.loadingUsers = false

            return Promise.reject()
          })
      }
    },

    getFullTags () {
      this.loadingTags = true

      return this.$axios
        .get('/api/v1/tag', { params: { full_load: true } })
        .then((res) => {
          this.setTags(res.data)
          this.$VueEvent.fire('tags_loaded')
          this.loadingTags = false

          return Promise.resolve()
        })
        .catch((err) => {
          this.setTagsFullyLoaded(false)
          console.log(err)
          this.loadingTags = false

          return Promise.reject()
        })
    },

    getTags (page = 1) {
      if (page === 1) {
        this.loadingTags = true
      }

      const params = {
        page: page
      }

      return this.$axios
        .get('/api/v1/tag', { params })
        .then((res) => {
          this.setTagsFullyLoaded(false)

          if (res.data.data && res.data.data.length) {
            res.data.data.forEach((tag) => {
              this.newTag(tag)
            })
          }

          if (res.data.to !== res.data.total) {
            this.getTags(page + 1)

            return Promise.resolve()
          }

          this.setTagsFullyLoaded(true)
          this.$VueEvent.fire('tags_loaded')
          this.loadingTags = false

          return Promise.resolve()
        })
        .catch((err) => {
          this.setTagsFullyLoaded(false)
          console.log(err)
          this.loadingTags = false

          return Promise.reject()
        })
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
          console.log(err)

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
            console.log(err)
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
            console.log(err)
            this.loadingCallDispositionStatuses = false

            return Promise.reject()
          })
      }
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
          console.log(err)
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
          console.log(err)
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
          console.log(err)

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
        console.log('Calling phone number: ' + phoneNumber)
        this.call(phoneNumber)

        return
      }

      console.log('Rescheduling call to phone number: ' + phoneNumber)
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
                console.log(err)
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
                console.log(err)
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
                console.log(err)
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
            console.log(err)
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
              console.log(err)
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
            console.log(err)
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
              console.log(err)
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
            console.log(err)
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

    handleInAppHighSmsVolumeNotification (incomingNumber, contact, direction) {
      if (window.Push.Permission.has()) {
        this.$generalNotification(`Received too many messages from a contacts.</br>Name: ${contact.name}</br>Incoming Number: ${incomingNumber.phone_number}`, 'error', 5000, true)
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
              console.log(err)
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
            console.log(err)
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
              console.log(err)
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
            console.log(err)
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
        this.mobilePhoneDrawer = true
      }

      if (typeof this.$refs.appFooter !== 'undefined') {
        this.$refs.appFooter.updateTab()
      }
    },

    logout () {
      this.logoutUser().then((res) => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
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
        }).catch(err => {
          console.log(err)

          if (repeatTimes >= 3) {
            this.$handleErrors(err.response)
            return
          }

          this.getStatics(repeatTimes + 1)
        })
    },

    goAvailable () {
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)
      this.$bvModal.hide('missed-call-modal')
    },

    stayBusy () {
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)
      this.$bvModal.hide('missed-call-modal')
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
    ...mapActions('powerDialer', ['setFinishedPowerDialerSession']),
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
      'setTagsFullyLoaded',
      'setNotifications',
      'resetNotifications',
      'setTags',
      'setIsMobile',
      'setIsTabletOrMobile',
      'setContactDetailsDrawer',
      'setEnableAudio',
      'setDefaultDateFilter',
      'setNotificationAudio',
      'removeParkedCall',
      'setSuspended',
      'setLeadSources',
      'updateUserStatus',
      'setStatics',
      'setStaticsLoaded'
    ]),
    ...mapActions('contacts', [
      'resetSearch',
      'setShowContactsHeader'
    ]),
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check'
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
      'gettingTasksList'
    ])
  },

  watch: {
    '$q.screen.lt.lg': function () {
      if (typeof this.$refs.mobilePhone === 'undefined') {
        return
      }

      if (!this.$q.screen.lt.lg) {
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

      if (!(from.name === 'Contacts' && this.$route.name === 'Contact') &&
        !(from.name === 'Contact' && this.$route.name === 'Contacts') &&
        to.name !== from.name &&
        (to.name !== 'Power Dialer' && to.name !== 'Power Dialer Session')) {
        this.resetVuex(['contacts', 'non-cache'])
      }

      if (from.name === 'Contacts' && to.name === 'Contacts' && from.params.id !== to.params.id) {
        this.resetSearch()
      }

      if (!(from.name === 'Inbox' && this.$route.name === 'Inbox Contact') &&
        !(from.name === 'Inbox Contact' && this.$route.name === 'Inbox') &&
        to.name !== from.name) {
        this.resetVuex(['inbox', 'non-cache'])
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

      const inboxStatus = _.get(this.$route, 'params.status', null)

      if (inboxStatus) {
        setTimeout(() => {
          this.$VueEvent.fire('inbox_route_change')
        }, 1000)
      }

      if (to.name.includes('Inbox')) {
        setTimeout(() => {
          this.$VueEvent.fire('inbox_route_name_change')
        }, 1000)
      }

      if (to.name === 'Inbox' && !from.name.includes('Inbox')) {
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
</script>
