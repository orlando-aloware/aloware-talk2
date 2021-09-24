<template>
  <div :data-layer="layer">
    <div
      class="folder d-flex align-items-center"
      :class="{ 'folder--target': isTarget }"
    >
      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder">
      </div>
      <div class="folder__arrow" @click="onToggleFolder" v-if="folders.length > 0">
        <folder-arrow-open-icon v-if="isOpen"></folder-arrow-open-icon>
        <folder-arrow-close-icon v-if="!isOpen"></folder-arrow-close-icon>
      </div>
      <div class="folder__icon" @click="onToggleFolder">
        <folder-icon></folder-icon>
      </div>

      <div class="flex-grow-1 d-flex align-items-center">
        <div @click="onToggleFolder" class="folder__name">
          {{ name }}
        </div>
      </div>

      <button class="folder__option btn btn-link p-0" @click="onTarget" v-if="isTargetable">
        <i class="fa fa-circle small" v-if="!isTarget"></i>
        <i class="fa fa-check-circle text-success small" v-if="isTarget"></i>
      </button>
    </div>

    <div
      v-if="isOpen"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }"
    >
      <move-folder-lists
        :folders="folders"
        :layer="layer + 1"
      ></move-folder-lists>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'
// import MoveFolderLists from './move-folder-lists'

export default {
  components: {
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon
    // MoveFolderLists
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
    }
  },
  computed: {
    ...mapGetters('powerDialer', ['moveDialog']),
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    isTarget () {
      return this.moveDialog.target === this.id
    },
    isTargetable () {
      if (this.moveDialog.type === 'list') {
        return this.id > 0
      }
      return true
    }
  },
  data () {
    return {
      isOpen: false
    }
  },
  methods: {
    ...mapActions('powerDialer', ['setMoveDialogTarget']),
    onToggleFolder () {
      this.isOpen = !this.isOpen
    },
    onTarget () {
      this.setMoveDialogTarget({
        target: this.id
      })
    }
  },
  mounted () {
    this.isOpen = this.layer < 1
  }
}
</script>
