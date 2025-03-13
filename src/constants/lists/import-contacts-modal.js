export const STEPS = {
  DNC_AGREEMENT: 1,
  CSV_UPLOAD: 2,
  SELECT_COLUMNS: 3,
  REVIEW_DATA: 4,
  SETTINGS: 5,
  FINISHED: 6
}

export const contactFields = [
  {
    group_name: 'Common Fields',
    fields: [
      {
        value: 'full_name',
        label: 'Full Name'
      },
      {
        value: 'first_name',
        label: 'First Name'
      },
      {
        value: 'last_name',
        label: 'Last Name'
      },
      {
        value: 'phone_number',
        label: 'Phone Number'
      },
      {
        value: 'email',
        label: 'Email'
      },
      {
        value: 'company_name',
        label: 'Company'
      },
      {
        value: 'address',
        label: 'Address'
      },
      {
        value: 'cnam_city',
        label: 'City'
      },
      {
        value: 'cnam_state',
        label: 'State'
      },
      {
        value: 'cnam_zipcode',
        label: 'Zip Code'
      },
      {
        value: 'cnam_country',
        label: 'Country'
      },
      {
        value: 'date_of_birth',
        label: 'Date of Birth'
      },
      {
        value: 'notes',
        label: 'Notes'
      },
      {
        value: 'website',
        label: 'Website'
      },
      {
        value: 'csf1',
        label: 'Custom Field 1'
      },
      {
        value: 'csf2',
        label: 'Custom Field 2'
      },
      {
        value: 'lead_source',
        label: 'Lead Source'
      },
      {
        value: 'disposition_status',
        label: 'Disposition Status'
      },
      {
        value: 'tag',
        label: 'Tag'
      }
    ]
  },
  {
    group_name: 'Custom Fields',
    fields: []
  }
]
