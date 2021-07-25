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
      }
    }
  },

  computed: {
    ...mapGetters('contacts', ['opened', 'moveDialog', 'createList', 'selectList']),

    indentStyle () {
      return {
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
      if (this.selectList.search_value.length > 0) {
        return this.lists.filter(list => list.name.toLowerCase().includes(this.selectList.search_value.toLowerCase()))
      }
      return this.lists
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

    onToggleFolder () {
      this.isOpen = !this.isOpen
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
  max-height: 40vh;

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
