<template>
  <q-expansion-item default-opened
                    expand-icon-toggle
                    label="My Lists"
                    icon="perm_identity"
                    :class="`contact-sidebar-list-wrapper my-lists ${isContactModuleType ? '' : 'hide-toggle'}`">
    <template v-slot:header>
      <q-item-section>
        <div class="folders__header d-flex align-items-center list--header pb-0">
          <div class="header__header__title font-weight-bold flex-grow-1">
            <span v-if="isContactModuleType">My Lists</span>
            <span v-else class="px-3">Power Dialer Lists</span>
            <button class="btn btn-link btn-sm tooltip-target mr-1"
                    :id="folderId"
                    :ref="folderId"
                    @click="destroySubmenu">
              <plus-icon color="#256EFF"
                          width="14"
                          height="14"
                          firstD="M7 1.5V12.5"
                          secondD="M12.5 7H1.5"
                          strokeWidth="1.5" />
            </button>

            <b-popover triggers="click blur"
                        placement="bottomright"
                        boundary="window"
                        custom-class="contact-popover"
                        :target="folderId">
              <!-- v-if="$refs[folderId] !== undefined"> -->
              <contact-menu>
                <contact-menu-item @click="onCreateFolderToggle($event)">
                  <template slot="icon">
                    <folder-icon color="#62666E"></folder-icon>
                  </template>
                  <template slot="title">
                    <span>Folder</span>
                  </template>
                </contact-menu-item>

                <contact-menu-item v-if="isContactModuleType"
                                    @click="onCreateList($event)">
                  <template slot="icon">
                    <people-icon></people-icon>
                  </template>
                  <template slot="title">
                    <span>List</span>
                  </template>
                </contact-menu-item>
                <contact-menu-item v-else
                                    @mouseover="createSubmenu"
                                    @mouseleave="destroySubmenu">
                  <template slot="icon">
                    <people-icon></people-icon>
                  </template>
                  <template slot="title">
                    <span>List</span>
                  </template>
                  <template slot="suffix">
                    <span :id="'folder-submenu-' + rootFolderId"
                          class="submenu-icon"
                          @click="createSubmenu">
                      <FolderArrowCloseIcon color="#62666E" />
                    </span>
                  </template>
                </contact-menu-item>

                <div class="folder-submenu-items extended"
                      :id="'folder-submenu-items-' + rootFolderId"
                      :class="{ 'd-flex': isMenuOpen }"
                      @mouseleave="{}"
                      @mouseover="createSubmenu">

                  <contact-menu-item style="padding:0 !important"
                                      @click="onCreateFromExistingList">
                    <template slot="title">
                      <span class="create-item"
                            style="width:100%;padding:10px;">
                        Create from existing contacts list
                      </span>
                    </template>
                  </contact-menu-item>

                  <contact-menu-item @click="onCreateByManualSelection">
                    <template slot="title">
                      <span class="create-item">
                        Create new list &amp; select contacts
                      </span>
                    </template>
                  </contact-menu-item>
                  <contact-menu-item v-if="isIntegrationEnabled"
                                     @click="onCreateFromIntegration">
                    <template slot="title">
                      <span class="create-item">
                        Import from Integration
                      </span>
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
        <!-- <p @click="isLoading = !isLoading">-- {{ isLoading }}</p> -->
        <tree-folder-create :layer="0"
                            :parent_id="null"
                            :endpoint="foldersEndpoint"
                            v-if="isCreatingFolder"
                            @blur="onCreateFolderToggle($event)"
                            @cancel="onCreateFolderCancel"/>
        <template v-if="foldersLength && !isLoading">
          <template v-for="folder in folders[0].child_folders">
            <tree-folder :name="folder.name"
                          :key="folder.id"
                          :id="folder.id"
                          :order="folder.order"
                          :endpoint="foldersEndpoint"
                          :hasEdit="folders[0].has_edit"
                          :hasDelete="folders[0].has_delete"
                          :folders="folder.child_folders"
                          :lists="folder.lists"
                          :layer="0"
                          v-if="folder.id !== removedFolder"/>
          </template>
          <tree-folder :name="folders[0].name"
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
                        v-if="folders[0].id !== removedFolder"
                        @blur="onCreateFolderToggle($event)"
                        @cancel="onCreateFolderCancel"/>
        </template>
        <div class="item-empty"
              v-if="isFolderEmpty && !isLoading">
          <span class="fs-12 text-muted">
            You don't have any contact list
          </span>
        </div>
        <contacts-sidebar-loader v-if="isLoading"/>
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
// import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import pdList from 'src/plugins/mixins/power-dialer-list'
import { createPopper } from '@popperjs/core'

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
      'folders',
      'removedFolder',
      'activeFolder',
      'createDialog',
      'unsavedList'
    ]),
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('powerDialer', [
      'datatableLoader'
    ]),
    foldersWithoutRoot () {
      return this.folders?.filter(folder => folder.name !== 'Root')
    },
    rootFolder () {
      return this.folders?.find(folder => folder.name === 'Root')
    },
    foldersEndpoint () {
      return this.isContacts ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
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
      return this.$route.name === 'Contacts' && this.isContactModuleType
    },
    folderId () {
      return this.isContacts ? 'bs-folder-options' : 'pd-folder-options'
    },
    routeName () {
      return this.$route.name
    },
    routePath () {
      if (this.isPD) {
        return 'Power Dialer'
      } else if (this.isContact) {
        return 'Contacts'
      }
      return ''
    },
    isPD () {
      return this.routeName === 'Power Dialer' && !this.isContactModuleType
    },
    isContact () {
      return this.routeName === 'Contacts' && this.isContactModuleType
    },
    isIntegrationEnabled () {
      return this.currentCompany && (this.currentCompany.hubspot_integration_enabled || this.currentCompany.zoho_integration_enabled || this.currentCompany.pipedrive_integration_enabled)
    }
  },
  mounted () {
    this.initResources()
    this.listeners.fetchContactsLists = () => {
      this.initResources()
    }
    this.$VueEvent.listen('fetchContactsLists', this.listeners.fetchContactsLists)
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false,
      isMenuOpen: false,
      popperInstance: null,
      isUnsavedListModalShown: false,
      listeners: {}
    }
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
      'createListOpen',
      'createPdListOpen',
      'setActiveFolder',
      'setMyListsLoaded',
      'setUnsavedList'
    ]),
    initResources () {
      this.loadFolders()
      this.setActiveFolder(this.folderId)
    },
    showUnsavedListDialog (callback) {
      if (this.unsavedList && !this.isUnsavedListModalShown) {
        this.isUnsavedListModalShown = true
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.setUnsavedList(null)
            callback()
          }

          this.isUnsavedListModalShown = false
        })
      }

      if (!this.unsavedList) {
        callback()
      }
    },
    onCreateFolderToggle (event) {
      if (event) {
        event.preventDefault()
      }

      this.showUnsavedListDialog(() => {
        this.isCreatingFolder = !this.isCreatingFolder
      })
    },
    onCreateList (event) {
      if (event) {
        event.preventDefault()
      }

      this.showUnsavedListDialog(() => {
        this.createListOpen({
          contact_folder_id: null
        })
      })
    },
    onCreateFromExistingList (data) {
      // this.TOGGLE_CREATE_FROM_EXISTING_LIST(true)
      this.destroySubmenu()
      this.createPdListOpen({
        id: '',
        type: 'list'
      })
      this.$root.$emit('bv::hide::popover')
    },
    onCreateByManualSelection () {
      this.destroySubmenu()
      this.createListOpen({
        contact_folder_id: null
      })
    },
    onCreateFromIntegration () {
      this.destroySubmenu()
      this.$emit('openIntegrationListsImportDialog')
    },
    onCreateFolderCancel () {
      this.isCreatingFolder = false
    },
    async loadFolders () {
      this.isLoading = true
      this.setMyListsLoaded(false)
      await this.$axios
        .get(this.foldersEndpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load folders please try again.', 'error')
          this.setMyListsLoaded(true)
          this.isLoading = false
        })
        .finally(() => {
          this.isLoading = false
          this.setMyListsLoaded(true)
        })
    },
    createSubmenu () {
      this.isMenuOpen = true
      this.$nextTick(() => {
        this.popperInstance = createPopper(
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
      if (this.popperInstance) {
        this.popperInstance.destroy()
        this.popperInstance = null
      }
    }
  },
  watch: {
    routeName (val) {
      if (val === this.routePath) {
        this.initResources()
      }
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists', this.listeners.fetchContactsLists)
  }
}
</script>
