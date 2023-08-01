<template>
  <div class="folder d-flex align-items-center"
       :class="{ 'folder--active': activeFolder && id !== undefined ? true : id === undefined }">
    <div class="folder__arrow">
      <folder-arrow-close-icon class="transparent">
      </folder-arrow-close-icon>
    </div>
    <router-link
      class="tree-list-item flex-grow-1 d-flex-shrink-0 w-100"
      :to="viewListPath"
      v-slot="{ navigate, isExactActive }"
    >
      <div :data-layer="layer">
        <div
          :title="name"
          :class="{ 'folder--active': isExactActive && activeFolder, 'folder--moving': isMoving }"
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
            <span
              @click="toggleSidebar(navigate, $event)"
              v-if="!isEditing">
              {{ name }}
            </span>
            <UnsavedIcon
              class="mr-1"
              v-show="id == undefined" />
          </div>

          <button
            class="folder__option btn btn-link p-0 shadow-0"
            :tabindex="id"
            :data-popper-target="'list-' + id"
            :id="folderId"
            :ref="folderId">
            <folder-option></folder-option>
          </button>
        </div>

        <b-popover
          triggers="click blur"
          placement="bottomright"
          boundary="window"
          custom-class="contact-popover"
          :target="folderId"
          v-if="folderExists">
          <list-actions
            :list-id="id"
            :type="type"
            :hasEdit="hasEdit"
            :hasDelete="hasDelete"
            :isPinned="isPinned"
            @remove="onRemoveList"
            @rename="onRenameList"
            @pin="onPin"
            @move="onMove"
            @duplicate="onDuplicate"
            @clonestatic="onCloneStatic"/>
        </b-popover>
      </div>
    </router-link>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import FolderArrowCloseIcon from 'components/icons/folder-arrow-close-icon.vue'
import FolderOption from 'components/icons/folder-option.vue'
import FolderStaticIcon from 'components/icons/folder-static-icon.vue'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon.vue'
import DialIcon from 'components/icons/dial-icon.vue'
import ListActions from '../list-actions.vue'
import UnsavedIcon from 'components/icons/unsaved-icon'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    FolderArrowCloseIcon,
    FolderOption,
    FolderStaticIcon,
    FolderDynamicIcon,
    DialIcon,
    UnsavedIcon,
    ListActions
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
      isRenaming: false,
      folderExists: false,
      inputTimeout: null,
      folderInterval: null
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinned',
      'moveDialog',
      'listToRemove',
      'unsavedList'
    ]),
    ...mapState(['isMobile']),
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
      if (this.id === undefined && id === 'unsaved') {
        return true
      }
      return id && parseInt(id) === this.id
    },
    itemName () {
      return this.$options.filters.truncate(this.name, (32 - (2 * (this.layer - 1))))
    },
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    viewListPath () {
      return this.isContactsRoute ? `/contacts/list/${this.id}` : `/power-dialer/list/${this.id}`
    },
    listPath () {
      return this.isContactsRoute ? '/api/v2/contacts-list/' : '/api/v2/power-dialer-lists/'
    },
    foldersPath () {
      return this.isContactsRoute ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    },
    folderId () {
      const module = this.$route.name === 'Contacts' ? 'contact' : 'power-dialer'
      return `folder-item-option-${module}-${this.id}`
    },
    unsavedListId () {
      return this.unsavedList?.id || ''
    }
  },

  mounted () {
    if (!this.isMobile) {
      this.folderExists = true
    }

    if (this.isMobile && this.$refs[this.folderId] !== undefined) {
      const count = { data: 0 }
      this.folderInterval = setInterval(() => {
        if (document.getElementById(this.folderId)) {
          this.folderExists = true
          clearInterval(this.folderInterval)
        }
        count.data++
        if (count.data === 60) {
          clearInterval(this.folderInterval)
        }
      }, 500)
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeListOpen',
      'removeListClose',
      'foldersLoaded',
      'listLoaded',
      'listPinToggled',
      'openMoveDialog',
      'setUnsavedList',
      'setUnsavedListName',
      'setShowContactsListSidebar'
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

          if (this.isContactsRoute) {
            this.$router.push(`/contacts/list/${data.id}`)
          } else {
            this.$router.push(`/power-dialer/list/${data.id}`)
          }

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

      if (isPinned) {
        if (this.type === ContactListTypes.STATIC) {
          this.listLoaded({
            id: this.id,
            name: this.name,
            type: this.type
          })
          this.setDataCount({ filters: {
            0: {
              filters: {
                contact_lists: {
                  operator: OPERATORS.IS_ANY_OF,
                  value: [this.id]
                }
              },
              is_conjunction: true
            }
          } })
        }

        if (this.type === ContactListTypes.DYNAMIC) {
          this.getContactList(this.id).then((response) => {
            this.listLoaded(response)
            if (this.type === ContactListTypes.DYNAMIC) {
              this.setDataCount(response)
            }
          })
        }
      }

      this.pinRequest(this.id, isPinned).finally(() => {
        this.$generalNotification((isPinned ? 'Contact list has been successfully pinned.' : 'Contact list has been unpinned.'))
      })
    },
    setDataCount (data) {
      this.$VueEvent.fire('get-list-count', {
        data: data,
        clear: true,
        thenFunctions: {
          'pinnedCountLoaded': {
            id: this.id,
            count: 'response.data.count'
          }
        }
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
      this.inputTimeout = setTimeout(() => {
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
      const responseData = { data: null, message: '' }
      if (this.isRenaming) return
      this.isRenaming = true
      if (!this.id) {
        this.setUnsavedListName(name)
        return
      }

      this.updateListRequest(this.id, { name, order: this.order })
        .then(response => {
          responseData.data = _.get(response.data, 'data', _.get(response, 'data', null))
          responseData.message = _.get(response.data, 'message', _.get(response, 'message', ''))
          this.listLoaded(responseData.data)
          this.$generalNotification(responseData.message)
          this.reloadFolders()
        }).finally(() => {
          this.$nextTick(() => {
            this.isEditing = false
            this.isRenaming = false
          })
        })
    },
    updateListRequest (id, params) {
      if (id === 'unsaved') {
        return
      }

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
      if (!this.id) {
        this.$bvModal.msgBoxConfirm('Are you sure you want to discard your contact list?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.setUnsavedList(null)
            this.$router.push(`/contacts`)
          }
        })
        return
      }

      this.removeListClose()
      setTimeout(() => {
        this.removeListOpen({ id: this.id, name: this.name })
      }, 10)
      this.removeListOpen({ id: this.id, name: this.name })
    },
    toggleSidebar (callback, event) {
      if (this.unsavedList) {
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.handleToggleSidebar(callback, event)
          }
        })
      } else {
        this.handleToggleSidebar(callback, event)
      }
    },
    handleToggleSidebar (callback, event) {
      this.setUnsavedList(null)
      this.setShowContactsListSidebar(false)
      if (this.id !== undefined) {
        callback(event)
        return
      }
      if (this.$route.path !== '/contacts/list/unsaved') {
        this.$router.push('/contacts/list/unsaved')
      }
    }
  },

  beforeDestroy () {
    clearTimeout(this.inputTimeout)
    clearInterval(this.folderInterval)
  }
}
</script>
