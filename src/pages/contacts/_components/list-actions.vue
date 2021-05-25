<template>
  <contact-menu>
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
      @click="$emit('clone_static')"
    >
      <template slot="icon">
        <plus-icon></plus-icon>
      </template>
      <template slot="title">
        <span>Clone as Static List</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('duplicate')">
      <template slot="icon">
        <duplicate-icon></duplicate-icon>
      </template>
      <template slot="title">
        <span>Duplicate</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('move')">
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
        <span>Remove</span>
      </template>
    </contact-menu-item>

    <contact-menu-item @click="$emit('pin')">
      <template slot="icon">
        <pin-icon></pin-icon>
      </template>
      <template slot="title">
        <span>{{ isPinned ? 'Unpin' : 'Pin' }}</span>
      </template>
    </contact-menu-item>
  </contact-menu>
</template>

<script>
import ContactMenu from './contact-menu.vue'
import ContactMenuItem from './contact-menu-item.vue'
import PencilIcon from 'src/components/icons/pencil-icon.vue'
import PlusIcon from 'src/components/icons/plus-icon.vue'
import DuplicateIcon from 'src/components/icons/duplicate-icon.vue'
import TrashIcon from 'src/components/icons/trash-icon.vue'
import PinIcon from 'src/components/icons/pin-icon.vue'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'
import MoveIcon from 'src/components/icons/move-icon.vue'

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
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder {
  padding-left: 10px;
  padding-right: 10px;
  line-height: 34px;
  cursor: pointer;
  user-select: none;
  transition: background-color 100ms ease-in-out;
  &__arrow {
    margin-top: -5px;
    margin-right: 5px;
  }
  &__icon {
    margin-top: -5px;
    margin-right: 5px;
  }
  &:hover {
    background-color: $light-green2;
  }
  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
  }
}
</style>
