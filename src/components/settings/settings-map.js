const SettingsMap = {
  'profile_settings': {
    title: 'Profile Settings',
    description: 'The users profile settings.',
    route: '/settings/profile',
    visible: true
  },
  'profile_settings_name': {
    title: 'Name',
    description: 'The name of the user.',
    route: '/settings/profile',
    hash_keyword: 'name',
    visible: true
  },
  'profile_settings_email': {
    title: 'Email',
    description: 'The user\'s email address.',
    route: '/settings/profile',
    hash_keyword: 'email',
    visible: true
  },
  'profile_settings_description': {
    title: 'Description',
    description: 'The user\'s brief description.',
    route: '/settings/profile',
    hash_keyword: 'description',
    visible: true
  },
  'profile_settings_password': {
    title: 'Password',
    description: 'The user\'s password.',
    route: '/settings/profile#password',
    visible: true
  },
  'role': {
    title: 'Role',
    description: 'The users role.',
    route: '/settings/profile',
    hash_keyword: 'role',
    visible: true
  },
  'answer_type': {
    title: 'Answer Type',
    description: 'Choose how you answer calls.',
    route: '/settings/profile',
    hash_keyword: 'answer-type',
    visible: true
  },
  'backup_routing': {
    title: 'Backup Routing',
    description: 'Call routing will check if the user is online. If you check this, the backup phone number will ring if your not available.',
    route: '/settings/profile',
    hash_keyword: 'backup-routing',
    visible: true
  },
  'backup_phone_number': {
    title: 'Backup Phone Number',
    description: 'Your backup phone number.',
    route: '/settings/profile',
    hash_keyword: 'backup-phone-number',
    visible: true
  },
  'text_message_handling': {
    title: 'Text Message Handling',
    description: 'If you don\'t want this user to be assigned to text messages please uncheck "Answers text messages."',
    route: '/settings/profile',
    hash_keyword: 'text-message-handling',
    visible: true
  },
  'respect_agent_status': {
    title: 'Respect Agent Availability Status',
    description: 'Respect Agent Availability Status',
    route: '/settings/profile',
    hash_keyword: 'respect-agent-status',
    visible: true
  },
  'can_change_contact_ownership': {
    title: 'Change Contact Ownership',
    description: 'If user is allowed to change contact ownership.',
    route: '/settings/profile',
    hash_keyword: 'change-contact-ownership',
    visible: true
  },
  'can_modify_contact_ring_groups': {
    title: 'Allow Contact Ring Groups Modification',
    description: 'If user is allowed to modify contact ring groups.',
    route: '/settings/profile',
    hash_keyword: 'can-modify-contact-ring-group',
    visible: true
  },
  'can_barge_and_whisper_on_call': {
    title: 'Allow Call Barge and Whisper',
    description: 'If user is allowed to barge and whisper on call.',
    route: '/settings/profile',
    hash_keyword: 'can-barge-and-whisper-on-a-call',
    visible: true
  },
  'can_access_communications_logs': {
    title: 'Allow Access Communications Logs',
    description: 'If user is allowed to access communications logs.',
    route: '/settings/profile',
    hash_keyword: 'can-access-communications-logs',
    visible: true
  },
  'can_access_contacts': {
    title: 'Allow Access Contacts',
    description: 'If user is allowed to access contacts.',
    route: '/settings/profile',
    hash_keyword: 'can-access-contacts',
    visible: true
  },
  'campaign_id': {
    title: 'Personal Line',
    description: 'User\'s personal line',
    route: '/settings/profile',
    hash_keyword: 'personal-line',
    visible: true
  },
  'has_broadcast_access': {
    title: 'Can Broadcast',
    description: 'If user is allowed to create and update broadcast.',
    route: '/settings/profile',
    hash_keyword: 'can-broadcast',
    visible: true
  },
  'can_delete_contact': {
    title: 'Delete Contact',
    description: 'If user is allowed to delete a contact.',
    route: '/settings/profile',
    hash_keyword: 'delete-contact',
    visible: true
  },

  // VISIBILITY SETTINGS
  'contacts_visibility': {
    title: 'Contacts Visibility',
    description: 'Contacts visibility setting.',
    route: '/settings/visibility',
    hash_keyword: 'contacts-visibility',
    visible: true,
    tag: 'visibility'
  },
  'communications_visibility': {
    title: 'Communications Visibility',
    description: 'Communications visibility setting.',
    route: '/settings/visibility',
    hash_keyword: 'communications-visibility',
    visible: true,
    tag: 'visibility'
  },
  'line_access_limit': {
    title: 'Line Visibility Limit',
    description: 'Define what lines user has access to.',
    route: '/settings/visibility',
    hash_keyword: 'line-access-limit',
    visible: true,
    tag: 'visibility'
  },
  'read_only_access': {
    title: 'Reporter Access',
    description: 'Users with reporter access can only see the reports and they can not interact with the contacts or make calls.',
    route: '/settings/visibility',
    hash_keyword: 'read-only-access',
    visible: true,
    tag: 'visibility'
  },
  'user_access_limit': {
    title: 'User Access Limit',
    description: 'Limit visibility of other users',
    route: '/settings/visibility',
    hash_keyword: 'user-access-limit',
    visible: true,
    tag: 'visibility'
  },

  // PERSONALIZATION SETTINGS
  'go_to_available_after_login': {
    title: 'Available by Default, But Allow Manual Changes',
    description: 'Put user on available status after login and disable idle mode detection (auto offline).',
    route: '/settings/personalization',
    hash_keyword: 'available-after-login',
    visible: true
  },
  'wrap_up_seconds': {
    title: 'Wrap Up Duration',
    description: 'Stay on wrap up for this amount of time before you go back to available for the next call.',
    route: '/settings/personalization',
    hash_keyword: 'wrap-up-duration',
    visible: true
  },
  'url_shortener_enabled': {
    title: 'Enable URL Shortener',
    description: 'Enable URL Shortener for user',
    route: '/settings/profile',
    hash_keyword: 'enable-url-shortener',
    visible: true
  },

  // INBOUND CALL SETTINGS
  'extension': {
    title: 'Extension',
    description: 'An extension is a unique company-wide identifier for a user.',
    route: '/settings/inbound-call',
    hash_keyword: 'extension',
    visible: true
  },
  'operating_hours': {
    title: 'Working Hours',
    description: 'This setting sets the working hours for this user.',
    route: '/settings/inbound-call',
    hash_keyword: 'working-hours',
    visible: true
  },
  'missed_calls_settings': {
    title: 'Personal Voicemail',
    description: 'Determine action when a direct call is missed.',
    route: '/settings/inbound-call',
    hash_keyword: 'personal-voicemail',
    visible: true
  },
  'operating_states_limit': {
    title: 'Operating States',
    description: 'Do not enable geo-routing for this user.',
    route: '/settings/inbound-call',
    hash_keyword: 'operating-states-limit',
    visible: true
  },
  'operating_area_codes_limit': {
    title: 'Operating Area Codes',
    description: 'Customize the area codes that you operate on.',
    route: '/settings/inbound-call',
    hash_keyword: 'operating-area-codes-limit',
    visible: true
  },
  'should_message_if_missed': {
    title: 'Follow Up',
    description: 'Send a message to the attempted agent who missed a call.',
    route: '/settings/inbound-call',
    hash_keyword: 'follow-up',
    visible: true
  },
  'missed_call_message': {
    title: 'Missed Call Message',
    description: 'A message to send when a call is missed.',
    route: '/settings/inbound-call',
    hash_keyword: 'missed-call-message',
    visible: true
  },
  'should_message_caller_if_completed': {
    title: 'Call Notification',
    description: 'Notify caller with a text message.',
    route: '/settings/inbound-call',
    hash_keyword: 'should-message-caller-if-completed',
    visible: true
  },
  'completed_call_message_caller': {
    title: 'Completed Call Message',
    description: 'A message to send when a call is completed.',
    route: '/settings/inbound-call',
    hash_keyword: 'completed-call-message',
    visible: true
  },

  // OUTBOUND CALL SETTINGS
  'outbound_calling_selector': {
    title: 'Caller ID',
    description: 'Decide what line is used when this user makes an outbound call.',
    route: '/settings/outbound-call',
    hash_keyword: 'outbound-calling-selector',
    visible: true
  },
  'default_outbound_campaign_id': {
    title: 'Outbound Line',
    description: 'The lines to get notified from.',
    route: '/settings/outbound-call',
    hash_keyword: 'outbound-calling-selector',
    visible: true
  },
  'outbound_call_recording_mode': {
    title: 'Call Recordings',
    description: 'Determine outbound call recording.',
    route: '/settings/outbound-call',
    hash_keyword: 'outbound-call-recording',
    visible: true
  },
  'enabled_two_legged_outbound': {
    title: 'Two Legged Outbound Call (Beta)',
    description: 'Determine if we call your contacts with your secondary number.',
    route: '/settings/outbound-call',
    hash_keyword: 'two-legged-outbound-call',
    visible: true
  },
  'secondary_phone_number': {
    title: 'Secondary Phone Number',
    description: 'The phone number to call when two legged outbound is enabled.',
    route: '/settings/outbound-call',
    hash_keyword: 'secondary-phone-number',
    visible: true
  },
  'vm_drop_library': {
    title: 'Voicemail Drop Library',
    description: 'Build your voicemail drop library here. When using the PowerDialer or calling a lot of leads manually, you can use voicemail drop to put a voicemail after the beep without being on the call.',
    route: '/settings/outbound-call',
    hash_keyword: 'voicemail-drop-library',
    visible: true
  },

  // NOTIFICATION SETTINGS
  'my_calls': {
    title: 'Communication Notification - Calls',
    description: 'Call to personal line or to the ring groups this user belongs to.',
    route: '/settings/notification',
    hash_keyword: 'call-to-line-or-ring-groups',
    visible: true
  },
  'my_texts': {
    title: 'Communication Notification - Text Message',
    description: 'Send message to personal line or to the ring groups this user belongs to.',
    route: '/settings/notification',
    hash_keyword: 'message-to-line-or-ring-groups',
    visible: true
  },
  'my_voicemail': {
    title: 'Communication Notification - Voicemail',
    description: 'Voicemail to personal line or to the ring groups this user belongs to.',
    route: '/settings/notification',
    hash_keyword: 'voicemail-to-line-or-ring-groups',
    visible: true
  },
  'my_faxes': {
    title: 'Communication Notification - Fax',
    description: 'Fax to personal line.',
    route: '/settings/notification',
    hash_keyword: 'fax-to-personal-line',
    visible: true
  },
  'my_mentions': {
    title: 'Communication Notification - Mentions',
    description: 'Notify when a user is mentioned.',
    route: '/settings/notification',
    hash_keyword: 'notify-when-mentioned',
    visible: true
  },
  'my_contacts': {
    title: 'Communication Notification - Contacts',
    description: 'Notify when a contact is assigned to this user.',
    route: '/settings/notification',
    hash_keyword: 'notify-when-contact-is-assigned',
    visible: true
  },
  'my_appointments': {
    title: 'Communication Notification - Appointments',
    description: 'Notify when an appointment is assigned to this user.',
    route: '/settings/notification',
    hash_keyword: 'notify-when-appointment-is-assigned',
    visible: true
  },
  'my_reminders': {
    title: 'Communication Notification - Reminders',
    description: 'Notify when a reminder is assigned to this user.',
    route: '/settings/notification',
    hash_keyword: 'notify-when-reminder-is-assigned',
    visible: true
  },
  'reminders_options': {
    title: 'Event Notifications',
    description: 'Notify this user for appointment or reminder events.',
    route: '/settings/notification',
    hash_keyword: 'reminder-options',
    visible: true
  },
  'line_notifications': {
    title: 'Line Notifications',
    description: 'Get extra notifications from the lines you chose.',
    route: '/settings/notification',
    hash_keyword: 'line-notifications',
    visible: true
  },
  'notifications_channel': {
    title: 'Notifications Channel',
    description: 'Choose what channels you want this user to get notified on.',
    route: '/settings/notification',
    hash_keyword: 'notifications-channel',
    visible: true
  },
  'inAppNotifications': {
    title: 'Notifications Channel - In-App',
    description: 'In-App notification.',
    route: '/settings/notification',
    hash_keyword: 'in-app-notification',
    visible: true
  },
  'desktopNotifications': {
    title: 'Notifications Channel - Desktop',
    description: 'Desktop notification.',
    route: '/settings/notification',
    hash_keyword: 'desktop-notification',
    visible: true
  },
  'mobileNotifications': {
    title: 'Notifications Channel - Mobile',
    description: 'Mobile notification.',
    route: '/settings/notification',
    hash_keyword: 'mobile-notification',
    visible: true
  },
  'emailNotifications': {
    title: 'Notifications Channel - Email',
    description: 'Email notification.',
    route: '/settings/notification',
    hash_keyword: 'email-notifications',
    visible: true
  },
  'textNotifications': {
    title: 'Notifications Channel - Text Message',
    description: 'Text notification.',
    route: '/settings/notification',
    hash_keyword: 'text-notifications',
    visible: true
  },
  'contact_card': {
    title: 'Contact Card',
    description: '',
    route: '/settings/profile',
    hash_keyword: 'contact-card',
    visible: true
  },
  'company_contact_card': {
    title: 'Company Contact Card',
    description: '',
    route: '/settings/profile',
    hash_keyword: 'company-contact-card',
    visible: true
  },

  // CONNECTION TEST SETTINGS
  'connection_test': {
    title: 'Connection Test',
    description: 'Test your connection for voice and video calls.',
    route: '/settings/connection-test',
    visible: true
  }
}

export default SettingsMap
