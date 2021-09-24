<template>
  <div>
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        {{ title }}
      </div>

      <b-popover
        target="bs-folder-options"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover">
        <ContactMenu>
          <ContactMenuItem @click="onCreateFolderToggle">
            <template slot="icon">
              <FolderIcon />
            </template>
            <template slot="title">
              <span>Folder</span>
            </template>
          </ContactMenuItem>

          <ContactMenuItem @click="onCreateList">
            <template slot="icon">
              <PeopleIcon />
            </template>
            <template slot="title">
              <span>List</span>
            </template>
          </ContactMenuItem>
        </ContactMenu>
      </b-popover>
      <button
        class="btn btn-link btn-sm tooltip-target mr-1"
        id="bs-folder-options">
        <i class="fa fa-plus text-primary"></i>
      </button>

    </div>

    <div class="d-flex folders__content flex-column p-0">
      <DirectoryFolderCreate
        v-if="isCreatingFolder"
        :layer="0"
        :parent_id="null"
        @blur="onCreateFolderToggle" />
      <template v-if="directory">
        <DirectoryFolder
          v-for="folder in directory[0].child_folders"
          :name="folder.name"
          :key="folder.id"
          :id="folder.id"
          :order="folder.order"
          :hasEdit="directory[0].has_edit"
          :hasDelete="directory[0].has_delete"
          :folders="folder.child_folders"
          :lists="folder.lists"
          :layer="0" />
        <DirectoryFolder
          :name="directory[0].name"
          :id="directory[0].id"
          :order="directory[0].order"
          :hasEdit="directory[0].has_edit"
          :hasDelete="directory[0].has_delete"
          :isRootList="true"
          :folders="[]"
          :lists="directory[0].lists"
          :layer="0" />
      </template>
    </div>
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import DirectoryFolder from './directory-folder'
import DirectoryFolderCreate from './directory-folder-create'
import ContactMenu from 'src/components/contacts/contact-menu'
import ContactMenuItem from 'src/components/contacts/contact-menu-item'
import FolderIcon from 'components/icons/folder-icon.vue'
import PeopleIcon from 'components/icons/people-icon.vue'

export default {
  name: 'DirectoryBase',
  props: {
    directory: {
      type: [],
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  components: {
    DirectoryFolder,
    DirectoryFolderCreate,
    ContactMenu,
    ContactMenuItem,
    FolderIcon,
    PeopleIcon
  },
  methods: {
    ...mapActions('powerDialer', [
      'createListOpen'
    ]),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    }
  },
  data () {
    return {
      isCreatingFolder: false
    }
  }
}
</script>
