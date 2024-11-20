<template>
  <contact-menu class="list-actions">
    <contact-menu-item v-if="shouldShowSplitOption"
                       @click="$emit('split')">
      <template slot="icon">
        <copy-icon></copy-icon>
      </template>
      <template slot="title">
        <span>Split</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('rename')" v-if="hasEdit">
      <template slot="icon">
        <pencil-icon></pencil-icon>
      </template>
      <template slot="title">
        <span>Rename</span>
      </template>
    </contact-menu-item>

    <contact-menu-item
      v-if="type === ContactListTypes.DYNAMIC && id && false"
      @click="$emit('clonestatic')"
    >
      <template slot="icon">
        <plus-icon></plus-icon>
      </template>
      <template slot="title">
        <span>Clone as Static List</span>
      </template>
    </contact-menu-item>

    <contact-menu-item v-if="hasDuplicate && id"
                       @click="$emit('duplicate')">
      <template slot="icon">
        <duplicate-icon></duplicate-icon>
      </template>
      <template slot="title">
        <span>Duplicate</span>
      </template>
    </contact-menu-item>

    <contact-menu-item v-if="hasEdit && id"
                       @click="$emit('move')">
      <template slot="icon">
        <move-icon></move-icon>
      </template>
      <template slot="title">
        <span class="move-item">Move</span>
      </template>
    </contact-menu-item>

    <contact-menu-item
      v-if="hasPin && isContactsRoute && id"
      @click="$emit('pin')">
      <template slot="icon">
        <pin-icon></pin-icon>
      </template>
      <template slot="title">
        <span>{{ isPinned ? 'Unpin' : 'Pin' }}</span>
      </template>
    </contact-menu-item>

    <contact-menu-item v-if="hasDelete"
                       @click="$emit('remove')" >
      <template slot="icon">
        <trash-icon></trash-icon>
      </template>
      <template slot="title">
        <span>{{ id === undefined ? 'Discard' : 'Delete'}}</span>
      </template>
    </contact-menu-item>
    <contact-menu-item v-if="hasShowInPublicFolderPermission"
                       @click="$emit('showInPublicFolder')" >
      <template slot="icon">
        <eye-icon></eye-icon>
      </template>
      <template slot="title">
        <span>Convert to Public</span>
      </template>
    </contact-menu-item>
  </contact-menu>
</template>

<script>
import ContactMenu from './contacts/contact-menu.vue'
import ContactMenuItem from './contacts/contact-menu-item.vue'
import PencilIcon from 'components/icons/pencil-icon.vue'
import CopyIcon from 'components/icons/copy-icon.vue'
import PlusIcon from 'components/icons/plus-icon.vue'
import DuplicateIcon from 'components/icons/duplicate-icon.vue'
import TrashIcon from 'components/icons/trash-icon.vue'
import PinIcon from 'components/icons/pin-icon.vue'
import MoveIcon from 'components/icons/move-icon.vue'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { contactLists } from 'src/plugins/mixins'
import EyeIcon from 'components/icons/eye-icon.vue'

export default {
  components: {
    ContactMenu,
    ContactMenuItem,
    PencilIcon,
    CopyIcon,
    PlusIcon,
    DuplicateIcon,
    TrashIcon,
    PinIcon,
    MoveIcon,
    EyeIcon
  },
  mixins: [contactLists],
  data () {
    return {
      ContactListTypes
    }
  },
  props: {
    id: {
      required: true
    },
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
    hasSplit: {
      type: Number,
      required: false,
      default: 0
    },
    hasPin: {
      type: Number,
      required: false,
      default: 1
    },
    hasDuplicate: {
      type: Number,
      required: false,
      default: 1
    },
    hasShowInPublicFolderPermission: {
      type: Boolean,
      required: true
    },
    isPinned: {
      type: Boolean
    },
    contactsCount: {
      type: Number,
      required: false,
      default: 0
    }
  },
  computed: {
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },

    shouldShowSplitOption () {
      return (this.type === ContactListTypes.STATIC && this.contactsCount > this.minimunContactsToSplit) || this.hasSplit
    }
  }
}
</script>
