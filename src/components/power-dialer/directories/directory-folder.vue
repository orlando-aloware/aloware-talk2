<template>
  <div class="tree-folder" :data-layer="layer">
    <div
      v-if="!isRootList"
      class="folder folder-pad-1 d-flex align-items-center"
      :class="{ 'folder--selected': isSelected }">
      <div
        @click="onToggleFolder"
        class="folder__indent"
        :style="indentStyle">
      </div>
      <div
        @click="onToggleFolder"
        class="folder__arrow">
        <FolderArrowOpenIcon
          v-if="isOpen" color="#62666E" />
        <FolderArrowCloseIcon
          v-if="!isOpen" color="#62666E" />
      </div>
      <div
        @click="onToggleFolder"
        class="folder__icon">
        <FolderIcon />
      </div>

      <div class="flex-grow-1 d-flex align-items-center">
        <div
          v-if="!isEditing" @click="onToggleFolder"
          class="folder__name">
          {{ name }}
        </div>
        <input
          @blur="onInputBlur"
          @keydown="onKeyDown"
          :id="'folder-input-' + id"
          v-if="isEditing"
          type="text"
          :value="name"
          :disabled="isRenaming"
          class="folder__input d-inline"
          autofocus />
      </div>

      <button
        :data-popper-target="'folder-' + id"
        :id="'folder-option-' + id"
        class="folder__option btn btn-link p-0"
        :class="{ 'folder__option--hide': isEditing }">
        <FolderOption></FolderOption>
      </button>
    </div>

    <DirectoryFolderCreate
      @blur="onCloseFolder"
      v-if="isCreatingFolder"
      :layer="layer + 1"
      :parent_id="id" />

    <div
      v-if="isOpen && !isRootList"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }">
      <DirectoryFolderContents
        :folders="folders"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete"
        :layer="layer + 1" />
      <DirectoryListContents
        :lists="lists"
        :layer="layer + 1"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete" />
    </div>

    <DirectoryListContents
      v-if="isRootList"
      :lists="lists"
      :layer="layer + 1"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      :isRootList="isRootList" />

    <b-popover
      :target="'folder-option-' + id"
      triggers="click blur"
      placement="bottomright"
      boundary="window"
      custom-class="t-popover"
    >

      <FolderActions
        @create="onCreateFolder"
        @edit="onEditFolder"
        @remove="onRemoveFolder"
        @move="onMove"
        @createlist="onCreateList"
        :id="id"
        :hasEdit="hasEdit"
        :hasDelete="hasDelete" />

    </b-popover>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-2-icon'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'
import FolderOption from 'components/icons/folder-option'
import FolderActions from './directory-folder-actions'
import DirectoryFolderCreate from './directory-folder-create'
import errorMessages from 'src/plugins/helpers/extract-error-message'
import DirectoryFolderContents from './directory-folder-contents'
import DirectoryListContents from './directory-list-contents'

let inputTimeout

export default {
  name: 'DirectoryFolder',
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
    DirectoryFolderContents,
    DirectoryListContents,
    FolderOption,
    FolderActions,
    DirectoryFolderCreate
  },
  data () {
    return {
      isCreatingFolder: false,
      isEditing: false,
      isRenaming: false
    }
  },
  computed: {
    ...mapGetters('powerDialer', [
      'opened',
      'moveDialog',
      'createList'
    ]),
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
    ...mapActions('powerDialer', [
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
      return this.$axios
        .patch('/api/v2/power-dialer-folders/' + id, params)
        .catch((error) => {
          const {
            message,
            html
          } = errorMessages(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    reloadFolders () {
      console.log('Folders reloading')
      return this.$axios
        .get('/api/v2/power-dialer-folders')
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
