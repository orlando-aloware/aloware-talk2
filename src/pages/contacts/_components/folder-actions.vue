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

    <contact-menu-item>
      <template slot="icon">
        <plus-icon></plus-icon>
      </template>
      <template slot="title">
        <span>New</span>
      </template>
      <template slot="suffix">
        <span class="submenu-icon">
          <folder-arrow-close-icon></folder-arrow-close-icon>
        </span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('create')" v-if="hasEdit">
      <template slot="icon">
        <folder-icon></folder-icon>
      </template>
      <template slot="title">
        <span>New Folder</span>
      </template>
    </contact-menu-item>

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
import { mapActions } from 'vuex'
import ContactMenu from './contact-menu.vue'
import ContactMenuItem from './contact-menu-item.vue'
import FolderIcon from 'src/components/icons/folder-2-icon'
import PencilIcon from 'src/components/icons/pencil-icon.vue'
import MoveIcon from 'src/components/icons/move-icon.vue'
import TrashIcon from 'src/components/icons/trash-icon.vue'
import PlusIcon from 'src/components/icons/plus-icon.vue'
import FolderArrowCloseIcon from 'src/components/icons/folder-arrow-close-icon.vue'

export default {
  components: {
    ContactMenu,
    ContactMenuItem,
    FolderIcon,
    PencilIcon,
    TrashIcon,
    MoveIcon,
    PlusIcon,
    FolderArrowCloseIcon
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
  methods: {
    ...mapActions('contacts', ['toggleFolder'])
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.submenu-icon {
  svg {
    path {
      fill: $black;
    }
  }
}
</style>
