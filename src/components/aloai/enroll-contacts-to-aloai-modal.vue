<template>
  <b-modal
    size="md"
    hide-header
    hide-footer
    centered
    data-testid="enroll-contacts-to-aloai-modal"
    v-model="isOpen"
    @hidden="onHidden"
    @shown="onShown"
  >
    <div class="p-2">
      <h1
        data-testid="enroll-contacts-to-aloai-modal-title"
        class="text-center mb-2"
      >
        Enroll Contacts to AloAi Bot
      </h1>
      <div class="text-center">
        Select the bot that you want to enroll at your
        <strong>~{{this.contactsCount}} contacts</strong>.
      </div>
      <div class="w-75 my-2 mx-auto">
        <search
          placeholder="Search bot"
          data-testid="enroll-contacts-to-aloai-modal-search"
          @search="onSearch"
        />
      </div>
      <b-form
        data-testid="enroll-contacts-to-aloai-modal-form"
        class="my-4"
        @submit.prevent="onSubmit"
      >
        <div
          class="p-1"
          v-if="isLoading"
        >
          <template v-for="n in 5">
            <q-skeleton
              type="text"
              animation="fade"
              height="40px"
              :key="`${n}-skeleton`"
            />
          </template>
        </div>
        <template v-else>
          <div
            class="text-center py-2"
            v-if="!this.filteredBots.length"
          >
            No records to show.
          </div>
          <b-overlay
            data-testid="enroll-to-aloai-modal-overlay"
            :show="isBusy"
            v-else
          >
            <ul class="list-group list-group-flush scrollable-list">
              <li
                class="list-group-item list-group-item-action p-0"
                :key="`enroll-bot-${key}`"
                v-for="(bot, key) in this.filteredBots"
              >
                <label class="d-block font-weight-bold p-2 mb-0 cursor-pointer">
                  <b-form-radio
                    name="selected-bot"
                    :value="bot.id"
                    v-model="selectedBotId"
                  >
                    {{ bot.name }}
                  </b-form-radio>
                </label>
              </li>
            </ul>

            <template #overlay>
              <div class="text-center">
                <q-spinner-bars
                  color="primary"
                  size="2em"
                />
              </div>
            </template>
          </b-overlay>
        </template>
      </b-form>
      <div
        class="d-flex items-center justify-center"
        style="gap: 15px"
      >
        <b-button
          variant="outline"
          size="sm"
          class="custom-btn"
          data-testid="enroll-contacts-to-aloai-modal-close-button"
          @click="onHidden"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          size="sm"
          class="custom-btn"
          :disabled="!selectedBotId || isBusy"
          data-testid="enroll-contacts-to-aloai-modal-enroll-contact-button"
          @click="onSubmit"
        >
          <q-spinner-bars
            color="white"
            v-if="isBusy"
          />
          Enroll
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters, mapState } from 'vuex'
import Search from 'src/components/search.vue'
import { isEmpty } from 'lodash'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { viewMixin } from 'src/plugins/mixins'

export default {
  name: 'enroll-contacts-to-aloai-modal',
  components: { Search },
  props: {
    params: {
      type: Object,
      required: true
    },
    contactList: {
      type: Object,
      default: null
    },
    checkedCount: {
      type: Number,
      default: 0
    }
  },
  mixins: [viewMixin],
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', [
      'currentListFilters',
      'showAddViewMyContacts',
      'search'
    ]),
    ...mapState(['isDatatableSelectedAll']),
    filteredBots () {
      let bots = this.bots
      if (!isEmpty(this.searchText)) {
        bots = bots.filter((bot) =>
          bot.name.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      return bots.sort((a, b) =>
        a.name?.toUpperCase() > b.name?.toUpperCase() ? 1 : -1
      )
    },
    contactsCount () {
      if (this.mode === 'add-contact-list' && this.contactList) {
        return this.contactList.contactCount
      }

      if (this.isDatatableSelectedAll) {
        return this.checkedCount
      }

      return this.params?.contact_ids?.length ?? 0
    }
  },
  data () {
    return {
      isBusy: false,
      isOpen: false,
      mode: 'add-contact-list',
      bots: [],
      searchText: '',
      isLoading: true,
      selectedBotId: undefined,
      ContactListTypes
    }
  },
  methods: {
    onSearch (searchText) {
      this.searchText = searchText
    },
    onSubmit (event) {
      event.preventDefault()

      const params = {
        ...this.params,
        'prevent_duplicates': true,
        'multiple_phone_numbers': false,
        'allow_international_phone_numbers': false,
        'own_contacts_only': this.showAddViewMyContacts
      }

      if (this.search) {
        params.search = this.search
      }

      if (this.isDatatableSelectedAll) {
        params.selected_all = true
        if (params?.contact_ids) {
          delete params.contact_ids
        }
      }

      // // Verify filters to avoid adding all company contacts
      // if (params.selected_all && !params.filter_groups && this.contactList && this.contactList.id !== 'all') {
      //   // Add to requests params the list_id to adding all contacts from current list
      //   params.contact_list_id = this.contactList.id
      // }

      // Don't send list_id for dynamic lists, it should use only the filters
      if (this.contactList?.type === this.ContactListTypes.DYNAMIC) {
        delete params.list_id
      }

      if (!isEmpty(this.currentListFilters)) {
        params.filter_groups = this.$jsonClone(this.currentListFilters)
      }

      // add confirm dialog here
      this.isBusy = true
      talk2Api.V2.aloAiBot
        .enrollContacts(this.selectedBotId, params)
        .then(() => {
          this.$generalNotification(
            'Contacts successfully enrolled to the selected AloAi Bot.'
          )
          this.onHidden()
        })
        .catch((error) => {
          let errorMsg = 'Error while enrolling contacts to AloAi Bot.'
          if (error?.response.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[onSubmit] error', error)
        })
        .finally(() => {
          this.isBusy = false
        })
    },
    onHidden () {
      this.isOpen = false
      setTimeout(() => {
        this.isBusy = true
        this.isLoading = true
        this.searchText = ''
        this.selectedBotId = undefined
      }, 300)
    },
    onShown () {
      this.load()
    },
    async load () {
      this.isLoading = true
      this.isBusy = true
      try {
        this.bots = await this.fetchBots()
        this.isLoading = false
        this.isBusy = false
      } catch (error) {
        this.$generalNotification('Error while fetching AloAi Bots.', 'error')
        console.error('[loadBots] error', error)
        this.isLoading = false
        this.isBusy = false
      }
    },
    async fetchBots () {
      try {
        if (this.bots.length > 0) {
          return this.bots
        }
        const { data } = await talk2Api.V2.aloAiBot.getBots({
          enabled: true,
          use_case: 1
        })
        return data?.data ?? []
      } catch (error) {
        console.error('[fetchBots] error', error)
        return []
      }
    }
  }
}
</script>
<style scoped>
.scrollable-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
