<template>
  <b-modal
    v-model="isOpen"
    title="Select A List"
    size="lg"
    modal-class="select-list-modal"
    scrollable
    centered
    hide-footer
    hide-header
    no-close-on-esc
  >
    <b-overlay
      :show="isLoading"
      spinner-variant="primary"
      spinner-type="grow"
      spinner-small
      rounded="sm"
    >
      <div class="d-flex flex-column select-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 select-list-modal__title">{{ getTitle }}</div>
          <button
            class="btn btn-link small text-muted select-list-modal__close"
            @click="onClose"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="pt-3">
          <b-form-row>
            <b-col md="10">
              <contacts-table-search
                @search="onSearch"
                placeholder="Search static list..."
                searchOnKeyup
              />
            </b-col>
            <b-col md="2">
              <b-form-group>
                <b-button
                  block
                  variant="primary"
                  size="sm"
                  class="mt-2"
                  :disabled="isLoading || !selectedStaticList.id"
                  @click="onSubmit"
                >
                  Add to
                </b-button>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
        <div class="tree-container">
          <select-list-tree-folder
            v-for="folder in folders"
            :name="folder.name"
            :key="folder.id"
            :id="folder.id"
            :order="folder.order"
            :hasEdit="folder.has_edit"
            :hasDelete="folder.has_delete"
            :folders="folder.child_folders"
            :lists="folder.lists.filter(list => list.type === ContactListTypes.STATIC && list.id !== selectedList.id)"
            :layer="0"
          />
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  STATIC,
  DYNAMIC
} from 'src/constants/contacts-list-types'

import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import SelectListTreeFolder from 'src/components/select-list-tree-folder/select-list-tree-folder'
import ContactsTableSearch from 'src/components/contacts/contacts-table-search'

const ContactListTypes = { STATIC, DYNAMIC }
export default {
  components: { ContactsTableSearch, SelectListTreeFolder },
  computed: {
    ...mapGetters('contacts', ['selectList', 'currentListFilters', 'selectedStaticList', 'selectedList', 'selectedContacts', 'folders']),
    getTitle () {
      return 'Add to Static Lists'
    }
  },
  methods: {
    ...mapActions('contacts', ['selectListClose', 'foldersLoaded', 'setSelectListSearchValue']),
    onClose () {
      if (!this.isLoading) {
        this.selectListClose()
      }
    },
    onSearch (searchValue) {
      this.setSelectListSearchValue(searchValue)
    },
    onSubmit () {
      if (!this.selectedStaticList.hasEdit) {
        this.$q.notify({
          message: 'You are not authorized to edit this resource.',
          type: 'negative',
          textColor: 'white'
        })
        return
      }

      this.isLoading = true
      window.axios
        .post(`/api/v2/contacts-list/${this.selectedStaticList.id}/items`, {
          contacts: this.selectedContacts[this.selectedList.id]
        })
        .then((response) => {
          const message = response.data.message

          this.$router.push(`/contacts/list/${this.selectedStaticList.id}`)

          this.selectListClose()

          this.$q.notify({
            message,
            type: 'positive',
            textColor: 'white'
          })

          this.loadFolders()
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
        .finally(() => {
          this.isLoading = false
        })
    },
    loadFolders () {
      window.axios
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
      this.type = ContactListTypes.STATIC
    }
  }
}
</script>

<style lang="scss">
@import '../css/mixins';
@import '../css/variables';
@import '../css/breakpoints';
.select-list-modal {
  .modal-lg {
    @media (min-width: 992px) {
      max-width: 550px;
    }
  }
  .modal-body {
    padding: 0;
    min-height: 90vh;
    max-height: 90vh;
    overflow: hidden !important;
  }
  &__body {
    padding: 40px;
  }
  &__title {
    font-size: 18px;
    font-weight: 400;
    color: $black;
  }
  &__close {
    margin-right: -15px;
    margin-top: -30px;
  }
  &__list-title {
    font-size: 14px;
    font-weight: 600;
    color: $black;
  }
  &__list-desc {
    font-size: 13px;
    color: $grey-light5;
  }

  .tree-container {
    max-height: 65vh;
    overflow: auto;
  }

  .row.q-input .q-field__prepend + .q-field__control-container .q-field__native {
    padding-left: 15px !important;
  }
}
</style>
