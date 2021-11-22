<template>
  <div class="move-dialog shadow-sm" ref="moveDialog">
    <div class="move-dialog-input">
      <div>
        <Search
          ref="folder-search"
          :placeholder="placeholder"
          @search="onSearch"
        ></Search>
      </div>
    </div>
    <div class="move-dialog-lists">
      <MoveFolderItem
        v-for="folder in searchedItemsList"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :folders="folder.child_folders"
        :layer="0" />
    </div>
    <div class="move-dialog-footer" v-if="hasSelected">
      <div class="text-muted small pr-2">
        {{ message }}
      </div>
      <CompactBtn
        variant="primary"
        class="mr-2"
        v-if="hasSelected"
        :disabled="isMoving"
        @clicked="onConfirmMove">
        <q-spinner-bars v-if="isMoving" color="white" />
        {{ isMoving ? '' : 'Yes' }}
      </CompactBtn>
      <!-- <CompactBtn
        variant="outlined-light"
        v-if="hasSelected"
        :disabled="isMoving"
        @clicked="closeMoveDialog">
        No
      </CompactBtn> -->
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'
import MoveFolderItem from 'src/components/power-dialer/custom/move-folder-item'
import Search from 'src/components/search.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let popperInstance

export default {
  props: {
    message: {
      type: String,
      default: 'Move to this location?'
    },
    placeholder: {
      type: String,
      default: 'Move to...'
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
      isMoving: false
    }
  },
  computed: {
    ...mapGetters('powerDialer', ['moveDialog', 'folders', 'powerDialerDirectoryList']),
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
    }
  },
  methods: {
    ...mapActions('powerDialer', ['closeMoveDialog', 'foldersLoaded']),
    onConfirmMove () {
      if (this.moveDialog.type === 'list') {
        return this.moveListRequest()
      }
      return this.moveFolderRequest()
    },
    moveFolderRequest () {
      this.isMoving = true
      return this.$axios
        .patch('/api/v2/power-dialer-folders/move/' + this.moveDialog.id, {
          parent_id: this.moveDialog.target < 1 ? null : this.moveDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
        })
        .catch(this.handleRequestError)
        .finally(this.closeMoveDialog)
    },
    moveListRequest () {
      this.isMoving = true
      return this.$axios
        .patch('/api/v2/power-dialer-list/' + this.moveDialog.id, {
          contact_folder_id: this.moveDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
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
      return this.$axios
        .get('/api/v2/power-dialer-folders')
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
      for (let i = 0; i < folders.length; i++) {
        names += folders[i].name.toLowerCase()
        if (
          Array.isArray(folders[i].child_folders) &&
          folders[i].child_folders.length
        ) {
          names += this.getFolderNames(
            folders[i].name,
            folders[i].child_folders
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

      popperInstance = createPopper(reference, this.$refs.moveDialog, {
        placement: 'auto'
      })

      document.body.addEventListener('click', this.handleClick)
    },
    destroyDialogInstance () {
      this.$refs.moveDialog.classList.remove('d-flex')

      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    },
    handleClick (evt) {
      if (
        evt.target &&
        !this.$refs.moveDialog.contains(evt.target) &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('move-item')
      ) {
        this.closeMoveDialog()
        document.body.removeEventListener('click', this.handleClick)
      }
    }
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
    folders: function (value) {
      let itemsList = []
      if (value.length) {
        value = value[0].child_folders
        itemsList = this.createFolders('', [
          {
            id: 0,
            name: 'Root Folder',
            child_folders: value
          }
        ])
      }
      this.itemsList = itemsList
    }
  }
}
</script>
