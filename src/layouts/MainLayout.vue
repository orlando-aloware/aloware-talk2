<template>
  <div class="h-100"
       :class="[auth.user.authenticated ? 'dashboard' : 'guest',
       light_mode ? 'light-mode' : 'night-mode']">
    <q-layout class="h-100"
              view="lHh Lpr lff"
              v-if="!showUpgradeDialog">
      <q-header class="bg-transparent pl-1 pl-lg-4 ml-lg-1 pt-lg-1 pr-2 pr-lg-2 mr-lg-2"
                v-show="auth && auth.user && auth.user.authenticated && !isWidget && !loading">
        <app-header @toggleSidebar="toggleSidebar"/>
      </q-header>
      <q-drawer
        v-model="sidebar_visibile"
        v-show="sidebar_visibile && auth && auth.user && auth.user.authenticated && !isWidget && !loading"
        :breakpoint="0"
        class="h-100 sidebar-wrapper-sm sidebar-wrapper"
        :width="60"
        content-class="sidebar-wrapper">
        <q-list class="h-100">
          <app-sidebar v-show="auth && auth.user && auth.user.authenticated && !isWidget && !loading"
                       class="sidebar"
                       :light_mode="light_mode"
                       @toggleMode="toggleMode" />
        </q-list>
      </q-drawer>

      <q-page-container class="page-container h-100 pl-1 pl-sm-4 ml-sm-1 pt-sm-1 pr-2 pr-sm-2 mr-sm-2">
        <section class="main-content section h-100">
          <template v-if="!loading"
                    class="h-100">
            <transition :name="transitionName"
                        mode="out-in"
                        @beforeLeave="beforeLeave"
                        @enter="enter"
                        @afterEnter="afterEnter">
              <keep-alive>
                <router-view></router-view>
              </keep-alive>
            </transition>
          </template>
          <div v-else
               class="d-flex justify-content-center align-items-center text-center text-black h-100">
            <div class="container">
              <q-spinner-bars color="success"
                              size="40px"/>
              <div>
                <div v-if="!onlineStatus">
                  <span>Network is <b>offline</b></span>
                </div>
                <div v-else-if="!authCheckStatus">
                  <span>Checking authentication</span>
                  <div class="container"
                       v-if="showRefreshButton">
                    <b-button type="is-link"
                              @click="refreshPage"
                              expanded>
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
        <app-footer v-if="auth && auth.user && auth.user.authenticated && !isWidget && !loading"
                    ref="appFooter">
        </app-footer>
        <dialer v-if="auth.user.authenticated"></dialer>
      </q-page-container>
    </q-layout>
    <q-dialog v-model="showUpgradeDialog"
              transition-show="scale"
              transition-hide="scale"
              persistent>
      <q-card class="bg-red text-white"
              style="width: 300px">
        <q-card-section>
          <div class="text-h6">Oops!</div>
        </q-card-section>

        <q-card-section>
          It looks like that you are using an outdated version of the app, please download and install the new version
          to continue using it.
        </q-card-section>

        <q-card-actions align="right"
                        class="bg-white text-danger">
          <q-btn type="a"
                 label="Visit Website"
                 @click="openApps"
                 flat>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
                 v-close-popup
                 flat>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showUpdateErrorDialog"
              transition-show="scale"
              transition-hide="scale"
              persistent>
      <q-card class="bg-red text-white"
              style="width: 300px">
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
                 v-close-popup
                 flat>
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
</template>

<script>
import auth from '../boot/auth'
import { mapActions, mapState } from 'vuex'
import { aclMixin, communicationMixin, htmlMixin, webrtcMixin } from '../boot/mixins'
import { Platform } from 'quasar'
import broadcast from '../boot/broadcast'
import * as AgentStatus from '../constants/agent-status'
import * as CommunicationTypes from '../constants/communication-types'
import AppHeader from '../components/layout/app-header'
import AppFooter from '../components/layout/app-footer'
import AppSidebar from '../components/layout/app-sidebar'
import Dialer from '../components/dialer'

if (Platform.is.cordova) {
  document.addEventListener('deviceready', () => {
    console.log('device ready')
    window.addEventListener('keyboardDidShow', function () {
      document.activeElement.scrollIntoView()
    })
  }, false)

  document.addEventListener('resume', () => {
    console.log('app resumed')
  }, false)
}

export default {
  name: 'MyLayout',

  components: {
    AppHeader,
    AppFooter,
    AppSidebar,
    Dialer
  },

  mixins: [webrtcMixin, communicationMixin, htmlMixin, aclMixin],
  data () {
    return {
      auth: auth,
      loading: true,
      loadingCampaigns: false,
      loadingUsers: false,
      loadingTags: false,
      loadingDispositionStatuses: false,
      loadingCallDispositionStatuses: false,
      isWidget: false,
      enableAudio: false,
      transitionName: null,
      prevHeight: 0,
      push: null,
      minVersion: null,
      version: null,
      showUpgradeDialog: false,
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
      sidebar_visibile: false,
      light_mode: true,
      CommunicationTypes
    }
  },

  computed: {
    ...mapState(['current_company', 'dialer', 'campaigns'])
  },

  created () {
    console.log('vue created')
    this.resetCall()

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
      window.VueEvent.listen('bounce_dock', () => {
        this.bounceDock()
      })

      // set dock badge
      window.VueEvent.listen('set_badge', (badgeText) => {
        if (badgeText === undefined) {
          return
        }
        this.setBadge(badgeText.toString())
      })

      // increase dock badge
      window.VueEvent.listen('increase_badge', (count) => {
        this.increaseAppBadge(count)
      })

      // decrease dock badge
      window.VueEvent.listen('decrease_badge', (count) => {
        this.decreaseAppBadge(count)
      })

      // new desktop contact assigned notification
      window.VueEvent.listen('new_desktop_contact_assigned', (contact) => {
        if (this.checkContactMatchesUserAccessibility(contact)) {
          this.handleDesktopContactNotification(contact)
        }
      })

      // new desktop appointment notification
      window.VueEvent.listen('new_desktop_appointment', ({ engagement, contact, timeDiff, unit }) => {
        this.handleDesktopAppointmentNotification(engagement, contact, timeDiff, unit)
      })

      // new desktop reminder notification
      window.VueEvent.listen('new_desktop_reminder', ({ engagement, contact, timeDiff, unit }) => {
        this.handleDesktopReminderNotification(engagement, contact, timeDiff, unit)
      })

      // new desktop call notification
      window.VueEvent.listen('new_desktop_call', (communication) => {
        if (this.checkCommunicationMatchesUserAccessibility(communication)) {
          this.handleDesktopCommunicationNotification(communication)
        }
      })

      // answered desktop call notification
      window.VueEvent.listen('answered_desktop_call', (communication) => {
        if (this.checkCommunicationMatchesUserAccessibility(communication)) {
          this.handleDesktopCommunicationNotification(communication)
        }
      })

      // new desktop sms notification
      window.VueEvent.listen('new_desktop_sms', (communication) => {
        if (this.checkCommunicationMatchesUserAccessibility(communication)) {
          this.handleDesktopCommunicationNotification(communication)
        }
      })

      // new desktop fax notification
      window.VueEvent.listen('new_desktop_fax', (communication) => {
        if (this.checkCommunicationMatchesUserAccessibility(communication)) {
          this.handleDesktopCommunicationNotification(communication)
        }
      })

      // new desktop voicemail notification
      window.VueEvent.listen('new_desktop_voicemail', (communication) => {
        if (this.checkCommunicationMatchesUserAccessibility(communication)) {
          this.handleDesktopVoicemailNotification(communication)
        }
      })
    }

    if (this.$q.platform.is.cordova || this.$q.platform.is.electron) {
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

    if (this.$q.platform.is.cordova) {
      window.cordova.getAppVersion.getVersionNumber().then((version) => {
        this.version = version
        localStorage.setItem('version', this.version)
        window.axios.defaults.headers.common['Version'] = this.version
        this.$axios = window.axios
      })

      this.registerPush()
    }

    if (this.auth.user && this.auth.user.authenticated) {
      console.log('authenticated')
      this.initAuth()
    } else {
      this.auth.check().then(() => {
        this.loading = false
        this.authCheckStatus = true
        this.showRefreshButton = false
      }).catch(() => {
        if (this.$route.name !== 'Login') {
          // @todo Go to login page
          this.$router.push({ name: 'Login' }).catch(err => {
            console.log(err)
          })
        }
        this.loading = false
        this.authCheckStatus = false
        setTimeout(() => {
          this.showRefreshButton = true
        }, 10000)
      })
    }
  },

  mounted () {
    if (!window.sessionIntervalId && !this.$q.platform.is.cordova) {
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
      if (!window.Push.Permission.has() && window.Push.Permission.get() !== window.Push.Permission.DENIED) {
        window.Push.Permission.request()
      }
    }

    // event for listening before tab/browser close
    window.addEventListener('beforeunload', this.unsubscribeFromPusher)

    // online / offline
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },

  methods: {
    toggleMode () {
      this.light_mode = !this.light_mode
    },

    toggleSidebar () {
      this.sidebar_visibile = !this.sidebar_visibile
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
      if (!this.onlineStatus) {
        this.loading = true
      } else {
        this.loading = false
      }
    },

    registerPush () {
      this.push = window.PushNotification.init({
        android: {
          senderId: 663210610327,
          icon: 'fcm_push_icon',
          iconColor: '#090A0D'
        },
        ios: {
          sound: true,
          alert: true,
          badge: true
        }
      })
      this.push.on('registration', (data) => {
        localStorage.setItem('registrationId', data.registrationId)
        localStorage.setItem('registrationType', data.registrationType)
      })
      this.push.on('notification', (data) => {
        if (data.additionalData.contact_id && this.$route.name === 'Contact' && parseInt(this.$route.params.contactId) === parseInt(data.additionalData.contact_id)) {
          return
        }
        this.increaseAppBadge()
        // Will be true if the notification was received while the app was in the foreground
        if (data.additionalData.foreground) {
          if (this.auth.user.authenticated) {
            this.decreaseAppBadge()
            const dismiss = this.$q.notify({
              timeout: 5000,
              message: '<div class="no-select"><small><b>' + data.title + '</b></small>' + '<p class="has-margin-top-5">' + this.nl2br(data.message) + '</p></div>',
              html: true,
              actions: [
                {
                  label: 'Check',
                  color: 'link',
                  handler: () => {
                    dismiss()
                    if (data.additionalData.contact_id) {
                      // @todo Go to contact page
                      /*
                      this.$router.push({
                        name: 'Contact',
                        params: {
                          contactId: data.additionalData.contact_id
                        }
                      }).catch(err => {
                        console.log(err)
                      })
                       */
                    }

                    if (data.additionalData.custom_link) {
                      window.open(data.additionalData.custom_link, '_system')
                    }
                  }
                },
                {
                  label: 'Dismiss',
                  color: 'greyish',
                  handler: () => {
                    dismiss()
                  }
                }
              ],
              onDismiss: () => {

              }
            })
          }
        } else if (data.additionalData.coldstart) { // Will be true if the application is started by clicking on the push notification, false if the app is already started.
          if (this.auth.user.authenticated) {
            this.decreaseAppBadge()
            if (data.additionalData.contact_id) {
              // @todo Go to contact page
              /*
              this.$router.push({
                name: 'Contact',
                params: {
                  contactId: data.additionalData.contact_id
                }
              }).catch(err => {
                console.log(err)
              })
               */
            }

            if (data.additionalData.custom_link) {
              window.open(data.additionalData.custom_link, '_system')
            }
          }
        } else if (data.additionalData.dismissed) { // Is set to true if the notification was dismissed by the user
          // @todo
        } else {
          if (this.auth.user.authenticated) {
            this.decreaseAppBadge()
            if (data.additionalData.contact_id) {
              // @todo Go to contact page
              /*
              this.$router.push({
                name: 'Contact',
                params: {
                  contactId: data.additionalData.contact_id
                }
              }).catch(err => {
                console.log(err)
              })
               */
            }

            if (data.additionalData.custom_link) {
              window.open(data.additionalData.custom_link, '_system')
            }
          }
        }
      })
      this.push.on('error', (err) => {
        console.log(err)
      })
    },

    call (phoneNumber) {
      if (this.auth && this.auth.user && this.auth.user.authenticated && !this.dialer.call) {
        // @todo Go to dial page
        /*
        this.$router.push({ name: 'Dial', query: { phone_number: phoneNumber } }).catch(err => {
          console.log(err)
        })
         */
      }
    },

    unsubscribeFromPusher () {
      if (this.auth.user.authenticated) {
        // just leave the channels
        broadcast.leave()
      }
    },

    resetCall () {
      if (!this.auth.user.authenticated) {
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
      let breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>'
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')
    },

    beforeLeave (element) {
      this.prevHeight = getComputedStyle(element).height
    },

    enter (element) {
      const { height } = getComputedStyle(element)

      element.style.height = this.prevHeight

      setTimeout(() => {
        element.style.height = height
      })
    },

    afterEnter (element) {
      element.style.height = 'auto'
    },

    removeBehaviorsRestrictions () {
      window.removeEventListener('keydown', this.removeBehaviorsRestrictions())
      window.removeEventListener('mousedown', this.removeBehaviorsRestrictions())
      window.removeEventListener('touchstart', this.removeBehaviorsRestrictions())
      this.enableAudio = true
    },

    mediaPlaybackRequiresUserGesture () {
      // test if play() is ignored when not called from an input event handler
      let audio = document.createElement('audio')
      let promise = audio.play()
      if (promise !== undefined) {
        promise.catch(() => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          return true
        }).then(() => {
          // Auto-play started
          return audio.paused
        })
      }
    },

    initAuth () {
      this.loading = true
      this.initAccount(this.auth.user).then(() => {
        this.loading = false
        if (this.$q.platform.is.cordova) {
          if (this.$q.platform.is.android) {
            if (this.minVersion && this.version && this.compareVersion(this.version, this.minVersion.androidVersion) < 0) {
              this.showUpgradeDialog = true
            }
          }

          if (this.$q.platform.is.ios) {
            if (this.minVersion && this.version && this.compareVersion(this.version, this.minVersion.iosVersion) < 0) {
              this.showUpgradeDialog = true
            }
          }
        }

        if (this.auth.user.profile.live_calls === 0 && this.dialer.call) {
          if (!this.auth.user.profile.go_to_available_after_login) {
            this.$VueEvent.fire('change_agent_status', AgentStatus.AGENT_STATUS_OFFLINE)
          }
        }

        if (this.auth.user.profile.go_to_available_after_login && !this.dialer.call) {
          this.$VueEvent.fire('change_agent_status', AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)
        }

        broadcast.init()
      })
    },

    checkAuth (authTry = 1) {
      if (this.auth.user.profile !== null) {
        this.auth.check(true).then(() => {
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
      this.auth.user.authenticated = false
      this.auth.user.profile = null
      window.location.href = '/login'
    },

    getCampaign (id) {
      if (!id) {
        return null
      }
      let found = this.campaigns.find(campaign => campaign.id === id)
      if (found) {
        return found
      }

      return null
    },

    // refresh the current_company state
    getCurrentCompany () {
      return this.$axios.get('/api/v1/company/' + this.current_company.id, {
        mode: 'no-cors'
      }).then(res => {
        this.setCurrentCompany(res.data)
        return Promise.resolve()
      }).catch(err => {
        console.log(err)
        return Promise.reject()
      })
    },

    getCampaigns () {
      if (this.hasPermissionTo('list campaign')) {
        this.loadingCampaigns = true
        return this.$axios.get('/api/v1/campaign', {
          mode: 'no-cors'
        }).then(res => {
          this.setCampaigns(res.data)
          this.loadingCampaigns = false
          return Promise.resolve()
        }).catch(err => {
          console.log(err)
          this.loadingCampaigns = false
          return Promise.reject()
        })
      }
    },

    getUsers () {
      if (this.hasPermissionTo('list user')) {
        this.loading_users = true
        return this.$axios.get('/api/v1/user', {
          mode: 'no-cors'
        }).then(res => {
          this.setUsers(res.data)
          this.loadingUsers = false
        }).catch(err => {
          console.log(err)
          this.loadingUsers = false
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
      return this.$axios.get('/api/v1/tag', { params }).then(res => {
        if (res.data.data && res.data.data.length) {
          res.data.data.forEach((tag) => {
            this.newTag(tag)
          })
        }
        if (res.data.to !== res.data.total) {
          this.getTags(page + 1)
        } else {
          window.VueEvent.fire('tags_loaded')
          this.loadingTags = false
          return Promise.resolve()
        }
      }).catch(err => {
        console.log(err)
        this.loadingTags = false
        return Promise.reject()
      })
    },

    getDispositionStatuses () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingDispositionStatuses = true
        return this.$axios.get('/api/v1/disposition-status')
          .then(res => {
            this.setDispositionStatuses(res.data)
            this.loadingDispositionStatuses = false
            return Promise.resolve()
          })
          .catch(err => {
            console.log(err)
            this.loadingDispositionStatuses = false
            return Promise.reject()
          })
      }
    },

    getCallDispositions () {
      if (this.hasPermissionTo('list disposition status')) {
        this.loadingCallDispositionStatuses = true
        return this.$axios.get('/api/v1/call-disposition')
          .then(res => {
            this.setCallDispositions(res.data)
            this.loadingCallDispositionStatuses = false
          })
          .catch(err => {
            console.log(err)
            this.loadingCallDispositionStatuses = false
          })
      }
    },

    getMinVersion () {
      return this.$axios.get('/get-min-version').then(res => {
        this.minVersion = res.data.version
      }).catch(err => {
        console.log(err)
      })
    },

    compareVersion (v1, v2) {
      if (typeof v1 !== 'string') return false
      if (typeof v2 !== 'string') return false
      v1 = v1.split('.')
      v2 = v2.split('.')
      const k = Math.min(v1.length, v2.length)
      for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10)
        v2[i] = parseInt(v2[i], 10)
        if (v1[i] > v2[i]) return 1
        if (v1[i] < v2[i]) return -1
      }
      return v1.length === v2.length ? 0 : (v1.length < v2.length ? -1 : 1)
    },

    async initAccount (user) {
      if (user.profile) {
        this.$Sentry.configureScope((scope) => {
          scope.setTag('id', user.profile.id)
          scope.setTag('name', user.profile.name)
          scope.setTag('company_name', user.profile.company_name)
          scope.setTag('version', localStorage.getItem('version'))
        })
        if (user.profile.company_id) {
          this.$Sentry.configureScope((scope) => {
            scope.setTag('company_id', user.profile.company_id)
          })
        }
        let getCurrentCompany = this.getCurrentCompany()
        let getCampaigns = this.getCampaigns()
        let getUsers = this.getUsers()
        let getTags = this.getTags()
        let getDispositionStatuses = this.getDispositionStatuses()
        let getCallDispositions = this.getCallDispositions()
        let getMinVersion = this.getMinVersion()
        await Promise.all([getCurrentCompany, getCampaigns, getUsers, getTags, getDispositionStatuses, getCallDispositions, getMinVersion])
      }
    },

    openApps () {
      if (this.$q.platform.is.android) {
        window.open('https://play.google.com/store/apps/details?id=com.aloware.talk', '_system')
      } else if (this.$q.platform.is.ios) {
        window.open('https://apps.apple.com/us/app/aloware-talk-business-phone/id1479253481', '_system')
      } else {
        window.open('https://aloware.com/apps', '_system')
      }
      return false
    },

    sendCall (phoneNumber) {
      if (!phoneNumber) {
        return
      }
      if (this.auth.user.authenticated) {
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
      if (window.Push.Permission.has() && !this.communicationNotifiedDesktop.includes(communication.id)) {
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
        if (communication.type === CommunicationTypes.CALL && communication.user_id) {
          title = 'Answered Incoming Call'
        }

        const onClickFunction = function (res) {
          window.focus()
          this.close()
          self.decreaseAppBadge()
          self.restoreApp()
          if (communication.type === CommunicationTypes.CALL) {
            if (!this.dialer.call) {
              self.$router.push({
                name: 'Communication',
                params: {
                  communicationObj: communication,
                  communicationId: communication.id
                }
              }).catch(err => {
                console.log(err)
              })
            }
          }
          if (communication.type === CommunicationTypes.SMS) {
            self.$router.push({
              name: 'Contact',
              params: {
                contactId: communication.contact_id
              }
            }).catch(err => {
              console.log(err)
            })
          }
          if (communication.type === CommunicationTypes.FAX) {
            self.$router.push({
              name: 'Contact',
              params: {
                contactId: communication.contact_id
              }
            }).catch(err => {
              console.log(err)
            })
          }
        }

        let lineName = this.getCampaign(communication.campaign_id).name
        const options = {
          icon: 'notification-icons/' + icon + '.png',
          body: `From: ${this.$options.filters.fixName(this.sanitizeText(communication.contact.name))} ${this.$options.filters.fixPhone(communication.contact.phone_number)} on ${lineName} line.`,
          tag: 'communication-notification-' + communication.id,
          requireInteraction: (communication.type !== CommunicationTypes.CALL),
          timeout: (communication.type === CommunicationTypes.CALL) ? 60000 : 30000,
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
      if (window.Push.Permission.has() && !this.voicemailNotifiedDesktop.includes(communication.id)) {
        this.voicemailNotifiedDesktop.push(communication.id)
        let self = this
        const title = 'New Voicemail'
        const onClickFunction = function (res) {
          window.focus()
          this.close()
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router.push({
            name: 'Communication',
            params: {
              communicationObj: communication,
              communicationId: communication.id
            }
          }).catch(err => {
            console.log(err)
          })
        }
        let lineName = this.getCampaign(communication.campaign_id).name
        const options = {
          icon: 'notification-icons/voicemail.png',
          body: `From: ${this.$options.filters.fixName(this.sanitizeText(communication.contact.name))} ${this.$options.filters.fixPhone(communication.contact.phone_number)} on ${lineName} line.`,
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
      if (window.Push.Permission.has() && !this.contactNotifiedDesktop.includes(contact.id)) {
        this.contactNotifiedDesktop.push(contact.id)
        let self = this
        const title = 'You have been assigned to a contact.'
        const onClickFunction = function (res) {
          window.focus()
          this.close()
          self.decreaseAppBadge()
          self.restoreApp()
          self.$router.push({
            name: 'Contact',
            params: {
              contactObj: contact,
              contactId: contact.id
            }
          }).catch(err => {
            console.log(err)
          })
        }
        const options = {
          icon: 'notification-icons/contact.png',
          body: `Name: ${this.$options.filters.fixName(this.sanitizeText(contact.name))} Phone number: ${this.$options.filters.fixPhone(contact.phone_number)}.`,
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
      if (window.Push.Permission.has() && !this.appointmentNotifiedDesktop.includes(engagement.id)) {
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
          self.$router.push({
            name: 'Contact',
            params: {
              contactObj: contact,
              contactId: contact.id
            },
            query: {
              activityType: engagement.type
            }
          }).catch(err => {
            console.log(err)
          })
        }
        const options = {
          icon: 'notification-icons/appointment.png',
          body: engagement.body + '\n\r' + `Name: ${this.$options.filters.fixName(this.sanitizeText(contact.name))} Phone number: ${this.$options.filters.fixPhone(contact.phone_number)}.`,
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
      if (window.Push.Permission.has() && !this.reminderNotifiedDesktop.includes(engagement.id)) {
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
          self.$router.push({
            name: 'Contact',
            params: {
              contactObj: contact,
              contactId: contact.id
            },
            query: {
              activityType: engagement.type
            }
          }).catch(err => {
            console.log(err)
          })
        }
        const options = {
          icon: 'notification-icons/reminder.png',
          body: engagement.body + '\n\r' + `Name: ${this.$options.filters.fixName(this.sanitizeText(contact.name))} Phone number: ${this.$options.filters.fixPhone(contact.phone_number)}.`,
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
      let deviceInfo = null
      const isMobile = this.$q.platform.is.cordova
      if (isMobile) {
        deviceInfo = {
          registration_id: localStorage.getItem('registrationId'),
          registration_type: localStorage.getItem('registrationType'),
          model: window.device.model,
          platform: window.device.platform,
          is_virtual: window.device.isVirtual,
          uuid: window.device.uuid,
          version: window.device.version,
          manufacturer: window.device.manufacturer,
          serial: window.device.serial,
          app_version: localStorage.getItem('version')
        }
      }
      this.auth.logout(deviceInfo).then(res => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },

    ...mapActions([
      'setCurrentCompany',
      'setCampaigns',
      'setUsers',
      'newTag',
      'setDispositionStatuses',
      'setCallDispositions',
      'setDialerToken',
      'setDialerCall',
      'setDialerCommunication',
      'setDialerDeal',
      'setDialerContact',
      'setDialerCurrentNumber',
      'setDialerIsMuted'
    ])
  },

  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    },

    'auth.user.authenticated' (newVal, oldVal) {
      if (newVal && !oldVal) {
        this.initAuth()
      }

      if (!this.auth.user.authenticated) {
        this.resetCall()
      }
    }
  }
}
</script>
