<template>
  <router-link
    :to="'/contacts/list/' + id"
    v-slot="{ navigate, isExactActive }"
  >
    <div :data-layer="layer">
      <div
        :title="name"
        :class="{ 'folder--active': isExactActive, 'folder--moving': isMoving }"
        class="folder d-flex align-items-center"
      >
        <div class="folder__indent" :style="indentStyle"></div>
        <div class="folder__icon">
          <folder-static-icon
            v-if="type === ContactListTypes.STATIC"
          ></folder-static-icon>
          <folder-dynamic-icon
            v-if="type === ContactListTypes.DYNAMIC"
          ></folder-dynamic-icon>
        </div>
        <div class="folder__name">
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
          <span @click="navigate" v-if="!isEditing">
            {{ name }}
          </span>
        </div>

        <button
          :tabindex="id"
          :data-popper-target="'list-' + id"
          :id="'folder-option-' + id + '-' + layer"
          class="folder__option btn btn-link p-0"
        >
          <folder-option></folder-option>
        </button>
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
          @move="onMove"
          @duplicate="onDuplicate"
          @clonestatic="onCloneStatic"
          :hasEdit="hasEdit"
          :hasDelete="hasDelete"
          :isPinned="isPinned"
        ></list-actions>
      </b-popover>
    </div>
  </router-link>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import FolderOption from 'components/icons/folder-option.vue'
import FolderStaticIcon from 'components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon.vue'
import ListActions from '../list-actions.vue'
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
    ...mapGetters('contacts', ['pinned', 'moveDialog']),
    indentStyle () {
      return {
        width: `${this.layer * 10}px`
      }
    },
    isPinned () {
      return Array.isArray(this.pinned)
        ? this.pinned.includes(this.id)
        : false
    },
    isMoving () {
      return this.id === this.moveDialog.id && this.moveDialog.type === 'list'
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
      'listPinToggled',
      'openMoveDialog',
      'pinnedCountLoaded'
    ]),
    onDuplicate () {
      this.$root.$emit('bv::hide::popover')
      this.createList({
        id: this.id,
        type: this.type
      })
    },
    onCloneStatic () {
      this.$root.$emit('bv::hide::popover')
      this.createList({
        id: this.id,
        type: ContactListTypes.STATIC
      })
    },
    createList (params) {
      this.$axios
        .post('/api/v2/contacts-list/' + this.id + '/duplicate', params)
        .then((response) => {
          const data = response.data.data
          const message = response.data.message

          this.$router.push(`/contacts/list/${data.id}`)

          this.$q.notify({
            message,
            type: 'positive',
            textColor: 'white'
          })

          this.reloadFolders()
        })
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
    onMove () {
      this.$root.$emit('bv::hide::popover')
      this.openMoveDialog({
        id: this.id,
        type: 'list'
      })
    },
    onPin () {
      this.$root.$emit('bv::hide::popover')

      const isPinned = !this.isPinned
      this.listPinToggled({
        id: this.id,
        isPinned
      })

      if (isPinned) {
        this.$axios
          .get(`api/v2/contacts-list/${this.id}/items?per_page=1`)
          .then((response) => {
            this.pinnedCountLoaded({
              id: this.id,
              count: response.data.total
            })
          })
      }

      this.listLoaded({
        id: this.id,
        name: this.name,
        type: this.type
      })

      this.pinRequest(this.id, isPinned).finally(() => {
        this.getContactList(this.id).then((response) => {
          this.listLoaded(response)
          this.$q.notify({
            message: isPinned ? 'Successfully pinned' : 'Successfully unpinned',
            type: 'positive',
            textColor: 'white'
          })
        })
      })
    },
    pinRequest (id, isPinned) {
      if (isPinned) {
        return this.$axios.post('/api/v2/contact-list-bookmark', { contact_list_id: id, order: id })
      } else {
        return this.$axios.delete('/api/v2/contact-list-bookmark/' + id)
      }
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
      return this.$axios
        .patch('/api/v2/contacts-list/' + id, params)
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
    getContactList (id) {
      return this.$axios
        .get('/api/v2/contacts-list/' + id)
        .then((response) => response.data)
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
    getItems (id) {
      return this.$axios
        .get(`api/v2/contacts-list/${id}/items?per_page=1`)
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
@import '../../css/mixins';
@import '../../css/variables';
.folder {
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
  &:hover,
  &--moving,
  &--active {
    background-color: $light-green2;
  }
  &__name {
    width: calc(100% - 54px);
    display: flex;
    align-items: center;
    span {
      display: inline-block;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
  &__sub {
    padding-left: 10px;
  }
  &__indent {
    width: 10px;
  }
  &__option {
    margin-top: -5px;
    margin-left: 5px;
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
.sublists {
  &.is-root {
    .folder__indent {
      display: none;
    }
    .folder {
      padding-right: 0;
    }
  }
}
</style>
