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
          <div class="flex-grow-1 create-list-modal__title">New List</div>
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
            v-model="name"
          />
        </div>

        <div class="flex-grow-1 py-4">
          <div class="form-check mb-2" @click="type = ContactListTypes.DYNAMIC">
            <input
              class="form-check-input"
              type="radio"
              id="dynamicList"
              :checked="type === ContactListTypes.DYNAMIC"
            />
            <label for="dynamicList">
              <div class="create-list-modal__list-title">Dynamic List</div>
              <div class="create-list-modal__list-desc">
                Automatically updates based off a filter; contacts join or leave
                as their properties change
              </div>
            </label>
          </div>
          <div class="form-check" @click="type = ContactListTypes.STATIC">
            <input
              class="form-check-input"
              type="radio"
              id="staticList"
              :checked="type === ContactListTypes.STATIC"
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

        <div class="d-flex align-items-center">
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
            :disabled="isLoading"
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

const ContactListTypes = { STATIC, DYNAMIC }

export default {
  computed: {
    ...mapGetters('contacts', ['createList'])
  },
  methods: {
    ...mapActions('contacts', ['createListClose', 'foldersLoaded']),
    onClose () {
      if (!this.isLoading) {
        this.createListClose()
      }
    },
    onSubmit () {
      this.isLoading = true
      window.axios
        .post('/api/v1/contacts-list', {
          contact_folder_id: this.createList.folderId,
          name: this.name,
          type: this.type,
          headers: DEFAULT_COLUMNS,
          filters: [],
          order: 0
        })
        .then((response) => {
          const data = response.data.data
          const message = response.data.message

          this.$router.push(`/contacts/list/${data.id}`)

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
      window.axios
        .get('/api/v1/contact-folders')
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
      ContactListTypes
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

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.create-list-modal {
  .modal-lg {
    @media (min-width: 992px) {
      max-width: 650px;
    }
  }
  .modal-body {
    padding: 0;
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
}
</style>
