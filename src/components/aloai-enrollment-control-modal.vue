<template>
  <b-modal size="md"
           hide-header
           hide-footer
           centered
           data-testid="aloai-enrollment-control-modal"
           v-model="isOpen"
           @hidden="onHidden"
           @shown="onShown">
    <div class="p-2">
      <h1 data-testid="aloai-enrollment-control-modal-title"
          class="text-center mb-2">
        AloAi Text Bot Enrollment
      </h1>
      <div class="text-center">
        Select the Sales Bot you want to initiate a conversation with this contact.
      </div>
      <div class="w-75 my-2 mx-auto">
        <search placeholder="Search bot"
                data-testid="aloai-enrollment-control-modal-search"
                @search="onSearch"/>
      </div>
      <ul class="list-group list-group-flush scrollable-list mb-4">
        <li class="list-group-item list-group-item-action p-0"
            :key="`enroll-bot-${key}`"
            v-for="(bot, key) in this.filteredSalesBots">
          <label class="d-block font-weight-bold p-2 mb-0 cursor-pointer">
            <b-form-radio name="selected-bot"
                          :value="bot.id"
                          v-model="selectedBotId">
              {{ bot.name }}
              <!-- Bot Enrolled Label -->
              <b-popover
                target="enrolled-badge"
                triggers="hover"
                placement="right"
                delay="100"
              >
                This contact is currently enrolled to this bot.
              </b-popover>
              <q-badge
                v-if="isEnrolled(bot.id)"
                id="enrolled-badge"
                class="ml-1"
                color="green-6"
              >
                <span>Enrolled</span>
              </q-badge>
            </b-form-radio>
          </label>
        </li>
      </ul>
      <div class="d-flex items-center justify-center" style="gap: 15px">
        <button class="btn btn-sm btn-outline-dark mr-2"
                data-testid="aloai-enrollment-control-modal-close-button"
                @click="onHidden">
          Cancel
        </button>
        <button class="btn btn-sm bg-primary text-white mr-2"
                data-testid="aloai-enrollment-control-modal-enroll-contact-button"
                :disabled="isBusy"
                @click="confirmEnrollment">
          Enroll
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters } from 'vuex'
import Search from 'src/components/search.vue'
import { AloAiUseCases } from 'src/constants/aloai'
import { isEmpty } from 'lodash'

export default {
  name: 'aloai-enrollment-control-modal',

  components: { Search },

  computed: {
    ...mapGetters('contacts', ['contact']),
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
    // Retrieve only sales bots (Sales bot has a defined opener and can start conversations)
    filteredSalesBots () {
      let bots = this.bots.filter((bot) => bot.enabled && bot.use_case === AloAiUseCases.SALES)
      if (!isEmpty(this.searchText)) {
        bots = bots.filter((bot) =>
          bot.name.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      return bots.sort((a, b) =>
        a.name?.toUpperCase() > b.name?.toUpperCase() ? 1 : -1
      )
    }
  },

  data () {
    return {
      isBusy: false,
      isOpen: false,
      bots: [],
      bot_engagements: {},
      bot_enrollments: {},
      searchText: '',
      isLoading: true,
      selectedBotId: null,
      AloAiUseCases
    }
  },

  methods: {
    onSearch (searchText) {
      this.searchText = searchText
    },
    confirmEnrollment (event) {
      event.preventDefault()
      // If the contact is already enrolled, confirm we want to re-enroll
      if (this.isEnrolled(this.selectedBotId)) {
        this.$bvModal.msgBoxConfirm('Re-enrolling this contact will count as a new enrollment and charged accodingly. Continue?', {
          title: 'Warning',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'warning',
          okTitle: 'Yes',
          cancelTitle: 'No',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.submitEnrollment()
          }
        }).catch(() => {
          // Do nothing
        })
      } else {
        this.submitEnrollment()
      }
    },
    submitEnrollment () {
      if (!this.selectedBotId) {
        this.$generalNotification(
          'Please select a bot to enroll the contact.',
          'error'
        )
        return
      }

      this.isBusy = true

      talk2Api.V2.aloAiBot
        .enrollContacts(this.selectedBotId, { contact_ids: [this.contact.id] })
        .then(() => {
          this.$generalNotification(
            'Contact successfully enrolled to the selected AloAi Bot.'
          )
          this.onHidden()
        })
        .catch((error) => {
          let errorMsg = 'Error while enrolling contact to AloAi Bot.'
          if (error?.response.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[submitEnrollment] error', error)
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
        this.selectedBotId = null
      }, 300)
    },
    onShown () {
      this.load()
    },
    isEnrolled (botId) {
      // Search in the bot_enrollments object array if the contact is enrolled in the bot
      return !!this.bot_enrollments.some((enrollment) => enrollment.aloai_bot_id === botId)
    },
    async load () {
      this.isLoading = true
      this.isBusy = true

      try {
        const [bots, contactDisengagedBots, contactEnrolledBots] = await Promise.all([
          this.fetchBots(),
          this.fetchContactDisengagedBots(),
          this.fetchContactEnrolledBots()
        ])

        this.bots = bots
        this.bot_enrollments = contactEnrolledBots

        const disengagedBotIds = contactDisengagedBots?.reduce((acc, v) => {
          acc.push(v.aloai_bot_id)
          return acc
        }, [])

        for (const bot of this.bots) {
          this.bot_engagements[bot.id] = !disengagedBotIds.includes(bot.id)
        }

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
        const { data } = await talk2Api.V2.aloAiBot.getBots()
        return data?.data ?? []
      } catch (error) {
        console.error('[fetchBots] error', error)
        return []
      }
    },
    async fetchContactDisengagedBots () {
      try {
        const { data } = await talk2Api.V2.aloAiBot.getContactDisengagedBots(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactDisengagedBots] error', error)
        return []
      }
    },
    async fetchContactEnrolledBots () {
      try {
        const { data } = await talk2Api.V2.aloAiBot.getContactEnrolledBots(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactEnrolledBots] error', error)
        return []
      }
    }
  }
}
</script>

<style scoped>
.aloai-enrollment-control-bots-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
