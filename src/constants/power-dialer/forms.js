export const SESSION_SETTINGS_ALL_FORMS = [
  {
    name: 'basics',
    label: 'Basics',
    children: [
      {
        name: 'line',
        label: 'Line',
        type: 'select',
        items: []
      },
      {
        name: 'skipOutsideDaytimeHours',
        label: 'Skip Outside Daytime Hours',
        type: 'toggle',
        items: []
      },
      {
        name: 'warmupPeriod',
        label: 'Warmup Period',
        type: 'select',
        items: []
      },
      {
        name: 'phoneScript',
        label: 'Phone Script',
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
        name: 'setCallDispostionShortcuts',
        label: 'Set Call Disposition Shortcuts',
        type: 'select',
        items: []
      },
      {
        name: 'setContactDispostionShortcuts',
        label: 'Set Contact Disposition Shortcuts',
        type: 'select',
        items: []
      },
      {
        name: 'setSessionMetrics',
        label: 'Set Session Metrics',
        type: 'select',
        items: []
      },
      {
        name: 'setVmDropShortcuts',
        label: 'Set VM Drop Shortcuts',
        type: 'select',
        items: []
      }
    ]
  }
]
