<template>
  <b-modal
    v-model="isOpen"
    title="Create A List"
    size="lg"
    modal-class="create-list-modal"
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
      <div class="d-flex flex-column create-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 create-list-modal__title">{{ getTitle }}</div>
          <button
            class="btn btn-link small text-muted create-list-modal__close"
            @click="onClose"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="pt-3">
          <input
            type="text"
            class="form-control"
            placeholder="Untitled List"
            :disabled="isLoading"
            autofocus
            v-model="createList.name"
          />
        </div>

        <div class="flex-grow-1 py-4" v-if="![CreateListMode.FROM_FILTERS, CreateListMode.FROM_BULK_MENU].includes(createList.mode)">
          <div class="form-check mb-2" @click="createList.type = ContactListTypes.DYNAMIC">
            <input
              class="form-check-input"
              type="radio"
              id="dynamicList"
              :checked="createList.type === ContactListTypes.DYNAMIC"
            />
            <label for="dynamicList">
              <div class="create-list-modal__list-title">Dynamic List</div>
              <div class="create-list-modal__list-desc">
                Automatically updates based off a filter; contacts join or leave
                as their properties change
              </div>
            </label>
          </div>
          <div class="form-check" @click="createList.type = ContactListTypes.STATIC">
            <input
              class="form-check-input"
              type="radio"
              id="staticList"
              :checked="createList.type === ContactListTypes.STATIC"
            />
            <label for="staticList">
              <div class="create-list-modal__list-title">Static List</div>
              <div class="create-list-modal__list-desc">
                Does not Automatically update; able to manually select and
                adjust order of contacts
              </div>
            </label>
          </div>
        </div>

        <div class="d-flex align-items-center pt-3">
          <button
            class="btn btn-block btn-light mt-0 mr-2"
            @click="onClose"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            class="btn btn-block btn-primary mt-0"
            @click="onSubmit"
            :disabled="!isNameValid || isLoading"
          >
            Create
          </button>
        </div>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  STATIC,
  DYNAMIC,
  DEFAULT_COLUMNS
} from 'src/constants/contacts-list-types'

import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { FROM_FILTERS, FROM_FOLDERS, FROM_BULK_MENU } from 'src/constants/contacts-list-create-mode'

const ContactListTypes = { STATIC, DYNAMIC }
export default {
  computed: {
    ...mapGetters('contacts', ['createList', 'currentListFilters', 'selectedList', 'selectedContacts']),
    getTitle () {
      if ([this.CreateListMode.FROM_FILTERS, this.CreateListMode.FROM_BULK_MENU].includes(this.createList.mode)) {
        let typeText = (this.createList.type === STATIC) ? 'Static' : 'Dynamic'
        return `New ${typeText} Lists`
      }

      return 'New Lists'
    },
    isNameValid () {
      return this.createList.name && this.createList.name.length > 0
    }
  },
  methods: {
    ...mapActions('contacts', ['createListClose', 'foldersLoaded']),
    onClose () {
      if (!this.isLoading) {
        this.createListClose()
      }
    },
    getParams () {
      let params = {
        contact_folder_id: this.createList.contact_folder_id,
        name: this.createList.name,
        type: this.createList.type,
        headers: DEFAULT_COLUMNS,
        mode: this.createList.mode,
        order: 0
      }

      switch (true) {
        case this.createList.mode === FROM_FILTERS:
          let clonedCurrentListFilters = { ...this.currentListFilters }
          if (this.createList.type === DYNAMIC) {
            // remove contact_lists filter since we are creating dynamic one
            delete clonedCurrentListFilters.contact_lists
          }
          params = { ...params, filters: clonedCurrentListFilters }

          break
        case this.createList.mode === FROM_BULK_MENU:
          let contacts = []

          if (this.selectedContacts[this.selectedList.id]) {
            contacts = this.selectedContacts[this.selectedList.id]
          }
          params = { ...params, contacts: contacts.map(contact => contact.id) }
          break
        case this.createList.mode === FROM_FOLDERS:
        default:
      }

      return params
    },
    onSubmit () {
      this.isLoading = true
      this.$axios
        .post('/api/v2/contacts-list', this.getParams())
        .then((response) => {
          const data = response.data.data
          const message = response.data.message

          if (this.createList.mode === FROM_BULK_MENU) {
            this.$router.push(`/contacts/list/${data.id}`)
          } else {
            this.$router.push(`/contacts/list/${data.id}?start=1`)
          }

          this.createListClose()

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
      this.$axios
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
      name: null,
      type: ContactListTypes.DYNAMIC,
      isLoading: false,
      ContactListTypes,
      CreateListMode: { FROM_FILTERS, FROM_FOLDERS, FROM_BULK_MENU }
    }
  },
  watch: {
    createList ({ open }) {
      this.isOpen = open
      this.name = null
      this.type = ContactListTypes.DYNAMIC
    }
  }
}
</script>
