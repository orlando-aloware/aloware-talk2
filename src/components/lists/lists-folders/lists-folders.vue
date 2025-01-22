<template>
    <q-expansion-item default-opened
                      expand-icon-toggle
                      label="My Lists"
                      icon="perm_identity"
                      data-testid="my-lists-sidebar-expansion-item"
                      :class="`contact-sidebar-list-wrapper my-lists hide-toggle`">
      <template v-slot:header>
        <q-item-section>
          <div class="folders__header d-flex align-items-center list--header pb-0">
            <div class="header__header__title font-weight-bold flex-grow-1">
              <span v-if="isContactModuleType">{{ title }}</span>
              <span v-else class="px-3">Power Dialer Lists</span>
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
                              :user-id="userId"
                              v-if="isCreatingFolder"
                              data-testid="contacts-create-folder-toggle"
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
                           :has-show-in-public-folder-permission="hasShowInPublicFolderPermission"
                           :folders="folder.child_folders"
                           :lists="[]"
                           :layer="0"
                           :user-id="userId"
                           data-testid="create-tree-folder-component"
                           v-if="folder.id !== removedFolder"/>
            </template>
            <tree-folder :name="folders[0].name"
                         :id="folders[0].id"
                         :order="folders[0].order"
                         :hasEdit="folders[0].has_edit"
                         :endpoint="foldersEndpoint"
                         :hasDelete="folders[0].has_delete"
                         :has-show-in-public-folder-permission="hasShowInPublicFolderPermission"
                         :isRootList="true"
                         :folders="[]"
                         :lists="[]"
                         :layer="0"
                         :parent_id="null"
                         :user-id="userId"
                         v-if="folders[0].id !== removedFolder"
                         data-testid="create-tree-folder-toggle"
                         @blur="onCreateFolderToggle($event)"
                         @cancel="onCreateFolderCancel"/>
          </template>
          <div class="item-empty"
               v-if="isFolderEmpty && !isLoading">
            <span class="fs-12 text-muted">
              No folders to show
            </span>
          </div>
          <contacts-sidebar-loader v-if="isLoading"/>
        </div>
      </div>
    </q-expansion-item>
  </template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import TreeFolder from 'components/lists/lists-folders/lists-tree-folder.vue'
import TreeFolderCreate from 'components/tree/tree-folder-create.vue'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'
import aclMixin from 'src/plugins/mixins/acl.mixin'
import { createPopper } from '@popperjs/core'

export default {
  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    },
    userId: {
      type: Number
    }
  },
  mixins: [aclMixin],
  components: {
    ContactsSidebarLoader,
    TreeFolder,
    TreeFolderCreate
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
      return !this.folders?.[0]?.child_folders.length
    },
    foldersLength () {
      return this.folders?.length
    },
    rootFolderId () {
      return this.rootFolder?.id
    },
    isContacts () {
      return this.isContactModuleType
    },
    folderId () {
      return this.isContacts ? 'bs-folder-options' : 'pd-folder-options'
    },
    isContact () {
      return this.isContactModuleType
    },
    hasShowInPublicFolderPermission () {
      return this.isBillingAdminOrAdminOrSupervisor
    },

    title () {
      if (this.isAdmin && this.userId !== this.profile.id) {
        return 'User Folders'
      }

      return 'My Folders'
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
      isMenuOpen: true,
      popperInstance: null,
      isUnsavedListModalShown: false,
      listeners: {}
    }
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
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
    onCreateFolderCancel () {
      this.isCreatingFolder = false
    },
    async loadFolders () {
      const params = {}
      if (this.userId) {
        params.user_id = this.userId
      }

      this.isLoading = true
      this.setMyListsLoaded(false)
      await this.$axios
        .get(this.foldersEndpoint, { params })
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
    userId () {
      this.initResources()
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists', this.listeners.fetchContactsLists)
  }
}
</script>
