<template>
  <contact-menu class="list-actions">
    <contact-menu-item @click="$emit('rename')" v-if="hasEdit">
      <template slot="icon">
        <pencil-icon></pencil-icon>
      </template>
      <template slot="title">
        <span>Rename</span>
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
import ContactMenu from 'components/contacts/contact-menu.vue'
import ContactMenuItem from 'components/contacts/contact-menu-item.vue'
import PencilIcon from 'components/icons/pencil-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'
import MoveIcon from 'components/icons/move-icon.vue'

export default {
  components: {
    ContactMenu,
    ContactMenuItem,
    PencilIcon,
    TrashIcon,
    MoveIcon
  },
  data () {
    return {
      ListTypes: {
        DYNAMIC,
        STATIC
      }
    }
  },
  props: {
    type: {
      type: Number,
      required: true
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    },
    isPinned: {
      type: Boolean
    }
  }
}
</script>
