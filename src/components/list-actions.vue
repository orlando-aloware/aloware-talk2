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
      v-if="type === ContactListTypes.DYNAMIC && listId && false"
      @click="$emit('clonestatic')"
    >
      <template slot="icon">
        <plus-icon></plus-icon>
      </template>
      <template slot="title">
        <span>Clone as Static List</span>
      </template>
    </contact-menu-item>

    <contact-menu-item v-if="listId"
                       @click="$emit('duplicate')">
      <template slot="icon">
        <duplicate-icon></duplicate-icon>
      </template>
      <template slot="title">
        <span>Duplicate</span>
      </template>
    </contact-menu-item>

    <contact-menu-item v-if="hasEdit && listId"
                       @click="$emit('move')">
      <template slot="icon">
        <move-icon></move-icon>
      </template>
      <template slot="title">
        <span class="move-item">Move</span>
      </template>
    </contact-menu-item>

    <contact-menu-item
      v-if="isContactsRoute && listId"
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
        <span>{{ listId === undefined ? 'Discard' : 'Delete'}}</span>
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
import * as ContactListTypes from 'src/constants/contacts-list-types'
import MoveIcon from 'components/icons/move-icon.vue'
import { mapState } from 'vuex'

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
    MoveIcon
  },
  data () {
    return {
      ContactListTypes
    }
  },
  props: {
    listId: {
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
    isPinned: {
      type: Boolean
    },
    showInPublicFolder: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapState('auth', ['profile']),

    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },

    shouldShowSplitOption () {
      console.log('***** this.profile', this.profile)
      return false
      /* if(!this.hasEdit) {
        return false
      } */
      /* const isAgent = this.profile.role_names.includes('Company Agent')
      if (this.showInPublicFolder && isAgent) {
        return false
      }
      return this.type === ContactListTypes.STATIC_LIST && this.no_of_contacts > 50 */
    }
  }
}
</script>
