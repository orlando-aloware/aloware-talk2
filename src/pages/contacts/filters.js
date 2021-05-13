export const createContactFilters = (params = {}) => {
  return {
    date_field: 'last_engagement_at',
    type: 'all',
    direction: 'all',
    report_type: 'date_v_campaign',
    chart_period: 'day',
    answer_status: 'all',
    export_type: 'json',
    min_talk_time: '0',
    page: '1',
    per_page: '20',
    first_time_only: '0',
    untagged_only: '0',
    exclude_automated_communications: '0',
    has_untagged_call: '0',
    is_blocked: '0',
    is_dnc: '0',
    has_unread: '0',
    is_new_lead: '0',
    unassigned_leads: '0',
    should_follow_the_sun: '0',
    not_contacted: '0',
    not_responded: '0',
    responded: '0',
    text_authorized: '0',
    has_appointments: '0',
    has_reminders: '0',
    timezone: 'Asia/Manila',
    contact_country: '',
    contact_timezone: '',
    changed: 'true',
    states_limit: '{"us":[],"ca":[]}',
    initial_line_only: '0',
    search_text: '',
    search_fields: ['name', 'phone_number', 'email'],
    ...params
  }
}

export const createContactCountFilters = (_params = {}) => {
  return `?date_field=last_engagement_at&type=all&direction=all&report_type=date_v_campaign&chart_period=day&answer_status=all&export_type=json&min_talk_time=0&page=1&per_page=20&first_time_only=0&untagged_only=0&exclude_automated_communications=0&has_untagged_call=0&is_blocked=0&is_dnc=0&has_unread=0&is_new_lead=0&unassigned_leads=0&should_follow_the_sun=0&not_contacted=0&not_responded=0&responded=0&text_authorized=0&has_appointments=0&has_reminders=0&timezone=Asia%2FManila&contact_country=&contact_timezone=&changed=false&states_limit=%7B%22us%22:[],%22ca%22:[]%7D&initial_line_only=0&search_text=&search_fields[]=name&search_fields[]=phone_number&search_fields[]=email`
}
