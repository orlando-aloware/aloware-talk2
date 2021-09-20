<template>
  <div :data-layer="layer">
    <div class="folder-create d-flex align-items-center">
      <div
        class="folder-create__indent"
        :style="indentStyle">
      </div>
      <div class="folder-create__arrow">
        <FolderArrowCloseIcon />
      </div>
      <div class="folder-create__icon">
        <FolderIcon />
      </div>
      <div class="folder-create__name flex-grow-1 d-flex align-items-center">
        <input
          @blur="onInputBlur"
          @keydown="onKeyDown"
          :disabled="isCreating"
          type="text"
          v-model="text"
          class="folder-create__input d-inline"
          ref="input"
          autofocus />
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import FolderIcon from 'components/icons/folder-icon'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon'
import errorMessages from 'src/plugins/helpers/extract-error-message'

export default {
  name: 'DirectoryFolderCreate',
  components: {
    FolderIcon,
    FolderArrowCloseIcon
  },
  computed: {
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    ...mapGetters('powerDialer', ['opened'])
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
    ...mapActions('powerDialer', [
      'toggleFolder',
      'foldersLoaded'
    ]),
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
      return this.$axios
        .post('/api/v2/contact-folders', params)
        .then(() => this.reloadFolders())
        .catch((error) => {
          const { message, html } = errorMessages(error)
          console.log(html)
          this.$generalNotification(message, 'error')
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
        })
      ]).finally(() => {
        this.$emit('blur')
        this.resetState()
      })
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
