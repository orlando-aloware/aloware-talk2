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
      <div class="folder__arrow d-flex align-items-center" @click="onToggleFolder">
        <folder-arrow-open-icon v-if="isOpen"
                                :class="{ 'transparent': folders.length === 0 }"
                                color="#62666E">
        </folder-arrow-open-icon>
        <folder-arrow-close-icon v-if="!isOpen"
                                 :class="{ 'transparent': folders.length === 0 }"
                                 color="#62666E">
        </folder-arrow-close-icon>
      </div>
      <div class="folder__icon d-flex align-items-center" @click="onToggleFolder">
        <folder-icon color="#62666E"></folder-icon>
      </div>

      <div class="folder__name d-flex align-items-center"
           @click="onToggleFolder">
        <div class="folder__name d-flex align-items-center">
          {{ name }}
        </div>
      </div>

      <button class="folder__option btn btn-link p-0 shadow-none" @click="onTarget" v-if="isTargetable">
        <i class="fa fa-circle small" v-if="!isTarget"></i>
        <i class="fa fa-check-circle text-primary small" v-if="isTarget"></i>
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
import FolderIcon from 'components/icons/folder-icon.vue'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon.vue'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'

export default {
  components: {
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon,
    MoveFolderLists: () => import('./move-folder-lists.vue')
  },
  computed: {
    ...mapGetters('contacts', ['moveDialog']),
    indentStyle () {
      return {
        flex: `0 0 ${this.layer * 10}px`
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
    ...mapActions('contacts', ['setMoveDialogTarget']),
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
  }
}
</script>
