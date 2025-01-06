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
    sortable: true,
    resizable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    minWidth: 390,
    resizable: true
  },
  {
    name: 'date_created',
    label: 'Date Created',
    field: 'created_at',
    draggable: true
  },
  {
    name: 'no_of_contacts',
    label: '# of Contacts',
    field: 'no_of_contacts',
    draggable: true
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    draggable: true,
    resizable: true
  },
  {
    name: 'show_in_public_folder',
    label: 'Show in Public Folder',
    field: 'show_in_public_folder',
    draggable: true
  },
  {
    name: 'source',
    label: 'Source',
    field: 'source_name',
    draggable: true
  },
  {
    name: 'import_status',
    label: 'Import Status',
    field: 'import_status_name',
    draggable: true
  },
  {
    name: 'imported_at',
    label: 'Imported At',
    field: 'imported_at',
    draggable: true
  },
  {
    name: '',
    label: '',
    field: 'actions',
    maxWidth: 50,
    sticky: true,
    stickyRight: true
  }
]
