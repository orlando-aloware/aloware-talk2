export const SESSION_SETTINGS_ALL_FORMS = [
  {
    name: 'basics',
    label: 'Basics',
    children: [
      {
        name: 'campaign_id',
        label: 'Line',
        type: 'select',
        items: []
      },
      {
        name: 'skip_outside_daytime_hours',
        label: 'Skip Outside Daytime Hours',
        description: 'You can skip contacts that are in a timezone outside the daytime hours.',
        type: 'toggle',
        items: [],
        containerClass: 'col-12 mb-3 d-flex items-center justify-between',
        labelClass: 'font-weight-bold'
      },
      {
        name: 'force_redial',
        label: 'Require Agent Redial',
        description: 'You can require that the agents redial a contact when they doesn\'t pick the call up.',
        type: 'toggle',
        items: [],
        containerClass: 'col-12 mb-3 d-flex items-center justify-between',
        labelClass: 'font-weight-bold'
      },
      {
        name: 'warmup_period_in_seconds',
        label: 'Warmup Period',
        type: 'select',
        items: []
      },
      {
        name: 'script_id',
        label: 'Phone Script',
        type: 'select',
        items: []
      },
      {
        name: 'order',
        label: 'Order by',
        type: 'select',
        items: []
      }
    ]
  },
  {
    name: 'customizations',
    label: 'Customizations',
    children: [
      {
        name: 'call_disposition_ids',
        label: 'Set Call Disposition Shortcuts',
        type: 'select',
        items: []
      },
      {
        name: 'contact_disposition_ids',
        label: 'Set Contact Disposition Shortcuts',
        type: 'select',
        items: []
      },
      {
        name: 'metric_options',
        label: 'Set Session Metrics',
        type: 'select',
        items: []
      },
      {
        name: 'vm_drop_ids',
        label: 'Set VM Drop Shortcuts',
        type: 'select',
        items: []
      }
    ]
  }
]

export const DEFAULT_SETTING_VALUES = {
  call_disposition_ids: [],
  campaign_id: null,
  company_id: null,
  contact_disposition_ids: [],
  is_company_scope: 0,
  metric_options: [],
  name: null,
  script_id: null,
  skip_outside_daytime_hours: 1,
  force_redial: 0,
  user_id: null,
  warmup_period_in_seconds: 0,
  order: 1,
  vm_drop_ids: []
}
