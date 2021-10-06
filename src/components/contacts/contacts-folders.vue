<template>
  <div class="folders">
    <div class="folders__header d-flex align-items-center border-top list--header">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        My Lists
      </div>

      <b-popover
        target="bs-folder-options"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover">
        <contact-menu>
          <contact-menu-item @click="onCreateFolderToggle">
            <template slot="icon">
              <folder-icon></folder-icon>
            </template>
            <template slot="title">
              <span>Folder</span>
            </template>
          </contact-menu-item>

          <contact-menu-item @click="onCreateList">
            <template slot="icon">
              <people-icon></people-icon>
            </template>
            <template slot="title">
              <span>List</span>
            </template>
          </contact-menu-item>
        </contact-menu>
      </b-popover>

      <button
        class="btn btn-link btn-sm tooltip-target mr-1"
        id="bs-folder-options">
        <i class="fa fa-plus text-primary"></i>
      </button>
    </div>

    <div class="d-flex folders__content flex-column pl-2">
      <tree-folder-create
        v-if="isCreatingFolder"
        :layer="0"
        :parent_id="null"
        @blur="onCreateFolderToggle"
      />
      <template v-if="folders.length">
        <tree-folder
          v-for="folder in folders[0].child_folders"
          :name="folder.name"
          :key="folder.id"
          :id="folder.id"
          :order="folder.order"
          :hasEdit="folders[0].has_edit"
          :hasDelete="folders[0].has_delete"
          :folders="folder.child_folders"
          :lists="folder.lists"
          :layer="0"
        />
        <tree-folder
          :name="folders[0].name"
          :id="folders[0].id"
          :order="folders[0].order"
          :hasEdit="folders[0].has_edit"
          :hasDelete="folders[0].has_delete"
          :isRootList="true"
          :folders="[]"
          :lists="folders[0].lists"
          :layer="0"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TreeFolder from '../tree/tree-folder.vue'
import ContactMenu from './contact-menu.vue'
import ContactMenuItem from './contact-menu-item.vue'
import FolderIcon from 'components/icons/folder-icon.vue'
import TreeFolderCreate from '../tree/tree-folder-create.vue'
import PeopleIcon from 'components/icons/people-icon.vue'
export default {
  components: {
    TreeFolder,
    ContactMenu,
    ContactMenuItem,
    FolderIcon,
    TreeFolderCreate,
    PeopleIcon
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false
    }
  },
  methods: {
    ...mapActions('contacts', ['foldersLoaded', 'createListOpen']),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    },
    loadFolders () {
      this.isLoading = false
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .finally(() => {
          this.isLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  },
  computed: {
    ...mapState('contacts', ['folders']),
    foldersWithoutRoot () {
      return this.folders.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.folders.find(folder => folder.name === 'Root')
    }
  },
  mounted () {
    this.loadFolders()
  }
}
</script>
