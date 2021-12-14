<template>
  <div class="folder d-flex align-items-center"
       :class="{ 'folder--active': activeFolder }">
    <div class="folder__arrow">
      <folder-arrow-close-icon class="transparent">
      </folder-arrow-close-icon>
    </div>
    <router-link
      class="tree-list-item flex-grow-1 d-flex-shrink-0"
      :to="`${viewListPath}${id}`"
      v-slot="{ navigate, isExactActive }"
    >
      <div :data-layer="layer">
        <div
          :title="name"
          :class="{ 'folder--active': isExactActive, 'folder--moving': isMoving }"
          class="folder d-flex align-items-center p-0"
        >
          <div
            class="folder__indent"
            :style="indentStyle">
          </div>
          <div class="folder__icon d-flex align-items-center">
            <template
              v-if="isContactsRoute">
              <folder-static-icon color="#62666E"
                v-if="type === ContactListTypes.STATIC"
              ></folder-static-icon>
              <folder-dynamic-icon color="#62666E"
                v-if="type === ContactListTypes.DYNAMIC"
              ></folder-dynamic-icon>
            </template>
            <template
              v-else>
              <DialIcon
                color="grey"
                class="mr-1" />
            </template>
          </div>
          <div class="folder__name d-flex align-items-center">
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
              {{ itemName }}
            </span>
          </div>

          <button
            :tabindex="id"
            :data-popper-target="'list-' + id"
            :id="'folder-option-' + id"
            class="folder__option btn btn-link p-0 shadow-0"
          >
            <folder-option></folder-option>
          </button>
        </div>

        <b-popover
          :target="'folder-option-' + id"
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
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import FolderOption from 'components/icons/folder-option.vue'
import FolderStaticIcon from 'components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon.vue'
import DialIcon from 'components/icons/dial-icon.vue'
import ListActions from '../list-actions.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let inputTimeout

export default {
  components: {
    FolderArrowCloseIcon,
    FolderOption,
    FolderStaticIcon,
    FolderDynamicIcon,
    DialIcon,
    ListActions
  },
  computed: {
    ...mapGetters('contacts', ['pinned', 'moveDialog', 'listToRemove']),
    indentStyle () {
      return {
        flex: `0 0 ${this.layer * 10}px`
      }
    },
    isPinned () {
      return Array.isArray(this.pinned)
        ? this.pinned.includes(this.id)
        : false
    },
    isMoving () {
      return this.id === this.moveDialog.id && this.moveDialog.type === 'list'
    },
    activeFolder () {
      const id = _.get(this.$route.params, 'id', null)
      return id && parseInt(id) === this.id
    },
    itemName () {
      return this.$options.filters.truncate(this.name, (32 - (2 * (this.layer - 1))))
    },
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    viewListPath () {
      if (this.isContactsRoute) {
        return '/contacts/list/'
      }
      return '/power-dialer/list/'
    },
    listPath () {
      if (this.isContactsRoute) {
        return '/api/v2/contacts-list/'
      }
      return '/api/v2/power-dialer-lists/'
    },
    foldersPath () {
      if (this.isContactsRoute) {
        return '/api/v2/contact-folders'
      }
      return '/api/v2/power-dialer-folders'
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
      'removeListClose',
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
        .post(this.listPath + this.id + '/duplicate', params)
        .then((response) => {
          const data = response.data.data
          const message = response.data.message

          this.$router.push(`/contacts/list/${data.id}`)

          this.$generalNotification(message)

          this.reloadFolders()
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
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

      if (isPinned && this.type === ContactListTypes.STATIC) {
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
          this.$generalNotification((isPinned ? 'Contact list has been successfully pinned.' : 'Contact list has been unpinned.'))
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
        .patch(this.listPath + id, params)
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    getContactList (id) {
      return this.$axios
        .get(`${this.listPath}${id}`)
        .then((response) => response.data)
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
    },
    getItems (id) {
      return this.$axios
        .get(`api/v2/contacts-list/${id}/items?per_page=1`)
    },
    reloadFolders () {
      return this.$axios
        .get(this.foldersPath)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onClickItem () {
      this.$router.push(`/contacts/list/${this.id}`).catch((_err) => {})
    },
    onRemoveList () {
      this.removeListClose()
      setTimeout(() => {
        this.removeListOpen({ id: this.id, name: this.name })
      }, 10)
    }
  }
}
</script>
