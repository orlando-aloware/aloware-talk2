<template>
  <div
    :data-layer="layer"
    :class="`layer-indent-${layer} px-2`">

    <div
      v-if="name"
      class="folder d-flex align-items-center"
      :class="{ 'folder--target': isTarget }">

      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder">
      </div>

      <div
        @click="onToggleFolder"
        class="folder__arrow pd-arrow-create">
        <FolderArrowOpenIcon v-if="isOpen" />
        <FolderArrowCloseIcon v-if="!isOpen" />
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

    <template
      v-if="listOfItems.length > 0">

      <template
        v-for="(item, key) in listOfItems">
        <div
          v-if="filteredSearchList(item.name)"
          :key="key"
          class="folder d-flex align-items-center"
          @clicked="{}">

          <div class="folder-item folder__indent flex-grow-1 d-flex align-items-center">
            <div class="folder__name pd-name-create">
              <DialIcon
                color="grey"
                class="mr-1" />
              {{ item.name }}
            </div>
          </div>

          <button
            v-if="isTargetable"
            @click="onTarget"
            class="folder__option btn btn-link p-0">
            <i v-if="!isTarget"
              class="fa fa-circle small">
            </i>
            <i v-if="isTarget"
              class="fa fa-check-circle text-success small">
            </i>
          </button>

        </div>
      </template>
    </template>

    <div
      v-if="isOpen"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }">
      <MoveFolderLists
        :folders="folders"
        :layer="layer + 1"
        :item-folders="listOfChildFolders"
        :item-lists="itemLists"
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
import DialIcon from 'components/icons/dial-icon'
import { isEmpty } from 'lodash'

export default {
  name: 'CreateListItem',
  components: {
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon,
    DialIcon,
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
      return this.items || []
    },
    itemLists () {
      return this.items.lists || []
    },
    listOfChildFolders () {
      return this.items.child_folders || []
    },
    isTarget () {
      return this.createDialog.target === this.id
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
        console.log(`${this.searchedListItem} === ${value}`, isValid)
        return isValid
      }
      return true
    }
  }
}
</script>
