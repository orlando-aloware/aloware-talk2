<template>
  <div class="t-menu">
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        POWER DIALER LISTS
      </div>
      <!-- <button
        size="sm"
        class="btn btn-link btn-sm tooltip-target mr-1"
        id="bs-folder-options">
        <i class="fa fa-plus text-primary"></i>
      </button> -->
    </div>
    <div class="d-flex folders__content flex-column p-0">
      <DirectoryFolderCreate
        v-if="isCreatingFolder"
        :layer="0"
        :parent_id="null"
        @blur="onCreateFolderToggle" />
      <template v-if="powerDialerList">
        <DirectoryFolder
          v-for="folder in list[0].child_folders"
          :name="folder.name"
          :key="folder.id"
          :id="folder.id"
          :order="folder.order"
          :hasEdit="list[0].has_edit"
          :hasDelete="list[0].has_delete"
          :folders="folder.child_folders"
          :lists="folder.lists"
          :layer="0" />
        <DirectoryFolder
          :name="list[0].name"
          :id="list[0].id"
          :order="list[0].order"
          :hasEdit="list[0].has_edit"
          :hasDelete="list[0].has_delete"
          :isRootList="true"
          :folders="[]"
          :lists="list[0].lists"
          :layer="0" />
      </template>
    </div>
    <!-- <MyDirectory :directory="directoryList">
      <template slot-scope="props">
        <div
          v-if="props.item.children.length > 0"
          class="text-weight-medium pl-1">
          <FolderIcon class="mr-1 mb-1" />
          {{ props.item.label }}
        </div>
        <div
          v-else
          class="text-weight-medium pl-4">
          <router-link
            class="tree-list-item text-body2"
            :to="`/power-dialer/list/${props.item.id}`">
            <div class="link-item">
              {{ props.item.label }}
            </div>
          </router-link>
        </div>
      </template>
    </MyDirectory> -->
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import DirectoryFolder from './directories/directory-folder'
import DirectoryFolderCreate from './directories/directory-folder-create'
// import MyDirectory from './directories/directory'
// import FolderIcon from 'components/icons/folder-icon'
import { DIRECTORY_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerResourcesList',
  components: {
    DirectoryFolder,
    DirectoryFolderCreate
    // MyDirectory,
    // FolderIcon
  },
  computed: {
    ...mapGetters('powerDialer', [
      'powerDialerList'
    ]),
    list () {
      return this.powerDialerList || []
    },
    directoryList () {
      return DIRECTORY_LIST
    }
  },
  data () {
    return {
      isCreatingFolder: false,
      listItems: [
        {
          count: 99,
          id: 'all',
          link: '/power-dialer/',
          name: 'My Queue',
          to: '/power-dialer'
        }
      ]
    }
  },
  methods: {
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    }
  }
}
</script>
