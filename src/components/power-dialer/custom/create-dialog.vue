<template>
  <div class="move-dialog move-dialog__create shadow-sm" ref="createDialog">
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
      <CreateListItem
        v-for="folder in searchedItemsList"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :folders="folder.child_folders"
        :layer="0"
        :items="rootItems" />
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
        {{ isMoving ? '' : 'Create' }}
      </CompactBtn>
      <!-- <CompactBtn
        variant="outlined-light"
        v-if="hasSelected"
        :disabled="isMoving"
        @clicked="closeCreateListDialog">
        No
      </CompactBtn> -->
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item'
import Search from 'src/components/search.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let popperInstance

export default {
  name: 'CreateDialog',
  props: {
    message: {
      type: String,
      default: 'Create Power Dialer List?'
    },
    placeholder: {
      type: String,
      default: 'Select Contact List'
    }
  },
  components: {
    CreateListItem,
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
    ...mapGetters('powerDialer', ['createDialog', 'folders', 'powerDialerList']),
    searchedItemsList () {
      if (this.searchValue) {
        return this.filterByActiveId(
          this.filterBySearchValue(this.itemsList, this.searchValue)
        )
      }
      return this.filterByActiveId(this.itemsList)
    },
    rootItems () {
      return this.powerDialerList.find(item => item.name === 'Root')
    },
    hasSelected () {
      console.log('---', this.createDialog)
      return (
        typeof this.createDialog.target === 'number' &&
        this.createDialog.target >= 0
      )
    }
  },
  methods: {
    ...mapActions('powerDialer', ['closeCreateListDialog', 'foldersLoaded']),
    onConfirmMove () {
      console.log('this.moveDialog :>> ', this.createDialog)
      if (this.createDialog.type === 'list') {
        return this.moveListRequest()
      }
      return this.moveFolderRequest()
    },
    moveFolderRequest () {
      this.isMoving = true
      return this.$axios
        .patch('/api/v2/power-dialer-folders/move/' + this.createDialog.id, {
          parent_id: this.moveDialog.target < 1 ? null : this.moveDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
        })
        .catch(this.handleRequestError)
        .finally(this.closeCreateListDialog)
    },
    moveListRequest () {
      this.isMoving = true
      return this.$axios
        .patch('/api/v2/power-dialer-list/' + this.createDialog.id, {
          contact_folder_id: this.createDialog.target
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
        })
        .catch(this.handleRequestError)
        .finally(this.closeCreateListDialog)
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
        .filter((i) => i.id !== this.createDialog.id)
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

      this.$refs.createDialog.classList.add('d-flex')

      popperInstance = createPopper(reference, this.$refs.createDialog, {
        placement: 'auto'
      })

      document.body.addEventListener('click', this.handleClick)
    },
    destroyDialogInstance () {
      this.$refs.createDialog.classList.remove('d-flex')

      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    },
    handleClick (evt) {
      if (
        evt.target &&
        !this.$refs.createDialog.contains(evt.target) &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('move-item')
      ) {
        console.log('Closing dialog...')
        this.closeCreateListDialog()
        document.body.removeEventListener('click', this.handleClick)
      }
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('focus', this.handleClick)
    this.destroyDialogInstance()
  },
  watch: {
    createDialog: function ({ open, ...state }) {
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
