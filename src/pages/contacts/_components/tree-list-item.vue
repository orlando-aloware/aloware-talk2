<template>
  <div :data-layer="layer">
    <div class="folder d-flex align-items-center">
      <div class="folder__indent" :style="indentStyle"></div>
      <div class="folder__icon">
        <folder-static-icon
          v-if="type === ContactListTypes.STATIC"
        ></folder-static-icon>
        <folder-dynamic-icon
          v-if="type === ContactListTypes.DYNAMIC"
        ></folder-dynamic-icon>
      </div>
      <div class="folder__name flex-grow-1">
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
        <span
          @click.prevent="onClickItem"
          v-if="!isEditing"
          class="d-block w-100 h-100"
        >
          {{ name }}
        </span>
      </div>
      <b-popover
        :target="'folder-option-' + id + '-' + layer"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover"
      >
        <list-actions
          :type="type"
          @remove="onRemoveList"
          @rename="onRenameList"
          @pin="onPin"
          :hasEdit="hasEdit"
          :hasDelete="hasDelete"
          :isPinned="isPinned"
        ></list-actions>
      </b-popover>
      <button
        :tabindex="id"
        :id="'folder-option-' + id + '-' + layer"
        class="folder__option btn btn-link p-0"
      >
        <folder-option></folder-option>
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import FolderOption from 'src/components/icons/folder-option.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import ListActions from './list-actions.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let inputTimeout

export default {
  components: {
    FolderOption,
    FolderStaticIcon,
    FolderDynamicIcon,
    ListActions
  },
  computed: {
    ...mapGetters('contacts', ['pinnedLists']),
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    isPinned () {
      return Array.isArray(this.pinnedLists)
        ? this.pinnedLists.includes(this.id)
        : false
    }
  },
  props: {
    id: {
      type: Number
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    layer: {
      type: Number,
      required: false,
      default: 1
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    }
  },
  data () {
    return {
      ContactListTypes,
      isEditing: false,
      isRenaming: false
    }
  },
  beforeDestroy () {
    clearTimeout(inputTimeout)
  },
  methods: {
    ...mapActions('contacts', [
      'removeListOpen',
      'foldersLoaded',
      'listLoaded',
      'listPinToggled'
    ]),
    onPin () {
      this.$root.$emit('bv::hide::popover')

      const isPinned = !this.isPinned

      this.pinRequest(this.id, isPinned).then(() => {
        this.listPinToggled({
          id: this.id,
          isPinned
        })

        this.listLoaded({
          id: this.id,
          name: this.name,
          type: this.type
        })

        this.$q.notify({
          message: isPinned ? 'Successfully pinned' : 'Successfully unpinned',
          type: 'positive',
          textColor: 'white'
        })
      })
    },
    pinRequest (id, isPinned) {
      const request = isPinned ? window.axios.post : window.axios.delete
      return request('/api/v1/contact-list-bookmark/' + id)
    },
    onRenameList () {
      this.isEditing = true
      inputTimeout = setTimeout(() => {
        document.getElementById('folder-input-' + this.id).focus()
      })
    },
    onKeyDown (evt) {
      if (evt.keyCode === 13) {
        this.updateListName(evt.target.value)
      } else if (evt.keyCode === 27) {
        this.isEditing = false
        evt.target.value = this.name
      }
    },
    onInputBlur (evt) {
      if (evt.target.value !== this.name && evt.target.value !== '') {
        this.updateListName(evt.target.value)
      } else {
        this.$nextTick(() => {
          evt.target.value = this.name
          this.isEditing = false
        })
      }
    },
    updateListName (name) {
      if (this.isRenaming) return
      this.isRenaming = true
      return Promise.all([
        this.updateListRequest(this.id, { name, order: this.order }),
        this.reloadFolders()
      ])
        .then(([listResponse]) => {
          const list = listResponse.data.data
          this.listLoaded(list)
        })
        .finally(() => {
          this.$nextTick(() => {
            this.isEditing = false
          })
        })
    },
    updateListRequest (id, params) {
      return window.axios
        .patch('/api/v1/contacts-list/' + id, params)
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
    onClickItem () {
      this.$router.push(`/contacts/list/${this.id}`).catch((_err) => {})
    },
    onRemoveList () {
      this.removeListOpen({ id: this.id, name: this.name })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folder {
  padding-left: 10px;
  padding-right: 10px;
  line-height: 34px;
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
  &:hover {
    background-color: $light-green2;
  }
  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
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
