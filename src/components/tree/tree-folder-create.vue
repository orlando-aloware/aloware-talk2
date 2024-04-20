<template>
  <div :data-layer="layer">
    <div class="folder-create d-flex align-items-center">
      <div
        :style="indentStyle"
        class="folder-create__indent">
      </div>

      <div class="folder-create__arrow">
        <folder-arrow-close-icon />
      </div>

      <div class="folder-create__icon">
        <folder-icon color="#62666E" />
      </div>

      <div class="folder-create__name flex-grow-1 d-flex align-items-center">

        <input
          class="folder-create__input d-inline"
          ref="input"
          :disabled="isCreating"
          type="text"
          v-model="text"
          autofocus
          data-testid="tree-folder-create-input"
          @blur="onInputBlur"
          @keydown="onKeyDown" />

      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import folderIcon from 'components/icons/folder-icon.vue'
import folderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
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
    ...mapGetters('contacts', ['opened']),
    orderKey () {
      return 0 - Math.abs(new Date().getTime() / 1000).toFixed(0)
    }
  },
  props: {
    parent_id: {
      type: Number
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    },
    endpoint: {
      type: String,
      default: '/api/v2/contact-folders'
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
      if (this.text.length > 60) {
        this.$generalNotification('Folder name should have up to 60 characters.', 'error')
        this.resetState()
        this.$refs.input.blur()
        this.$emit('cancel')
        return
      }

      if (this.text) {
        this.createNewFolder()
      } else {
        this.$emit('blur')
        this.resetState()
      }
    },
    onKeyDown (evt) {
      if (evt.keyCode === 13 && this.text.length > 60) {
        this.$generalNotification('Folder name should have up to 60 characters.', 'error')
        return
      }

      if (evt.keyCode === 13) {
        this.onInputBlur()
      } else if (evt.keyCode === 27) {
        this.resetState()
        this.$refs.input.blur()
      }
    },
    createFolderRequest (params) {
      return this.$axios
        .post(this.endpoint, params)
        .then(() => this.reloadFolders())
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
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
          order: this.orderKey,
          parent_id: this.parent_id
        })
      ]).finally(() => {
        this.$emit('blur')
        this.resetState()
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
