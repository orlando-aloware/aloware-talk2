<template>
  <div class="move-dialog shadow-sm" ref="moveDialog">
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
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'
import MoveFolderItem from './move-folder-item.vue'
import ContactsTableSearch from './contacts-table-search.vue'

let popperInstance

export default {
  components: {
    MoveFolderItem,
    ContactsTableSearch
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
      return this.filterByActiveId(this.folders)
    }
  },
  methods: {
    ...mapActions('contacts', ['closeMoveDialog']),
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
        placement: 'right-start'
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
      const itemsList = this.createFolders('', value)
      console.log(itemsList)
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
  height: 250px;
  max-height: 435px;
  overflow: hidden;
  background: $white;
  border: solid 1px $grey-light;
  position: absolute;
  border-radius: 5px;
  font-size: 12px;
  display: none;
  flex-direction: column;
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
    height: 200px;
    max-height: calc(100% - 50px);
  }
}
</style>
