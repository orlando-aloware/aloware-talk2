<template>
  <div :data-layer="layer">
    <div class="folder d-flex align-items-center">
      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder"
      ></div>
      <div class="folder__arrow" @click="onToggleFolder">
        <folder-arrow-open-icon v-if="isOpen"></folder-arrow-open-icon>
        <folder-arrow-close-icon v-if="!isOpen"></folder-arrow-close-icon>
      </div>
      <div class="folder__icon" @click="onToggleFolder">
        <folder-icon></folder-icon>
      </div>

      <div class="flex-grow-1 d-flex align-items-center">
        <div v-if="!isEditing" @click="onToggleFolder" class="folder__name">
          {{ name }}
        </div>
        <input
          :id="'folder-input-' + id"
          v-if="isEditing"
          type="text"
          v-model="name"
          class="folder__input d-inline"
          @blur="onInputBlur"
          autofocus
        />
      </div>

      <button
        :id="'folder-option-' + id"
        class="folder__option btn btn-link p-0"
        :class="{ 'folder__option--hide': isEditing }"
      >
        <folder-option></folder-option>
      </button>
    </div>

    <tree-folder-create
      v-if="isCreatingFolder"
      :layer="layer + 1"
      :parent_id="id"
      @blur="onCloseFolder"
    />

    <div
      v-if="isOpen"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }"
    >
      <tree-folder-contents
        :folders="folders"
        :layer="layer + 1"
      ></tree-folder-contents>
      <tree-list-contents
        :lists="lists"
        :layer="layer + 1"
      ></tree-list-contents>
    </div>

    <b-popover
      :target="'folder-option-' + id"
      triggers="click blur"
      placement="bottomright"
      boundary="window"
      custom-class="contact-popover"
    >
      <folder-actions
        :id="id"
        @create="onCreateFolder"
        @edit="onEditFolder"
        @remove="onRemoveFolder"
      />
    </b-popover>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'src/components/icons/folder-icon.vue'
import FolderArrowOpenIcon from 'src/components/icons/folder-arrow-open-icon.vue'
import FolderArrowCloseIcon from 'src/components/icons/folder-arrow-close-icon.vue'
import FolderOption from 'src/components/icons/folder-option.vue'
import FolderActions from './folder-actions.vue'
import TreeFolderCreate from './tree-folder-create.vue'

let inputTimeout

export default {
  components: {
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon,
    treeFolderContents: () => import('./tree-folder-contents.vue'),
    treeListContents: () => import('./tree-list-contents.vue'),
    FolderOption,
    FolderActions,
    TreeFolderCreate
  },
  computed: {
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    ...mapGetters('contacts', ['opened']),
    isOpen () {
      return this.opened.has(this.id)
    }
  },
  props: {
    id: {
      type: Number
    },
    name: {
      type: String,
      required: true
    },
    folders: {
      type: Array,
      required: false
    },
    lists: {
      type: Array,
      required: false
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {
      isCreatingFolder: false,
      isEditing: false
    }
  },
  methods: {
    ...mapActions('contacts', [
      'toggleFolder',
      'openFolder',
      'closeFolder',
      'removeFolderOpen'
    ]),
    onToggleFolder () {
      this.toggleFolder(this.id)
    },
    onCloseFolder () {
      this.isCreatingFolder = false
    },
    onCreateFolder () {
      this.isCreatingFolder = true
      this.openFolder(this.id)
    },
    onInputBlur () {
      this.$nextTick(() => {
        this.isEditing = false
      })
    },
    onEditFolder () {
      this.isEditing = true
      inputTimeout = setTimeout(() => {
        document.getElementById('folder-input-' + this.id).focus()
      })
    },
    onRemoveFolder () {
      this.$nextTick(() => {
        this.removeFolderOpen({ id: this.id, name: this.name })
      })
    }
  },
  destroyed () {
    clearTimeout(inputTimeout)
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder {
  padding-left: 10px;
  padding-right: 10px;
  min-height: 34px;
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
    .folder__option {
      display: block;
    }
  }
  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 30px);
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
    &--hide {
      width: 0;
      overflow: hidden;
    }
  }
  &__input {
    font-size: 12px;
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 0;
    &:focus {
      outline-color: $green;
      -moz-outline-radius: 0;
    }
  }
}
</style>
