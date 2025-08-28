import { ContactAttributeTypeEnum } from 'components/contacts/contact-attributes/enums/contact-attribute-type-enum'

export const CONTACT_FIELD_DEFINITIONS = {
  owner: {
    key: 'owner',
    label: 'Owner',
    component: 'user-selector',
    type: 'default',
    dataField: 'user_id',
    permissions: ['list user'],
    editPermissions: ['change contact ownership'],
    readonly: false,
    props: {
      customClass: 'inline-select',
      genericStyling: false,
      multiple: false,
      useChips: false,
      outlined: false,
      showPlaceholder: false
    }
  },

  contact_disposition: {
    key: 'contact_disposition',
    label: 'Contact Disposition',
    component: 'contact-disposition-selector',
    type: 'default',
    dataField: 'disposition_status_id',
    permissions: ['list disposition status'],
    editPermissions: ['dispose contact'],
    readonly: false,
    props: {
      customClass: 'inline-select',
      genericStyling: false,
      multiple: false,
      useChips: false,
      outlined: false,
      showPlaceholder: false,
      emitValue: true
    }
  },

  email: {
    key: 'email',
    label: 'Email',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'email',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  address: {
    key: 'address',
    label: 'Address',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'address',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  company_name: {
    key: 'company_name',
    label: 'Company',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'company_name',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  website: {
    key: 'website',
    label: 'Website',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'website',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  city: {
    key: 'city',
    label: 'City',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'cnam_city',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  state: {
    key: 'state',
    label: 'State',
    component: 'location-state-selector',
    type: 'default',
    dataField: 'cnam_state',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    condition: (contact) => contact.cnam_country && ['US', 'CA'].includes(contact.cnam_country),
    props: {
      contact: (contact) => contact
    }
  },

  country: {
    key: 'country',
    label: 'Country',
    component: 'location-country-selector',
    type: 'default',
    dataField: 'cnam_country',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {
      contact: (contact) => contact
    }
  },

  zip_code: {
    key: 'zip_code',
    label: 'Zip Code',
    component: 'contact-input-field',
    type: 'default',
    dataField: 'cnam_zipcode',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  timezone: {
    key: 'timezone',
    label: 'Timezone',
    component: 'q-timezone-selector',
    type: 'default',
    dataField: 'timezone',
    permissions: [],
    editPermissions: ['admin'],
    readonly: false,
    props: {}
  },

  date_of_birth: {
    key: 'date_of_birth',
    label: 'Date of Birth',
    component: 'date-picker-selector',
    type: 'default',
    dataField: 'date_of_birth',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {
      wrapperClass: 'date-of-birth-field',
      contentClass: 'inline-input contact-info-editable',
      popoverClass: 'contact-info-popover',
      popoverId: 'popover-date-picker-sync'
    }
  },

  lead_source: {
    key: 'lead_source',
    label: 'Lead Source',
    component: 'lead-source-selector',
    type: 'default',
    dataField: 'lead_source',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {
      specificClass: 'inline-select',
      useInput: true,
      clearable: true,
      borderless: true,
      genericStyling: false,
      outlined: false
    }
  },

  initial_line: {
    key: 'initial_line',
    label: 'Initial Line',
    component: 'line-selector',
    type: 'default',
    dataField: 'initial_campaign_id',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {
      specificClass: 'inline-select',
      genericMultiselect: false,
      genericStyling: false,
      useInput: true,
      clearable: true,
      borderless: true,
      outlined: false,
      hideBottomSpace: true
    }
  },

  custom_field_1: {
    key: 'custom_field_1',
    label: 'Custom Field 1',
    component: 'contact-input-field',
    type: 'custom_static',
    dataField: 'csf1',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  custom_field_2: {
    key: 'custom_field_2',
    label: 'Custom Field 2',
    component: 'contact-input-field',
    type: 'custom_static',
    dataField: 'csf2',
    permissions: [],
    editPermissions: ['update contact'],
    readonly: false,
    props: {}
  },

  tcpa_approved: {
    key: 'tcpa_approved',
    label: 'TCPA Approved',
    component: 'readonly-text',
    type: 'display_only',
    dataField: 'text_authorized',
    permissions: [],
    editPermissions: [],
    readonly: false,
    filter: 'fixBooleanType',
    props: {}
  },

  created_at: {
    key: 'created_at',
    label: 'Created At',
    component: 'readonly-text',
    type: 'display_only',
    dataField: 'created_at',
    permissions: [],
    editPermissions: [],
    readonly: false,
    filter: 'fixFullDateUTCRelative',
    props: {}
  },

  time_of_first_outbound_call: {
    key: 'time_of_first_outbound_call',
    label: 'Time of First Outbound Call',
    component: 'readonly-text',
    type: 'display_only',
    dataField: 'time_of_first_outbound_call',
    permissions: [],
    editPermissions: [],
    readonly: false,
    computed: true,
    props: {}
  },

  time_to_first_outbound_call: {
    key: 'time_to_first_outbound_call',
    label: 'Time to First Outbound Call',
    component: 'readonly-text',
    type: 'display_only',
    dataField: 'time_to_first_outbound_call',
    permissions: [],
    editPermissions: [],
    readonly: false,
    computed: true,
    props: {}
  },

  intake_source: {
    key: 'intake_source',
    label: 'Intake Source',
    component: 'readonly-text',
    type: 'display_only',
    dataField: 'intake_source',
    permissions: [],
    editPermissions: [],
    readonly: false,
    filter: 'toUpperCase',
    props: {}
  }
}

/**
 * Helper functions to work with field definitions
 */
export const ContactFieldsHelper = {
  /**
   * Get all field keys
   */
  getAllFieldKeys () {
    return Object.keys(CONTACT_FIELD_DEFINITIONS)
  },

  /**
   * Get field definition by key
   */
  getFieldDefinition (key) {
    return CONTACT_FIELD_DEFINITIONS[key]
  },

  /**
   * Create custom attribute field definition
   */
  createCustomAttributeDefinition (attribute) {
    // Handle both id and attribute_id properties for compatibility
    const attributeId = attribute.id || attribute.attribute_id

    if (!attributeId || !attribute.name) {
      console.error('createCustomAttributeDefinition called with invalid attribute:', attribute)
      return null
    }

    return {
      key: `custom_attribute_${attributeId}`,
      label: attribute.name,
      component: this.getCustomAttributeComponent(attribute.type),
      type: 'custom_attribute',
      dataField: `attribute_${attributeId}`,
      attributeId: attributeId,
      attributeType: attribute.type,
      permissions: [],
      editPermissions: ['update contact'],
      readonly: false,
      props: {
        attribute: attribute,
        timezone: (contact) => contact.timezone || ''
      }
    }
  },

  /**
   * Get the appropriate component for custom attribute types
   */
  getCustomAttributeComponent (attributeType) {
    switch (attributeType) {
      case ContactAttributeTypeEnum.DATE_PICKER:
        return 'attribute-type-date-picker'
      case ContactAttributeTypeEnum.NUMBER:
      case ContactAttributeTypeEnum.TEXT:
      case ContactAttributeTypeEnum.DROPDOWN:
      default:
        return 'attribute-type-text'
    }
  }
}

export const DEFAULT_FIELD_ORDER = [
  'owner',
  'contact_disposition',
  'email',
  'address',
  'company_name',
  'website',
  'city',
  'state',
  'country',
  'zip_code',
  'timezone',
  'date_of_birth',
  'lead_source',
  'initial_line',
  'custom_field_1',
  'custom_field_2',
  // Custom attributes will be inserted here dynamically (after custom_field_2)
  // Display-only fields at the end
  'tcpa_approved',
  'created_at',
  'time_of_first_outbound_call',
  'time_to_first_outbound_call',
  'intake_source'
]
