import { isEmpty } from 'lodash'

export default {
  computed: {
    fetchedNameList () {
      let text = ''
      let chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
      for (let i = 0; i < 4; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return `Untitled ${text.toUpperCase()}`
    },
    nameCounter () {
      let ctr = this.fetchList(this.folders[0], 0)
      return ctr
    }
  },
  methods: {
    fetchList (folders, ctr) {
      if (!isEmpty(folders.lists)) {
        folders.lists.forEach((list) => {
          if (list.name.toLowerCase().includes('untitled')) {
            ctr++
          }
        })
      }
      if (!isEmpty(folders.child_folders)) {
        folders.child_folders.forEach((folder) => {
          ctr = this.fetchList(folder, ctr)
        })
      }
      return ctr
    },
    reloadFolders () {
      return this.$axios
        .get(this.foldersEndpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  }
}
