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
      cancelToken: null,
      source: null,
      ready: false,
      filter: {}
    }
  },

  created () {
    this.cancelToken = this.$axios.CancelToken
    this.source = this.cancelToken.source()
    this.filter = JSON.parse(JSON.stringify(DEFAULT_FILTER))
  },

  methods: {
    applyReportFilters () {
      this.filter.page = 1

      if (typeof this.getCommunications === 'function') {
        this.getCommunications()
      }
    }
  },

  watch: {
    filter: {
      deep: true,
      handler () {
        this.applyReportFilters()
      }
    }
  }
}
