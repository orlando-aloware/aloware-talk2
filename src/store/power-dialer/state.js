export default function () {
  return {
    filters: [],
    opened: [],
    folders: [],
    pinned: [],
    removeFolder: null,
    lists: null,
    removeList: null,
    createList: {
      name: '',
      mode: '', // from_filters, from_bulk_menu, from_folders
      type: 1,
      open: false,
      contact_folder_id: null,
      filters: []
    },
    moveDialog: {
      open: false,
      id: null,
      type: 'folder',
      target: null
    },
    // powerDialerList: null,
    contactResources: [],
    selectedContacts: {},
    isStartingDial: false
  }
}
