<template>
  <div class="move-dialog shadow-sm" ref="moveDialog">
    <div class="move-dialog-title">
      <div class="flex-grow-1">
        Move {{ moveDialog.type === 'folder' ? 'Folder' : 'List' }}
      </div>
      <button class="btn btn-link move-dialog-close" @click="closeMoveDialog">
        <i class="fa fa-times"></i>
      </button>
    </div>
    <div class="move-dialog-input">
      <div>
        <contacts-table-search
          @search="onSearch"
          placeholder="Search..."
          searchOnKeyup
        ></contacts-table-search>
      </div>
    </div>
    <div class="move-dialog-lists">
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
    <div class="move-dialog-footer">
      <div class="text-muted small pr-2" v-if="hasSelected">
        Would you like to continue?
      </div>
      <compact-btn
        variant="danger"
        class="mr-2"
        v-if="hasSelected"
        @clicked="onConfirmMove"
      >
        Yes
      </compact-btn>
      <compact-btn
        variant="outlined-light"
        v-if="hasSelected"
        @clicked="closeMoveDialog"
      >
        No
      </compact-btn>
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'
import MoveFolderItem from './move-folder-item.vue'
import ContactsTableSearch from './contacts-table-search.vue'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let popperInstance

export default {
  components: {
    MoveFolderItem,
    ContactsTableSearch,
    CompactBtn
  },
  data () {
    return {
      searchValue: '',
      itemsList: []
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
      return window.axios
        .patch('/api/v2/contact-folders/move/' + this.moveDialog.id, {
          parent_id: this.moveDialog.target < 1 ? null : this.moveDialog.target
        })
        .then(this.reloadFolders)
        .catch(this.handleRequestError)
        .finally(this.closeMoveDialog)
    },
    moveListRequest () {
      return window.axios
        .patch('/api/v2/contacts-list/' + this.moveDialog.id, {
          contact_folder_id: this.moveDialog.target
        })
        .then(this.reloadFolders)
        .catch(this.handleRequestError)
        .finally(this.closeMoveDialog)
    },
    handleRequestError (err) {
      const { message, html } = extractErrorMessage(err)
      this.$q.notify({
        message,
        type: 'negative',
        textColor: 'white',
        html
      })
    },
    reloadFolders () {
      return window.axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to load folders please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
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
        .filter((i) => i.searchText.toLowerCase().indexOf(searchValue) !== -1)
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
        this.destroyDialogInstance(state)
      }
    },
    folders: function (value) {
      const itemsList = this.createFolders('', [
        {
          id: 0,
          name: 'Root Folder',
          child_folders: value
        }
      ])
      this.itemsList = itemsList
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.move-dialog {
  width: 258px;
  min-height: 300px;
  max-height: calc(100vh - 200px);
  background: $white;
  border: solid 1px $grey-light;
  position: absolute;
  border-radius: 5px;
  font-size: 12px;
  display: none;
  flex-direction: column;
  z-index: 100;
  &-close {
    margin-right: -5px;
    padding: 5px 5px 5px 5px;
    display: inline-flex;
    align-items: center;
    color: $grey-mid;
    text-decoration: none;
    &:hover,
    &:active {
      text-decoration: none;
    }
  }
  &-title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: solid 1px $grey-light;
    background-color: $grey-light2;
    font-size: 12px;
    min-height: 35px;
  }
  &-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-left: 10px;
    padding-right: 10px;
    border-top: solid 1px $grey-light;
    background-color: $grey-light2;
    font-size: 12px;
    min-height: 35px;
  }
  &-input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 10px;
    padding-right: 10px;
    border-bottom: solid 1px $grey-light;
    min-height: 50px;

    input {
      height: 30px;
    }
  }
  &-lists {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: calc(300px - 120px);
    max-height: calc(100vh - 200px);
  }
}
</style>
