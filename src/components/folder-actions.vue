<template>
  <contact-menu>
    <contact-menu-item @click="$emit('edit')" v-if="hasEdit">
      <template slot="icon">
        <pencil-icon></pencil-icon>
      </template>
      <template slot="title">
        <span>Rename</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @mouseover="createSubmenu" @mouseleave="destroySubmenu">
      <template slot="icon">
        <plus-icon></plus-icon>
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
          <folder-arrow-close-icon></folder-arrow-close-icon>
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
      <contact-menu-item @click="$emit('create')" v-if="hasEdit">
        <template slot="icon">
          <folder-icon color="#62666E"></folder-icon>
        </template>
        <template slot="title">
          <span>Folder</span>
        </template>
      </contact-menu-item>

      <contact-menu-item @click="$emit('createlist')" v-if="hasEdit">
        <template slot="icon">
          <people-icon></people-icon>
        </template>
        <template slot="title">
          <span>List</span>
        </template>
      </contact-menu-item>
    </div>

    <contact-menu-item @click="$emit('move')" v-if="hasEdit">
      <template slot="icon">
        <move-icon></move-icon>
      </template>
      <template slot="title">
        <span class="move-item">Move</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('remove')" v-if="hasDelete">
      <template slot="icon">
        <trash-icon></trash-icon>
      </template>
      <template slot="title">
        <span>Delete</span>
      </template>
    </contact-menu-item>
  </contact-menu>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions } from 'vuex'
import ContactMenu from './contacts/contact-menu.vue'
import ContactMenuItem from './contacts/contact-menu-item.vue'
import FolderIcon from 'components/icons/folder-2-icon'
import PencilIcon from 'components/icons/pencil-icon.vue'
import MoveIcon from 'components/icons/move-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import PeopleIcon from 'components/icons/people-icon.vue'

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
      isMenuOpen: false
    }
  },
  methods: {
    ...mapActions('contacts', ['toggleFolder']),
    createSubmenu () {
      this.isMenuOpen = true
      this.$nextTick(() => {
        popperInstance = createPopper(
          document.getElementById('folder-submenu-' + this.id),
          document.getElementById('folder-submenu-items-' + this.id),
          {
            placement: 'auto'
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
