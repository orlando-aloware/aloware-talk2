<template>
  <contact-menu>
    <ContactMenuItem
      v-if="hasEdit"
      @click="$emit('edit')">
      <template slot="icon">
        <PencilIcon />
      </template>
      <template slot="title">
        <span>Rename</span>
      </template>
    </ContactMenuItem>

    <ContactMenuItem
      @mouseover="createSubmenu"
      @mouseleave="destroySubmenu">
      <template slot="icon">
        <PlusIcon />
      </template>
      <template slot="title">
        <span>New</span>
      </template>
      <template slot="suffix">
        <span
          :id="'folder-submenu-' + id"
          class="submenu-icon"
          @click="createSubmenu">
          <FolderArrowCloseIcon />
        </span>
      </template>
    </ContactMenuItem>

    <div
      @mouseleave="destroySubmenu"
      @mouseover="createSubmenu"
      :id="'folder-submenu-items-' + id"
      class="folder-submenu-items"
      :class="{ 'd-flex': isMenuOpen }">
      <ContactMenuItem
        v-if="hasEdit"
        @click="$emit('create')">
        <template slot="icon">
          <FolderIcon />
        </template>
        <template slot="title">
          <span>Folder</span>
        </template>
      </ContactMenuItem>

      <ContactMenuItem
        v-if="hasEdit"
        @mouseover="createChildmenu"
        @mouseleave="destroyChildmenu">
        <template slot="icon">
          <PeopleIcon />
        </template>
        <template slot="title">
          <span>List</span>
        </template>
        <template slot="suffix">
          <span
            :id="'folder-childmenu-' + id"
            class="childmenu-icon"
            @click="createChildmenu">
            <FolderArrowCloseIcon />
          </span>
        </template>
      </ContactMenuItem>
      <div
        @mouseleave="destroyChildmenu"
        @mouseover="createChildmenu"
        :id="'folder-childmenu-items-' + id"
        class="folder-childmenu-items"
        :class="{ 'd-flex': isChildMenuOpen }">
        <ContactMenuItem
          v-if="hasEdit"
          @click="$emit('create-existing')">
          <template slot="icon">
            <FolderIcon />
          </template>
          <template slot="title">
            <span>Create from Existing Contacts List</span>
          </template>
        </ContactMenuItem>
        <ContactMenuItem
          v-if="hasEdit"
          @click="$emit('create-manual')">
          <template slot="icon">
            <FolderIcon />
          </template>
          <template slot="title">
            <span>Create by Manually Selecting Contacts</span>
          </template>
        </ContactMenuItem>
      </div>
    </div>

    <ContactMenuItem
      v-if="hasEdit"
      @click="$emit('move')">
      <template slot="icon">
        <MoveIcon />
      </template>
      <template slot="title">
        <span class="move-item">Move</span>
      </template>
    </ContactMenuItem>

    <ContactMenuItem
      v-if="hasDelete"
      @click="$emit('remove')">
      <template slot="icon">
        <TrashIcon />
      </template>
      <template slot="title">
        <span>Delete</span>
      </template>
    </ContactMenuItem>
  </contact-menu>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions } from 'vuex'
import ContactMenu from 'components/contacts/contact-menu'
import ContactMenuItem from 'components/contacts/contact-menu-item'
import FolderIcon from 'components/icons/folder-2-icon'
import PencilIcon from 'components/icons/pencil-icon'
import MoveIcon from 'components/icons/move-icon'
import TrashIcon from 'components/icons/trash-icon'
import PlusIcon from 'components/icons/plus-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'
import PeopleIcon from 'components/icons/people-icon'

let popperInstance

export default {
  name: 'DirectoryFolderActions',
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
  methods: {
    ...mapActions('powerDialer', ['toggleFolder']),
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
    createChildmenu () {
      this.isChildMenuOpen = true
      this.$nextTick(() => {
        popperInstance = createPopper(
          document.getElementById('folder-childmenu-' + this.id),
          document.getElementById('folder-childmenu-items-' + this.id),
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
    destroyChildmenu (evt) {
      this.isChildMenuOpen = false
      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    }
  }
}
</script>
