<template>
  <div
    class="move-dialog move-dialog__create shadow-sm"
    ref="createDialog">
    <div class="move-dialog-input mdi_input_2">
      <div>
        <Search
          ref="folder-search"
          :placeholder="placeholder"
          @search="onSearch"
        ></Search>
      </div>
    </div>
    <div class="move-dialog-lists px-2 pb-2">
      <CreateListItem
        v-for="folder in contactFolders"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :folders="folder.child_folders"
        :layer="0"
        :items="searchedPdItem && searchedPdItem.length > 0 ? folder.lists.filter(item => item.name.toLowerCase().includes(searchedPdItem.toLocaleLowerCase())) : folder.lists" />
    </div>
    <div v-if="hasSelected"
         class="move-dialog-footer">
      <div class="text-muted small pr-2">
        {{ message }}
      </div>
      <CompactBtn
        variant="primary"
        class="mr-2"
        v-if="hasSelected"
        :disabled="isCreating"
        @clicked="onConfirmCreate">
        <q-spinner-bars v-if="isCreating"
                        color="white" />
        {{ isCreating ? '' : 'Create' }}
      </CompactBtn>
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item'
import Search from 'src/components/search.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

let popperInstance

export default {
  name: 'CreateDialog',
  props: {
    message: {
      type: String,
      default: 'Create Power Dialer List?'
    },
    placeholder: {
      type: String,
      default: 'Select Contact List'
    }
  },
  components: {
    CreateListItem,
    Search,
    CompactBtn
  },
  data () {
    return {
      searchValue: '',
      isCreating: false,
      contactFolders: null
    }
  },
  computed: {
    ...mapGetters('contacts', [
      'createDialog',
      'folders',
      'lists',
      'searchedPdItem'
    ]),
    hasSelected () {
      return (
        typeof this.createDialog.target === 'number' &&
        this.createDialog.target >= 0
      )
    }
  },
  methods: {
    ...mapActions('contacts', [
      'createPdListClose',
      'foldersLoaded'
    ]),
    ...mapActions('powerDialer', [
      'getContactFolders'
    ]),
    ...mapMutations('contacts', [
      'ON_SEARCH_PD_ITEM'
    ]),
    onConfirmCreate () {
      return this.createListRequest()
    },
    createFolderRequest () {
      this.isCreating = true
    },
    createListRequest () {
      this.isCreating = true
      let params = {
        type: 1,
        name: this.createDialog.name
      }
      if (this.createDialog?.id) {
        params.contact_folder_id = this.createDialog.id
      }

      if (this.createDialog.id) {
        return this.$axios
          .post(`/api/v2/power-dialer-lists/${this.createDialog.target}/duplicate`, {
            contact_folder_id: this.createDialog.id
          })
          .then(() => {
            this.reloadFolders()
            this.isCreating = false
          })
          .catch(this.handleRequestError)
          .finally(this.createPdListClose)
      } else {
        this.$axios
          .post(`/api/v2/power-dialer-lists/${this.createDialog.target}/duplicate`)
          .then((res) => {
            console.log(res)
            this.reloadFolders()
            this.isCreating = false
            this.$generalNotification('Power dialer list has been successfully created from a contacts list.', 'success')
            this.$router.push({ path: `/power-dialer/list/${res.data.data.id}/in-queue` })
          })
          .catch(this.handleRequestError)
          .finally(this.createPdListClose)
      }
    },
    handleRequestError (err) {
      const { message } = extractErrorMessage(err)
      this.$generalNotification(message, 'error')
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
    onSearch (searchValue) {
      this.searchValue = searchValue
      this.ON_SEARCH_PD_ITEM(searchValue)
    },
    createDialogInstance () {
      this.ON_SEARCH_PD_ITEM(this.searchValue)
      const reference = document.querySelector(
        '[data-popper-target="power-dialer-list"]'
      )

      this.$refs.createDialog.classList.add('d-flex')

      popperInstance = createPopper(reference, this.$refs.createDialog, {
        placement: 'auto',
        positionFixed: true,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-80, 10]
            }
          }
        ]
      })

      document.body.addEventListener('click', this.handleClick)
    },
    destroyDialogInstance () {
      this.$refs.createDialog.classList.remove('d-flex')

      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    },
    handleClick (evt) {
      if (
        evt.target &&
        !(this.$refs.createDialog && this.$refs.createDialog.constructor.name === 'Object' && this.$refs.createDialog.contains(evt.target)) &&
        !evt.path.find(path => path.className && typeof path.className === 'string' && path.className.split(' ').includes('move-dialog')) &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('create-item')
      ) {
        this.createPdListClose()
        this.searchValue = ''
        document.body.removeEventListener('click', this.handleClick)
      }
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('focus', this.handleClick)
    this.destroyDialogInstance()
  },
  watch: {
    createDialog: function ({ open, ...state }) {
      if (open) {
        this.createDialogInstance(state)
      } else {
        this.$refs['folder-search'].clearSearch()
        document.body.removeEventListener('focus', this.handleClick)
        this.destroyDialogInstance(state)
      }
    }
  },
  mounted () {
    this.getContactFolders().then(res => {
      this.contactFolders = res
    })
  }
}
</script>
