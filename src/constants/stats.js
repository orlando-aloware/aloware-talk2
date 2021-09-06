export const METRIC_OPTIONS = [
  {
    label: 'Contact Dispositions',
    options: [
      { value: 'Active', text: 'Active' },
      { value: 'Attempted to Contact', text: 'Attempted to Contact' },
      { value: 'Bad Timing', text: 'Bad Timing' },
      { value: 'Connected', text: 'Connected' },
      { value: 'In Progress', text: 'In Progress' },
      { value: 'New', text: 'New' },
      { value: 'Open', text: 'Open' },
      { value: 'Open Deal', text: 'Open Deal' },
      { value: 'Unqualified', text: 'Unqualified' }
    ]
  },
  {
    label: 'Type of Calls',
    options: [
      { value: 'All Activity', text: 'All Activity' },
      { value: 'All Calls', text: 'All Calls' },
      { value: 'All Qualified Calls', text: 'All Qualified Calls' },
      { value: 'All Missed ', text: 'All Missed Calls' },
      { value: 'All Abandoned Calls', text: 'All Abandoned Calls' },
      { value: 'All Voicemails', text: 'All Voicemails' },
      { value: 'Inbound Calls', text: 'Inbound Calls' },
      { value: 'Qualified Inbound Calls', text: 'Qualified Inbound Calls' },
      { value: 'Outbound Calls', text: 'Outbound Calls' },
      { value: 'Qualified Outbound Calls', text: 'Qualified Outbound Calls' }
    ]
  },
  {
    label: 'Call Metadata',
    options: [
      { value: 'Average Duration', text: 'Average Duration' },
      { value: 'Total Duration', text: 'Total Duration' },
      { value: 'Average Talk Time', text: 'Average Talk Time' },
      { value: 'Total Talk Time', text: 'Total Talk Time' },
      { value: 'Average Wait Time', text: 'Average Wait Time' },
      { value: 'Total Wait Time', text: 'Total Wait Time' }
    ]
  },
  {
    label: 'Types of SMS',
    options: [
      { value: 'All SMS', text: 'All SMS' },
      { value: 'Inbound SMS', text: 'Inbound SMS' },
      { value: 'Outbound SMS', text: 'Outbound SMS' }
    ]
  },
  {
    label: 'Types of Email',
    options: [
      { value: 'All Email', text: 'All Email' },
      { value: 'Inbound Email', text: 'Inbound Email' },
      { value: 'Outbound Email', text: 'Outbound Email' }
    ]
  },
  {
    label: 'Other Communication Types',
    options: [
      { value: 'All Faxes', text: 'All Faxes' },
      { value: 'Inbound Faxes', text: 'Inbound Faxes' },
      { value: 'Outbound Faxes', text: 'Outbound Faxes' },
      { value: 'Appointments', text: 'Appointments' },
      { value: 'Reminders', text: 'Reminders' }
    ]
  },
  {
    label: 'Manual-Defined Agent Statuses',
    options: [
      { value: 'Available', text: 'Available' },
      { value: 'Busy', text: 'Busy' },
      { value: 'Offline', text: 'Offline' },
      { value: 'On Break', text: 'On Break' }
    ]
  },
  {
    label: 'System-Defined Agent Statuses',
    options: [
      { value: 'On Call', text: 'On Call' },
      { value: 'Ringing', text: 'Ringing' },
      { value: 'Wrap-Up', text: 'Wrap-Up' }
    ]
  }
]

export const METRIC_OPTIONS_2 = [
  { disable: true, value: null, text: 'Contact Dispositions' },
  { disable: false, value: 'Active', text: 'Active' },
  { disable: false, value: 'Attempted to Contact', text: 'Attempted to Contact' },
  { disable: false, value: null, text: 'Bad Timing' },
  { disable: false, value: null, text: 'Connected' },
  { disable: false, value: null, text: 'In Progress' },
  { disable: false, value: null, text: 'New' },
  { disable: false, value: null, text: 'Open' },
  { disable: false, value: null, text: 'Open Deal' },
  { disable: false, value: null, text: 'Unqualified' },
  { disable: true, value: null, text: 'Type of Calls' },
  { disable: false, value: null, text: 'All Activity' },
  { disable: false, value: null, text: 'All Calls' },
  { disable: false, value: null, text: 'All Qualified Calls' },
  { disable: false, value: null, text: 'All Missed Calls' },
  { disable: false, value: null, text: 'All Abandoned Calls' },
  { disable: false, value: null, text: 'All Voicemails' },
  { disable: false, value: null, text: 'Inbound Calls' },
  { disable: false, value: null, text: 'Qualified Inbound Calls' },
  { disable: false, value: null, text: 'Outbound Calls' },
  { disable: false, value: null, text: 'Qualified Outbound Calls' },
  { disable: true, value: null, text: 'Call Metadata' },
  { disable: false, value: null, text: 'Average Duration' },
  { disable: false, value: null, text: 'Total Duration' },
  { disable: false, value: null, text: 'Average Talk Time' },
  { disable: false, value: null, text: 'Total Talk Time' },
  { disable: false, value: null, text: 'Average Wait Time' },
  { disable: false, value: null, text: 'Total Wait Time' },
  { disable: true, value: null, text: 'Types of SMS' },
  { disable: false, value: null, text: 'All SMS' },
  { disable: false, value: null, text: 'Inbound SMS' },
  { disable: false, value: null, text: 'Outbound SMS' },
  { disable: true, value: null, text: 'All Email' },
  { disable: false, value: null, text: 'All Email' },
  { disable: false, value: null, text: 'Inbound Email' },
  { disable: false, value: null, text: 'Outbound Email' },
  { disable: true, value: null, text: 'Other Communication Types' },
  { disable: false, value: null, text: 'All Faxes' },
  { disable: false, value: null, text: 'Inbound Faxes' },
  { disable: false, value: null, text: 'Outbound Faxes' },
  { disable: false, value: null, text: 'Appointments' },
  { disable: false, value: null, text: 'Reminders' },
  { disable: true, value: null, text: 'Manual-Defined Agent Statuses' },
  { disable: false, value: null, text: 'Available' },
  { disable: false, value: null, text: 'Busy' },
  { disable: false, value: null, text: 'Offline' },
  { disable: false, value: null, text: 'On Break' },
  { disable: true, value: null, text: 'System-Defined Agent Statuses' },
  { disable: false, value: null, text: 'On Call' },
  { disable: false, value: null, text: 'Ringing' },
  { disable: false, value: null, text: 'Wrap-Up' }
]

export const METRIC_OPTIONS_COLORS = [
  { value: 'positive', color: 'primary', text: 'Success' },
  { value: 'negative', color: 'danger', text: 'Warning' },
  { value: null, color: 'black', text: 'No Color' }
]
