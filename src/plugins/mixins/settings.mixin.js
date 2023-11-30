import { mapActions, mapState } from 'vuex'
import * as AnswerTypes from 'src/constants/answer-types'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import _ from 'lodash'

export default {

  computed: {
    ...mapState('settings', ['userClone']),

    isXmasEnabled () {
      return process.env.XMAS_ENABLED && (this.statics?.xmas_enabled || false)
    },

    isXmasBannerEnabled () {
      return process.env.XMAS_ENABLED && process.env.XMAS_BANNERS_ENABLED && (this.statics?.xmas_enabled || false)
    }
  },

  data () {
    return {
      loadingOperatingHours: false,
      setCustomNotificationPhoneNumber: false,
      localUser: null
    }
  },

  methods: {
    ...mapActions('settings', ['setFormValidity']),
    scrollToElement () {
      this.$nextTick(function () {
        const targetEl = document.querySelector(this.$route.hash + '-container')
        const containerEl = document.querySelector('.setting-content-wrapper')
        containerEl.scrollTop = targetEl.offsetTop
      })
    },
    validateState (input) {
      const { $dirty, $error } = this.$v.user[input]
      return $dirty ? !$error : null
    },

    updateFormValidity () {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.setFormValidity(false)
      } else {
        this.setFormValidity(true)
      }
    },

    fixOperatingHours () {
      this.loadingOperatingHours = true
      // fixes null issue
      const day = { data: null }
      const item = { data: null }
      for (day.data of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        for (item.data in this.localUser.operating_hours[day.data]) {
          if (!this.localUser.operating_hours[day.data][item.data].open) {
            this.localUser.operating_hours[day.data][item.data].open = ''
          }

          if (!this.localUser.operating_hours[day.data][item.data].close) {
            this.localUser.operating_hours[day.data][item.data].close = ''
          }

          if (this.localUser.operating_hours[day.data][item.data].isOpen && this.localUser.operating_hours[day.data][item.data].open === '') {
            this.localUser.operating_hours[day.data][item.data].open = '24hrs'
          }

          if (this.localUser.operating_hours[day.data][item.data].isOpen && this.localUser.operating_hours[day.data][item.data].close === '') {
            this.localUser.operating_hours[day.data][item.data].close = '24hrs'
          }

          if (this.localUser.operating_hours[day.data][item.data].isOpen && this.localUser.operating_hours[day.data][item.data].open !== '24hrs' && this.localUser.operating_hours[day.data][item.data].close === '24hrs') {
            this.localUser.operating_hours[day.data][item.data].open = '24hrs'
          }
        }
      }

      // fixes the order of weekdays
      this.localUser.operating_hours = {
        monday: this.localUser.operating_hours.monday,
        tuesday: this.localUser.operating_hours.tuesday,
        wednesday: this.localUser.operating_hours.wednesday,
        thursday: this.localUser.operating_hours.thursday,
        friday: this.localUser.operating_hours.friday,
        saturday: this.localUser.operating_hours.saturday,
        sunday: this.localUser.operating_hours.sunday
      }

      this.loadingOperatingHours = false
    },

    setupUser () {
      if (typeof this.localUser.operating_hours === 'string') {
        this.localUser.operating_hours = JSON.parse(this.localUser.operating_hours)

        this.fixOperatingHours()
      }

      if (typeof this.localUser.operating_states_limit === 'string') {
        this.localUser.operating_states_limit = JSON.parse(this.localUser.operating_states_limit)
      }

      if (typeof this.localUser.operating_area_codes_limit === 'string') {
        this.localUser.operating_area_codes_limit = JSON.parse(this.localUser.operating_area_codes_limit)
      }

      if (typeof this.localUser.sip_details === 'string') {
        this.localUser.sip_details = JSON.parse(this.localUser.sip_details)
      }

      if (typeof this.localUser.reminders_options === 'string') {
        this.localUser.reminders_options = JSON.parse(this.localUser.reminders_options)
      }

      if (this.localUser.reminders_options === null) {
        this.localUser.reminders_options = [
          'now',
          'one_minute_before',
          'fifteen_minutes_before',
          'one_hour_before',
          'one_day_before'
        ]
      }

      if (!this.localUser.operating_states_limit || this.localUser.operating_states_limit.length === 0) {
        this.localUser.operating_states_limit = {
          us: [],
          ca: []
        }
      }

      if (!this.localUser.operating_area_codes_limit || this.localUser.operating_area_codes_limit.length === 0) {
        this.localUser.operating_area_codes_limit = []
      }

      if (typeof this.localUser.observing_campaigns === 'string') {
        this.localUser.observing_campaigns = JSON.parse(this.localUser.observing_campaigns)
      }

      if (!this.localUser.observing_campaigns) {
        this.localUser.observing_campaigns = []
      }

      if (this.localUser.phone_number && this.localUser.answer_by === AnswerTypes.BY_BROWSER) {
        this.localUser.phone_number_as_backup = true
      }

      if (this.localUser.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && this.localUser.default_outbound_campaign_id) {
        this.localUser.outbound_calling_selector = 1
      } else if (this.localUser.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.localUser.outbound_calling_selector = 3
      } else {
        this.localUser.outbound_calling_selector = 2
      }

      this.localUser.selected_campaign_ids = []
      this.localUser.selected_user_ids = []

      if (this.localUser.line_access_limit && this.localUser.accessible_campaigns && this.localUser.accessible_campaigns.length > 0) {
        this.localUser.selected_campaign_ids = this.localUser.accessible_campaigns
      }

      if (this.localUser.user_access_limit && this.localUser.accessible_users && this.localUser.accessible_users.length > 0) {
        this.localUser.selected_user_ids = this.localUser.accessible_users
      }

      this.localUser.ring_group_ids = _.uniq(this.localUser.ring_group_ids)
      this.localUser.password = ''
      this.localUser.password_confirmation = ''

      this.setUserClone(_.cloneDeep(this.localUser))
      this.setUser(_.cloneDeep(this.userClone))
    }

  },

  watch: {
    '$route.hash': function () {
      if (['Settings Tab'].includes(this.$route.name) && this.$route.hash) {
        this.$nextTick(function () {
          const targetEl = document.querySelector(this.$route.hash + '-container')

          if (!targetEl) {
            return
          }

          targetEl.classList.add('highlighted')

          setTimeout(function () {
            targetEl.classList.remove('highlighted')
          }, 2000)

          const containerEl = document.querySelector('.settings-content-wrapper')
          containerEl.scrollTop = targetEl.offsetTop - 10
        })
      }
    }
  }
}
