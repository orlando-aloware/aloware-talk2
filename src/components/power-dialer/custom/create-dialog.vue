<template>
  <div class="move-dialog move-dialog__create shadow-sm"
       ref="createDialog">
    <div class="move-dialog-input mdi_input_2">
      <div>
        <Search ref="folder-search"
                :placeholder="placeholder"
                @search="onSearch"
        ></Search>
      </div>
    </div>
    <div class="move-dialog-lists px-2 pb-2">
      <CreateListItem name="Public Lists"
                      :key="0"
                      :id="0"
                      :order="0"
                      :layer="0"
                      :items="searchedPdItem && searchedPdItem.length > 0 ? publicContactLists.filter(item => item.name.toLowerCase().includes(searchedPdItem.toLocaleLowerCase())) : publicContactLists" />
      <CreateListItem v-for="folder in contactFolders"
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
      <CompactBtn variant="primary"
                  class="mr-2"
                  v-if="hasSelected"
                  :disabled="isCreating"
                  @clicked="onConfirmCreate">
        <q-spinner-bars v-if="isCreating"
                        color="white" />
        {{ isCreating ? '' : 'Create' }}
      </CompactBtn>
    </div>
    <power-dialer-add-modal :params="powerDialerParams"
                            mode="duplicate"
                            v-if="isAddPowerDialerOpen && powerDialerParams.target"
                            @hidden="onHiddenPowerDialerModal">
    </power-dialer-add-modal>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item'
import Search from 'src/components/search.vue'
import CompactBtn from 'src/components/compact-btn.vue'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal.vue'

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
    CompactBtn,
    PowerDialerAddModal
  },
  data () {
    return {
      searchValue: '',
      isCreating: false,
      publicContactLists: null,
      contactFolders: null,
      powerDialerParams: {}
    }
  },
  computed: {
    ...mapGetters('contacts', [
      'createDialog',
      'folders',
      'lists',
      'searchedPdItem',
      'isAddPowerDialerOpen'
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
      'addPowerDialerOpen'
    ]),
    ...mapActions('powerDialer', [
      'getContactFolders',
      'getPublicContactLists'
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
      this.powerDialerParams = {
        target: this.createDialog.target,
        contact_folder_id: this.createDialog.id
      }

      this.addPowerDialerOpen(true)
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
        placement: 'auto-start'
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
    },
    onHiddenPowerDialerModal () {
      this.powerDialerParams = {}
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
    this.getPublicContactLists().then(res => {
      this.publicContactLists = res
    })
    this.getContactFolders().then(res => {
      this.contactFolders = res
    })
  }
}
</script>
