<template>
  <b-modal modal-class="create-list-modal"
           title="Create A List"
           size="lg"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           v-model="isOpen">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               rounded="sm"
               spinner-smal
               :show="isLoading">
      <div class="d-flex flex-column create-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 create-list-modal__title">{{ getTitle }}</div>
          <button class="btn btn-link small text-muted create-list-modal__close"
                  @click="onClose">
            <i class="fa fa-times"/>
          </button>
        </div>

        <div class="pt-3">
          <input class="form-control"
                 type="text"
                 placeholder="Untitled List"
                 autofocus
                 :disabled="isLoading"
                 v-model="createList.name"/>
        </div>

        <div class="flex-grow-1 py-4"
             v-if="![CreateListMode.FROM_FILTERS, CreateListMode.FROM_BULK_MENU].includes(createList.mode) && isDefault">
          <div class="form-check mb-2"
               @click="createList.type = ContactListTypes.DYNAMIC">
            <input class="form-check-input"
                   type="radio"
                   id="dynamicList"
                   :checked="createList.type === ContactListTypes.DYNAMIC"/>
            <label for="dynamicList">
              <div class="create-list-modal__list-title">Dynamic List</div>
              <div class="create-list-modal__list-desc">
                Automatically updates based off a filter; contacts join or leave
                as their properties change
              </div>
            </label>
          </div>
          <div class="form-check"
               @click="createList.type = ContactListTypes.STATIC">
            <input class="form-check-input"
                   type="radio"
                   id="staticList"
                   :checked="createList.type === ContactListTypes.STATIC"/>
            <label for="staticList">
              <div class="create-list-modal__list-title">Static List</div>
              <div class="create-list-modal__list-desc">
                Does not Automatically update; able to manually select and
                adjust order of contacts
              </div>
            </label>
          </div>
        </div>

        <div class="text-red">
          {{ errorMsg }}
        </div>

        <div class="d-flex align-items-center pt-3">
          <button class="btn btn-block btn-light mt-0 mr-2"
                  :disabled="isLoading"
                  @click="onClose">
            Cancel
          </button>
          <button class="btn btn-block btn-primary mt-0"
                  :disabled="!isNameValid || isLoading"
                  @click="onSubmit">
            Create
          </button>
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import {
  DEFAULT_COLUMNS,
  POWER_DIALER_DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import {
  DEFAULT_DYNAMIC_LIST_TEMPLATE_REQUEST,
  DEFAULT_DYNAMIC_LIST_TEMPLATE_RESPONSE
} from 'src/constants/default-lists'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import {
  FROM_FILTERS,
  FROM_FOLDERS,
  FROM_BULK_MENU
} from 'src/constants/contacts-list-create-mode'

export default {
  props: {
    isDefault: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'createList',
      'currentListFilters',
      'selectedList',
      'selectedContacts',
      'unsavedList',
      'isAllContactsSelected'
    ]),

    ...mapState(['isDatatableSelectedAll']),

    getTitle () {
      if ([this.CreateListMode.FROM_FILTERS, this.CreateListMode.FROM_BULK_MENU].includes(this.createList.mode)) {
        const typeText = (this.createList.type === this.ContactListTypes.STATIC) ? 'Static' : 'Dynamic'
        return `New ${typeText} List`
      }

      return 'New List'
    },

    isNameValid () {
      return this.createList.name && this.createList.name.length > 0
    },

    listsEndpoint () {
      return this.isDefault ? '/api/v2/contacts-list' : '/api/v2/power-dialer-lists'
    },

    foldersEndpoint () {
      return this.isDefault ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    },

    redirectPath () {
      return this.isDefault ? `/contacts/list` : `/power-dialer/list`
    },

    defaultTemplateRequest () {
      return DEFAULT_DYNAMIC_LIST_TEMPLATE_REQUEST
    },

    defaultTemplateResponse () {
      return DEFAULT_DYNAMIC_LIST_TEMPLATE_RESPONSE
    }
  },

  methods: {
    ...mapActions('contacts', [
      'createListClose',
      'foldersLoaded',
      'setUnsavedList',
      'setCurrentListFilters'
    ]),

    onClose () {
      if (!this.isLoading) {
        this.createListClose()
      }
    },

    getParams () {
      let headers = DEFAULT_COLUMNS

      if (this.$route.name.includes('Power Dialer')) {
        headers = POWER_DIALER_DEFAULT_COLUMNS
      }

      let params = {
        contact_folder_id: this.createList.contact_folder_id,
        name: this.createList.name,
        type: this.createList.type,
        headers: headers,
        mode: this.createList.mode,
        order: 0,
        include_all_contacts: this.isAllContactsSelected
      }

      const clonedCurrentListFilters = { ...this.currentListFilters }

      // remove contact_lists filter since we are creating dynamic one
      if (clonedCurrentListFilters?.contact_lists) {
        delete clonedCurrentListFilters.contact_lists
      }

      if (!this.isDatatableSelectedAll) {
        switch (true) {
          case this.createList.mode === FROM_FILTERS:
            params = {
              ...params,
              filters: clonedCurrentListFilters
            }

            break
          case this.createList.mode === FROM_BULK_MENU:
            let contacts = []

            if (this.selectedContacts[this.selectedList.id]) {
              contacts = this.selectedContacts[this.selectedList.id]
            }

            params = {
              ...params,
              contacts: contacts.map(contact => contact.id)
            }

            break
          case this.createList.mode === FROM_FOLDERS:
          default:
        }
      } else {
        params.selected_all = true
      }

      params.filter_groups = this.currentListFilters

      return params
    },

    processSubmit () {
      this.isLoading = true

      this.$axios
        .post(this.listsEndpoint, this.getParams())
        .then((response) => {
          const message = response.data.message
          const id = response.data?.id || response.data?.data?.id

          if (this.createList.mode === FROM_BULK_MENU) {
            this.$router.push(`${this.redirectPath}/${id}`)
          } else {
            this.$router.push(`${this.redirectPath}/${id}?start=1`)
          }

          this.createListClose()

          this.$generalNotification(message)

          this.loadFolders()
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          console.log(html)
          this.errorMsg = message
          this.$generalNotification(message, 'error')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onSubmit () {
      if (this.createList.type === this.ContactListTypes.STATIC) {
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
      } else {
        if (this.unsavedList) {
          this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action will overwrite any unsaved data. Do you wish to continue?', {
            buttonSize: 'sm',
            okTitle: 'Yes',
            cancelTitle: 'No',
            centered: true
          }).then(confirm => {
            if (confirm) {
              this.handleDynamicListCreation()
            }
          })
        } else {
          this.handleDynamicListCreation()
        }

        this.isLoading = false
      }
    },

    handleDynamicListCreation () {
      this.isLoading = true

      const data = {
        ...this.defaultTemplateResponse,
        name: this.getParams().name,
        contact_folder_id: this.getParams().contact_folder_id,
        params: this.getParams(),
        filters: []
      }

      this.setUnsavedList(data)
      this.isLoading = false
      this.createListClose()

      if (this.$route.path !== '/contacts/list/unsaved') {
        this.$router.push(`${this.redirectPath}/unsaved`)
      }

      this.$VueEvent.fire('resetContactsListFilter')

      this.setCurrentListFilters({
        sort: this.currentListFilters.sort,
        order: this.currentListFilters.order,
        search: this.currentListFilters.search,
        relations: this.currentListFilters.relations
      })
    },

    loadFolders () {
      this.$axios
        .get(this.foldersEndpoint)
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
      name: null,
      type: ContactListTypes.DYNAMIC,
      isLoading: false,
      CreateListMode: {
        FROM_FILTERS,
        FROM_FOLDERS,
        FROM_BULK_MENU
      },
      errorMsg: '',
      ContactListTypes
    }
  },

  watch: {
    createList ({ open }) {
      this.isOpen = open
      this.name = null
      this.type = this.ContactListTypes.DYNAMIC
    }
  }
}
</script>
