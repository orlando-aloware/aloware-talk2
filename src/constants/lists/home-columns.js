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
    name: 'date_created',
    label: 'Date Created',
    field: 'created_at',
    align: 'center',
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
    draggable: true
  },
  {
    name: '',
    label: '',
    field: 'actions',
    align: 'center',
    maxWidth: 50,
    sticky: true,
    stickyRight: true
  }
]
