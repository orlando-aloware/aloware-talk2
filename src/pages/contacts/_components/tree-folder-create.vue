<template>
  <div :data-layer="layer" class="overflow-hidden">
    <div class="folder-create d-flex align-items-center">
      <div class="folder-create__indent" :style="indentStyle"></div>
      <div class="folder-create__arrow">
        <folder-arrow-close-icon></folder-arrow-close-icon>
      </div>
      <div class="folder-create__icon">
        <folder-icon></folder-icon>
      </div>
      <div class="folder-create__name flex-grow-1 d-flex align-items-center">
        <input
          :disabled="isCreating"
          type="text"
          v-model="text"
          class="folder-create__input d-inline"
          ref="input"
          @blur="onInputBlur"
          autofocus
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import folderIcon from 'src/components/icons/folder-icon.vue'
import folderArrowCloseIcon from 'src/components/icons/folder-arrow-close-icon.vue'

export default {
  components: {
    folderIcon,
    folderArrowCloseIcon
  },
  computed: {
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    ...mapGetters('contacts', ['opened'])
  },
  props: {
    parent_id: {
      type: Number
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {
      text: '',
      isCreating: false
    }
  },
  methods: {
    ...mapActions('contacts', ['toggleFolder']),
    onInputBlur () {
      if (!this.text) {
        this.$emit('blur')
      } else {
        this.createNewFolder()
      }
    },
    createFolderAction () {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    },
    async createNewFolder () {
      try {
        this.isCreating = true
        await this.createFolderAction()
        this.isCreating = false
      } catch (err) {
        this.isCreating = false
      }
    }
  },
  mounted () {
    this.$refs.input.focus()
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder-create {
  padding-left: 10px;
  padding-right: 10px;
  line-height: 34px;
  cursor: pointer;
  &:hover {
    background-color: white;
  }
  &__arrow {
    margin-top: -5px;
    margin-right: 5px;
  }
  &__icon {
    margin-top: -5px;
    margin-right: 5px;
  }
  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__indent {
    width: 10px;
  }
  &__input {
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
