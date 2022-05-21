export default function () {
  return {
    items: [
      {
        label: 'General',
        value: 'general_information',
        icon: 'document',
        disabled: false
      },
      {
        label: 'Profile',
        value: 'profile_settings',
        icon: 'person',
        disabled: false
      },
      {
        label: 'Visibility',
        value: 'visibility_settings',
        icon: 'eye',
        disabled: false
      },
      {
        label: 'Personalization',
        value: 'personalization',
        icon: 'personalization',
        disabled: false
      },
      {
        label: 'Inbound Call',
        value: 'inbound_call_settings',
        icon: 'inbound',
        disabled: false
      },
      {
        label: 'Outbound Call',
        value: 'outbound_call_settings',
        icon: 'outbound',
        disabled: false
      },
      {
        label: 'Notification',
        value: 'notification_settings',
        icon: 'notification',
        disabled: false
      },
      {
        label: 'SMS Templates',
        value: 'sms_templates',
        icon: 'message',
        disabled: false
      },
      {
        label: 'Diagnosis',
        value: 'diagnosis',
        icon: 'diagnosis',
        disabled: false
      }
    ],
    user: null,
    userClone: null,
    changedUserProperties: [],
    formIsValid: true
  }
}
