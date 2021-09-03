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
  { title: true, value: null, text: 'Contact Dispositions' },
  { title: false, value: 'Active', text: 'Active' },
  { title: false, value: 'Attempted to Contact', text: 'Attempted to Contact' },
  { title: false, value: null, text: 'Bad Timing' },
  { title: false, value: null, text: 'Connected' },
  { title: false, value: null, text: 'In Progress' },
  { title: false, value: null, text: 'New' },
  { title: false, value: null, text: 'Open' },
  { title: false, value: null, text: 'Open Deal' },
  { title: false, value: null, text: 'Unqualified' },
  { title: true, value: null, text: 'Type of Calls' },
  { title: false, value: null, text: 'All Activity' },
  { title: false, value: null, text: 'All Calls' },
  { title: false, value: null, text: 'All Qualified Calls' },
  { title: false, value: null, text: 'All Missed Calls' },
  { title: false, value: null, text: 'All Abandoned Calls' },
  { title: false, value: null, text: 'All Voicemails' },
  { title: false, value: null, text: 'Inbound Calls' },
  { title: false, value: null, text: 'Qualified Inbound Calls' },
  { title: false, value: null, text: 'Outbound Calls' },
  { title: false, value: null, text: 'Qualified Outbound Calls' },
  { title: true, value: null, text: 'Call Metadata' },
  { title: false, value: null, text: 'Average Duration' },
  { title: false, value: null, text: 'Total Duration' },
  { title: false, value: null, text: 'Average Talk Time' },
  { title: false, value: null, text: 'Total Talk Time' },
  { title: false, value: null, text: 'Average Wait Time' },
  { title: false, value: null, text: 'Total Wait Time' },
  { title: true, value: null, text: 'Types of SMS' },
  { title: false, value: null, text: 'All SMS' },
  { title: false, value: null, text: 'Inbound SMS' },
  { title: false, value: null, text: 'Outbound SMS' },
  { title: true, value: null, text: 'All Email' },
  { title: false, value: null, text: 'All Email' },
  { title: false, value: null, text: 'Inbound Email' },
  { title: false, value: null, text: 'Outbound Email' },
  { title: true, value: null, text: 'Other Communication Types' },
  { title: false, value: null, text: 'All Faxes' },
  { title: false, value: null, text: 'Inbound Faxes' },
  { title: false, value: null, text: 'Outbound Faxes' },
  { title: false, value: null, text: 'Appointments' },
  { title: false, value: null, text: 'Reminders' },
  { title: true, value: null, text: 'Manual-Defined Agent Statuses' },
  { title: false, value: null, text: 'Available' },
  { title: false, value: null, text: 'Busy' },
  { title: false, value: null, text: 'Offline' },
  { title: false, value: null, text: 'On Break' },
  { title: true, value: null, text: 'System-Defined Agent Statuses' },
  { title: false, value: null, text: 'On Call' },
  { title: false, value: null, text: 'Ringing' },
  { title: false, value: null, text: 'Wrap-Up' }
]
