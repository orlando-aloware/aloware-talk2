export const COLUMNS = [
  {
    name: 'checkbox',
    label: '',
    field: ''
  },
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    align: 'center',
    sortable: true,
    resizable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true,
    minWidth: 390,
    resizable: true
  },
  {
    name: 'owner_name',
    label: 'Owner',
    field: 'owner_name',
    align: 'left',
    sortable: true
  },
  {
    name: 'date_created',
    label: 'Date Created',
    field: 'created_at',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'no_of_contacts',
    label: '# of Contacts',
    field: 'no_of_contacts',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center',
    sortable: true,
    draggable: true,
    resizable: true
  },
  {
    name: 'show_in_public_folder',
    label: 'Show in Public Folder',
    field: 'show_in_public_folder',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'source',
    label: 'Source',
    field: 'source_name',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'import_status',
    label: 'Import Status',
    field: 'import_status_name',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'imported_at',
    label: 'Imported At',
    field: 'imported_at',
    align: 'center',
    sortable: true,
    draggable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    maxWidth: 50,
    sticky: true,
    stickyRight: true
  }
]

export const columnsByViewportConfig = {
  mobile: [
    'name',
    'actions'
  ],
  tablet: [
    'name',
    'no_of_contacts',
    'actions'
  ],
  smallDesktop: [
    'name',
    'owner_name',
    'no_of_contacts',
    'type',
    'actions'
  ],
  mediumDesktop: [
    'name',
    'owner_name',
    'date_created',
    'no_of_contacts',
    'type',
    'show_in_public_folder',
    'source',
    'import_status',
    'actions'
  ],
  largeDesktop: [
    'name',
    'owner_name',
    'date_created',
    'no_of_contacts',
    'type',
    'show_in_public_folder',
    'source',
    'import_status',
    'imported_at',
    'actions'
  ],
  extraLargeDesktop: [
    'name',
    'owner_name',
    'date_created',
    'no_of_contacts',
    'type',
    'show_in_public_folder',
    'source',
    'import_status',
    'imported_at',
    'actions'
  ]
}
