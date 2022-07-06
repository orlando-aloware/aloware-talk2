<template>
  <div class="h-100"
       :class="[
          authenticated && !accountSuspended ? `dashboard ${pageClass}` : 'guest',
          lightMode ? 'light-mode' : 'night-mode'
        ]"
       v-if="(!this.isGuest && authenticated || this.isGuest && !authenticated)">
    <div class=" h-100 w-100 d-flex align-items-center justify-content-center text-center"
         :class="{ 'unsupported': !$q.platform.is.mobile }">
      <span>This screen size is not supported.</span>
    </div>
    <div class="page h-100">
      <mobile-live-call-bar v-if="!mobilePhoneDrawer && !accountSuspended" />
      <q-layout class="page-layout"
                view="lHh Lpr lff"
                :class="pageLayoutHeightClass"
                :height="'100%'">
        <div class="h-100"
             :class="{ 'sidebar-active': sidebarVisible, 'hidden': mobilePhoneDrawer || (mobilePhoneDrawer && !isPhoneVisible) }">
          <q-header class="page-header bg-white text-black no-box-shadow"
                    v-if="authenticated && !isWidget && !loading && showContactsHeader && !accountSuspended">
            <app-header @toggleSidebar="toggleSidebar"/>
          </q-header>
          <q-page-container :class="pageContainerClasses">
            <section class="main-content section h-100">
              <template v-if="!loading">
                <transition :name="transitionName"
                            mode="out-in">
                  <!-- <keep-alive> -->
                    <router-view></router-view>
                  <!-- </keep-alive> -->
                </transition>
              </template>
              <div class="d-flex justify-content-center align-items-center text-center text-black h-100"
                   v-else-if="loading">
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
            <dialer v-if="authenticated && !accountSuspended">
            </dialer>
          </q-page-container>
        </div>
        <q-drawer v-model="sidebarVisible"
                  v-if="authenticated && !accountSuspended"
                  :breakpoint="0"
                  class="h-100 sidebar-wrapper d-block"
                  :width="64"
                  content-class="sidebar">
          <q-list>
            <app-sidebar class="page-sidebar"
                         :lightMode="lightMode"
                         @toggleMode="toggleMode">
            </app-sidebar>
          </q-list>
        </q-drawer>
        <q-drawer
          ref="mobilePhone"
          :overlay="false"
          bordered
          no-swipe-close
          class="mobile-phone-drawer position-relative"
          :class="mobilePhoneDrawerClass"
          side="right"
          :breakpoint="789"
          v-model="mobilePhoneDrawer"
          v-if="authenticated && !accountSuspended"
          @hide="onCloseMobilePhone">
          <q-header class="page-header bg-white text-black no-box-shadow dialer-header"
                    v-show="!isPhoneVisible">
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
                       :class="{ 'hide': isPhoneVisible }"
                       :isMobile="true"
                       v-model="mobilePhoneDrawer"
                       v-if="mobilePhoneDrawer"
                       @hide="onDialerFormHide">
          </dialer-form>
        </q-drawer>
        <app-footer class="page-footer row d-block w-100 m-0 px-1"
                    ref="appFooter"
                    v-if="authenticated && !isWidget && !loading && isMobile && !accountSuspended"
                    @toggleMobilePhone="toggleMobilePhone">
        </app-footer>
      </q-layout>
      <q-dialog v-model="showNewVersionDialog"
                transition-show="scale"
                transition-hide="scale"
                persistent>
        <q-card class="bg-blue text-white"
                style="width: 300px">
          <q-card-section>
            <div class="text-h6">Update Available</div>
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-html="updateDialogText">
          </q-card-section>

          <q-card-actions align="right"
                          class="bg-white text-blue">
            <q-btn label="Close"
                   v-close-popup flat>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showUpdateErrorDialog"
                transition-show="scale"
                transition-hide="scale"
                persistent>
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
                   text-color="red"
                   v-close-popup flat>
            </q-btn>
            <q-btn label="Quit"
                   text-color="red"
                   @click="quitApp"
                   flat>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showUpdateDownloadedDialog"
                transition-show="scale"
                transition-hide="scale"
                persistent>
        <q-card class="bg-greenish text-white"
                style="width: 300px">
          <q-card-section>
            <div class="text-h6">Update Downloaded</div>
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-html="updateDialogText">
          </q-card-section>

          <q-card-actions align="right"
                          class="bg-white text-greenish">
            <q-btn label="Restart"
                   @click="restartApp"
                   flat>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
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
  unownedContactTaskMixin
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
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import _ from 'lodash'
import DialerForm from 'components/dialer/dialer-form'
import Phone from 'components/dialer/phone'
import MobileLiveCallBar from 'components/dialer/mobile-live-call-bar'
import * as storage from 'src/plugins/helpers/storage'
import talk2Api from 'src/plugins/api/api'
import * as CommunicationDirections from 'src/constants/communication-direction'

export default {
  name: 'MyLayout',

  components: {
    MobileLiveCallBar,
    DialerForm,
    AppHeader,
    AppFooter,
    AppSidebar,
    Dialer,
    Phone
  },

  mixins: [
    webrtcMixin,
    htmlMixin,
    aclMixin,
    notificationMixin,
    broadcastMixin,
    parkCallMixin,
    visibilityMixin,
    unownedContactTaskMixin
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
      CommunicationTypes,
      MetricOptionGroups,
      AppDefaultLogin
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState([
      'dialer',
      'campaigns',
      'isMobile',
      'ringGroups',
      'notifications',
      'showPhone',
      'accountSuspended'
    ]),
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState('stats', ['availableMetrics']),
    ...mapState('contacts', ['showContactsHeader']),
    ...mapState('inbox', ['selectedContact', 'liveContacts']),
    ...mapState('powerDialer', ['ongoingSession']),
    isGuest () {
      return _.get(this.$route.meta, 'isGuest', false)
    },
    pageClass () {
      const pageSlug = _.get(this.$route.meta, 'title', this.$route.name).toLowerCase()
      return pageSlug.replace(/ /g, '_') + '-page'
    },
    pageLayoutHeightClass () {
      if (!this.isMobile || (this.mobilePhoneDrawer && !this.isPhoneVisible) || (this.$route.name === 'Phone' && !this.isPhoneVisible)) {
        return ['h-100']
      }

      if (((this.dialer.call && !['RECEIVED_CALL_INVITE', 'WRAP_UP'].includes(this.dialer.currentStatus)) && !this.dialer.parkedCall) ||
        ((!this.dialer.call || ['RECEIVED_CALL_INVITE', 'WRAP_UP'].includes(this.dialer.currentStatus)) && this.dialer.parkedCall)) {
        return ['h-1-livebar']
      }

      if ((this.dialer.call && !['RECEIVED_CALL_INVITE', 'WRAP_UP'].includes(this.dialer.currentStatus)) && this.dialer.parkedCall) {
        return ['h-2-livebar']
      }

      return ['h-100']
    },
    pageContainerClasses () {
      return {
        'page-container h-100': true,
        'pt-58': this.showContactsHeader
      }
    },
    mobilePhoneDrawerClass () {
      return {
        'hidden': !this.mobilePhoneDrawer || !this.$q.screen.lt.md,
        'mobile-phone-visible': this.isPhoneVisible
      }
    },
    isSamePDListId () {
      return this.$route.params.id === this.ongoingSession.listId
    },
    isNotInInbox () {
      return this.$route.path.indexOf('channels/inbox') === -1 && !['Inbox', 'Inbox Channel Task Status', 'Inbox Contact Task'].includes(this.$route.name)
    }
  },

  created () {
    if (this.$route.name === 'Suspended') {
      this.setAccountSuspended(true)
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
    }

    if (this.$q.platform.is.electron) {
      this.$q.electron.ipcRenderer.send('app_version')

      this.$q.electron.ipcRenderer.on('open-url', (event, data) => {
        const action = data.replace(/(^\w+:|^)\/\//, '')

        if (data.indexOf('callto:') > -1) {
          const phoneNumber = data.replace('callto:', '')
          return this.sendCall(phoneNumber)
        }

        if (data.indexOf('tel:') > -1) {
          const phoneNumber = data.replace('tel:', '')
          return this.sendCall(phoneNumber)
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
      })

      this.$q.electron.ipcRenderer.on('update_available', (event, data) => {
        this.updateDialogText = data
        this.showUpdateDownloadedDialog = false
        this.showUpdateErrorDialog = false
        this.showNewVersionDialog = true
      })

      this.$q.electron.ipcRenderer.on('update_downloaded', (event, data) => {
        this.updateDialogText = data
        this.showNewVersionDialog = false
        this.showUpdateErrorDialog = false
        this.showUpdateDownloadedDialog = true
      })

      this.$q.electron.ipcRenderer.on('update_error', (event, data) => {
        this.updateDialogText = data
        this.showNewVersionDialog = false
        this.showUpdateDownloadedDialog = false
        this.showUpdateErrorDialog = true
      })

      this.$q.electron.ipcRenderer.on('app_version', (event, data) => {
        this.version = data.version
        storage.local.setItem('version', this.version)
        window.axios.defaults.headers.common['Version'] = this.version
        this.$axios = window.axios
      })

      // bounce dock
      this.$VueEvent.listen('bounce_dock', () => {
        this.bounceDock()
      })

      // set dock badge
      this.$VueEvent.listen('set_badge', (badgeText) => {
        if (badgeText === undefined) {
          return
        }
        this.setBadge(badgeText.toString())
      })

      // increase dock badge
      this.$VueEvent.listen('increase_badge', (count) => {
        this.increaseAppBadge(count)
      })

      // decrease dock badge
      this.$VueEvent.listen('decrease_badge', (count) => {
        this.decreaseAppBadge(count)
      })
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

    // new in-app call notification
    this.$VueEvent.listen('new_in_app_call', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication) && !this.profile.sleep_mode) {
        this.processActionNotification(communication, 'call')
      }
    })

    // new in-app sms notification
    this.$VueEvent.listen('new_in_app_sms', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication) && !this.profile.sleep_mode) {
        this.processActionNotification(communication, 'sms')
      }
    })

    // new in-app voicemail notification
    this.$VueEvent.listen('new_in_app_voicemail', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication) && !this.profile.sleep_mode) {
        this.processActionNotification(communication, 'missed voicemail')
      }
    })

    // new in-app fax notification
    // this.$VueEvent.listen('new_in_app_fax', (communication) => {
    //   if (this.checkCommunicationMatchesUserAccessibility(communication) && !this.profile.sleep_mode) {
    //     this.handleInAppCommunicationNotification(communication)
    //   }
    // })

    // new desktop contact assigned notification
    this.$VueEvent.listen('new_desktop_contact_assigned', (contact) => {
      if (this.checkContactMatchesUserAccessibility(contact)) {
        this.handleDesktopContactNotification(contact)
      }
    })

    // new desktop appointment notification
    this.$VueEvent.listen(
      'new_desktop_appointment',
      ({
        engagement,
        contact,
        timeDiff,
        unit
      }) => {
        this.handleDesktopAppointmentNotification(
          engagement,
          contact,
          timeDiff,
          unit
        )
      }
    )

    // new desktop reminder notification
    this.$VueEvent.listen(
      'new_desktop_reminder',
      ({
        engagement,
        contact,
        timeDiff,
        unit
      }) => {
        this.handleDesktopReminderNotification(
          engagement,
          contact,
          timeDiff,
          unit
        )
      }
    )

    // new desktop call notification
    this.$VueEvent.listen('new_desktop_call', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    })

    // answered desktop call notification
    this.$VueEvent.listen('answered_desktop_call', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    })

    // new desktop sms notification
    this.$VueEvent.listen('new_desktop_sms', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    })

    // new desktop fax notification
    this.$VueEvent.listen('new_desktop_fax', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopCommunicationNotification(communication)
      }
    })

    // new desktop voicemail notification
    this.$VueEvent.listen('new_desktop_voicemail', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication)) {
        this.handleDesktopVoicemailNotification(communication)
      }
    })

    // user mention notification
    this.$VueEvent.listen('mention', (data) => {
      if (this.checkMentionMatchesUserAccessibility(data)) {
        this.processActionNotification(data, 'mention')
      }
    })

    this.$VueEvent.listen('update_communication', (communication) => {
      const parkedCall = _.get(this.dialer, 'parkedCall', null)
      const isCommunicationHasUnownedContact = this.isNotOwned(communication.contact.user_id)

      // remove the parked call if the caller was disconnected
      if (communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW && parkedCall && parkedCall.id === communication.id) {
        this.setDialerParkedCall()
        this.removeParkedCall(communication.id)
      }

      if (this.checkCommunicationMatchesUserAccessibility(communication) || isCommunicationHasUnownedContact) {
        // missed call notification
        // if (communication.type === CommunicationTypes.CALL &&
        //   communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW &&
        //   !this.profile.sleep_mode) {
        //   this.processActionNotification(communication, 'missed call')
        // }

        // if disposition status is not in-progress
        // or current status is not queued / ring all, close call notification
        if (communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ||
          ![CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW].includes(communication.current_status2)) {
          this.closeCallNotifications(this.getNotificationType(communication.ring_group_id), communication.id)
        }

        if (this.isNotInInbox) {
          if (!communication.contact_id) {
            return
          }

          const isActiveInLiveContactsIndex = this.liveContacts.findIndex(item => item.id === communication.contact_id &&
            [
              CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
              CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
            ].includes(item.last_communication.current_status2))

          if (isActiveInLiveContactsIndex >= 0 && this.liveContacts[isActiveInLiveContactsIndex].last_communication.id === communication.id) {
            const liveContacts = _.cloneDeep(this.liveContacts)
            liveContacts[isActiveInLiveContactsIndex].last_communication = communication

            // if type is call and completed/voicemail then remove from live calls
            if ([CommunicationDirections.INBOUND, CommunicationDirections.OUTBOUND].includes(communication.direction) &&
              communication.type === CommunicationTypes.CALL &&
              [CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW].includes(communication.current_status2)) {
              liveContacts.splice(isActiveInLiveContactsIndex, 1)
            }

            this.setLiveContacts(
              [
                // connected calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)),
                // parked calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
                // incoming calls
                ...liveContacts.filter(item => [
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
                ].includes(item.last_communication.current_status2))
              ]
            )

            return
          }

          if (isActiveInLiveContactsIndex >= 0) {
            return
          }

          const index = this.liveContacts.findIndex(item => item.id === communication.contact_id)
          if (index >= 0) {
            const liveContacts = _.cloneDeep(this.liveContacts)
            liveContacts[index].last_communication = communication
            this.setLiveContacts(
              [
                // connected calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)),
                // parked calls
                ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
                // incoming calls
                ...liveContacts.filter(item => [
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
                  CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
                ].includes(item.last_communication.current_status2))
              ]
            )
          }
        }
      }
    })

    this.$VueEvent.listen('new_version', () => {
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
    })

    this.$VueEvent.listen('contact_updated', (data) => {
      if (this.$route.path.indexOf('channels/inbox') === -1) {
        // only fetch the latest contact data when updated contact is also the selected contact
        // this is to avoid swarm of api request when numbers of contacts get updated
        if (this.selectedContact && parseInt(this.selectedContact.id) === parseInt(data.id)) {
          talk2Api.V2.contacts.get(data.id).then(response => {
            const contact = response.data
            // check data loaded
            this.setSelectedContact(contact)
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })

    this.$VueEvent.listen('new_communication', (communication) => {
      if (!this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      if (this.isNotInInbox) {
        // Do not alter live contacts if it's in active mode
        const isActiveInLiveContactsIndex = this.liveContacts.findIndex(item => item.id === communication.contact_id &&
          [
            CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
            CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
          ].includes(item.last_communication.current_status2))

        if (isActiveInLiveContactsIndex >= 0) {
          return
        }

        setTimeout(() => {
          talk2Api.V2.contacts.get(communication.contact_id).then(response => {
            const contact = response.data
            const isInLiveContacts = this.liveContacts.find(item => item.id === contact.id)
            // check if communication is a live call
            if (communication.type === CommunicationTypes.CALL && [CommunicationDirections.INBOUND, CommunicationDirections.OUTBOUND].includes(communication.direction) &&
              [ CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
                CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW ].includes(communication.current_status2)) {
              const liveContacts = _.cloneDeep(this.liveContacts)
              if (!isInLiveContacts) {
                liveContacts.push(contact)
              }
              this.setLiveContacts(
                [
                  // connected calls
                  ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(item.last_communication.current_status2)),
                  // parked calls
                  ...liveContacts.filter(item => [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(item.last_communication.current_status2)),
                  // incoming calls
                  ...liveContacts.filter(item => [
                    CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
                    CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
                    CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
                    CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
                    CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
                  ].includes(item.last_communication.current_status2))
                ]
              )
            }
          }).catch(err => {
            console.log(err)
          })
        }, 1000)
      }
    })

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
      this.check().then((res) => {
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

    if (!window.sessionIntervalId) {
      window.sessionIntervalId = setInterval(() => {
        // this is a recursive authentication check with 3 tries
        this.checkAuth()
      }, 60 * 1000)
    }

    if (this.mediaPlaybackRequiresUserGesture()) {
      window.addEventListener('keydown', this.removeBehaviorsRestrictions)
      window.addEventListener('mousedown', this.removeBehaviorsRestrictions)
      window.addEventListener('touchstart', this.removeBehaviorsRestrictions)
    } else {
      this.setEnableAudio(true)
    }

    console.log('Push permission: ' + window.Push.Permission.get())
    if (
      !window.Push.Permission.has() &&
      window.Push.Permission.get() !== window.Push.Permission.DENIED
    ) {
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
    resetPowerDialerSession (route) {
      if (route.meta.title !== 'Power Dialer Sessions' || (route.meta.title === 'Power Dialer Sessions' && !this.isSamePDListId)) {
        this.setFinishedPowerDialerSession()
      }
    },

    onDialerFormHide () {
      // if (typeof this.$refs.appFooter !== 'undefined') {
      //   this.$refs.appFooter.toggleContacts()
      // }
    },

    onPhoneVisible (value) {
      this.isPhoneVisible = value
      if (typeof this.$refs.dialerForm !== 'undefined') {
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
      const breakTag =
        isXhtml || typeof isXhtml === 'undefined' ? '<br />' : '<br>'
      return (str + '').replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        `$1${breakTag}$2`
      )
    },

    removeBehaviorsRestrictions () {
      window.removeEventListener('keydown', this.removeBehaviorsRestrictions())
      window.removeEventListener(
        'mousedown',
        this.removeBehaviorsRestrictions()
      )
      window.removeEventListener(
        'touchstart',
        this.removeBehaviorsRestrictions()
      )
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
      this.loading = true
      this.setCampaignsIsLoading(true)
      this.setTagsFullyLoaded(true)

      if (['Stats'].includes(this.$route.name)) {
        this.setMetricLoader(true)
      }

      this.initAccount().then(() => {
        this.loading = false
        if (this.profile && this.profile.live_calls === 0 && this.dialer.call) {
          if (!this.profile.go_to_available_after_login) {
            this.$VueEvent.fire(
              'change_agent_status',
              AgentStatus.AGENT_STATUS_OFFLINE
            )
          }
        }

        if (this.profile && this.profile.go_to_available_after_login && !this.dialer.call) {
          this.$VueEvent.fire(
            'change_agent_status',
            AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
          )
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
          } else {
            this.checkAuth(authTry)
          }
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
          } else {
            this.setTagsFullyLoaded(true)
            this.$VueEvent.fire('tags_loaded')
            this.loadingTags = false
            return Promise.resolve()
          }
        })
        .catch((err) => {
          this.setTagsFullyLoaded(false)
          console.log(err)
          this.loadingTags = false
          return Promise.reject()
        })
    },

    getWorkflows () {
      if (this.hasPermissionTo('list workflow')) {
        this.loadingWorkflows = true
        return this.$axios.get('/api/v1/automations/workflows', {
          mode: 'no-cors',
          params: {
            size: 100
          }
        }).then(res => {
          this.loadingWorkflows = false
          res.data.data.forEach((workflow) => {
            this.newWorkflow(workflow)
          })
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
          const availableMetrics = response.data
          const index = { data: null }
          const option = { data: null }
          const key = { data: null }
          const optionGroup = { data: null }
          const categoryLabel = { data: null }
          for (index.data in availableMetrics) {
            optionGroup.data = this.MetricOptionGroups.METRIC_OPTION_GROUPS.find(item => item.name === index.data)
            categoryLabel.data = optionGroup.data ? optionGroup.data.label : this.$options.filters.ucwords(index.data.replace(/_/g, ' '))
            structuredMetricGroups.push({
              disable: true,
              value: null,
              label: categoryLabel.data
            })

            if (availableMetrics[index.data].constructor.name === 'Array') {
              for (option.data of availableMetrics[index.data]) {
                option.data.disable = false
                option.data.categoryLabel = categoryLabel.data
                structuredMetricGroups.push(option.data)
              }
            }

            if (availableMetrics[index.data].constructor.name === 'Object') {
              for (key.data of Object.keys(availableMetrics[index.data])) {
                availableMetrics[index.data][key.data].disable = false
                availableMetrics[index.data][key.data].categoryLabel = categoryLabel.data
                structuredMetricGroups.push(availableMetrics[index.data][key.data])
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
      if (this.authenticated) {
        console.log('Calling phone number: ' + phoneNumber)
        this.call(phoneNumber)
      } else {
        console.log('Rescheduling call to phone number: ' + phoneNumber)
        // reschedule for 1 second from now
        setTimeout(() => {
          this.call(phoneNumber)
        }, 1000)
      }
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
        const title = { data: '' }
        const icon = { data: '' }
        switch (communication.type) {
          case CommunicationTypes.CALL:
            title.data = 'Incoming Call'
            icon.data = 'call'
            break
          case CommunicationTypes.SMS:
            title.data = 'Incoming Text Message'
            icon.data = 'text'
            break
          case CommunicationTypes.FAX:
            title.data = 'Incoming Fax'
            icon.data = 'fax'
            break
        }

        // handling answered calls
        if (
          communication.type === CommunicationTypes.CALL &&
          communication.user_id
        ) {
          title.data = 'Answered Incoming Call'
        }

        // handling answered calls
        if (communication.type === CommunicationTypes.CALL && communication.user_id) {
          title.data = 'Answered Incoming Call'
        }

        const onClickFunction = (res) => {
          window.focus()
          self.closeDesktopNotification(communication.id, 'communication')
          self.decreaseAppBadge()
          self.restoreApp()
          if (communication.type === CommunicationTypes.CALL) {
            if (!this.dialer.call) {
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
          icon: 'notification-icons/' + icon.data + '.png',
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

        window.Push.create(title.data, options).then((data) => {
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

    handleDesktopAppointmentNotification (engagement, contact, timeDiff, unit) {
      const found = this.appointmentNotifiedDesktop.length &&
        this.appointmentNotifiedDesktop.find(item => item.id === engagement.id)
      if (window.Push.Permission.has() && !found) {
        const self = this
        const title = { data: 'Appointment' }
        if (timeDiff !== 0) {
          title.data += ` in ${timeDiff} ${unit}`
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

        window.Push.create(title.data, options).then((data) => {
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
        const title = { data: 'Reminder' }
        if (timeDiff !== 0) {
          title.data += ` in ${timeDiff} ${unit}`
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

        window.Push.create(title.data, options).then((data) => {
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

    getRingGroup (id) {
      if (!id) {
        return null
      }

      const found = this.ringGroups.find(ringGroup => ringGroup.id === id)

      if (found) {
        return found
      }

      return null
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

    beforeUnload () {
      this.$VueEvent.stop('bounce_dock')
      this.$VueEvent.stop('set_badge')
      this.$VueEvent.stop('increase_badge')
      this.$VueEvent.stop('decrease_badge')
      this.$VueEvent.stop('new_in_app_call')
      this.$VueEvent.stop('new_in_app_sms')
      this.$VueEvent.stop('new_in_app_voicemail')
      // this.$VueEvent.stop('new_in_app_fax')
      this.$VueEvent.stop('new_desktop_contact_assigned')
      this.$VueEvent.stop('new_desktop_appointment')
      this.$VueEvent.stop('new_desktop_reminder')
      this.$VueEvent.stop('new_desktop_call')
      this.$VueEvent.stop('answered_desktop_call')
      this.$VueEvent.stop('new_desktop_sms')
      this.$VueEvent.stop('new_desktop_fax')
      this.$VueEvent.stop('new_desktop_voicemail')
      this.$VueEvent.stop('mention')
      this.$VueEvent.stop('update_communication')
      this.$VueEvent.stop('new_version')
      this.unsubscribeFromPusher()
      this.resetVuex(['contacts', 'inbox', 'stats', 'settings', 'non-cache'])
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

    ...mapActions('cache', ['setCurrentCompany']),
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
      'setAccountSuspended'
    ]),
    ...mapActions('contacts', ['resetSearch', 'setShowContactsHeader']),
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check'
    }),
    ...mapActions('stats', ['setAvailableMetrics', 'setMetricGroups', 'setMetricLoader']),
    ...mapActions('inbox', ['setSelectedContact', 'setLiveContacts'])
  },

  watch: {
    '$q.screen.lt.md': function () {
      if (typeof this.$refs.mobilePhone === 'undefined') {
        return
      }

      if (!this.$q.screen.lt.md) {
        this.mobilePhoneDrawer = false
        this.onCloseMobilePhone()
      }
    },
    $route (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'

      if (!(from.name === 'Contacts' && this.$route.name === 'Contact') &&
        !(from.name === 'Contact' && this.$route.name === 'Contacts') &&
        (to.name !== from.name)) {
        if (to.name !== 'Power Dialer' && to.name !== 'Power Dialer Session') {
          this.resetVuex(['contacts', 'non-cache'])
        }
      }

      if (from.name === 'Contacts' && to.name === 'Contacts' && from.params.id !== to.params.id) {
        this.resetSearch()
      }

      if (!(from.name === 'Inbox' && this.$route.name === 'Inbox Contact') &&
        !(from.name === 'Inbox Contact' && this.$route.name === 'Inbox') &&
        (to.name !== from.name)) {
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

      if (to.name === 'Suspended') {
        this.setAccountSuspended(true)
      }

      if (this.accountSuspended && to.name !== 'Suspended') {
        this.setAccountSuspended(false)
      }

      this.resetPowerDialerSession(to)
    },

    authenticated (newVal, oldVal) {
      if (newVal && !oldVal) {
        this.initAuth()
      }

      if (!this.authenticated) {
        this.resetCall()
      }

      if (this.authenticated) {
        this.sidebarVisible = true
      }
    },

    isMobile (val) {
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
            this.$refs.appFooter.updateTab(
              this.dialer.currentStatus && this.dialer.currentStatus !== 'READY' ? 'phone' : null
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

      if (this.isMobile &&
        ['WRAP_UP', 'CALL_CONNECTED'].includes(value)) {
        this.mobilePhoneDrawer = true
        this.isPhoneVisible = true
      }
    }
  }
}
</script>
