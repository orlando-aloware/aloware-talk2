<template>
  <div
    class="move-dialog move-dialog__create shadow-sm"
    ref="createDialog">
    <div class="move-dialog-input mdi_input_2">
      <div>
        <Search
          ref="folder-search"
          :placeholder="placeholder"
          @search="onSearch"
        ></Search>
      </div>
    </div>
    <div class="move-dialog-lists px-2">
      <CreateListItem
        v-for="folder in contactFolders"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :folders="folder.child_folders"
        :layer="0"
        :items="folder.lists" />
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
        @clicked="onConfirmCreate">
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
import { mapActions, mapMutations, mapGetters } from 'vuex'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item'
// import CreateListItem from 'src/components/move-folder-item'
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
      isMoving: false,
      contactFolders: null
    }
  },
  computed: {
    ...mapGetters('contacts', [
      'createDialog',
      'folders',
      'lists',
      'searchedPdItem'
    ]),
    searchedItemsList () {
      if (this.searchValue) {
        return this.filterByActiveId(
          this.filterBySearchValue(this.itemsList, this.searchValue)
        )
      }
      return this.filterByActiveId(this.itemsList)
    },
    rootItems () {
      return this.folders.find(item => item.name === 'Root')
    },
    hasSelected () {
      return (
        typeof this.createDialog.target === 'number' &&
        this.createDialog.target >= 0
      )
    }
  },
  async mounted () {
    let response = await this.getContactFolders()
    this.contactFolders = response
  },
  methods: {
    ...mapActions('contacts', [
      'createPdListClose',
      'foldersLoaded'
    ]),
    ...mapActions('powerDialer', [
      'getContactFolders'
    ]),
    ...mapMutations('contacts', [
      'ON_SEARCH_PD_ITEM'
    ]),
    onConfirmCreate () {
      return this.createListRequest()
      // if (this.createDialog.type === 'list') {
      //   return this.createListRequest()
      // }
      // return this.createFolderRequest()
    },
    createFolderRequest () {
      this.isMoving = true
      console.log('Creating a folder...')
      // this.$axios
      //   .post('/api/v2/power-dialer-lists', {
      //     type: 1,
      //     name: 'Untitled'
      //   })
      // return this.$axios
      //   .patch('/api/v2/power-dialer-folders/move/' + this.createDialog.id, {
      //     parent_id: this.createDialog.target < 1 ? null : this.createDialog.target
      //   })
      //   .then(() => {
      //     this.reloadFolders()
      //     this.isMoving = false
      //   })
      //   .catch(this.handleRequestError)
      //   .finally(this.createPdListClose)
    },
    createListRequest () {
      this.isMoving = true
      console.log('Creating a list...')
      this.$axios
        .post('/api/v2/power-dialer-lists', {
          type: 1,
          name: this.createDialog.name
        })
        .then(() => {
          this.reloadFolders()
          this.isMoving = false
        })
        .catch(this.handleRequestError)
        .finally(this.createPdListClose)
      // return this.$axios
      //   .post('/api/v2/power-dialer-list', {
      //     contact_folder_id: this.createDialog.target
      //   })
      //   .then(() => {
      //     this.reloadFolders()
      //     this.isMoving = false
      //   })
      //   .catch(this.handleRequestError)
      //   .finally(this.createPdListClose)
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
      let filteredItems = items
        .filter((i) => i.id !== this.createDialog.id)
        .map((i) => {
          return {
            ...i,
            child_folders: this.filterByActiveId(i.child_folders)
          }
        })
      return filteredItems
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
      // this.searchValue = searchValue
      this.ON_SEARCH_PD_ITEM(searchValue)
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
        !(this.$refs.createDialog && this.$refs.createDialog.constructor.name === 'Object' && this.$refs.createDialog.contains(evt.target)) &&
        !evt.path.find(path => path.className && typeof path.className === 'string' && path.className.split(' ').includes('move-dialog')) &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('create-item')
      ) {
        this.createPdListClose()
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
    contactFolders: function (value) {
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
