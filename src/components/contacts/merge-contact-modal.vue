<template>
  <b-modal centered
           hide-footer
           no-close-on-backdrop
           no-close-on-esc
           dialog-class="modal-mc-add"
           data-testid="merge-contact-modal"
           v-model="isOpen"
           @hide="onCloseAttempt">
    <template #modal-title>
      <h5 v-if="!active_step">
        Which contact do you want to merge <strong>{{ fromContact }}</strong> with?
      </h5>
      <h5 v-else>
        Merge <strong>{{ fromContact }}</strong> with <strong>{{ toContact }}</strong>
      </h5>
    </template>

    <div class="merge-contact__sidebar"
         style="margin-bottom: 2em;">
      <steps-wrapper-horizontal :current-step="currentStep" :steps="steps" />
    </div>

    <div style="margin-bottom: 2em;">
      <template v-if="active_step === 0">
        <q-input borderless
                 clearable
                 ref="searchInput"
                 class="form-control form-control-search"
                 placeholder="Search Contact..."
                 data-testid="search-input"
                 :loading="contact_searching"
                 v-model="searchQuery"
                 @input="onInput"
                 @click="toggleSearchFocus"
                 @clear="onClear">
          <template v-slot:prepend>
            <search-icon />
          </template>
          <template v-slot:default
                    v-show="isInputFocused">
            <q-tooltip anchor="bottom middle"
                       self="center middle"
                       data-testid="search-tooltip"
                       v-if="!searchQuery || (searchQuery && searchQuery.length < 3)">
              Search requires at least 3 characters
            </q-tooltip>
          </template>
        </q-input>

        <q-menu fit
                ref="contactsList"
                anchor="bottom left"
                self="top left"
                :max-height="300"
                v-show="showMenu">
          <q-list style="min-width: 100%" v-show="showMenu">
            <q-item clickable
                    style="padding: 10px;"
                    :key="contact.id"
                    v-for="contact in filteredContacts"
                    @click="selectContact(contact)">
              <q-item-section>
                <q-item-label><strong>{{ contact.name | fixContactName }}</strong></q-item-label>
                <q-item-label caption>{{ contact.phone_number | fixPhone('NATIONAL', true, false, true) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="text-grey"
                    style="padding: 10px;"
                    v-if="filteredContacts.length === 0">
              <q-item-section>
                <q-item-label>{{ no_data_text }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </template>

      <template v-else>
        <q-card-section>
          <h5 class="mb-3">
            The following <strong>{{ fromContact }}</strong> info will be added to the <strong>{{ toContact }}</strong> if applicable:
          </h5>
          <ul>
            <li v-for="(item, index) in listAddInfo"
                :key="index">{{ item }}</li>
          </ul>

          <hr />

          <h5 class="mb-3">
            The <strong>{{ fromContact }}</strong> contact will be deleted and the following info will be lost:
          </h5>
          <ul>
            <li v-for="(item, index) in listDeleteInfo" :key="index">{{ item }}</li>
          </ul>

          <hr />

          <h5><strong>Are you sure you want to merge?</strong></h5>
        </q-card-section>
      </template>
    </div>

    <div class="dialog-footer d-flex q-gutter-md">
      <q-btn class="flex-grow-1"
             data-testid="merge-cancel-button"
             :disabled="isMerging"
             :label="active_step ? 'Back' : 'Cancel'"
             @click="active_step ? backToSearch() : closeDialog()"/>
      <q-btn color="primary"
             class="flex-grow-1"
             data-testid="merge-review-button"
             :disabled="!selectedContact || isMerging"
             @click="active_step ? mergeContact() : reviewMerge()">
        <q-spinner-bars color="white"
                        v-if="isMerging"/>
        {{ !active_step ? 'Review' : (isMerging ? '&nbsp;Merging' : 'Merge') }}
      </q-btn>
    </div>
  </b-modal>
</template>

<script>
import debounce from 'lodash/debounce'
import { mapActions, mapState } from 'vuex'
import SearchIcon from 'components/icons/search-icon'
import StepsWrapperHorizontal from '../generic-wrappers/steps-wrapper-horizontal.vue'

export default {
  name: 'merge-contact-modal',

  components: { SearchIcon, StepsWrapperHorizontal },

  props: {
    contact: {
      required: true
    }
  },

  data () {
    return {
      active_step: 0,
      cancelToken: null,
      contact_searching: false,
      contacts: [],
      filteredContacts: [],
      isInputFocused: false,
      isMerging: false,
      no_data_text: '',
      searchQuery: '',
      selectedContact: null,
      showMenu: false,
      source: null,

      steps: [
        { id: 1, name: 'Select Contact' },
        { id: 2, name: 'Merge Contact' }
      ],

      listAddInfo: [
        'Phone Number',
        'Power Dialer Tasks',
        'Communications',
        'Tags',
        'Future Scheduled Messages',
        'Ring Groups',
        'Lines',
        'Initial Line',
        'Contact Disposition',
        'Owner'
      ],

      listDeleteInfo: [
        'Contact Information (e.g. First Name, Last Name, etc.)',
        'Contact Audits',
        'Active Broadcast or Sequence'
      ]
    }
  },

  computed: {
    ...mapState('contacts', ['isMergeContactOpen']),

    currentStep () {
      return this.steps[this.active_step]
    },

    isOpen: {
      get () {
        return this.isMergeContactOpen
      },
      set (isOpen) {
        return isOpen
      }
    },

    fromContact () {
      return this.getFormattedContactName(this.contact)
    },

    toContact () {
      return this.getFormattedContactName(this.selectedContact)
    }
  },

  created () {
    this.CancelToken = window.axios.CancelToken
    this.source = this.CancelToken.source()
  },

  methods: {
    ...mapActions('contacts', ['addMergeContactOpen']),

    toggleSearchFocus: debounce(function () {
      if (this.isInputFocused) {
        this.$refs.searchInput.blur()
      } else {
        this.$refs.searchInput.focus()
      }
      this.isInputFocused = !this.isInputFocused

      if (!this.isInputFocused && this.searchQuery && this.searchQuery.length >= 3) {
        this.isInputFocused = true
        this.showMenu = true
        this.$refs.searchInput.focus()
      }
    }, 200),

    onInput: debounce(function () {
      if (!this.searchQuery) {
        this.searchQuery = ''
      }
      this.searchQuery = this.searchQuery.trim()
      this.fetchContact(this.searchQuery)
    }, 500),

    onClear () {
      this.searchQuery = ''
      this.filteredContacts = []
      this.selectedContact = null
      this.showMenu = false
    },

    onCloseAttempt (evt) {
      evt.preventDefault()
      this.closeDialog()
    },

    selectContact (contact) {
      this.selectedContact = contact
      this.searchQuery = contact.name
      this.showMenu = false
    },

    resetAll () {
      this.selectedContact = null
      this.contacts = []
      this.isOpen = false
      this.active_step = 0
      this.contact_searching = false
    },

    backToSearch () {
      this.active_step = 0
    },

    reviewMerge () {
      this.active_step = 1
    },

    closeDialog () {
      if (this.selectedContact) {
        this.$q.dialog({
          title: 'Merge Contact',
          message: `Are you sure you want to close this form?`,
          ok: "Yes, I'm sure",
          cancel: "No, I'm not",
          persistent: true
        }).onOk(() => {
          this.resetAll()
          this.addMergeContactOpen(false)
        })
      } else {
        this.resetAll()
        this.addMergeContactOpen(false)
      }
    },

    fetchContact (query) {
      this.filteredContacts = []
      this.showMenu = false

      if (query.length >= 3) {
        this.source.cancel('fetchContact canceled by the user.')
        this.source = this.CancelToken.source()
        this.contact_searching = true

        const params = {
          search_fields: ['name', 'email', 'phone_number'],
          search_text: query
        }

        this.$axios.get('/api/v1/contact', {
          params,
          cancelToken: this.source.token
        })
          .then((res) => {
            this.contacts = res.data.data
            this.filteredContacts = this.contacts.filter(contact =>
              this.contact && contact.id !== this.contact.id
            )
            this.showMenu = true
          })
          .catch((err) => {
            if (!this.$axios.isCancel(err)) {
              this.$root.handleErrors(err.response)
            }
          })
          .finally(() => {
            this.contact_searching = false
            this.no_data_text = this.filteredContacts.length === 0 ? 'No data' : ''
          })
      }
    },

    mergeContact () {
      this.isMerging = true
      this.active_step++

      this.$axios.put(`/api/v1/contact/${this.contact.id}/merge-to/${this.selectedContact.id}`)
        .then((res) => {
          if (res.data) {
            this.$generalNotification(`${this.fromContact} successfully merged with ${this.toContact}`, 'success')

            let id = this.selectedContact.id
            this.resetAll()
            this.addMergeContactOpen(false)

            setTimeout(() => {
              this.$router.push('/contacts/' + id)
            }, 200)
          }
        })
        .catch((err) => {
          console.log(err)
          this.$generalNotification('Something went wrong while merging contacts.', 'error')
        })
        .finally(() => {
          this.isMerging = false
        })
    },

    getFormattedContactName (contact) {
      if (!contact) {
        return ''
      }

      const filters = this.$options.filters

      return contact.name
        ? filters.fixContactName(contact.name)
        : filters.fixPhone(contact.phone_number)
    }
  },

  watch: {
    isMergeContactOpen (value) {
      this.isOpen = value
    }
  }
}
</script>

<style scoped>
ul {
  padding-left: 1.5em;
}

li {
  margin-bottom: 2px;
}

.q-btn {
  text-transform: none !important;
}
</style>
