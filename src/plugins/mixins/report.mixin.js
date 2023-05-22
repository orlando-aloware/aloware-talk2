import _ from 'lodash'
import * as DncFilterOptions from 'src/constants/dnc-filter-options'

const DEFAULT_FILTER = {
  from_date: null,
  date_field: 'last_engagement_at',
  to_date: null,
  type: 'all',
  transfer_type: null,
  direction: 'all',
  report_type: 'date_v_campaign',
  chart_period: 'day',
  answer_status: 'all',
  export_type: 'json',
  min_talk_time: 0,
  campaign_id: null,
  ring_group_id: null,
  user_id: null,
  workflow_id: null,
  page: 1,
  per_page: 20,
  checked_table_fields: null,
  first_time_only: 0,
  untagged_only: 0,
  exclude_automated_communications: 0,
  creator_type: null,
  has_untagged_call: 0,
  not_disposed: 0,
  is_blocked: 0,
  dnc_option: DncFilterOptions.ALL_CONTACTS,
  has_unread: 0,
  is_new_lead: 0,
  has_scheduled_messages: 0,
  no_scheduled_messages: 0,
  enrolled_in_sequence: 0,
  not_enrolled_in_sequence: 0,
  callback_status: null,
  unassigned_leads: 0,
  should_follow_the_sun: 0,
  not_contacted: 0,
  not_contacted_hours: null,
  not_responded: 0,
  not_responded_hours: null,
  responded: 0,
  responded_hours: null,
  text_authorized: 0,
  lrn_types: [],
  has_appointments: 0,
  has_reminders: 0,
  event_range: null,
  intake_source: [],
  lead_source: [],
  tags: [],
  doesnt_have_tags: [],
  disposition_statuses: [],
  no_disposition_statuses: [],
  call_dispositions: [],
  campaigns: [],
  workflows: [],
  broadcasts: [],
  ring_groups: [],
  incoming_numbers: [],
  users: [],
  owners: [],
  timezone: window.timezone,
  contact_country: '',
  contact_timezone: '',
  changed: false,
  states_limit: {
    us: [],
    ca: []
  },
  initial_line_only: 0,
  search_text: '',
  search_fields: [],
  comm_sort_by: null,
  outbound_call_count_start: null,
  outbound_call_count_end: null,
  transcription_keyword: null,
  transcription_category: null
}

// default mixin for all graphs and tables
export default {
  data () {
    return {
      CancelToken: null,
      source: null,
      countSource: null,
      is_done: false,
      report_is_filter_changed: false,
      report_can_reset: false,
      is_fired_report_event: false,
      prevent_first_load: true,
      filter: {
        from_date: null,
        date_field: 'last_engagement_at',
        to_date: null,
        type: 'all',
        transfer_type: null,
        direction: 'all',
        report_type: 'date_v_campaign',
        chart_period: 'day',
        answer_status: 'all',
        export_type: 'json',
        min_talk_time: 0,
        campaign_id: null,
        ring_group_id: null,
        user_id: null,
        workflow_id: null,
        page: 1,
        per_page: 20,
        checked_table_fields: null,
        first_time_only: 0,
        untagged_only: 0,
        exclude_automated_communications: 0,
        creator_type: null,
        has_untagged_call: 0,
        not_disposed: 0,
        is_blocked: 0,
        dnc_option: DncFilterOptions.ALL_CONTACTS,
        has_unread: 0,
        is_new_lead: 0,
        unassigned_leads: 0,
        should_follow_the_sun: 0,
        not_contacted: 0,
        not_contacted_hours: null,
        not_responded: 0,
        not_responded_hours: null,
        responded: 0,
        has_scheduled_messages: 0,
        no_scheduled_messages: 0,
        enrolled_in_sequence: 0,
        not_enrolled_in_sequence: 0,
        responded_hours: null,
        text_authorized: 0,
        lrn_types: [],
        has_appointments: 0,
        has_reminders: 0,
        event_range: null,
        callback_status: null,
        intake_source: [],
        lead_source: [],
        tags: [],
        doesnt_have_tags: [],
        disposition_statuses: [],
        no_disposition_statuses: [],
        call_dispositions: [],
        campaigns: [],
        workflows: [],
        broadcasts: [],
        ring_groups: [],
        incoming_numbers: [],
        users: [],
        owners: [],
        timezone: window.timezone,
        contact_country: '',
        contact_timezone: '',
        changed: false,
        states_limit: {
          us: [],
          ca: []
        },
        initial_line_only: 0,
        search_text: '',
        search_fields: [],
        comm_sort_by: null,
        outbound_call_count_start: null,
        outbound_call_count_end: null,
        transcription_keyword: null,
        transcription_category: null
      }
    }
  },

  created () {
    this.CancelToken = this.$axios.CancelToken
    this.source = this.CancelToken.source()
    this.countSource = this.CancelToken.source()
  },

  mounted () {
    // don't change date range filters on report page, sequence tasks and broadcast tasks
    if (
      !['Reports', 'Sequence Tasks', 'Broadcast Tasks'].includes(
        this.$route.name
      ) &&
      this.is_first_load &&
      !this.$route.query.from_date
    ) {
      this.resetFilters()
      this.$VueEvent.fire('reset_date_range')
    }

    this.filter.campaign_id = this.campaign_id
    this.filter.workflow_id = this.workflow_id
    this.filter.ring_group_id = this.ring_group_id
    this.filter.user_id = this.user_id
    this.filter.broadcast_id = this.broadcast_id
    if (this.tag_id) {
      this.filter.tags = [this.tag_id]
    }
  },

  methods: {
    applyReportFilters () {
      this.filter.page = 1
      // for reports-specific filter change(s), we no longer need to
      // call getCommunications. the report components will
      // call it during the loading process
      let isReport = this.$route.path.includes('/reports/')
      if (this.report_type && isReport) {
        this.$emit('reportFiltersChanged')
        return
      }

      // we should make sure that this function exist on each vue component scope
      if (typeof this.getCommunications === 'function') {
        // get communications
        this.getCommunications()
      }
      // we should make sure that this function exist on each vue component scope
      if (typeof this.getTranscriptionReportingPanelData === 'function') {
        // get transcription reporting panel
        this.getTranscriptionReportingPanelData()
      }

      // we should make sure that this function exist on each vue component scope
      if (typeof this.fetchSentimentCharts === 'function') {
        // get transcription reporting panel
        this.fetchSentimentCharts()
      }

      // we should make sure that this function exist on each vue component scope
      if (typeof this.fetchHistoryTable === 'function') {
        // get transcription reporting panel
        this.setTranscriptionPage(1)
        this.fetchHistoryTable()
      }
    },

    resetFilters () {
      const campaignId = this.filter.campaign_id
      const userId = this.filter.user_id
      const workflowId = this.filter.workflow_id
      // a new filter object, not a reference from the default state filter
      this.filter = JSON.parse(JSON.stringify(DEFAULT_FILTER))
      if (campaignId) {
        this.filter.campaign_id = campaignId
      }
      if (workflowId) {
        this.filter.workflow_id = workflowId
      }
      if (userId) {
        this.filter.user_id = userId
      }
      this.filter.changed = false
    }
  },

  watch: {
    'filter.from_date': function (newValue, oldValue) {
      this.applyReportFilters()
    },

    'filter.to_date': function (newValue, oldValue) {
      this.applyReportFilters()
    },

    'filter.direction': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.answer_status': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.type': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.transfer_type': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.min_talk_time': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.tags': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.call_dispositions': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.first_time_only': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.untagged_only': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.exclude_automated_communications': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.creator_type': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.campaigns': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.workflows': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.broadcasts': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.ring_groups': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.incoming_numbers': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.users': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.owners': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },
    'filter.callback_status': function (newValue, oldValue) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.applyReportFilters()
      }
    },

    'filter.transcription_keyword': function (newValue, oldValue) {
      if (!_.isEqual(oldValue, newValue)) {
        this.applyReportFilters()
      }
    },

    'filter.transcription_category': function (newValue, oldValue) {
      if (!_.isEqual(oldValue, newValue)) {
        this.applyReportFilters()
      }
    }
  }
}
