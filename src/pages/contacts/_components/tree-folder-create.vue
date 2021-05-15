<template>
  <div :data-layer="layer">
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
          @keydown="onKeyDown"
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
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

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
    ...mapActions('contacts', ['toggleFolder', 'foldersLoaded']),
    onInputBlur () {
      if (this.text) {
        this.createNewFolder()
      } else {
        this.$emit('blur')
        this.resetState()
      }
    },
    onKeyDown (evt) {
      if (evt.keyCode === 13) {
        this.onInputBlur()
      } else if (evt.keyCode === 27) {
        this.resetState()
        this.$refs.input.blur()
      }
    },
    createFolderRequest (params) {
      return window.axios
        .post('/api/v1/contact-folders', params)
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
    },
    createNewFolder () {
      if (this.isCreating) return Promise.resolve()
      this.isCreating = true
      return Promise.all([
        this.createFolderRequest({
          name: this.text,
          order: 0 - Math.abs(new Date().getTime() / 1000).toFixed(0),
          parent_id: this.parent_id
        }),
        this.reloadFolders()
      ]).finally(() => {
        this.$emit('blur')
        this.resetState()
      })
    },
    reloadFolders () {
      return window.axios
        .get('/api/v1/contact-folders')
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
    resetState () {
      this.isCreating = false
      this.text = ''
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
  height: 34px;
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
