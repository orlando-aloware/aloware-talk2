<template>
  <div class="h-100"
       :class="[
          authenticated ? `dashboard ${pageClass}` : 'guest',
          lightMode ? 'light-mode' : 'night-mode'
        ]"
       v-if="(!this.isGuest && authenticated || this.isGuest && !authenticated)">
    <div class="unsupported h-100 w-100 d-flex align-items-center justify-content-center text-center">
      <span>This screen size is not supported.</span>
    </div>
    <div class="page h-100">
      <q-layout class="page-layout h-100"
                view="lHh Lpr lff"
                :height="'100%'">
        <div class="h-100"
             :class="[ sidebarVisible ? 'sidebar-active' : '']">
          <q-header class="page-header bg-white text-black no-box-shadow"
                    v-if="authenticated && !isWidget && !loading">
            <app-header @toggleSidebar="toggleSidebar"/>
          </q-header>
          <q-page-container class="page-container h-100">
            <section class="main-content section h-100">
              <template v-if="!loading">
                <transition :name="transitionName"
                            mode="out-in">
                  <keep-alive>
                    <router-view></router-view>
                  </keep-alive>
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
            <dialer v-if="authenticated"></dialer>
          </q-page-container>
        </div>
        <q-drawer v-model="sidebarVisible"
                  v-if="authenticated"
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
        <app-footer class="page-footer row d-block w-100 m-0 px-1"
                    ref="appFooter"
                    v-if="authenticated && !isWidget && !loading">
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
import { aclMixin, communicationMixin, htmlMixin, webrtcMixin } from '../boot/mixins'
import broadcast from '../boot/broadcast'
import AppHeader from '../components/layout/app-header'
import AppFooter from '../components/layout/app-footer'
import AppSidebar from '../components/layout/app-sidebar'
import Dialer from '../components/dialer/dialer'
import * as AgentStatus from '../constants/agent-status'
import * as CommunicationTypes from '../constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as MetricOptionGroups from 'src/constants/metric-option-groups'
import _ from 'lodash'

export default {
  name: 'MyLayout',

  components: {
    AppHeader,
    AppFooter,
    AppSidebar,
    Dialer
  },

  mixins: [webrtcMixin, htmlMixin, aclMixin, communicationMixin],
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
      enableAudio: false,
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
      communicationNotifiedDesktop: [],
      voicemailNotifiedDesktop: [],
      contactNotifiedDesktop: [],
      appointmentNotifiedDesktop: [],
      reminderNotifiedDesktop: [],
      sidebarVisible: false,
      lightMode: true,
      CommunicationTypes,
      MetricOptionGroups
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer', 'campaigns']),
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState('stats', ['availableMetrics']),
    isGuest () {
      return _.get(this.$route.meta, 'isGuest', false)
    },
    pageClass () {
      let pageSlug = _.get(this.$route.meta, 'title', this.$route.name).toLowerCase()
      return pageSlug.replace(/ /g, '_') + '-page'
    }
  },

  created () {
    this.resetCall()
    this.resetNotifications()

    // Quasar global config
    this.$q.iconSet.arrow.dropdown = 'o_expand_more'

    window.handleOpenURL = (url) => {
      let action = url.replace(/(^\w+:|^)\/\//, '')

      if (url.indexOf('callto:') > -1) {
        let phoneNumber = url.replace('callto:', '')
        return this.sendCall(phoneNumber)
      }

      if (url.indexOf('tel:') > -1) {
        let phoneNumber = url.replace('tel:', '')
        return this.sendCall(phoneNumber)
      }

      if (action.indexOf('call:') > -1) {
        let phoneNumber = action.replace('call:', '')
        return this.sendCall(phoneNumber)
      }

      if (action.indexOf('hs:') > -1) {
        let phoneNumber = action
        this.setHubSpotDeal(phoneNumber)
        return this.sendCall(phoneNumber)
      }
    }

    if (this.$q.platform.is.electron) {
      this.$q.electron.ipcRenderer.send('app_version')

      this.$q.electron.ipcRenderer.on('open-url', (event, data) => {
        let action = data.replace(/(^\w+:|^)\/\//, '')

        if (data.indexOf('callto:') > -1) {
          let phoneNumber = data.replace('callto:', '')
          return this.sendCall(phoneNumber)
        }

        if (data.indexOf('tel:') > -1) {
          let phoneNumber = data.replace('tel:', '')
          return this.sendCall(phoneNumber)
        }

        if (action.indexOf('call:') > -1) {
          let phoneNumber = action.replace('call:', '')
          return this.sendCall(phoneNumber)
        }

        if (action.indexOf('hs:') > -1) {
          let phoneNumber = action
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
        localStorage.setItem('version', this.version)
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
        // this.handleDesktopCommunicationNotification(communication)
        const firstAttachment = _.get(communication.attachments, '0.url', null)
        this.$actionNotification(communication.contact.phone_number, communication.body, null, firstAttachment, 'sms', communication.contact.id, communication.id)
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
        this.$actionNotification(communication.contact.name, 'Missed Call with Voicemail', 'call-voicemail-icon', null, 'call', communication.contact.id, communication.id)
        // this.handleDesktopVoicemailNotification(communication)
      }
    })

    // user mention notification
    this.$VueEvent.listen('mention', (data) => {
      const name = _.get(data, 'mentioner_user.name', '')
      const contactId = _.get(data, 'contact_id', null)
      const communicationId = _.get(data, 'mention_subject_id', null)
      const message = _.get(data, 'preview_text', '')
      this.$actionNotification(name, message, null, null, 'mention', contactId, communicationId)
    })

    // missed call notification
    this.$VueEvent.listen('update_communication', (communication) => {
      if (this.checkCommunicationMatchesUserAccessibility(communication) && communication.type === CommunicationTypes.CALL && communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
        this.$actionNotification(communication.contact.name, 'Missed Call', null, null, 'call', communication.contact.id, communication.id)
      }
    })

    this.$VueEvent.listen('new_version', () => {
      if (this.isWidget) {
        return
      }

      this.$actionNotification('System Updates', 'Refresh your screen', null, null, 'system')
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
    } else {
      this.check().then(() => {
        this.loading = false
        this.authCheckStatus = true
        this.showRefreshButton = false
      }).catch(() => {
        if (!this.isGuest) {
          let route = {
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
      this.enableAudio = true
    }

    if (this.$q.platform.is.electron) {
      console.log('Push permission: ' + window.Push.Permission.get())
      if (
        !window.Push.Permission.has() &&
        window.Push.Permission.get() !== window.Push.Permission.DENIED
      ) {
        window.Push.Permission.request()
      }
    }

    // event for listening before tab/browser close

    window.addEventListener('beforeunload', this.beforeUnload)

    // online / offline
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },

  methods: {
    toggleMode () {
      this.lightMode = !this.lightMode
    },

    toggleSidebar () {
      this.sidebarVisible = !this.sidebarVisible
    },

    setHubSpotDeal (phoneNumber) {
      let link = phoneNumber.replace('hs:', '').replace('deal=', '')
      let parts = link.split('?')
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
        // @todo Go to dial page
        /*
        this.$router.push({ name: 'Dial', query: { phone_number: phoneNumber } }).catch(err => {
          console.log(err)
        })
         */
      }
    },

    unsubscribeFromPusher () {
      if (this.authenticated) {
        // just leave the channels
        broadcast.leave()
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
    },

    nl2br (str, isXhtml) {
      if (typeof str === 'undefined' || str === null) {
        return ''
      }
      let breakTag =
        isXhtml || typeof isXhtml === 'undefined' ? '<br />' : '<br>'
      return (str + '').replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        '$1' + breakTag + '$2'
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
      this.enableAudio = true
    },

    mediaPlaybackRequiresUserGesture () {
      // test if play() is ignored when not called from an input event handler
      let audio = document.createElement('audio')
      let promise = audio.play()
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
      this.initAccount().then(() => {
        this.loading = false
        if (this.profile.live_calls === 0 && this.dialer.call) {
          if (!this.profile.go_to_available_after_login) {
            this.$VueEvent.fire(
              'change_agent_status',
              AgentStatus.AGENT_STATUS_OFFLINE
            )
          }
        }

        if (this.profile.go_to_available_after_login && !this.dialer.call) {
          this.$VueEvent.fire(
            'change_agent_status',
            AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
          )
        }

        broadcast.init()
      }).finally(() => {
        this.getRingGroups()
        this.getBroadcasts()
        this.getTemplates()

        if (['Stats'].includes(this.$route.name)) {
          this.getAvailableMetrics()
          this.getMetricGroups()
        }

        this.getCampaigns()
        this.getTags()
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
            this.loading = true
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
      let found = this.campaigns.find((campaign) => campaign.id === id)
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
            mode: 'no-cors'
          })
          .then((res) => {
            this.setCampaigns(res.data)
            this.loadingCampaigns = false
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
        this.loading_users = true
        return this.$axios
          .get('/api/v1/user', {
            mode: 'no-cors'
          })
          .then((res) => {
            this.setUsers(res.data)
            this.loadingUsers = false
            return Promise.resolve()
          })
          .catch((err) => {
            console.log(err)
            this.loadingUsers = false
            return Promise.reject()
          })
      }
    },

    getTags (page = 1) {
      if (page === 1) {
        this.loadingTags = true
      }
      let params = {
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

          let structuredMetricGroups = []
          const availableMetrics = response.data
          for (let index in availableMetrics) {
            const optionGroup = this.MetricOptionGroups.METRIC_OPTION_GROUPS.find(optionGroup => optionGroup.name === index)
            const categoryLabel = optionGroup ? optionGroup.label : this.$options.filters.ucwords(index.replace(/_/g, ' '))
            structuredMetricGroups.push({
              disable: true,
              value: null,
              label: categoryLabel
            })

            if (availableMetrics[index].constructor.name === 'Array') {
              for (let option of availableMetrics[index]) {
                option.disable = false
                option.categoryLabel = categoryLabel
                structuredMetricGroups.push(option)
              }
            }

            if (availableMetrics[index].constructor.name === 'Object') {
              for (let key of Object.keys(availableMetrics[index])) {
                availableMetrics[index][key].disable = false
                availableMetrics[index][key].categoryLabel = categoryLabel
                structuredMetricGroups.push(availableMetrics[index][key])
              }
            }
          }
          this.setAvailableMetrics(structuredMetricGroups)
          return Promise.resolve()
        })
        .catch((err) => {
          console.error(err)
          this.loadingAvailableMetrics = false
          return Promise.reject()
        })
    },

    getMetricGroups: function () {
      if (!this.profile) {
        return
      }

      this.loadingMetricGroups = true
      return this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.loadingMetricGroups = false
          this.setMetricGroups(response.data)
          return Promise.resolve()
        })
        .catch((err) => {
          console.error(err)
          this.loadingMetricGroups = false
          return Promise.reject()
        })
    },

    async initAccount () {
      if (this.profile) {
        this.$Sentry.configureScope((scope) => {
          scope.setTag('id', this.profile.id)
          scope.setTag('name', this.profile.name)
          scope.setTag('company_name', this.profile.company_name)
          scope.setTag('version', localStorage.getItem('version'))
        })
        if (this.profile.company_id) {
          this.$Sentry.configureScope((scope) => {
            scope.setTag('company_id', this.profile.company_id)
          })
        }
        let getCurrentCompany = this.getCurrentCompany()
        let getUsers = this.getUsers()

        await Promise.all([
          getCurrentCompany,
          getUsers
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
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('set_badge', text)
      }
    },

    bounceDock () {
      if (this.$q.platform.is.electron) {
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
      if (
        window.Push.Permission.has() &&
        !this.communicationNotifiedDesktop.includes(communication.id)
      ) {
        this.communicationNotifiedDesktop.push(communication.id)
        let self = this
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
        if (
          communication.type === CommunicationTypes.CALL &&
          communication.user_id
        ) {
          title = 'Answered Incoming Call'
        }

        const onClickFunction = function (res) {
          window.focus()
          this.close()
          self.decreaseAppBadge()
          self.restoreApp()
          if (communication.type === CommunicationTypes.CALL) {
            if (!this.dialer.call) {
              self.$router
                .push({
                  name: 'Communication',
                  params: {
                    communicationObj: communication,
                    communicationId: communication.id
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

        let lineName = this.getCampaign(communication.campaign_id).name
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
          onError: function (err) {
            console.log(err)
          }
        }
        window.Push.create(title, options)
        if (communication.type !== CommunicationTypes.CALL) {
          this.bounceDock()
          this.increaseAppBadge()
        }
      }
    },

    handleDesktopVoicemailNotification (communication) {
      if (
        window.Push.Permission.has() &&
        !this.voicemailNotifiedDesktop.includes(communication.id)
      ) {
        this.voicemailNotifiedDesktop.push(communication.id)
        let self = this
        const title = 'New Voicemail'
        const onClickFunction = function (res) {
          window.focus()
          this.close()
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router
            .push({
              name: 'Communication',
              params: {
                communicationObj: communication,
                communicationId: communication.id
              }
            })
            .catch((err) => {
              console.log(err)
            })
        }
        let lineName = this.getCampaign(communication.campaign_id).name
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
          onError: function (err) {
            console.log(err)
          }
        }
        window.Push.create(title, options)
        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopContactNotification (contact) {
      if (
        window.Push.Permission.has() &&
        !this.contactNotifiedDesktop.includes(contact.id)
      ) {
        this.contactNotifiedDesktop.push(contact.id)
        let self = this
        const title = 'You have been assigned to a contact.'
        const onClickFunction = function (res) {
          window.focus()
          this.close()
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
          onError: function (err) {
            console.log(err)
          }
        }
        window.Push.create(title, options)
        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopAppointmentNotification (engagement, contact, timeDiff, unit) {
      if (
        window.Push.Permission.has() &&
        !this.appointmentNotifiedDesktop.includes(engagement.id)
      ) {
        this.appointmentNotifiedDesktop.push(engagement.id)
        let self = this
        let title = 'Appointment'
        if (timeDiff !== 0) {
          title += ` in ${timeDiff} ${unit}`
        }
        const onClickFunction = function (res) {
          window.focus()
          this.close()
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
          onError: function (err) {
            console.log(err)
          }
        }
        window.Push.create(title, options)
        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    handleDesktopReminderNotification (engagement, contact, timeDiff, unit) {
      if (
        window.Push.Permission.has() &&
        !this.reminderNotifiedDesktop.includes(engagement.id)
      ) {
        this.reminderNotifiedDesktop.push(engagement.id)
        let self = this
        let title = 'Reminder'
        if (timeDiff !== 0) {
          title += ` in ${timeDiff} ${unit}`
        }
        const onClickFunction = function (res) {
          window.focus()
          this.close()
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
          onError: function (err) {
            console.log(err)
          }
        }
        window.Push.create(title, options)
        this.bounceDock()
        this.increaseAppBadge()
      }
    },

    refreshPage () {
      window.location.reload()
    },

    increaseAppBadge (count = 1) {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('increase_badge', count)
      }
    },

    decreaseAppBadge (count = 1) {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('decrease_badge', count)
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

    beforeUnload () {
      this.unsubscribeFromPusher()
      this.resetContactsVuex()
      this.resetInboxVuex()
      this.resetNotifications()
    },

    ...mapActions([
      'setCurrentCompany',
      'setCampaigns',
      'setRingGroups',
      'setUsers',
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
      'setFilters',
      'setTagsFullyLoaded',
      'resetNotifications'
    ]),
    ...mapActions('contacts', ['resetContactsVuex', 'resetSearch']),
    ...mapActions('inbox', ['resetInboxVuex']),
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check'
    }),
    ...mapActions('stats', ['setAvailableMetrics', 'setMetricGroups'])
  },

  watch: {
    $route (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'

      if (!(from.name === 'Contacts' && this.$route.name === 'Contact') &&
        !(from.name === 'Contact' && this.$route.name === 'Contacts') &&
        (to.name !== from.name)) {
        this.resetContactsVuex()
      }

      if (from.name === 'Contacts' && to.name === 'Contacts' && from.params.id !== to.params.id) {
        this.resetSearch()
      }

      if (!(from.name === 'Inbox' && this.$route.name === 'Inbox Contact') &&
        !(from.name === 'Inbox Contact' && this.$route.name === 'Inbox') &&
        (to.name !== from.name)) {
        this.resetInboxVuex()
      }
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
    }
  }
}
</script>
