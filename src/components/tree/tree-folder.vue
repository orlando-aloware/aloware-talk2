<template>
  <div class="tree-folder"
       :data-layer="layer">
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
      <div class="folder__arrow d-flex align-items-center" @click="onToggleFolder">
        <folder-arrow-open-icon v-if="isOpen"
                                color="#62666E"></folder-arrow-open-icon>
        <folder-arrow-close-icon v-else
                                 color="#62666E"></folder-arrow-close-icon>
      </div>
      <div class="folder__icon d-flex align-items-center" @click="onToggleFolder">
        <folder-icon color="#62666E"></folder-icon>
      </div>

      <div class="folder__name-wrapper flex-grow-1 d-flex align-items-center">
        <div v-if="!isEditing"
             class="folder__name"
             @click="onToggleFolder">
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
        class="folder__option btn btn-link p-0 shadow-0"
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
      @cancel="onCreateFolderCancel"
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
    },

    endpoint: {
      type: String,
      default: '/api/v2/contact-folders'
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
        flex: `0 0 ${this.layer * 10}px`
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

    onCreateFolderCancel () {
      this.onCloseFolder()
    },

    onKeyDown (evt) {
      if (evt.keyCode === 13 && evt.target.value.length > 60) {
        this.$generalNotification('Folder name should have up to 60 characters.', 'error')
        return
      }

      if (evt.keyCode === 13) {
        this.updateFolderName(evt.target.value)
      } else if (evt.keyCode === 27) {
        this.isEditing = false
        evt.target.value = this.name
      }
    },

    onInputBlur (evt) {
      if (evt.target.value.length > 60) {
        this.$generalNotification('Folder name should have up to 60 characters.', 'error')
        this.isEditing = false
        this.onCloseFolder()
        evt.target.value = this.name
        return
      }

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

      return this.updateFolderRequest(this.id, { name, order: this.order }).then(response => {
        this.reloadFolders()
      }).finally(() => {
        this.$nextTick(() => {
          this.isEditing = false
          this.isRenaming = false
        })
      })
    },

    updateFolderRequest (id, params) {
      console.log('params :>> ', params)
      return this.$axios
        .patch(`${this.endpoint}/${id}`, params)
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },

    reloadFolders () {
      return this.$axios
        .get(this.endpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
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
