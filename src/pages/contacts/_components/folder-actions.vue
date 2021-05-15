<template>
  <contact-menu title="Actions">
    <contact-menu-item @click="$emit('edit')" v-if="hasEdit">
      <template slot="icon">
        <pencil-icon></pencil-icon>
      </template>
      <template slot="title">
        <span>Rename</span>
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
    <!-- <contact-menu-item>
      <template slot="icon">
        <permission-icon></permission-icon>
      </template>
      <template slot="title">
        <span>Permissions</span>
      </template>
    </contact-menu-item> -->
    <contact-menu-item @click="$emit('remove')" v-if="hasDelete">
      <template slot="icon">
        <trash-icon></trash-icon>
      </template>
      <template slot="title">
        <span>Remove</span>
      </template>
    </contact-menu-item>
  </contact-menu>
</template>

<script>
import { mapActions } from 'vuex'
import contactMenu from './contact-menu.vue'
import contactMenuItem from './contact-menu-item.vue'
import folderIcon from 'src/components/icons/folder-2-icon'
import pencilIcon from 'src/components/icons/pencil-icon.vue'
// import permissionIcon from 'src/components/icons/permission-icon.vue'
import trashIcon from 'src/components/icons/trash-icon.vue'

export default {
  components: {
    contactMenu,
    contactMenuItem,
    folderIcon,
    pencilIcon,
    // permissionIcon,
    trashIcon
  },
  props: {
    id: {
      type: Number
    },
    hasEdit: {
      type: Boolean
    },
    hasDelete: {
      type: Boolean
    }
  },
  methods: {
    ...mapActions('contacts', ['toggleFolder'])
  }
}
</script>
