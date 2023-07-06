<template>
  <b-modal title="Select A List"
           size="lg"
           modal-class="select-list-modal"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           v-model="isOpen">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               spinner-small
               rounded="sm"
               :show="isLoading">
      <div class="d-flex flex-column select-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 select-list-modal__title">{{ getTitle }}</div>
          <button class="btn btn-link small text-muted select-list-modal__close"
                  @click="onClose">
            <i class="fa fa-times"/>
          </button>
        </div>

        <div class="pt-3">
          <b-form-row>
            <b-col md="10">
              <search placeholder="Search static list..."
                      searchOnKeyup
                      @search="onSearch"/>
            </b-col>
            <b-col md="2">
              <b-form-group>
                <b-button variant="primary"
                          size="sm"
                          block
                          :disabled="isLoading || !selectedStaticList.id"
                          @click="onSubmit">
                  Add to
                </b-button>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
        <div class="tree-container">
          <select-list-tree-folder class="select-list-tree-folder"
                                   :name="folder.name"
                                   :key="folder.id"
                                   :id="folder.id"
                                   :order="folder.order"
                                   :hasEdit="folder.has_edit"
                                   :hasDelete="folder.has_delete"
                                   :folders="folder.child_folders"
                                   :lists="folder.lists.filter(list => list.type === ContactListTypes.STATIC && list.id !== selectedList.id)"
                                   :layer="0"
                                   v-for="folder in folders"/>
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import SelectListTreeFolder from 'src/components/select-list-tree-folder/select-list-tree-folder'
import Search from 'src/components/search'
import { isEmpty } from 'lodash'

export default {
  inject: [
    'selectedContacts'
  ],

  components: { Search, SelectListTreeFolder },

  computed: {
    ...mapGetters('contacts', [
      'selectList',
      'currentListFilters',
      'selectedStaticList',
      'selectedList',
      'folders'
    ]),

    ...mapState(['isDatatableSelectedAll']),

    getTitle () {
      return 'Add to Static Lists'
    }
  },

  methods: {
    ...mapActions('contacts', [
      'selectListClose',
      'foldersLoaded',
      'setSelectListSearchValue'
    ]),

    onClose () {
      if (!this.isLoading) {
        this.selectListClose()
      }
    },

    onSearch (searchValue) {
      this.setSelectListSearchValue(searchValue)
    },

    processSubmit () {
      this.isLoading = true

      let params = {}

      if (this.isDatatableSelectedAll) {
        params.selected_all = true
      } else {
        params.contacts = this.selectedContacts[this.selectedList.id].map(item => item.id)
      }

      if (!isEmpty(this.currentListFilters)) {
        params.filter_groups = this.currentListFilters
      }

      this.$axios
        .post(`/api/v2/contacts-list/${this.selectedStaticList.id}/items`, params)
        .then((response) => {
          const message = response.data.message

          this.$router.push(`/contacts/list/${this.selectedStaticList.id}`)

          this.selectListClose()

          this.$generalNotification(message)

          this.loadFolders()
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onSubmit () {
      if (!this.selectedStaticList.hasEdit) {
        this.$generalNotification('You are not authorized to edit this resource.', 'error')
        return
      }

      this.$bvModal.msgBoxConfirm('Are you sure you want to continue?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'No',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.processSubmit()
        }
      })
    },

    loadFolders () {
      this.$axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  },

  data () {
    return {
      isOpen: false,
      contact_list_id: null,
      isLoading: false,
      ContactListTypes
    }
  },

  watch: {
    selectList ({ open }) {
      this.isOpen = open
      this.name = null
      this.type = this.ContactListTypes.STATIC
    }
  }
}
</script>
