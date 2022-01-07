<template>
  <q-expansion-item
    default-opened
    expand-icon-toggle
    label="My Lists"
    icon="perm_identity"
    :class="`contact-sidebar-list-wrapper my-lists ${isContactModuleType ? '' : 'hide-toggle'}`"
  >
    <template v-slot:header>
      <q-item-section>
        <div class="folders__header d-flex align-items-center list--header pb-0">
          <div class="header__header__title font-weight-bold flex-grow-1">
            <span v-if="isContactModuleType">My Lists</span>
            <span v-else class="px-3">Power Dialer Lists</span>
            <button
              class="btn btn-link btn-sm tooltip-target mr-1"
              :id="folderId"
              :ref="folderId">
              <plus-icon
                color="#256EFF"
                width="14"
                height="14"
                firstD="M7 1.5V12.5"
                secondD="M12.5 7H1.5"
                strokeWidth="1.5" />
            </button>

            <b-popover
              triggers="click blur"
              placement="bottomright"
              boundary="window"
              custom-class="contact-popover"
              :target="folderId"
              v-if="$refs[folderId] !== undefined">
              <contact-menu>
                <contact-menu-item @click="onCreateFolderToggle">
                  <template slot="icon">
                    <folder-icon color="#62666E"></folder-icon>
                  </template>
                  <template slot="title">
                    <span>Folder</span>
                  </template>
                </contact-menu-item>

                <contact-menu-item
                  v-if="isContactModuleType"
                  @click="onCreateList">
                  <template slot="icon">
                    <people-icon></people-icon>
                  </template>
                  <template slot="title">
                    <span>List</span>
                  </template>
                </contact-menu-item>
                <contact-menu-item
                  v-else
                  @mouseover="createSubmenu"
                  @mouseleave="destroySubmenu">
                  <template slot="icon">
                    <people-icon></people-icon>
                  </template>
                  <template slot="title">
                    <span>List</span>
                  </template>
                  <template slot="suffix">
                    <span
                      :id="'folder-submenu-' + rootFolderId"
                      class="submenu-icon"
                      @click="createSubmenu">
                      <FolderArrowCloseIcon color="#62666E" />
                    </span>
                  </template>
                </contact-menu-item>

                <div
                  :id="'folder-submenu-items-' + rootFolderId"
                  class="folder-submenu-items extended"
                  :class="{ 'd-flex': isMenuOpen }"
                  @mouseleave="destroySubmenu"
                  @mouseover="createSubmenu"
                >
                  <contact-menu-item @click="onCreateFromExistingList">
                    <template slot="title">
                      <span class="create-item">Create from Existing Contacts List</span>
                    </template>
                  </contact-menu-item>

                  <contact-menu-item @click="onCreateByManualSelection">
                    <template slot="title">
                      <span class="create-item">Create by Manually Selecting Contacts</span>
                    </template>
                  </contact-menu-item>
                </div>

              </contact-menu>
            </b-popover>

          </div>
        </div>
      </q-item-section>
    </template>
    <div :class="`folders ${isContactModuleType ? 'border-top' : ''}`">
      <div class="folders__content">
        <tree-folder-create
          v-if="isCreatingFolder"
          :layer="0"
          :parent_id="null"
          :endpoint="foldersEndpoint"
          @blur="onCreateFolderToggle"
          @cancel="onCreateFolderCancel"
        />
        <template v-if="foldersLength && !isLoading">
          <tree-folder
            v-for="folder in folders[0].child_folders"
            :name="folder.name"
            :key="folder.id"
            :id="folder.id"
            :order="folder.order"
            :endpoint="foldersEndpoint"
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
            :endpoint="foldersEndpoint"
            :hasDelete="folders[0].has_delete"
            :isRootList="true"
            :folders="[]"
            :lists="folders[0].lists"
            :layer="0"
            :parent_id="null"
            @blur="onCreateFolderToggle"
            @cancel="onCreateFolderCancel"
          />
        </template>
        <div v-if="isFolderEmpty && !isLoading"
            class="item-empty">
          <span class="fs-12 text-muted">
            You don't have any contact list
          </span>
        </div>
        <contacts-sidebar-loader v-if="isLoading"></contacts-sidebar-loader>
      </div>
    </div>
  </q-expansion-item>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import TreeFolder from '../tree/tree-folder.vue'
import TreeFolderCreate from '../tree/tree-folder-create.vue'
import ContactMenu from './contact-menu.vue'
import ContactMenuItem from './contact-menu-item.vue'
import FolderIcon from 'components/icons/folder-icon.vue'
import PeopleIcon from 'components/icons/people-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import pdList from 'src/plugins/mixins/power-dialer-list'
import { createPopper } from '@popperjs/core'

let popperInstance

export default {
  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    }
  },
  mixins: [pdList],
  components: {
    ContactsSidebarLoader,
    TreeFolder,
    TreeFolderCreate,
    ContactMenu,
    ContactMenuItem,
    FolderIcon,
    PeopleIcon,
    FolderArrowCloseIcon,
    PlusIcon
  },
  computed: {
    ...mapState('contacts', [
      'folders'
    ]),
    ...mapGetters('powerDialer', [
      'datatableLoader'
    ]),
    foldersWithoutRoot () {
      return this.folders?.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.folders?.find(folder => folder.name === 'Root')
    },
    rootFolderIsContactModuleType () {
      if (this.rootFolder.module_type === 0) {
        return true
      }
      return false
    },
    foldersEndpoint () {
      return this.isContactModuleType ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    },
    isFolderEmpty () {
      return !this.folders?.[0]?.child_folders.length && !this.folders?.[0]?.lists.length
    },
    foldersLength () {
      return this.folders?.length
    },
    rootFolderId () {
      return this.rootFolder?.id
    },
    isContacts () {
      return this.$route.name === 'Contacts'
    },
    folderId () {
      return this.isContacts ? 'bs-folder-options' : 'pd-folder-options'
    }
  },
  mounted () {
    this.loadFolders()
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false,
      isMenuOpen: false
    }
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
      'createListOpen',
      'createPdListOpen'
    ]),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    onCreateList () {
      this.createListOpen({
        contact_folder_id: null
      })
    },
    onCreateFromExistingList () {
      // this.TOGGLE_CREATE_FROM_EXISTING_LIST(true)
      this.$root.$emit('bv::hide::popover')
      this.createPdListOpen({
        id: '',
        type: 'list'
      })
    },
    onCreateByManualSelection () {
      this.$root.$emit('bv::hide::popover')
      this.$axios
        .post('/api/v2/power-dialer-lists', {
          type: 1,
          name: this.fetchedNameList()
        })
        .then((response) => response.data)
        .then((response) => {
          console.log('LOG: Successfully created a list...', response)
          this.reloadFolders()
          this.$generalNotification(response.message, 'success')
          setTimeout(() => {
            this.$router.push(`/power-dialer/list/${response.data.id}/add`)
          }, 500)
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(`Error in creating a list. ${message}`, 'error')
        })
    },
    onCreateFolderCancel () {
      this.isCreatingFolder = false
    },
    loadFolders () {
      this.isLoading = true
      this.$axios
        .get(this.foldersEndpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .finally(() => {
          this.isLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    createSubmenu () {
      this.isMenuOpen = true
      this.$nextTick(() => {
        popperInstance = createPopper(
          document.getElementById('folder-submenu-' + this.rootFolder?.id),
          document.getElementById('folder-submenu-items-' + this.rootFolder?.id),
          {
            placement: 'right-start'
          }
        )
      })
    },
    destroySubmenu (evt) {
      this.isMenuOpen = false
      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    }
  }
}
</script>
