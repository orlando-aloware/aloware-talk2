<template>
  <div :data-layer="layer" :class="`layer-indent-${layer}`">
    <div
      v-if="name"
      class="folder d-flex align-items-center"
      :class="{ 'folder--target': isTarget }"
    >
      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder">
      </div>
      <div class="folder__arrow" @click="onToggleFolder" >
        <folder-arrow-open-icon v-if="isOpen"></folder-arrow-open-icon>
        <folder-arrow-close-icon v-if="!isOpen"></folder-arrow-close-icon>
      </div>
      <div class="folder__icon"  @click="onToggleFolder">
        <folder-icon></folder-icon>
      </div>

      <div  class="flex-grow-1 d-flex align-items-center">
        <div @click="onToggleFolder" class="folder__name">
          {{ name }}
        </div>
      </div>

      <!-- <button class="folder__option btn btn-link p-0" @click="onTarget" v-if="isTargetable">
        <i class="fa fa-circle small" v-if="!isTarget"></i>
        <i class="fa fa-check-circle text-success small" v-if="isTarget"></i>
      </button> -->
    </div>

    <template
      v-if="listOfItems.length > 0">
      <div
        v-for="(item, key) in listOfItems"
        :key="key"
        class="folder d-flex align-items-center"
        @clicked="{}">

        <div class="folder folder__indent flex-grow-1 d-flex align-items-center">
          <div class="folder__name">
            {{ item.name }}
          </div>
        </div>

        <button class="folder__option btn btn-link p-0" @click="onTarget" v-if="isTargetable">
          <i class="fa fa-circle small" v-if="!isTarget"></i>
          <i class="fa fa-check-circle text-success small" v-if="isTarget"></i>
        </button>
      </div>
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
        action="create"
      ></MoveFolderLists>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'

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
    ...mapGetters('powerDialer', [
      'createDialog'
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
      console.log('299 :>> ', 299)
      this.isOpen = !this.isOpen
    },
    onTarget () {
      console.log('Clicked')
      this.setCreateDialogTarget({
        target: this.id
      })
    }
  },
  mounted () {
    console.log('100 :>> ', 100)
    this.isOpen = this.layer < 1
  }
}
</script>
