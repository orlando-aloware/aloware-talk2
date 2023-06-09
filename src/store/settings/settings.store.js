export default function () {
  return {
    items: [
      {
        label: 'General',
        value: 'general-information',
        icon: 'document',
        disabled: false
      },
      {
        label: 'Profile',
        value: 'profile',
        icon: 'person',
        disabled: false
      },
      {
        label: 'Visibility',
        value: 'visibility',
        icon: 'eye',
        height: 16,
        width: 16,
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
        value: 'inbound-call',
        icon: 'inbound',
        height: 14,
        width: 14,
        disabled: false
      },
      {
        label: 'Outbound Call',
        value: 'outbound-call',
        icon: 'outbound',
        disabled: false
      },
      {
        label: 'Notification',
        value: 'notification',
        icon: 'notification',
        disabled: false
      },
      {
        label: 'SMS Templates',
        value: 'sms-templates',
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
