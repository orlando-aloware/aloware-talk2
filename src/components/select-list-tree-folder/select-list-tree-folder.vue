<template>
  <div :data-layer="layer">
    <div
      class="folder d-flex align-items-center"
      :class="{ 'folder--selected': isSelected }"
    >
      <div
        class="folder__indent"
        :style="indentStyle"
        @click="onToggleFolder"
      ></div>
      <div class="folder__arrow"
           @click="onToggleFolder">
        <folder-arrow-open-icon v-if="isOpen"
                                color="#62666E"></folder-arrow-open-icon>
        <folder-arrow-close-icon v-else
                                 color="#62666E"></folder-arrow-close-icon>
      </div>
      <div class="folder__icon" @click="onToggleFolder">
        <folder-icon color="#62666E"></folder-icon>
      </div>

      <div class="flex-grow-1 d-flex align-items-center">
        <div @click="onToggleFolder" class="folder__name">
          {{ name }}
        </div>
      </div>
    </div>

    <div
      v-if="isOpen"
      class="animated"
      v-bind:class="{ animate__fadeIn: isOpen, animate__fadeOut: !isOpen }"
    >
      <select-list-tree-folder-contents :folders="folders"
                                        :hasEdit="hasEdit"
                                        :hasDelete="hasDelete"
                                        :layer="layer + 1"
      />
      <select-list-tree-list-contents :lists="filterStaticList"
                                      :layer="layer + 1"
                                      :hasEdit="hasEdit"
                                      :hasDelete="hasDelete"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon.vue'
import FolderArrowOpenIcon from 'components/icons/folder-arrow-open-icon.vue'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import SelectListTreeFolderContents from 'src/components/select-list-tree-folder/select-list-tree-folder-contents'
import SelectListTreeListContents from 'components/select-list-tree-folder/select-list-tree-list-contents'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'

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
    SelectListTreeListContents,
    SelectListTreeFolderContents,
    FolderIcon,
    FolderArrowOpenIcon,
    FolderArrowCloseIcon
  },

  data () {
    return {
      isOpen: false,
      ContactListTypes: {
        STATIC,
        DYNAMIC
      },
      inputTimeout: null
    }
  },

  computed: {
    ...mapGetters('contacts', ['opened', 'moveDialog', 'createList', 'selectList', 'selectedList']),

    indentStyle () {
      return {
        flex: `0 0 ${this.layer * 10}px`,
        width: `${this.layer * 10}px`
      }
    },

    isSelected () {
      return (
        (this.id === this.moveDialog.id && this.moveDialog.type === 'folder') ||
        (this.createList.open && this.createList.folderId === this.id)
      )
    },

    filterStaticList () {
      if (this.selectList.search_value && this.selectList.search_value.length > 0) {
        return this.lists.filter(item => item.name.toLowerCase().includes(this.selectList.search_value.toLowerCase()) &&
          item.type === this.ContactListTypes.STATIC &&
          item.id.toString() !== this.selectedList.id)
      }
      return this.lists.filter(item => item.type === this.ContactListTypes.STATIC && item.id.toString() !== this.selectedList.id)
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

    reloadFolders () {
      return this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    onToggleFolder () {
      this.isOpen = !this.isOpen
    },

    onCloseFolder () {
      this.isCreatingFolder = false
    }
  },

  beforeDestroy () {
    clearTimeout(this.inputTimeout)
  }
}
</script>
