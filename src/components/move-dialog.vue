<template>
  <div class="move-dialog shadow-sm"
       ref="moveDialog">
    <div class="move-dialog-input">
      <div>
        <search
          ref="folder-search"
          placeholder="Move to..."
          @search="onSearch"
        ></search>
      </div>
    </div>
    <div class="move-dialog-lists px-4 pb-2">
      <move-folder-item
        v-for="folder in searchedItemsList"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :folders="folder.child_folders"
        :layer="0"
      />
    </div>
    <div class="move-dialog-footer" v-if="hasSelected">
      <div class="fs-12 text-grey-100 pr-4">
        Move to this location?
      </div>
      <compact-btn
        variant="primary"
        v-if="hasSelected"
        :disabled="isMoving"
        @clicked="onConfirmMove"
      >
        <q-spinner-bars v-if="isMoving" color="white" />
        {{ isMoving ? '' : 'Move' }}
      </compact-btn>
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'
import MoveFolderItem from 'src/components/move-folder-item.vue'
import Search from 'src/components/search.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    },
    userId: {
      type: Number
    }
  },

  components: {
    MoveFolderItem,
    Search,
    CompactBtn
  },

  data () {
    return {
      searchValue: '',
      itemsList: [],
      isMoving: false,
      popperInstance: null
    }
  },

  computed: {
    ...mapGetters('contacts', ['moveDialog', 'folders']),
    searchedItemsList () {
      if (this.searchValue) {
        return this.filterByActiveId(
          this.filterBySearchValue(this.itemsList, this.searchValue)
        )
      }
      return this.filterByActiveId(this.itemsList)
    },
    hasSelected () {
      return (
        typeof this.moveDialog.target === 'number' &&
        this.moveDialog.target >= 0
      )
    },
    moveFoldersEndpoint () {
      return this.isContactModuleType ? '/api/v2/contact-folders/move' : '/api/v2/power-dialer-folders/move'
    },
    fetchFoldersEndpoint () {
      return this.isContactModuleType ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    },
    fetchFoldersListEndpoint () {
      return this.isContactModuleType ? '/api/v2/contacts-list' : '/api/v2/power-dialer-lists'
    }
  },

  methods: {
    ...mapActions('contacts', ['closeMoveDialog', 'foldersLoaded']),
    onConfirmMove () {
      if (this.moveDialog.type === 'list') {
        return this.moveListRequest()
      }
      return this.moveFolderRequest()
    },
    moveFolderRequest () {
      this.isMoving = true
      return this.$axios
        .patch(`${this.moveFoldersEndpoint}/${this.moveDialog.id}`, {
          parent_id: this.moveDialog.target < 1 ? null : this.moveDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
          this.$generalNotification('You have successfully moved a folder!', 'success')
        })
        .catch(this.handleRequestError)
        .finally(this.closeMoveDialog)
    },
    moveListRequest () {
      if (this.moveDialog.id === 'unsaved') {
        return
      }

      this.isMoving = true
      return this.$axios
        .patch(`${this.fetchFoldersListEndpoint}/${this.moveDialog.id}`, {
          contact_folder_id: this.moveDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
          this.$generalNotification('You have successfully moved a list!', 'success')
        })
        .catch(this.handleRequestError)
        .finally(this.closeMoveDialog)
    },
    handleRequestError (err) {
      const { message, html } = extractErrorMessage(err)
      console.log(html)
      this.$generalNotification(message, 'error')
    },
    reloadFolders () {
      const params = {}
      if (this.userId) {
        params.user_id = this.userId
      }
      return this.$axios
        .get(this.fetchFoldersEndpoint, { params })
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    filterByActiveId (items) {
      return items
        .filter((i) => i.id !== this.moveDialog.id)
        .map((i) => {
          return {
            ...i,
            child_folders: this.filterByActiveId(i.child_folders)
          }
        })
    },
    filterBySearchValue (items, searchValue) {
      return items
        .filter((i) => i.searchText.toLowerCase().includes(searchValue.toLowerCase()))
        .map((i) => {
          return {
            ...i,
            child_folders: this.filterBySearchValue(
              i.child_folders,
              searchValue
            )
          }
        })
    },
    onSearch (searchValue) {
      this.searchValue = searchValue
    },
    createFolders (names = '', newFolders = []) {
      return newFolders.map((i) => {
        const name = i.name.toLowerCase()
        const nextNames = names + this.getFolderNames(name, i.child_folders)
        return {
          id: i.id,
          name: i.name,
          searchText: nextNames,
          child_folders: this.createFolders(name, i.child_folders)
        }
      })
    },
    getFolderNames (names, folders) {
      const index = { i: 0 }
      for (index.i = 0; index.i < folders.length; index.i++) {
        names += folders[index.i].name.toLowerCase()
        if (
          Array.isArray(folders[index.i].child_folders) &&
          folders[index.i].child_folders.length
        ) {
          names += this.getFolderNames(
            folders[index.i].name,
            folders[index.i].child_folders
          )
        }
      }
      return names
    },
    createDialogInstance (state) {
      this.searchValue = ''

      const elId = state.type + '-' + state.id

      const reference = document.querySelector(
        '[data-popper-target="' + elId + '"]'
      )

      this.$refs.moveDialog.classList.add('d-flex')

      this.popperInstance = createPopper(reference, this.$refs.moveDialog, {
        placement: 'auto'
      })

      document.body.addEventListener('click', this.handleClick)
    },
    destroyDialogInstance () {
      this.$refs.moveDialog.classList.remove('d-flex')

      if (this.popperInstance) {
        this.popperInstance.destroy()
        this.popperInstance = null
      }
    },
    handleClick (evt) {
      const isReferenceElementExists = this.$refs.moveDialog && ['Object', 'HTMLDivElement'].includes(this.$refs.moveDialog.constructor.name)
      const dialogContainsTarget = isReferenceElementExists && this.$refs.moveDialog.contains(evt.target)

      if (
        evt.target &&
        !dialogContainsTarget &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('move-item') &&
        !evt.target.dataset.action?.includes('move-item')
      ) {
        this.closeMoveDialog()
        document.body.removeEventListener('click', this.handleClick)
      }
    },
    loadDirectories () {
      const itemsList = { data: [] }
      if (this.folders?.length) {
        const value = this.folders[0].child_folders
        itemsList.data = this.createFolders('', [
          {
            id: 0,
            name: 'Root Folder',
            child_folders: value
          }
        ])
      }
      this.itemsList = itemsList.data
    }
  },

  mounted () {
    if (this.folders?.length === 0) {
      this.reloadFolders()
    }
    this.loadDirectories()
  },

  beforeDestroy () {
    document.body.removeEventListener('focus', this.handleClick)
    this.destroyDialogInstance()
  },

  watch: {
    moveDialog: function ({ open, ...state }) {
      if (open) {
        this.createDialogInstance(state)
      } else {
        this.$refs['folder-search'].clearSearch()
        document.body.removeEventListener('focus', this.handleClick)
        this.destroyDialogInstance(state)
      }
    },
    folders: {
      deep: true,
      handler () {
        this.loadDirectories()
      }
    }
  }
}
</script>
