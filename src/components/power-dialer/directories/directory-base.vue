<template>
  <div class="folders">
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title pl-3 flex-grow-1">
        {{ title }}
      </div>

      <!-- Display menu for adding list or folders -->
      <b-popover
        target="bs-folder-options"
        triggers="click "
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover"
        :show.sync="popover">

        <q-card
          :class="`t-cascade-card ${createSubItems.length > 0 ? '' : 't-cascade-card__mini'} p-0 no-border`"
          style="box-shadow:0px 0px 0px 1px #dbdbdb !important;"
          flat bordered>
          <q-card-section class="p-0" horizontal>
            <q-card-section
              style="width:150px;"
              class="p-0">
              <q-list dense class="rounded-borders">
                <template v-for="(item, key) in createItems">
                  <q-item
                    v-if="item.children.length > 0"
                    :key="key"
                    clickable v-close-popup
                    @click="toggleChildItems(item.children)">
                    <q-item-section class="px-2">
                      <q-item-label>
                        <div class="text-caption">
                          <people-icon></people-icon>
                          <span class="pl-2">{{ item.name }}</span>
                        </div>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side class="px-2">
                      <i class="fas fa-chevron-right fa-1x pr-2" style="font-size:10px;"></i>
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-else
                    :key="key"
                    clickable v-close-popup
                    @click="onCreateFolderToggle">
                    <q-item-section class="px-2">
                      <q-item-label>
                        <div class="text-caption">
                          <folder-icon></folder-icon>
                          <span class="pl-2">{{ item.name }}</span>
                        </div>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-card-section>

            <q-separator vertical />

            <q-card-section
              v-if="createSubItems"
              class="p-0">
              <q-list dense>
                <q-item
                  v-for="(i, ikey) in createSubItems"
                  :key="ikey"
                  clickable
                  @click="clickedSubItem(i)">
                  <q-item-section
                    class="px-2">
                    <q-item-label>
                      <div class="text-caption">
                        <span :class="`pl-2 ${i.meta === 'create-existing' ? 'move-item' : ''}`">{{ i.name }}</span>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card-section>
        </q-card>
      </b-popover>
      <button
        class="btn btn-link btn-sm tooltip-target mr-1"
        id="bs-folder-options">
        <PlusIcon color="blue" />
      </button>

    </div>

    <div class="d-flex t-menu__content flex-column p-0">
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

    <!-- <CreateListDialog /> -->

  </div>
</template>

<script>

import { mapActions } from 'vuex'
import DirectoryFolder from './directory-folder'
import DirectoryFolderCreate from './directory-folder-create'
import FolderIcon from 'components/icons/folder-icon'
import PeopleIcon from 'components/icons/people-icon'
import PlusIcon from 'components/icons/plus-icon'
// import CreateListDialog from 'components/power-dialer/custom/move-dialog'

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
    // CreateListDialog,
    FolderIcon,
    PeopleIcon,
    PlusIcon
  },
  mounted () {
    this.loadFolders()
  },
  watch: {
    popover (val) {
      if (val) {
        this.createSubItems = []
      }
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'createListOpen',
      'foldersLoaded',
      'openMoveDialog',
      'openCreateListDialog'
    ]),
    onMove () {
      this.$root.$emit('bv::hide::popover')
      this.openMoveDialog({
        id: 565,
        type: 'list'
      })
    },
    onCreateFromExistingList () {
      this.$root.$emit('bv::hide::popover')
      this.openCreateListDialog({
        id: '',
        type: 'list'
      })
    },
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
      if (this.isCreatingFolder === true) {
        this.createSubItems = []
      }
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    },
    toggleChildItems (arr = []) {
      this.createSubItems = arr
    },
    clickedSubItem (val) {
      if (val.meta === 'create-existing') {
        this.onCreateFromExistingList()
      }
    },
    loadFolders () {
      this.isLoading = false
      this.foldersLoaded()
      // this.$axios
      //   .get('/api/v2/contact-folders')
      //   .then((response) => response.data)
      //   .then(this.foldersLoaded)
      //   .finally(() => {
      //     this.isLoading = false
      //   })
      //   .catch((err) => {
      //     console.error(err)
      //     this.$generalNotification('Unable to load folders please try again.', 'error')
      //   })
    }
  },
  data () {
    return {
      isCreatingFolder: false,
      popover: false,
      createItems: [
        {
          name: 'Folder',
          children: []
        },
        {
          name: 'List',
          children: [
            {
              name: 'Create from Existing Contacts List',
              meta: 'create-existing'
            },
            {
              name: 'Create by Manually Selecting Contacts',
              meta: 'create-manual'
            }
          ]
        }
      ],
      createSubItems: []
    }
  }
}
</script>
