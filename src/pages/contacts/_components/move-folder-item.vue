<template>
  <div :data-layer="layer">
    <div
      class="folder d-flex align-items-center"
      :class="{ 'folder--target': isTarget }"
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
import FolderIcon from 'src/components/icons/folder-icon.vue'
import FolderArrowOpenIcon from 'src/components/icons/folder-arrow-open-icon.vue'
import FolderArrowCloseIcon from 'src/components/icons/folder-arrow-close-icon.vue'
import { mapActions, mapGetters } from 'vuex'

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

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder {
  padding-left: 10px;
  padding-right: 0px;
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
  &--target {
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
    line-height: 0;
    height: 34px;
    width: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    &:hover,
    &:active,
    &:focus {
      text-decoration: none !important;
    }
    i {
      margin-top: 5px;
      color: $grey-light4;
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
