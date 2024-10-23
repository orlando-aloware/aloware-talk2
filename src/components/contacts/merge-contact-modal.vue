<template>
  <div>
    <b-modal
      dialog-class="modal-mc-add"
      data-testid="merge-contact-modal"
      centered
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
      v-model="isOpen"
      @hide="onCloseAttempt"
    >
      <template #modal-title>
        <h5 v-if="!active_step">
          Which contact do you want to merge {{ fromContact }} with?
        </h5>
        <h5 v-else>
          Merge {{ fromContact }} with {{ toContact }}
        </h5>
      </template>

      <div class="merge-contact__sidebar" style="margin-bottom: 2em;">
        <steps-wrapper-horizontal :current-step="currentStep" :steps="steps" />
      </div>

      <div style="margin-bottom: 2em;">
        <template v-if="active_step === 0">
          <q-input
            class="form-control form-control-search"
            placeholder="Search Contact..."
            :disabled="disabled"
            :loading="contact_searching"
            ref="searchInput"
            v-model="searchQuery"
            borderless
            clearable
            data-testid="search-input"
            @input="onInput"
            @click="toggleSearchFocus"
            @clear="onClear"
          >
            <template v-slot:prepend>
              <search-icon />
            </template>
            <template v-slot:default v-show="isInputFocused">
              <q-tooltip
                anchor="bottom middle"
                self="center middle"
                data-testid="search-tooltip"
                v-if="!searchQuery || (searchQuery && searchQuery.length < 3)"
              >
                Search requires at least 3 characters
              </q-tooltip>
            </template>
          </q-input>

          <q-menu
            v-if="showMenu"
            anchor="bottom left"
            self="top left"
            fit
            :max-height="300"
            ref="contactsList"
          >
            <q-list style="min-width: 100%">
              <q-item
                v-for="contact in filteredContacts"
                :key="contact.id"
                clickable
                @click="selectContact(contact)"
                style="padding: 10px;"
              >
                <q-item-section>
                  <q-item-label>{{ contact.name | fixContactName }}</q-item-label>
                  <q-item-label caption>{{ contact.phone_number | fixPhone }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="filteredContacts.length === 0" class="text-grey" style="padding: 10px;">
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
              <li v-for="(item, index) in addedInfo" :key="index">{{ item }}</li>
            </ul>

            <hr />

            <h5 class="mb-3">
              The <strong>{{ fromContact }}</strong> contact will be deleted and the following info will be lost:
            </h5>
            <ul>
              <li v-for="(item, index) in lostInfo" :key="index">{{ item }}</li>
            </ul>

            <hr />

            <h5><strong>Are you sure you want to merge?</strong></h5>
          </q-card-section>
        </template>
      </div>

      <div class="dialog-footer d-flex q-gutter-md">
        <q-btn
          @click="active_step ? backToSearch() : closeDialog()"
          data-testid="merge-cancel-button"
          class="flex-grow-1"
          :label="active_step ? 'Back' : 'Cancel'"
          :disable="isMerging"
        />
        <q-btn
          @click="active_step ? mergeContact() : reviewMerge()"
          :disabled="!selectedContact || isMerging"
          color="primary"
          data-testid="merge-review-button"
          class="flex-grow-1"
        >
          {{ !active_step ? 'Review' : 'Merge' }}
        </q-btn>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import StepsWrapperHorizontal from '../generic-wrappers/steps-wrapper-horizontal.vue'
import SearchIcon from 'components/icons/search-icon'
import _ from 'lodash'

export default {
  name: 'merge-contact-modal',
  components: { StepsWrapperHorizontal, SearchIcon },
  props: { contact: {} },
  data () {
    return {
      isMerging: false,
      searchQuery: '',
      selectedContact: null,
      showMenu: false,
      contact_searching: false,
      contacts: [],
      filteredContacts: [],
      active_step: 0,
      cancelToken: null,
      source: null,
      no_data_text: '',
      isInputFocused: false,
      steps: [
        { id: 1, name: 'Select Contact' },
        { id: 2, name: 'Merge Contact' }
      ],
      addedInfo: [
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
      lostInfo: [
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
      if (this.contact) {
        const filters = this.$options.filters
        return this.contact.name
          ? filters.fixContactName(this.contact.name)
          : filters.fixPhone(this.contact.phone_number)
      }
      return ''
    },
    toContact () {
      if (this.selectedContact) {
        const filters = this.$options.filters
        return this.selectedContact.name
          ? filters.fixContactName(this.selectedContact.name)
          : filters.fixPhone(this.selectedContact.phone_number)
      }
      return ''
    }
  },
  created () {

  },
  methods: {
    ...mapActions('contacts', ['addMergeContactOpen']),
    onInput: _.debounce(function () {
      // Pending
    }, 500),

    toggleSearchFocus: _.debounce(function () {
      // Pending
    }, 200),

    onClear () {
      this.searchQuery = ''
      this.filteredContacts = []
      this.selectedContact = null
      this.showMenu = false
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
    },

    backToSearch () {
      this.active_step = 0
    },

    reviewMerge () {
      this.active_step = 1
    },

    onCloseAttempt (evt) {
      evt.preventDefault()
      this.closeDialog()
    },

    closeDialog () {
      // Pending
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
            this.$q.notify({
              message: `${this.fromContact} successfully merged with ${this.toContact}`,
              color: 'positive'
            })
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
          this.$q.notify({
            message: 'Something went wrong while merging contacts.',
            color: 'negative'
          })
        })
        .finally(() => {
          this.isMerging = false
        })
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
