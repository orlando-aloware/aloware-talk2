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

    <contact-menu-item
      v-if="type === ListTypes.DYNAMIC"
      @click="$emit('clonestatic')"
    >
      <template slot="icon">
        <plus-icon></plus-icon>
      </template>
      <template slot="title">
        <span>Clone as Static List</span>
      </template>
    </contact-menu-item>

    <contact-menu-item
      @click="$emit('duplicate')">
      <template slot="icon">
        <duplicate-icon></duplicate-icon>
      </template>
      <template slot="title">
        <span>Duplicate</span>
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

    <contact-menu-item
      v-if="isContactsRoute"
      @click="$emit('pin')">
      <template slot="icon">
        <pin-icon></pin-icon>
      </template>
      <template slot="title">
        <span>{{ isPinned ? 'Unpin' : 'Pin' }}</span>
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
import ContactMenu from './contacts/contact-menu.vue'
import ContactMenuItem from './contacts/contact-menu-item.vue'
import PencilIcon from 'components/icons/pencil-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import DuplicateIcon from 'components/icons/duplicate-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import PinIcon from 'components/icons/pin-icon.vue'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'
import MoveIcon from 'components/icons/move-icon.vue'

export default {
  components: {
    ContactMenu,
    ContactMenuItem,
    PencilIcon,
    PlusIcon,
    DuplicateIcon,
    TrashIcon,
    PinIcon,
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
  },
  computed: {
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    }
  }
}
</script>
