<template>
  <div class="t-menu">
    <!-- <div class="d-flex folders__content flex-column p-0">
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
    </div> -->
    <DirectoryBase
      @create-folder="{}"
      title="Power Dialer Lists"
      :directory="list" />
    <!-- <MyDirectory class="t-directory" :directory="directoryList">
      <template slot-scope="props">
        <div
          v-if="props.item.children.length > 0"
          class="text-weight-medium pl-1">
          <FolderIcon class="mr-1 mb-1 text-body2" />
          {{ props.item.label }}
        </div>
        <div
          v-else
          class="full-width text-weight-medium pl-4">
          <div
            class="tree-list-item text-body2 cursor-pointer"
            @click="goTo(props.item)">
            <div class="link-item text-body2 text-weight-medium">
              <q-card-actions class="p-0">
                {{ props.item.label }}
                <q-space></q-space>
                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-0 p-0 pr-2 no-border b-compact-dropdown-button text-bold">
                  <b-dropdown-item href="#">
                    <i class="fa fa-search mr-1"></i> Select Contact
                  </b-dropdown-item>
                  <b-dropdown-item href="#" v-b-modal:create-contact-modal>
                    <i class="fa fa-plus mr-1"></i>
                    Create Contact
                  </b-dropdown-item>
                </b-dropdown>
              </q-card-actions>
            </div>
          </div>
        </div>
      </template>
    </MyDirectory> -->
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
// import DirectoryFolder from './directories/directory-folder'
// import DirectoryFolderCreate from './directories/directory-folder-create'
import DirectoryBase from './directories/directory-base'
// import MyDirectory from './directories/directory'
// import FolderIcon from 'components/icons/folder-icon'
import { DIRECTORY_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerList',
  components: {
    DirectoryBase
    // DirectoryFolder,
    // DirectoryFolderCreate
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
      active: '',
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
    goTo (path) {
      let p1 = this.$route.params?.id
      let p2 = path.id
      if (p1 && p2) {
        if (p1.toString() !== p2.toString()) {
          this.$router.push({ path: `/power-dialer/list/${path.id}` })
        }
      }
    },
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    }
  }
}
</script>
