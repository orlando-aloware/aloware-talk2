<template>
  <div :data-layer="layer">

    <div
      class="folder d-flex align-items-center"
      :class="{ 'folder--target1': isTarget }"
    >

      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder">
      </div>

      <div
        @click="onToggleFolder"
        class="folder__arrow pd-arrow-create">
        <FolderArrowOpenIcon class="pe-none"
                             v-if="isOpen" />
        <FolderArrowCloseIcon class="pe-none"
                              v-if="!isOpen" />
      </div>

      <div
        @click="onToggleFolder"
        class="folder__icon pd-icon-create">
        <FolderIcon />
      </div>

      <div  class="flex-grow-1 d-flex align-items-center">
        <div
          @click="onToggleFolder"
          class="folder__name pd-name-create">
          {{ name }}
        </div>
      </div>

    </div>

    <div
      v-if="isOpen"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }">
      <MoveFolderLists
        :folders="folders"
        :layer="layer + 1"
        :item-folders="listOfChildFolders"
        :item-lists="searchedPdItem && searchedPdItem.length > 0 ? items.filter(item => item.name.toLowerCase().includes(searchedPdItem.toLocaleLowerCase())) : items"
        action="create">
      </MoveFolderLists>
    </div>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'
import { isEmpty } from 'lodash'

export default {
  name: 'CreateListItem',
  components: {
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon,
    MoveFolderLists: () => import('./move-folder-list')
  },
  props: {
    id: {
      type: Number
    },
    name: {
      type: String
    },
    folders: {
      type: Array,
      required: false
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    },
    order: {
      type: Number
    },
    items: {
      type: [Array, Object],
      default: () => []
    }
  },
  computed: {
    ...mapGetters('contacts', ['searchedPdItem']),
    ...mapGetters('powerDialer', [
      'createDialog',
      'searchedListItem'
    ]),
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    listOfItems () {
      if (this.layer === 0) {
        return []
      }
      return this.items?.child_folders || []
    },
    itemLists () {
      return this.items?.lists || []
    },
    listOfChildFolders () {
      return this.items?.child_folders || []
    },
    isTargetable () {
      if (this.createDialog.type === 'list') {
        return this.id > 0
      }
      return true
    }
  },
  data () {
    return {
      isOpen: true
    }
  },
  methods: {
    ...mapActions('powerDialer', ['setCreateDialogTarget']),
    onToggleFolder () {
      this.isOpen = !this.isOpen
    },
    onTarget () {
      this.setCreateDialogTarget({
        target: this.id
      })
    },
    filteredSearchList (value = '') {
      if (!isEmpty(value) && !isEmpty(this.searchedListItem)) {
        let isValid = value.toLowerCase().includes(this.searchedListItem.toLowerCase())
        return isValid
      }
      return true
    },
    isTarget (id) {
      return this.createDialog.target === id
    }
  }
}
</script>
