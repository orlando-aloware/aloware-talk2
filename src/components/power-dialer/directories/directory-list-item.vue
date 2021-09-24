<template>
  <router-link
    class="tree-list-item"
    :to="'/power-dialer/list/' + id"
    v-slot="{ navigate, isExactActive }">
    <div :data-layer="layer">
      <div
        :title="name"
        :class="{ 'folder--active': isExactActive, 'folder--moving': isMoving }"
        class="folder d-flex align-items-center">
        <div class="folder__indent" :style="indentStyle"></div>
        <div class="folder__icon pl-3">
          <DialIcon color="#62666E" />
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
            autofocus />
          <span
            v-if="!isEditing"
            @click="navigate">
            {{ name }}
          </span>
        </div>
        <button
          :tabindex="id"
          :data-popper-target="'list-' + id"
          :id="'folder-option-' + id + '-' + layer"
          class="folder__option btn btn-link p-0">
          <folder-option></folder-option>
        </button>
      </div>
      <b-popover
        :target="'folder-option-' + id + '-' + layer"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover">
        <ListActions
          :type="type"
          @remove="onRemoveList"
          @rename="onRenameList"
          @pin="onPin"
          @move="onMove"
          @duplicate="onDuplicate"
          @clonestatic="onCloneStatic"
          :hasEdit="hasEdit"
          :hasDelete="hasDelete"
          :isPinned="isPinned" />
      </b-popover>
    </div>
  </router-link>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import FolderOption from 'components/icons/folder-option'
import DialIcon from 'components/icons/dial-icon'
import ListActions from './../../list-actions'
import errorMessages from 'src/plugins/helpers/extract-error-message'

let inputTimeout

export default {
  name: 'DirectoryListItem',
  components: {
    FolderOption,
    ListActions,
    DialIcon
  },
  computed: {
    ...mapGetters('powerDialer', ['pinned', 'moveDialog']),
    indentStyle () {
      return {
        width: `${(this.layer * 10) + 2}px`
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
    ...mapActions('powerDialer', [
      'removeListOpen',
      'foldersLoaded',
      'listLoaded',
      'listPinToggled',
      'openMoveDialog',
      'pinnedCountLoaded'
    ]),
    onDuplicate () {
      this.$root.$emit('bv::hide::popover')
      // this.createList({
      //   id: this.id,
      //   type: this.type
      // })
    },
    onCloneStatic () {
      this.$root.$emit('bv::hide::popover')
      // this.createList({
      //   id: this.id,
      //   type: ContactListTypes.STATIC
      // })
    },
    createList (params) {
      this.$axios
        .post('/api/v2/power-dialer/' + this.id + '/duplicate', params)
        .then((response) => {
          const data = response.data.data
          const message = response.data.message

          this.$router.push(`/power-dialer/list/${data.id}`)

          this.$generalNotification(message)

          this.reloadFolders()
        })
        .catch((error) => {
          const { message, html } = errorMessages(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    onMove () {
      console.log('Moving items...')
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
          .get(`api/v2/power-dialer-list/${this.id}/items?per_page=1`)
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
          this.$generalNotification((isPinned ? 'Successfully pinned' : 'Successfully unpinned'))
        })
      })
    },
    pinRequest (id, isPinned) {
      // if (isPinned) {
      //   return this.$axios.post('/api/v2/power-dialer-list-bookmark', { contact_list_id: id, order: id })
      // } else {
      //   return this.$axios.delete('/api/v2/power-dialer-list-bookmark/' + id)
      // }
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
      this.updateListRequest(this.id, { name, order: this.order })
        .then(response => {
          this.listLoaded(response.data.data)
          this.reloadFolders()
        }).finally(() => {
          this.$nextTick(() => {
            this.isEditing = false
            this.isRenaming = false
          })
        })
    },
    updateListRequest (id, params) {
      return this.$axios
        .patch('/api/v2/power-dialer-list/' + id, params)
        .catch((error) => {
          const { message, html } = errorMessages(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    getContactList (id) {
      return this.$axios
        .get('/api/v2/power-dialer-list/' + id)
        .then((response) => response.data)
        .catch((error) => {
          const { message, html } = errorMessages(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    getItems (id) {
      return this.$axios
        .get(`api/v2/power-dialer-list/${id}/items?per_page=1`)
    },
    reloadFolders () {
      return this.$axios
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onClickItem () {
      this.$router.push(`/power-dialer/list/${this.id}`).catch((_err) => {})
    },
    onRemoveList () {
      this.removeListOpen({ id: this.id, name: this.name })
    }
  }
}
</script>
