<template>
  <div :data-layer="layer">
    <div
      v-if="!isRootList"
      class="folder d-flex align-items-center"
      :class="{ 'folder--selected': isSelected }"
    >
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
          :value="name"
          :disabled="isRenaming"
          class="folder__input d-inline"
          @blur="onInputBlur"
          @keydown="onKeyDown"
          autofocus
        />
      </div>

      <button
        :data-popper-target="'folder-' + id"
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
      v-if="isOpen && !isRootList"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }"
    >
      <tree-folder-contents
        :folders="folders"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete"
        :layer="layer + 1"
      ></tree-folder-contents>
      <tree-list-contents
        :lists="lists"
        :layer="layer + 1"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete"
      ></tree-list-contents>
    </div>

    <tree-list-contents
      v-if="isRootList"
      :lists="lists"
      :layer="layer + 1"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      :isRootList="isRootList"
    ></tree-list-contents>

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
        @move="onMove"
        @createlist="onCreateList"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete"
      />
    </b-popover>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon.vue'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon.vue'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import FolderOption from 'components/icons/folder-option.vue'
import FolderActions from '../folder-actions.vue'
import TreeFolderCreate from './tree-folder-create.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let inputTimeout

export default {
  props: {
    id: {
      type: Number
    },

    name: {
      type: String
    },

    hasEdit: {
      type: Number
    },

    hasDelete: {
      type: Number
    },

    isRootList: {
      type: Boolean,
      required: false,
      default: false
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
    },

    order: {
      type: Number
    }
  },

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

  data () {
    return {
      isCreatingFolder: false,
      isEditing: false,
      isRenaming: false
    }
  },

  computed: {
    ...mapGetters('contacts', ['opened', 'moveDialog', 'createList']),

    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },

    isOpen () {
      return this.opened.has(this.id)
    },

    isSelected () {
      return (
        (this.id === this.moveDialog.id && this.moveDialog.type === 'folder') ||
        (this.createList.open && this.createList.folderId === this.id)
      )
    }
  },

  methods: {
    ...mapActions('contacts', [
      'toggleFolder',
      'openFolder',
      'closeFolder',
      'removeFolderOpen',
      'foldersLoaded',
      'openMoveDialog',
      'createListOpen'
    ]),

    onMove () {
      this.$root.$emit('bv::hide::popover')
      this.openMoveDialog({
        id: this.id,
        type: 'folder'
      })
    },

    onCreateList () {
      this.$root.$emit('bv::hide::popover')

      this.createListOpen({
        contact_folder_id: this.id
      })

      this.onToggleFolder()
    },

    onKeyDown (evt) {
      if (evt.keyCode === 13) {
        this.updateFolderName(evt.target.value)
      } else if (evt.keyCode === 27) {
        this.isEditing = false
        evt.target.value = this.name
      }
    },

    onInputBlur (evt) {
      if (evt.target.value !== this.name && evt.target.value !== '') {
        this.updateFolderName(evt.target.value)
      } else {
        this.$nextTick(() => {
          evt.target.value = this.name
          this.isEditing = false
        })
      }
    },

    updateFolderName (name) {
      if (this.isRenaming) return
      this.isRenaming = true
      return Promise.all([
        this.updateFolderRequest(this.id, {
          name,
          order: this.order
        }),
        this.reloadFolders()
      ]).finally(() => {
        this.$nextTick(() => {
          this.isEditing = false
        })
      })
    },

    updateFolderRequest (id, params) {
      return this.$axios
        .patch('/api/v2/contact-folders/' + id, params)
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
    },

    reloadFolders () {
      return this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to load folders please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    },

    onCreateFolder () {
      this.isCreatingFolder = true
      this.openFolder(this.id)
    },

    onEditFolder () {
      this.isEditing = true
      inputTimeout = setTimeout(() => {
        document.getElementById('folder-input-' + this.id).focus()
      })
    },

    onRemoveFolder () {
      this.$nextTick(() => {
        this.removeFolderOpen({
          id: this.id,
          name: this.name
        })
      })
    },

    onToggleFolder () {
      this.toggleFolder(this.id)
    },

    onCloseFolder () {
      this.isCreatingFolder = false
    }
  },

  beforeDestroy () {
    clearTimeout(inputTimeout)
  }
}
</script>

<style lang="scss">
@import '../../css/mixins';
@import '../../css/variables';

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

  &--selected {
    background-color: $light-green2;
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
