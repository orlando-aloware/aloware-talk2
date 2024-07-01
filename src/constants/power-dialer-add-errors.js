/* When the contact has a number that is duplicated */
export const DUPLICATED = 1
/* Contact with multiple numbers but not added */
export const MULTIPLE = 2
/* Contact with a disposition that cannot be added to pd list */
export const UNAUTHORIZED_DISPOSITION = 3
/* Contact with no primary phone number */
export const NO_PRIMARY_PHONE_NUMBER = 4
/* Invalid number */
export const INVALID = 5
/* International numbers not allowed */
export const INTERNATIONAL_DISALLOWED = 6
/* Not owned contacts */
export const NOT_OWNED = 7

export const PD_BULK_ADD_MESSAGES = {
  1: 'With duplicate phone number(s)',
  2: 'Tasks from multiple phone number(s)',
  3: 'Unauthorized disposition',
  4: 'No primary phone number',
  5: 'Invalid phone number(s)',
  6: 'Contact(s) with International phone number',
  7: 'Contact(s) not owned'
}

export const PD_INTEGRATION_IMPORT_MESSAGES = {
  'missing_properties': 'Contact(s) with missing information',
  'ignored_contacts': 'Ignored contact(s)',
  'empty_phone_number': 'Contact(s) without phone number',
  'contact_creation_failed': 'Contact(s) import failed',
  'is_dnc': `DNC`,
  'is_blocked': 'Contact(s) blocked'
}
