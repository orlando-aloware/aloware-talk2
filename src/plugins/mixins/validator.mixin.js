import _ from 'lodash'
import * as MissedCallBehaviors from 'src/constants/missed-call-behavior'
import * as AnswerTypes from 'src/constants/answer-types'
export default {
  methods: {
    contactValidator (rule, value, callback) {
      if (this.schedule.contact !== null && !_.isEmpty(this.schedule.contact)) {
        callback()
      } else {
        callback(new Error('A contact is required'))
      }
    },

    newPasswordValidator (rule, value, callback) {
      if (this.user.password && this.user.password.length < 6) {
        callback(new Error('Password must be at least 6 characters'))
      } else {
        callback()
      }
    },

    newPasswordConfirmationValidator (rule, value, callback) {
      if (this.user.password && !this.user.password_confirmation) {
        callback(new Error('Please confirm new password'))
      } else if (this.user.password !== this.user.password_confirmation) {
        callback(new Error('Password and confirmation are not matching'))
      } else {
        callback()
      }
    },

    manualPasswordValidator (rule, value, callback) {
      if (this.user.is_manual_password) {
        if (this.user.password && this.user.password.length < 6) {
          callback(new Error('Password must be at least 6 characters'))
        } else if (!this.user.password) {
          callback(new Error('Please provide a password'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },

    outboundCampaignValidator (rule, value, callback) {
      if (this.outbound_calling_selector === 1 && !this.profile.default_outbound_campaign_id) {
        callback(new Error('Please select an outbound line'))
      } else {
        callback()
      }
    },

    userOutboundCampaignValidator (rule, value, callback) {
      if (this.user.outbound_calling_selector === 1 && !this.user.read_only_access && this.user.answer_by !== (AnswerTypes.BY_NONE + 2) && !this.user.default_outbound_campaign_id) {
        callback(new Error('Please select an outbound line'))
      } else {
        callback()
      }
    },

    transferUserValidator (rule, value, callback) {
      if (this.transfer.mode === 'user') {
        if (this.transfer.user_id) {
          callback()
        } else {
          callback(new Error('Please select a user'))
        }
      } else {
        callback()
      }
    },

    transferRingGroupValidator (rule, value, callback) {
      if (this.transfer.mode === 'ring_group') {
        if (this.transfer.ring_group_id) {
          callback()
        } else {
          callback(new Error('Please select a ring group'))
        }
      } else {
        callback()
      }
    },

    transferPhoneValidator (rule, value, callback) {
      if (this.transfer.mode === 'phone') {
        if (this.transfer.phone_number) {
          if (this.validatePhone(value)) {
            callback()
          } else {
            callback(new Error('Phone number is not valid'))
          }
        } else {
          callback(new Error('Please provide a phone number'))
        }
      } else {
        callback()
      }
    },

    addUserValidator (rule, value, callback) {
      if (this.add.mode === 'user') {
        if (this.add.user_id) {
          callback()
        } else {
          callback(new Error('Please select a user'))
        }
      } else {
        callback()
      }
    },

    addPhoneValidator (rule, value, callback) {
      if (this.add.mode === 'phone') {
        if (this.add.phone_number) {
          if (this.validatePhone(value)) {
            callback()
          } else {
            callback(new Error('Phone number is not valid'))
          }
        } else {
          callback(new Error('Please provide a phone number'))
        }
      } else {
        callback()
      }
    },

    phoneValidator (rule, value, callback) {
      // for user dialog page
      if (this.user && this.user.answer_by !== undefined && this.user.answer_by !== null && this.user.answer_by !== AnswerTypes.BY_PHONE_NUMBER) {
        if (value && this.validatePhone(value)) {
          callback()
        } else if (!value) {
          callback()
        } else {
          callback(new Error('Phone number is not valid'))
        }
      }

      if (value === '') {
        callback(new Error('Please provide a phone number'))
      } else {
        if (this.validatePhone(value)) {
          callback()
        } else {
          callback(new Error('Phone number is not valid'))
        }
      }
    },

    secondPhoneValidator (rule, value, callback) {
      if (this.user.enabled_two_legged_outbound) {
        if (value === '') {
          callback(new Error('Please provide a phone number'))
        } else {
          if (this.validatePhone(value)) {
            callback()
          } else {
            callback(new Error('Phone number is not valid'))
          }
        }
      } else {
        callback()
      }
    },

    answerByValidator (rule, value, callback) {
      // for profile settings page
      if (this.profile && (this.profile.answer_by !== undefined || this.profile.answer_by !== null)) {
        callback()
      }
      if (this.profile && (this.profile.answer_by === undefined || this.profile.answer_by === null)) {
        callback(new Error('Please select an answer type'))
      }

      if (this.user && (this.user.answer_by !== undefined || this.user.answer_by !== null)) {
        callback()
      }

      if (this.user && !this.user.read_only_access) {
        if (this.user.answer_by === undefined || this.user.answer_by === null) {
          callback(new Error('Please select an answer type'))
        } else {
          callback()
        }
      }
    },

    whisperValidator (rule, value, callback) {
      if (value === true) {
        if ((this.campaign.whisper_tts && this.campaign.whisper_tts.trim() !== '') ||
          (this.campaign.whisper_file && this.campaign.whisper_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Whisper message must not be empty'))
        }
      } else {
        callback()
      }
    },

    greetingValidator (rule, value, callback) {
      if (value === true) {
        if ((this.campaign.greeting_tts && this.campaign.greeting_tts.trim() !== '') ||
          (this.campaign.greeting_file && this.campaign.greeting_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Greeting message must not be empty'))
        }
      } else {
        callback()
      }
    },

    ivrPromptValidator (rule, value, callback) {
      if (rule.required()) {
        if ((this.campaign.ivr_prompt_tts && this.campaign.ivr_prompt_tts.trim() !== '') ||
          (this.campaign.ivr_prompt_file && this.campaign.ivr_prompt_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('IVR prompt message must not be empty'))
        }
      } else {
        callback()
      }
    },

    textAuthorizationValidator (rule, value, callback) {
      if (value === true) {
        if ((this.campaign.ask_for_text_authorization_tts && this.campaign.ask_for_text_authorization_tts.trim() !== '') ||
          (this.campaign.ask_for_text_authorization_file && this.campaign.ask_for_text_authorization_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Text authorization prompt must not be empty'))
        }
      } else {
        callback()
      }
    },

    callbackValidator (rule, value, callback) {
      if (value === true) {
        if ((this.ring_group.queue_ask_for_callback_tts && this.ring_group.queue_ask_for_callback_tts.trim() !== '') ||
          (this.ring_group.queue_ask_for_callback_file && this.ring_group.queue_ask_for_callback_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Callback prompt must not be empty'))
        }
      } else {
        callback()
      }
    },

    handleByTextValidator (rule, value, callback) {
      if (value === true) {
        if ((this.ring_group.queue_handle_by_text_tts && this.ring_group.queue_handle_by_text_tts.trim() !== '') ||
          (this.ring_group.queue_handle_by_text_file && this.ring_group.queue_handle_by_text_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Handle by text prompt must not be empty'))
        }
      } else {
        callback()
      }
    },

    askForVoicemailValidator (rule, value, callback) {
      if (value === true) {
        if ((this.ring_group.queue_ask_for_voicemail_tts && this.ring_group.queue_ask_for_voicemail_tts.trim() !== '') ||
          (this.ring_group.queue_ask_for_voicemail_file && this.ring_group.queue_ask_for_voicemail_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Voicemail prompt must not be empty'))
        }
      } else {
        callback()
      }
    },

    callScreenValidator (rule, value, callback) {
      if (value === true) {
        if ((this.ring_group.queue_call_screen_tts && this.ring_group.queue_call_screen_tts.trim() !== '') ||
          (this.ring_group.queue_call_screen_file && this.ring_group.queue_call_screen_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Call screen prompt must not be empty'))
        }
      } else {
        callback()
      }
    },

    handleByTextMessageValidator (rule, value, callback) {
      if (this.ring_group.queue_handle_by_text_response_tts && this.ring_group.queue_handle_by_text_response_tts.trim() !== '') {
        callback()
      } else {
        callback(new Error('Text message must not be empty'))
      }
    },

    recordValidator (rule, value, callback) {
      if (value === true) {
        if ((this.campaign.record_tts && this.campaign.record_tts.trim() !== '') ||
          (this.campaign.record_file && this.campaign.record_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Recording message must not be empty'))
        }
      } else {
        callback()
      }
    },

    voicemailValidator (rule, value, callback) {
      if (this.campaign.missed_calls_settings.missed_call_handling_mode === MissedCallBehaviors.MISSED_CALL_BEHAVIOR_VOICEMAIL) {
        if ((this.campaign.missed_calls_settings.voicemail_tts && this.campaign.missed_calls_settings.voicemail_tts.trim() !== '') ||
          (this.campaign.missed_calls_settings.voicemail_file && this.campaign.missed_calls_settings.voicemail_file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Voicemail message must not be empty'))
        }
      } else {
        callback()
      }
    },

    lineAccessLimitValidator (rule, value, callback) {
      if (this.user.line_access_limit && this.user.selected_campaign_ids && this.user.selected_campaign_ids.length === 0) {
        callback(new Error('Please select a line'))
      } else {
        callback()
      }
    },

    userAccessLimitValidator (rule, value, callback) {
      if (this.user.user_access_limit && this.user.selected_user_ids && this.user.selected_user_ids.length === 0) {
        callback(new Error('Please select a user'))
      } else {
        callback()
      }
    },

    closedHoursMissedCallVoicemailValidator (rule, value, callback) {
      if (this.campaign.closed_hours_voice_prompt.enabled) {
        if ((this.campaign.closed_hours_voice_prompt.tts && this.campaign.closed_hours_voice_prompt.tts.trim() !== '') ||
          (this.campaign.closed_hours_voice_prompt.file && this.campaign.closed_hours_voice_prompt.file.trim() !== '')) {
          callback()
        } else {
          callback(new Error('Voicemail message must not be empty'))
        }
      } else {
        callback()
      }
    },

    closedHoursMissedTextAutoReplyValidator (rule, value, callback) {
      if (this.campaign.closed_hours_auto_reply_text.enabled) {
        if (this.campaign.closed_hours_auto_reply_text.message && this.campaign.closed_hours_auto_reply_text.message.trim() !== '') {
          callback()
        } else {
          callback(new Error('Message body must not be empty'))
        }
      } else {
        callback()
      }
    },

    missedCallHandlingRouterOtherLine (rule, value, callback) {
      if (this.campaign.missed_calls_settings.missed_call_handling_mode === MissedCallBehaviors.MISSED_CALL_BEHAVIOR_REROUTE) {
        if (this.campaign.missed_calls_settings.reroute_to_campaign_id) {
          callback()
        } else {
          callback(new Error('Please select a line'))
        }
        return
      }
      callback()
    },

    missedCallHandlingForwardNumber (rule, value, callback) {
      if (this.campaign.missed_calls_settings.missed_call_handling_mode === MissedCallBehaviors.MISSED_CALL_BEHAVIOR_FORWARD) {
        if (this.campaign.missed_calls_settings.forward_to && this.$options.filters.fixPhone(this.campaign.missed_calls_settings.forward_to)) {
          callback()
        } else {
          callback(new Error('Please enter a valid phone number'))
        }
        return
      }
      callback()
    },

    sequenceValidator (rule, value, callback) {
      if ((this.sequence.message_tts !== '' && this.sequence.message_tts) ||
        (this.sequence.message_file !== '' && this.sequence.message_file)) {
        callback()
      } else {
        callback(new Error('Message must not be empty'))
      }
    },

    amdVoicemailValidator (rule, value, callback) {
      if ((this.sequence.amd_voicemail_tts !== '' && this.sequence.amd_voicemail_tts) ||
        (this.sequence.amd_voicemail_file !== '' && this.sequence.amd_voicemail_file)) {
        callback()
      } else {
        callback(new Error('Voicemail message must not be empty'))
      }
    },

    passValidator (rule, value, callback) {
      if (this.user.password === '') {
        callback(new Error('Please provide a password'))
      } else if (this.user.password !== '' && this.user.password.length < 6) {
        callback(new Error('Password length must be at least 6 characters'))
      } else {
        callback()
      }
    },

    termsValidator (rule, value, callback) {
      if (value === false) {
        callback(new Error('Please agree to terms of service'))
      } else {
        callback()
      }
    },

    labelValidator (rule, value, callback) {
      const validationResult = this.validateLabel()
      if (validationResult) {
        callback()
      } else {
        callback(new Error(this.post_error.label))
        this.post_error.label = null
      }
    },

    trackingIdValidator (rule, value, callback) {
      if (this.analytic.status === 1 && value.tracking_id === '') {
        callback(new Error('Please provide a Tracking ID'))
      } else {
        callback()
      }
    },

    poolNumberTypeValidator (rule, value, callback) {
      if (this.campaign.type === this.TYPE_ONLINE && this.campaign.subtype === this.SUBTYPE_ONLINE_VISITORS) {
        switch (value) {
          case 'local_to_destination':
            callback()
            break
          case 'tollfree_area_code':
            callback()
            break
          case 'local_area_code':
            if (this.area_code_available_numbers.length >= this.campaign.pool_size && this.search_area_code_done) {
              callback()
            } else {
              callback(new Error('No available number on this area code'))
            }
            break
          default:
            callback(new Error('Please select a pool option'))
            break
        }
      } else {
        callback()
      }
    },

    poolNumberTollFreeAreaCodeValidator (rule, value, callback) {
      if (this.campaign.type === this.TYPE_ONLINE && this.campaign.subtype === this.SUBTYPE_ONLINE_VISITORS) {
        if (value) {
          callback()
        } else {
          if (this.campaign.pool_options.type === 'tollfree_area_code') {
            callback(new Error('Please select an area code'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    },

    landingParamValidator (rule, value, callback) {
      value = this.campaign.visitor_tracking_options
      if (this.campaign.visitor_tracking_mode === 'utm_only') {
        if (value === '' || !value) {
          callback(new Error('Add a landing param'))
        } else {
          if (this.campaign.visitor_tracking_options.match(/(?!&)utm_source=[^&]*/g)) {
            callback()
          } else {
            callback(new Error('Landing param error'))
          }
        }
      } else {
        callback()
      }
    },

    socialMediaValidator (rule, value, callback) {
      if (this.campaign.visitor_tracking_mode === 'sm_only') {
        if (this.campaign.visitor_tracking_options) {
          callback()
        } else {
          callback(new Error('Select a social media site'))
        }
      } else {
        callback()
      }
    },

    ppcValidator (rule, value, callback) {
      if (this.campaign.visitor_tracking_mode === 'ppc_only') {
        if (this.campaign.visitor_tracking_options) {
          callback()
        } else {
          callback(new Error('Select a search engine'))
        }
      } else {
        callback()
      }
    },

    organicValidator (rule, value, callback) {
      if (this.campaign.visitor_tracking_mode === 'organic_only') {
        if (this.campaign.visitor_tracking_options) {
          callback()
        } else {
          callback(new Error('Select a search engine'))
        }
      } else {
        callback()
      }
    },

    validatePhone (phoneNumber) {
      return !!this.$options.filters.fixPhone(phoneNumber)
    },

    validateLabel () {
      if (this.post_error.label !== null) {
        return false
      }
      return true
    },

    callerIdValidator (rule, value, callback) {
      if (value === '') {
        callback(new Error('Please provide a phone number'))
      } else {
        if (!this.validatePhone(value)) {
          callback(new Error('Phone number is not valid'))
        }

        if (!this.checkIfCallerIdIsOnCampaignList(this.$options.filters.fixPhone(value))) {
          callback(new Error('Please use one of your line\'s numbers as your Caller ID. If you need a Caller ID that is not hosted with us, please contact our support.'))
        }

        callback()
      }
    },

    addExtensionPhoneNumberValidator (rule, value, callback) {
      if (value === '') {
        callback(new Error('Please provide a phone number'))
        return
      } else if (!this.validatePhone(value)) {
        callback(new Error('Phone number is not valid'))
        return
      }
      callback()
    },

    skipLineIdsValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_lines && value.length === 0) {
        callback(new Error('Please select a line'))
      }
      callback()
    },

    dispositionStatusesValidator (rule, value, callback) {
      if (this.card.settings.filters.contacts === 'selected_disposition_statuses' && value.length === 0) {
        callback(new Error('Please select a disposition status'))
      }
      callback()
    },

    dealCreationDispositionStatusesValidator (rule, value, callback) {
      if (this.card.settings.filters.create_deal_when === 'disposed' && value.length === 0) {
        callback(new Error('Please select a disposition status'))
      }
      callback()
    },

    sendDailyActivityReportsOnValidator (rule, value, callback) {
      if (this.company_clone.daily_activity_reports_enabled && !value) {
        callback(new Error('Please select a time to send reports'))
      }
      callback()
    },

    callDurationTypeValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_call_duration && _.isEmpty(value)) {
        callback(new Error('Please select the duration type to filter calls'))
      }
      callback()
    },

    callDurationValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_call_duration && _.isEmpty(value)) {
        callback(new Error('Please enter the duration in minutes'))
      } else if (this.card.settings.filters.filter_call_duration && parseInt(value) < 1) {
        callback(new Error('Please enter a value greater than or equal to 1'))
      }
      callback()
    },

    directionValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_direction && _.isEmpty(value)) {
        callback(new Error('Please select communication direction(s)'))
      }
      callback()
    },

    typeValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_type && _.isEmpty(value)) {
        callback(new Error('Please select communication type(s)'))
      }
      callback()
    },

    communicationDispositionStatusesValidator (rule, value, callback) {
      if (this.card.settings.filters.filter_communication_disposition_status && _.isEmpty(value)) {
        callback(new Error('Please select communication disposition status(es)'))
      }
      callback()
    },

    checkIfCallerIdIsOnCampaignList (phoneNumber) {
      // get campaign list
      const campaignList = []

      this.$store.state.campaigns.forEach(item => {
        if (item.incoming_numbers && item.incoming_numbers.length > 0) {
          item.incoming_numbers.forEach(incomingNumber => {
            campaignList.push(incomingNumber.phone_number)
          })
        }
      })

      return campaignList.indexOf(phoneNumber) !== -1
    },

    firstNameValidator (rule, value, callback) {
      if (value !== null && value.length > 191) {
        callback(new Error('First name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    lastNameValidator (rule, value, callback) {
      if (value !== null && value.length > 191) {
        callback(new Error('Last name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    firstNameRequiredValidator (rule, value, callback) {
      if (_.isEmpty(value)) {
        callback(new Error('Please provide a first name for the user'))
      } else if (value.length > 191) {
        callback(new Error('First name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    lastNameRequiredValidator (rule, value, callback) {
      if (_.isEmpty(value)) {
        callback(new Error('Please provide a last name for the user'))
      } else if (value.length > 191) {
        callback(new Error('First name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    registerFirstNameRequiredValidator (rule, value, callback) {
      if (_.isEmpty(value)) {
        callback(new Error('Please provide your first name'))
      } else if (value.length > 191) {
        callback(new Error('First name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    registerLastNameRequiredValidator (rule, value, callback) {
      if (_.isEmpty(value)) {
        callback(new Error('Please provide your last name'))
      } else if (value.length > 191) {
        callback(new Error('First name must not exceed 191 characters'))
      } else {
        callback()
      }
    },

    outboundCallCountValidator (rule, value, callback) {
      if (this.outbound_call_count_switch &&
        !this.outbound_call_count_model.outbound_call_count_start) {
        callback(new Error('Please enter call count start'))
      } else if (this.outbound_call_count_switch &&
        !this.outbound_call_count_model.outbound_call_count_end) {
        callback(new Error('Please enter call count end'))
      }
      callback()
    }
  }
}
