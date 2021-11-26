import { isEmpty } from 'lodash'

export default {
  computed: {
    fetchedNameList () {
      return `Untitled ${this.nameCounter + 1}`
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
  },
  data () {
    return {}
  }
}
