import { mapFields } from 'vuex-map-fields'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import moment from 'moment-timezone'
import { cloneDeep, debounce, get, isEmpty } from 'lodash'
import * as AgentStatus from '../../constants/agent-status'
import * as OutboundCallRecordingModes from 'src/constants/outbound-call-recording-modes'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationStatus from 'src/constants/communication-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'

const DIRECTION = {
  top: 1,
  bottom: 2
}

export default {
  data () {
    return {
      prevRoute: null,
      shouldRedirect: false,
      skippedTasks: [],
      countdownInterval: null,
      callInProgress: false,
      countdownStarted: false,
      wrapUp: false,
      reRouteModal: false,
      loadingNext: false,
      sessionNotReady: false,
      skipWrapUp: false,
      verifyAgentOnCall: false,
      redirectNotification: false,
      hangUpInterval: null,
      hangUpIntervalCounter: 0,
      loadingHold: false,
      loadingUnhold: false,
      isRedialClicked: false,
      isProcessingDNC: false,
      redialedTask: {}
    }
  },

  computed: {
    ...mapState('powerDialer', [
      'powerDialerTasks',
      'inQueueFetchTasks',
      'redialed'
    ]),

    ...mapState([
      'dialer',
      'campaigns'
    ]),

    ...mapFields([
      'sessionPhoneExpansion'
    ]),

    ...mapFields('powerDialer', [
      'sessionCallStatuses',
      'sessionPaused',
      'activeTask',
      'hubspot',
      'ongoingSession',
      'countdownTimer',
      'isSessionRunning',
      'taskToCall',
      'hasActiveTask'
    ]),

    ...mapGetters('powerDialer', [
      'sessionLoader',
      'sessionSettings'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'contact',
      'listItems',
      'selectedList'
    ]),

    status () {
      return AutoDialTaskStatus.STATUSES
    },

    statusDisplayText () {
      if (!this.dialer.isReady) {
        return 'Offline'
      }

      switch (this.dialer?.currentStatus) {
        case 'READY':
          // reset call in-progress flag
          this.callInProgress = false

          if (this.timerIsOver || !this.isSessionRunning || this.reRouteModal) {
            return 'Ready'
          }

          if (this.wrapUp) {
            return `Wrap up <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer >= 0 ? this.countdownTimer : 0}s</span>`
          }

          if (this.sessionPaused) {
            return 'Up Next'
          }

          if (this.countdownTimer > 0) {
            return `Will call in <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer > 0 ? this.countdownTimer : 0}s</span>`
          }

          if (this.toggleEnd || this.togglePause) {
            return 'Ready'
          }

          return `Dialing...`
        case 'WRAP_UP':
          return `Wrap Up <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer >= 0 ? this.countdownTimer : 0}s</span>`
        case 'MAKING_CALL':
          return `Dialing...`
        case 'ANSWERING_CALL':
          return 'Answering Call'
        case 'REJECTING_CALL':
          return 'Rejecting Call'
        case 'CALL_CONNECTED':
          return `Connected <span class="text-weight-bold text-grey-7 text-lowercase">${this.dialer.timer}</span>`
        case 'HANGING_UP_CALL':
          return 'Hanging Up Call'
        case 'CALL_DISCONNECTED':
          return 'Call Disconnected'
        case 'OFFLINE':
        default:
          return 'Offline'
      }
    },

    moveDirection () {
      return DIRECTION
    },

    shouldSkip () {
      return this.sessionSettings.skip_outside_daytime_hours === 1
    },

    togglePause: {
      get () {
        return this.sessionCallStatuses.pause
      },
      set (val) {
        this.sessionCallStatuses.pause = val
      }
    },

    toggleEnd: {
      get () {
        return this.sessionCallStatuses.end
      },
      set (val) {
        this.sessionCallStatuses.end = val
      }
    },

    muteText () {
      return this.toggleMute ? 'Unmute' : 'Mute'
    },

    timerIsOver () {
      return this.countdownTimer === -1
    },

    powerDialerSettings () {
      const settings = this.profile.company.power_dialer_settings

      if (settings !== null && settings.open_time && settings.close_time) {
        return settings
      }

      return {
        open_time: '09:00:00',
        close_time: '18:00:00'
      }
    },

    fullName () {
      const isEmptyFirstName = this.taskToCall?.first_name === null ||
        this.taskToCall?.first_name === ''
      const isEmptyLastName = this.taskToCall?.last_name === null ||
        this.taskToCall?.last_name === ''

      if (isEmptyFirstName && isEmptyLastName) {
        return `No Name`
      }

      const firstName = this.taskToCall?.first_name || ''
      const lastName = this.taskToCall?.last_name || ''

      return `${firstName} ${lastName}`
    },

    phoneNumber () {
      return this.taskToCall?.phone_number
    },
    forcedWrapUpAccount () {
      return this.profile.company.force_wrap_up
    },

    wrapUpSeconds () {
      if (this.forcedWrapUpAccount) {
        return this.profile.company.wrap_up_seconds
      }

      return this.profile.wrap_up_seconds
    },

    currentSessionStatus () {
      return this.dialer?.currentStatus || ''
    },

    address () {
      if (isEmpty(this.taskToCall)) {
        return 'N/A'
      }

      if (this.taskToCall?.cnam_city &&
        !this.taskToCall?.cnam_state) {
        return this.taskToCall?.cnam_city || ''
      }

      if (!this.taskToCall?.cnam_city &&
        this.taskToCall?.cnam_state) {
        return this.taskToCall?.cnam_state || ''
      }

      const cityName = this.taskToCall?.cnam_city || ''
      const stateName = this.taskToCall?.cnam_state || ''

      return `${cityName} ${stateName}`
    },

    companyName () {
      return this.taskToCall?.company_name || 'Company: N/A'
    },

    toggleRecording () {
      if (this.dialer.recordingStatus === 'in-progress' &&
        this.dialer.communication &&
        this.dialer.communication.should_record === true) {
        return true
      }

      if (this.dialer.recordingStatus === 'paused' &&
        this.dialer.communication &&
        this.dialer.communication.should_record === true) {
        return false
      }

      return false
    },
    toggleHold: {
      get () {
        return this.sessionCallStatuses.hold
      },

      set (val) {
        this.sessionCallStatuses.hold = val
      }
    },
    timezone () {
      return this.taskToCall?.timezone
    },
    getTimeZone () {
      const timezone = this.taskToCall?.timezone
      return moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone).format('hh:mm A')
    },

    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    },

    isRecordDisabled () {
      return this.statusCallConnected ||
        this.profile.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER ||
        (this.profile.company.force_outbound_recording && this.profile.company.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER)
    },

    isCallCompleted () {
      const dispositionNotInprogress = this.dialer.communication &&
        this.dialer.communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW
      const disconnectedCallStatuses = ['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP']

      return dispositionNotInprogress || disconnectedCallStatuses.includes(this.dialer.currentStatus)
    },

    isHoldDisabled () {
      const inprogressStatuses = [
        CommunicationStatus.STATUS_INPROGRESS_NEW,
        CommunicationStatus.STATUS_RINGING_NEW
      ]
      const conferencingDisabled = this.currentCompany &&
        !this.currentCompany.conferencing_enabled
      const inprogressCommunication = this.dialer.communication?.legc_uuid &&
        inprogressStatuses.includes(this.dialer.communication?.legc_status)
      const isSameSid = this.dialer.communication?.legz_uuid &&
        this.dialer.call.callSid === this.dialer.communication.legz_uuid

      return !this.dialer.communication ||
        this.loadingHold ||
        this.loadingUnhold ||
        this.isCallCompleted ||
        conferencingDisabled ||
        inprogressCommunication ||
        isSameSid
    },
    statusOnACall () {
      switch (this.dialer.currentStatus) {
        case 'WRAP_UP':
        case 'MAKING_CALL':
        case 'ANSWERING_CALL':
        case 'CALL_CONNECTED':
        case 'HANGING_UP_CALL':
          return true
        default:
          return false
      }
    },

    integrationsHubspot () {
      return this.activeTask?.integrations?.hubspot
    },

    options () {
      return this.$options.auto_dialer_interval
    },

    hasQueuedTaskLists () {
      return this.powerDialerTasks.in_queue.length > 0
    },

    allTasksAreSkipped () {
      if (this.powerDialerTasks.in_queue.length > 0) {
        return this.skippedTasks.length === this.powerDialerTasks.in_queue.length
      }

      return false
    },

    canNextTask () {
      // should be able to next task even if wrap-up is not paused and
      // status is on warm up period and no manual skip (clicked next task) is in-progress
      const canNextStatuses = ['WRAP_UP', 'READY']
      const canNext = this.statusCallConnected ||
        canNextStatuses.includes(this.dialer.currentStatus)

      return !this.wrapUpPaused && !this.loadingNext && canNext
    },
    pauseButtonText () {
      if (this.togglePause) {
        return 'Unpause Session'
      }

      if (this.togglePause && this.sessionPaused) {
        return 'Resume Session'
      }

      return 'Pause Session'
    },

    holdText () {
      return this.toggleHold ? 'Unhold' : 'Hold'
    },

    recordText () {
      return this.toggleRecording ? 'Stop Rec.' : 'Record'
    },

    pauseButtonColor () {
      const sessionPausedClass = this.sessionPaused ? 'primary' : 'red-3'

      return this.togglePause ? sessionPausedClass : 'grey-4'
    },

    pauseButtonClass () {
      const sessionPausedClass = this.sessionPaused ? 'btn-btn-primary' : 'bg-btn-red'
      const pauseClass = this.togglePause ? sessionPausedClass : ''

      return [
        pauseClass,
        'sessions-button',
        'free-width',
        'mx-1'
      ]
    },

    pauseIconColor () {
      return this.sessionPaused ? '#fff' : '#62666E'
    },

    pauseButtonTextClass () {
      const textClass = this.sessionPaused ? 'text-white' : 'text-black'

      return [
        'text-body2',
        textClass
      ]
    },

    endSessionText () {
      return this.toggleEnd ? 'Ending Session...' : 'End Session'
    },

    isEndSessionDisabled () {
      return this.toggleEnd || this.wrapUpPaused
    },

    endSessionButtonColor () {
      return this.toggleEnd ? 'red-3' : 'grey-4'
    },

    endSessionButtonClass () {
      const backgroundClass = this.toggleEnd ? 'bg-btn-red' : ''

      return [backgroundClass]
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setContact',
      'setContactClone'
    ]),

    ...mapActions(['setShowPhone', 'setDialerContact']),

    ...mapActions('powerDialer', [
      'moveContactItems',
      'getSessionTaskByFilter',
      'addRedialedTask',
      'clearRedialedTasks',
      'getContact',
      'reQueuePowerDialerTask',
      'removeFirstInQueueTask'
    ]),

    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),

    async fetchContact (taskId = null) {
      if (!taskId) {
        this.isSessionRunning = false
        return
      }

      this.TOGGLE_SESSION_LOADER(true)
      await this.getContact({ id: taskId })

      if (!this.isSessionRunning) {
        this.isSessionRunning = true
      }
    },

    async runTask () {
      const timezone = this.taskToCall?.timezone
      // Time without timezone
      const startDay = moment.tz(this.powerDialerSettings.open_time, 'HH:mm:ss', timezone)
      const endDay = moment.tz(this.powerDialerSettings.close_time, 'HH:mm:ss', timezone)
      const contactLocalTime = moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone)

      // If there is no contact TZ then
      // Use the company TZ
      if (this.shouldSkip && !timezone) {
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because timezone has not been set for this contact. Pushed the task to the bottom of the list.')
        // this.moveTask(this.taskToCall, this.moveDirection.bottom)
        return
      }

      // Check if it's outside working hours or not
      if (this.shouldSkip && timezone && !contactLocalTime.isBetween(startDay, endDay)) {
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because it\'s outside day times. Pushed the task to the bottom of the list.')
        // this.moveTask(this.taskToCall, this.moveDirection.bottom)
        return
      }

      // Check if the contact is DNC'ed
      if (this.taskToCall?.is_dnc) {
        this.cancelSingleTask(this.taskToCall, 'Task is removed because the contact is on DNC.')
        return
      }

      this.callInProgress = false

      // only proceed if task has a contact list item id and
      // dialer's status is ready
      if (!this.taskToCall?.contact_list_item_id || !this.dialer.isReady) {
        this.sessionNotReady = true
        return
      }

      this.hasActiveTask = true
      this.skipWrapUp = false

      // check if redial is true (this.redialedTask?.redialed_now) and if agent status is on call
      // then do not continue until agent status is not on call
      if (this.verifyAgentOnCall && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL) {
        await new Promise(resolve => {
          const checkAgentStatus = setInterval(() => {
            if (this.profile.agent_status !== AgentStatus.AGENT_STATUS_ON_CALL) {
              clearInterval(checkAgentStatus)
              this.verifyAgentOnCall = false
              resolve()
            }
          }, 1000)
        })
      }

      // Fires an event to make a call
      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      })

      this.setDialerContact(this.activeTask)
      this.callInProgress = true
    },

    skipSingleTask (autoDialTask, message, skipTask = false) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/skip`)
        .then(res => {
          if (!this.skippedTasks.includes(contactListItemId)) {
            this.skippedTasks.push(contactListItemId)
            const skippedTasks = Array.isArray(this.powerDialerTasks.skipped) ? this.powerDialerTasks.skipped : []
            const tempSet = new Set([...skippedTasks, autoDialTask].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
            this.powerDialerTasks.skipped = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
          }
          // if (autoDialTask.status !== AutoDialTaskStatus.STATUS_QUEUED) {
          //   // add to bottom of list
          //   // autoDialTask.direction = PowerDialer.DIRECTION_BOTTOM
          //   this.addTaskToList(autoDialTask)
          // }
          // this.skipped_list.push(autoDialTask.id)
          this.$generalNotification(message, 'warning')
          this.onNextTask()
          return Promise.resolve(res)
        }).catch(err => {
          // this.$handleErrors(err.response)
          return Promise.reject(err)
        })
    },

    cancelSingleTask (autoDialTask, message) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/cancel`, { reason: message })
        .then(res => {
          this.$generalNotification(message, 'warning')
          this.onNextTask(true, true)
          return Promise.resolve(res)
        }).catch(err => {
          // this.$handleErrors(err.response)
          return Promise.reject(err)
        })
    },

    redialTask (autoDialTask, redial) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/skip`, { redial })
        .then(res => {
          this.addRedialedTask(autoDialTask.id)

          const position = redial ? 'top' : 'bottom'
          this.$generalNotification(`Success: contact is at the ${position} of the current list`)
          return Promise.resolve(res)
        }).catch(err => {
          return Promise.reject(err)
        })
    },

    clearWarmUpCountDown () {
      this.countdownTimer = -1
      clearInterval(this.countdownInterval)

      setTimeout(() => {
        this.countdownStarted = false
      }, 1000)
    },

    skipTask () {
      if (!this.activeTask) {
        return
      }

      if (this.callInProgress) {
        this.$VueEvent.fire('hangupCall')
      }
    },

    addTaskToList () {
      // TODOs: Add task to list
    },

    removeTaskFromList () {
      // TODOs: Remove task from list
    },

    getSkippedAndActiveTasks () {
      const skippedTasks = Array.isArray(this.powerDialerTasks.skipped) ? this.powerDialerTasks.skipped : []
      return [...skippedTasks, this.activeTask]
    },

    updateNumberOfFetchedTasks (taskType, taskCount) {
      // if the current page is the same as the last page, then we keep the total of fetched tasks the same
      if (this.powerDialerTaskFilters[taskType].current_page === this.inQueueFetchTasks.currentPage) {
        this.inQueueFetchTasks.fetchedTasks = taskCount
      }

      // if the current page is greater than the last page, then we increment the total of fetched tasks
      if (this.powerDialerTaskFilters[taskType].current_page > this.inQueueFetchTasks.currentPage) {
        this.inQueueFetchTasks.fetchedTasks += taskCount
      }
    },

    updateCurrentPage (taskType) {
      this.inQueueFetchTasks.currentPage = this.powerDialerTaskFilters[taskType].current_page
    },

    filterNewInQueueTasks (currentList, taskType, updateFetched = false, updatePagination = false) {
      // Get list of processed tasks at this point
      // (Total of skipped tasks in the current PD session + active task)
      const currSkippedAndInProgress = this.getSkippedAndActiveTasks()

      // The new set of IN QUEUE tasks that are retrieved by the API
      const currInQueue = [...currentList]

      if (updateFetched) {
        // Update the number of fetched tasks in the current session
        this.updateNumberOfFetchedTasks(taskType, currInQueue?.length)
      }

      if (updatePagination) {
        // Update the current page in the current session
        this.updateCurrentPage(taskType)
      }

      // We compare the new set of IN QUEUE tasks retrieved by the API according to pagination
      // but discarding the ones have been skipped so we don't list them again
      const newInQueueList = currInQueue.filter(element => !currSkippedAndInProgress.some(item => item.id === element.id))

      return newInQueueList
    },

    processRemoveFirstInQueueTask: debounce(function () {
      this.removeFirstInQueueTask()
    }, 500),

    processHangup () {
      this.$VueEvent.fire('hangupCall')

      if (this.wrapUpSeconds === -1) {
        this.$VueEvent.fire('resetCall')
      }
    },

    findDefaultOutboundCampaign () {
      this.autoDialer.outbound_campaign_id = null

      // Default PowerDialer outbound line
      if (this.currentCompany &&
        this.currentCompany.default_power_dialer_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_power_dialer_campaign_id
        return
      }

      // Force outbound line on all users
      if (this.currentCompany &&
        this.currentCompany.default_outbound_campaign_id &&
        this.currentCompany.force_outbound_line) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // Outbound line is set to use account default and account has a default
      if (this.currentCompany &&
        this.currentCompany.default_outbound_campaign_id &&
        this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT &&
        !this.profile.default_outbound_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // User has a default outbound line
      if (this.profile.default_outbound_campaign_id &&
        this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.autoDialer.outbound_campaign_id = this.profile.default_outbound_campaign_id
        return
      }

      // User has to choose outbound line every time
      if (this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.autoDialer.outbound_campaign_id = null
      }
    },

    startWarmUpCountDown (resetCountdownTimer = false) {
      if (this.countdownStarted || !this.isSessionRunning || this.reRouteModal) {
        return
      }

      this.countdownStarted = true

      if (resetCountdownTimer) {
        this.resetTimer()
      }

      clearInterval(this.countdownInterval)

      const wasInWrapUpStatusAndPaused = this.dialer.currentStatus === 'WRAP_UP' &&
        this.wrapUpPaused

      this.countdownInterval = setInterval(() => {
        // if status in wrap-up and has wrap-up seconds but wrap up is paused due to
        // forced call or contact disposition, we should not continue the countdown
        if (this.wrapUpSeconds !== -1 && this.dialer.currentStatus === 'WRAP_UP' &&
          this.wrapUpPaused) {
          return
        }

        // end countdown if previously in wrap-up status and paused due to forced
        // call and contact disposition and status changed and is no longer in wrap-up
        if (wasInWrapUpStatusAndPaused && this.dialer.currentStatus !== 'WRAP_UP') {
          this.countdownTimer = 0
        }

        // reset next task loading flag
        if (this.loadingNext) {
          this.loadingNext = false
        }

        this.countdownTimer--
        this.onTimerIsOver()
      }, 1000)
    },

    onTimerIsOver () {
      if (this.timerIsOver) {
        this.clearWarmUpCountDown()

        const hasEnded = this.toggleEnd || !this.hasQueuedTaskLists
        const noActiveTask = !this.hasActiveTask || !this.activeTask

        if (hasEnded && noActiveTask) {
          this.reRoute()
          return
        }

        if (!this.togglePause && !this.wrapUp) {
          this.runTask()
        }

        if (this.wrapUp) {
          this.initialize()
        }

        // end wrap-up if wrap-up seconds
        // is not indefinite
        if (this.wrapUp && this.wrapUpSeconds !== 0) {
          this.wrapUp = false
          this.isSessionRunning = false
        }

        if (this.togglePause) {
          this.sessionPaused = true
        }
      }
    },

    resetSession () {
      this.activeTask = {}
      this.taskToCall = {}
      this.hasActiveTask = false
      this.sessionCallStatuses = {
        pause: false,
        end: false,
        recording: false,
        hold: false,
        next: false,
        mute: false
      }
    },

    start () {
      this.resetSession()
      this.initialize()

      // Force pause if session is started after being manually paused (it might happen when internet is restablished)
      if (this.sessionPaused) {
        this.onTogglePause()
      }
    },

    async initialize () {
      if (!this.isSessionRunning) {
        this.TOGGLE_SESSION_LOADER(true)
      }

      if (this.toggleEnd && this.timerIsOver) {
        this.reRoute()
        return
      }

      if (this.allTasksAreSkipped) {
        this.clearWarmUpCountDown()
        this.$emit('on-all-tasks-are-skipped')

        setTimeout(() => {
          this.reRoute()
        }, 1000)
        return
      }

      const task = get(this.powerDialerTasks.in_queue, '0', null)

      // skip assigning the next task if
      // there is still an active task and
      // wrap up seconds is indefinite
      if (!isEmpty(this.activeTask) && this.wrapUpSeconds === 0) {
        return
      }

      // end session if no more active call,
      // no tasks in queue, no active task,
      // and wrap up seconds is not indefinite
      if (!this.statusCallConnected && !this.hasQueuedTaskLists &&
        !task && this.wrapUpSeconds !== 0) {
        this.reRoute()
        return
      }

      // process the next task if no in-progress call
      if (!this.statusOnACall && !this.wrapUp) {
        this.loadingNext = true
        this.taskToCall = cloneDeep(task)

        if (this.taskToCall) {
          this.processRemoveFirstInQueueTask()
        }

        this.activeTask = this.taskToCall
        this.hasActiveTask = true
        this.setContact(this.taskToCall)
        this.TOGGLE_SESSION_LOADER(true)
        this.resetTimer()

        if (!this.isSessionRunning) {
          this.isSessionRunning = true
        }

        setTimeout(() => {
          this.startWarmUpCountDown()
        }, 1000)
      }

      // end power dialer session if:
      // power dialer has no tasks left in queue,
      // countdown timer is 0,
      // and session is still running
      if (!this.hasQueuedTaskLists &&
        !this.statusCallConnected &&
        this.timerIsOver &&
        this.isSessionRunning) {
        this.closePowerDialerNoTasks()
      }

      this.TOGGLE_SESSION_LOADER(false)
    },

    closePowerDialerNoTasks () {
      // continue the session if there is still
      // an active task
      if (this.hasActiveTask) {
        return
      }

      this.reRoute(false)

      if (this.redirectNotification) {
        this.$emit('no-tasks-found')
      }
    },

    onToggleHold () {
      this.toggleHold = !this.toggleHold

      if (this.dialer.isHeld) {
        this.loadingUnhold = true
      } else {
        this.loadingHold = true
      }

      this.$VueEvent.fire('toggleHold')
      this.$options.holdIntervalCount = 0

      this.$options.holdInterval = setInterval(() => {
        if (this.loadingHold && this.dialer.isHeld) {
          this.loadingHold = false
          clearInterval(this.$options.holdInterval)
        }

        if (this.loadingUnhold && !this.dialer.isHeld) {
          this.loadingUnhold = false
          clearInterval(this.$options.holdInterval)
        }

        this.$options.holdIntervalCount++

        if (this.$options.holdIntervalCount >= 120) {
          clearInterval(this.$options.holdInterval)
        }
      }, 500)
    },

    onToggleRecording () {
      this.$VueEvent.fire('toggleRecordingStatus')
    },

    onTogglePause () {
      this.togglePause = !this.togglePause

      if (this.togglePause) {
        this.sessionPaused = true
        return
      }

      this.resetTimer()
      this.sessionPaused = false

      if (this.taskToCall && !this.statusOnACall) {
        setTimeout(() => {
          this.startWarmUpCountDown()
        }, 1000)
      }
    },

    onToggleEnd () {
      this.togglePause = true
      this.toggleEnd = !this.toggleEnd
      this.reRoute()
    },
    resetTimer () {
      if (this.ongoingSession.finishedPdSession || this.countdownTimer <= -1) {
        const warmUpPeriod = get(this.sessionSettings, 'warmup_period_in_seconds', 0)
        this.countdownTimer = this.wrapUp ? this.wrapUpSeconds : warmUpPeriod

        return
      }

      if (!this.wrapUp) {
        this.countdownTimer = this.sessionSettings.warmup_period_in_seconds
      }
    },

    reRoute (isForced = false) {
      if (isForced) {
        this.redirectNotification = isForced
      }

      this.reRouteModal = true
      this.isSessionRunning = false

      // we force the wrap-up to end once the power dialer session has ended
      // and that call/contact disposition is not forced
      if (this.dialer.currentStatus !== 'READY' && !this.isNotDisposed) {
        this.hangUpIntervalCounter = 0

        this.hangUpInterval = setInterval(() => {
          if (this.dialer.currentStatus === 'WRAP_UP') {
            this.$VueEvent.fire('forceEndWrapUp')
          }

          this.hangUpIntervalCounter++

          if (this.hangUpIntervalCounter >= 120) {
            clearInterval(this.hangUpInterval)
          }
        }, 500)
      }

      this.clearRedialedTasks()
      clearInterval(this.countdownInterval)

      setTimeout(() => {
        this.$emit('on-redirect', this.selectedList)
      }, this.redirectDelay)
    },

    managingSessionFlows (status = '') {
      switch (status) {
        // If Status is READY
        case 'READY':
          if (!this.statusCallConnected &&
            this.timerIsOver &&
            this.isSessionRunning) {
            this.resetTimer()
          }

          // automate next task only if no wrap-up, no in-progress redial,
          // and no manual skip (clicked next task) is in-progress
          if (this.isSessionRunning &&
            this.wrapUpSeconds === -1 &&
            !this.loadingNext &&
            !this.isRedialClicked) {
            this.onNextTask()
          }

          break
        case 'WRAP_UP':
          // if task is manually skipped through the
          // Next button, end the wrap up
          if (this.skipWrapUp) {
            // we need to clear the wrap-up (set agent status to available)
            // after the session ended
            if (this.powerDialerTasks.in_queue.length === 0) {
              this.$VueEvent.fire('forceEndWrapUp')
            } else { // just end the wrap-up
              this.$VueEvent.fire('endWrapUp')
            }

            this.wrapUp = false
            this.skipWrapUp = false
            return
          }

          this.wrapUp = true
          this.countdownTimer = this.wrapUpSeconds

          // if status is wrap-up and wrap-up seconds
          // is "no wrap-up", then skip wrap-up countdown timer
          // and proceed immediately to the next task
          if (this.isSessionRunning && this.wrapUpSeconds === -1) {
            this.onNextTask(true)
          }

          break
        case 'HANGING_UP_CALL':
          if (!this.togglePause) {
            this.resetTimer()
          }

          break
      }
    },

    processSession (noWrapUp = false) {
      this.onPhoneExpansionReset()

      if (!noWrapUp) {
        this.$VueEvent.fire('endWrapUp')
      }

      this.activeTask = this.taskToCall
      this.hasActiveTask = true
      this.setContact(this.taskToCall)

      if (!this.isSessionRunning) {
        this.isSessionRunning = true
      }

      this.resetTimer()

      setTimeout(() => {
        this.startWarmUpCountDown()
      }, 1000)
    },

    async onNextTask (forceSkip = false, skipWrapUp = false) {
      let noWrapUp = false
      this.loadingNext = true

      // when there is wrap up, skip wrap
      if (this.wrapUpSeconds !== -1) {
        this.skipWrapUp = skipWrapUp
      }

      // when user clicks on Next button we also need to check if agent is on call
      if (!forceSkip && skipWrapUp) {
        this.verifyAgentOnCall = true
      }

      this.onPhoneExpansionReset()

      // end wrap up
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
        noWrapUp = true
      }

      // hangup in-progress call
      if (this.callInProgress && this.dialer.currentStatus !== 'WRAP_UP') {
        this.processHangup()
      }

      if (this.dialer.currentStatus !== 'CALL_CONNECTED' || forceSkip) {
        this.wrapUp = false
        this.hasActiveTask = false
        const task = get(this.powerDialerTasks.in_queue, '0', null)

        this.taskToCall = cloneDeep(task)

        if (isEmpty(task)) {
          this.hasActiveTask = false
          this.reRoute()
          return
        }

        this.processRemoveFirstInQueueTask()
        this.processSession(noWrapUp)
        // Add task to skipped list when users clicks on the Next button
        if (!forceSkip && skipWrapUp && this.sessionPaused) {
          this.powerDialerTasks.skipped.push(cloneDeep(this.taskToCall))
        }
        return
      }

      if (this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.processHangup()
      }
    },
    onInitiateSession (session) {
      this.activeTask = {}
      this.hasActiveTask = false
      this.initialize()
    },

    onInitiateWrapUp (session) {
      this.hasActiveTask = false
      this.initialize()
    },

    onEndWrapUp () {
      this.wrapUp = false
      this.taskToCall = cloneDeep(this.powerDialerTasks.in_queue[0])

      if (this.taskToCall && this.isSessionRunning) {
        setTimeout(() => {
          this.processRemoveFirstInQueueTask()
          this.processSession(true)
        }, 200)

        return
      }

      this.hasActiveTask = false
      this.reRoute()
    },

    onPhoneExpansionReset () {
      this.sessionPhoneExpansion = ''
    },

    async onRedial (redial) {
      this.isRedialClicked = true
      this.onPhoneExpansionReset()

      let task = null
      if (redial) {
        // get the current task
        task = this.activeTask
      } else {
        // get the next task
        task = get(this.powerDialerTasks.in_queue, '0', null)
      }
      this.taskToCall = cloneDeep(task)

      // end session if no more tasks
      if (isEmpty(task)) {
        this.hasActiveTask = false
        this.reRoute()

        return
      }

      this.redialedTask = this.$jsonClone(this.activeTask)
      this.redialedTask.redialed_now = redial
      this.verifyAgentOnCall = true

      this.redialTask(this.activeTask, redial).then(() => {
        // hang-up call if still in a call
        if (this.dialer.currentStatus === 'CALL_CONNECTED') {
          this.$VueEvent.fire('hangupCall')
        }

        // when there is wrap up, skip wrap
        if (this.wrapUpSeconds !== -1) {
          setTimeout(() => {
            this.isRedialClicked = false
            // if it's redial now, we should skip wrap up
            this.wrapUp = false
            this.skipWrapUp = redial
            this.processSession()
          }, 1000)

          return
        }

        // if no wrap-up, proceed to the next task
        setTimeout(() => {
          this.isRedialClicked = false
          this.processSession()
        }, 1000)
      }).catch((err) => {
        setTimeout(() => {
          this.redialedTask = {}
          this.isRedialClicked = false
        }, 1000)

        console.log(err)
        this.$generalNotification('Failed to process the redial.', 'error')
      })
    },

    requeueTask () {
      if (isEmpty(this.redialedTask)) {
        return
      }

      const task = this.$jsonClone(this.redialedTask)

      if (!task.redialed_now) {
        this.reQueuePowerDialerTask({
          task: task,
          id: task.contact_list_item_id
        })
      }

      this.redialedTask = {}
    },

    onHoldFailed () {
      this.loadingHold = false
      this.toggleHold = false
    },

    onUnholdFailed () {
      this.loadingUnhold = false
      this.toggleHold = true
    },

    manageTaskTransition () {
      const task = this.powerDialerTasks.in_queue.shift()
      this.taskToCall = cloneDeep(task)

      if (isEmpty(task)) {
        this.hasActiveTask = false
        this.reRoute()
        return
      }

      this.processSession(false)
    },

    hangupCall ($event) {
      this.isHangingUp = true
      $event.stopPropagation()
      $event.preventDefault()

      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      this.$VueEvent.fire('hangupCall')
    }
  }
}
