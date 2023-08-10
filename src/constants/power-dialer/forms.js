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
        type: 'toggle',
        items: []
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
        name: 'vm_drop_id',
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
  user_id: null,
  warmup_period_in_seconds: 0,
  order: 1
}
