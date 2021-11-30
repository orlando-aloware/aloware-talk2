<template>
  <contact-menu>

    <contact-menu-item @click="$emit('edit')" v-if="hasEdit">
      <template slot="icon">
        <pencil-icon color="#62666E"></pencil-icon>
      </template>
      <template slot="title">
        <span>Rename</span>
      </template>
    </contact-menu-item>

    <contact-menu-item
      @mouseover="createSubmenu"
      @mouseleave="destroySubmenu">
      <template slot="icon">
        <plus-icon color="#62666E"></plus-icon>
      </template>
      <template slot="title">
        <span>New</span>
      </template>
      <template slot="suffix">
        <span
          :id="'folder-submenu-' + id"
          class="submenu-icon"
          @click="createSubmenu"
        >
          <folder-arrow-close-icon color="#62666E">
          </folder-arrow-close-icon>
        </span>
      </template>
    </contact-menu-item>

    <div
      :id="'folder-submenu-items-' + id"
      class="folder-submenu-items"
      :class="{ 'd-flex': isMenuOpen }"
      @mouseleave="destroySubmenu"
      @mouseover="createSubmenu"
    >
      <contact-menu-item
        @click="$emit('create')" v-if="hasEdit"
        @mouseover="isChildMenuOpen = false">
        <template slot="icon">
          <folder-icon color="#62666E"></folder-icon>
        </template>
        <template slot="title">
          <span>Folder</span>
        </template>
      </contact-menu-item>

      <template v-if="isContactsRoute">
        <contact-menu-item
          v-if="hasEdit"
          @click="$emit('createlist')">
          <template slot="icon">
            <people-icon color="#62666E"></people-icon>
          </template>
          <template slot="title">
            <span>List</span>
          </template>
        </contact-menu-item>
      </template>
      <template v-else>
        <contact-menu-item
          v-if="hasEdit"
          @mouseover="createChildSubmenu">
          <template slot="icon">
            <people-icon color="#62666E"></people-icon>
          </template>
          <template slot="title">
            <span>List 1</span>
          </template>
          <template slot="suffix">
            <span
              :id="'folder-submenu-child-' + id"
              class="submenu-icon"
              @click="{}">
              <FolderArrowCloseIcon color="#62666E" />
            </span>
          </template>
        </contact-menu-item>
        <div
          v-if="isChildMenuOpen"
          :id="'folder-submenu-child-items-' + id"
          class="folder-submenu-items folder-submenu-child-items extended"
          :class="{ 'd-flex': isChildMenuOpen }"
          @mouseleave="destroyChildSubmenu"
          @mouseover="createChildSubmenu"
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
      </template>
    </div>

    <contact-menu-item @click="$emit('move')" v-if="hasEdit">
      <template slot="icon">
        <move-icon color="#62666E"></move-icon>
      </template>
      <template slot="title">
        <span class="move-item">Move</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('remove')" v-if="hasDelete">
      <template slot="icon">
        <trash-icon color="#62666E"></trash-icon>
      </template>
      <template slot="title">
        <span>Delete</span>
      </template>
    </contact-menu-item>
  </contact-menu>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapState, mapActions, mapMutations } from 'vuex'
import ContactMenu from './contacts/contact-menu.vue'
import ContactMenuItem from './contacts/contact-menu-item.vue'
import FolderIcon from 'components/icons/folder-2-icon'
import PencilIcon from 'components/icons/pencil-icon.vue'
import MoveIcon from 'components/icons/move-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import PeopleIcon from 'components/icons/people-icon.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import pdList from 'src/plugins/mixins/power-dialer-list'

let popperInstance

export default {
  components: {
    ContactMenu,
    ContactMenuItem,
    FolderIcon,
    PencilIcon,
    TrashIcon,
    MoveIcon,
    PlusIcon,
    FolderArrowCloseIcon,
    PeopleIcon
  },
  mixins: [pdList],
  props: {
    id: {
      type: Number
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    }
  },
  data () {
    return {
      isMenuOpen: false,
      isChildMenuOpen: false
    }
  },
  computed: {
    ...mapState('contacts', [
      'folders'
    ]),
    isContactsRoute () {
      if (this.$route.meta.title === 'Contacts') {
        return true
      }
      return false
    },
    foldersEndpoint () {
      if (this.isContactsRoute) {
        return '/api/v2/contact-folders'
      }
      return '/api/v2/power-dialer-folders'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'toggleFolder',
      'createPdListOpen',
      'foldersLoaded'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_CREATE_FROM_EXISTING_LIST'
    ]),
    createSubmenu () {
      this.isMenuOpen = true
      this.$nextTick(() => {
        popperInstance = createPopper(
          document.getElementById('folder-submenu-' + this.id),
          document.getElementById('folder-submenu-items-' + this.id),
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
    },
    createChildSubmenu () {
      this.isChildMenuOpen = true
      this.$nextTick(() => {
        popperInstance = createPopper(
          document.getElementById('folder-submenu-child-' + this.id),
          document.getElementById('folder-submenu-child-items-' + this.id),
          {
            placement: 'right-start'
          }
        )
      })
    },
    destroyChildSubmenu (evt) {
      this.isChildMenuOpen = false
      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    },
    onCreateFromExistingList () {
      console.log('Should create list from existing contacts...')
      this.TOGGLE_CREATE_FROM_EXISTING_LIST(true)
      this.$root.$emit('bv::hide::popover')
      this.createPdListOpen({
        id: this.id,
        type: 'list'
      })
    },
    onCreateByManualSelection () {
      let { id } = this
      this.$axios
        .post('/api/v2/power-dialer-lists', {
          contact_folder_id: id,
          type: 1,
          name: this.fetchedNameList
        })
        .then((response) => response.data)
        .then((response) => {
          console.log('LOG: Successfully created a list...', response)
          this.reloadFolders()
          // this.foldersLoaded()
          this.$generalNotification(response.message, 'success')
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(`Error in creating a list. ${message}`, 'error')
        })
    }
  }
}
</script>
