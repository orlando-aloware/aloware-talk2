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
        AloAi Agent Enrollment
      </h1>
      <div class="text-center">
        <template v-if="contactsCount === 1">
          Select the agent you want to use to initiate a conversation with this contact.
        </template>
        <template v-else>
          Select the agent that you want to enroll your <strong>
            {{params?.selected_all ? contactsCount : `~${contactsCount}`}} contacts
          </strong>.
        </template>
      </div>

      <!-- AloAi Agent Type selector -->
      <div class="w-75 mx-auto mb-2 mt-2">
        <q-select
          v-model="selectedBotType"
          :options="botTypeOptions"
          dense
          outlined
          emit-value
          map-options
          options-dense
          class="bot-type-select"
          data-testid="bot-type-filter"
        />
      </div>

      <div class="w-75 my-2 mx-auto">
        <search placeholder="Search agent"
                data-testid="aloai-enrollment-control-modal-search"
                @search="onSearch"/>
      </div>

      <ul class="list-group list-group-flush scrollable-list mb-4">
        <li class="list-group-item p-3"
            :key="`enroll-bot-${key}`"
            v-for="(bot, key) in filteredOutboundBots">
          <div class="d-flex flex-column">
            <!-- Bot Header -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0 font-weight-bold">{{ bot.name }}</h5>
              <div>
                <!-- Show single enrollment badge if bot is enrolled -->
                <q-badge
                  v-if="isEnrolled(bot.id)"
                  :id="`enrolled-badge-${bot.id}`"
                  color="green-6"
                  class="mr-2"
                >
                  <span class="custom-badge-margin-text">
                    Enrolled
                  </span>
                </q-badge>
              </div>
            </div>

            <!-- Bot Description -->
            <p class="text-muted small mb-2" v-if="bot.description">
              {{ bot.description }}
            </p>

            <div class="d-flex justify-content-between align-items-center">
              <button
                class="btn btn-sm btn-primary"
                @click="confirmEnrollment($event, bot)"
                :disabled="busyBotId === bot.id"
              >
                {{ getEnrollButtonText(bot.id) }}
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div class="d-flex items-center justify-center">
        <button
          class="btn btn-sm btn-outline-dark"
          data-testid="aloai-enrollment-control-modal-close-button"
          @click="onHidden">
          Close
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapGetters } from 'vuex'
import Search from 'src/components/search.vue'
import * as AloAi from 'src/constants/aloai'
import aloaiMixin from 'src/plugins/mixins/aloai.mixin'
import { isEmpty } from 'lodash'

export default {
  name: 'aloai-enrollment-control-modal',

  components: { Search },

  mixins: [aloaiMixin],

  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    contactList: {
      type: Object,
      default: null
    },
    checkedCount: {
      type: Number,
      default: 0
    },
    totalContactsCount: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    contactsCount () {
      // For single contact enrollment
      if (this.contact?.id) {
        return 1
      }
      // For "select all" case, use total contacts count
      if (this.params?.selected_all) {
        return this.totalContactsCount
      }
      // For multiple selected contacts case
      if (this.params?.contact_ids?.length > 0) {
        return this.params.contact_ids.length
      }
      return 0
    },
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
    filteredOutboundBots () {
      let bots = this.bots.filter((bot) => bot.direction === AloAi.DIRECTION_OUTBOUND)

      // Filter by bot type
      if (this.selectedBotType !== 'all') {
        bots = bots.filter((bot) =>
          this.selectedBotType === 'voice' ? bot.type === AloAi.TYPE_VOICE : bot.type === AloAi.TYPE_TEXT
        )
      }

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
      busyBotId: null,
      isOpen: false,
      bots: [],
      bot_engagements: {},
      bot_enrollments: {},
      searchText: '',
      isLoading: true,
      selectedBotId: null,
      selectedBotType: 'all',
      botTypeOptions: [
        { label: 'All', value: 'all' },
        { label: 'Voice', value: 'voice' },
        { label: 'Text', value: 'text' }
      ],
      AloAi
    }
  },

  methods: {
    onSearch (searchText) {
      this.searchText = searchText
    },
    confirmEnrollment (event, bot) {
      event.preventDefault()
      // If the contact is already enrolled, confirm we want to re-enroll
      if (this.isEnrolled(bot.id)) {
        this.$bvModal.msgBoxConfirm('Re-enrolling this contact will count as a new enrollment and charged accordingly. Continue?', {
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
            this.submitEnrollment(bot)
          }
        }).catch(() => {
          // Do nothing
        })
      } else {
        this.submitEnrollment(bot)
      }
    },
    submitEnrollment (bot) {
      this.busyBotId = bot.id
      this.isBusy = true

      // Construct enrollment data based on contact type
      let enrollmentData = {
        prevent_duplicates: true,
        multiple_phone_numbers: false,
        allow_international_phone_numbers: false
      }

      // For single contact
      if (this.contact?.id) {
        enrollmentData.contact_ids = [this.contact.id]
      } else { // For multiple contacts
        // For select all case
        if (this.params?.selected_all) {
          enrollmentData.selected_all = true
          enrollmentData.contact_ids = []
          if (this.params.list_id) {
            enrollmentData.list_id = this.params.list_id
          }
        } else if (this.params?.contact_ids?.length > 0) { // For specific contacts case
          enrollmentData.contact_ids = this.params.contact_ids
          if (this.params.list_id) {
            enrollmentData.list_id = this.params.list_id
          }
        }
      }

      talk2Api.V2.aloAiBot
        .enrollContacts(bot.id, enrollmentData)
        .then(() => {
          if (this.contact) {
            this.bot_enrollments.push({
              aloai_bot_id: bot.id,
              enrollment_expired_at: new Date(Date.now() + (24 * 60 * 60 * 1000))
            })
          }

          this.$generalNotification(
            `We are enrolling your contact${this.contactsCount > 1 ? 's' : ''} into AloAi Agent: ${bot.name}.`
          )
          this.$emit('contactEnrolled')
        })
        .catch((error) => {
          let errorMsg = `Error while enrolling contact${this.contactsCount > 1 ? 's' : ''} to AloAi Agent: ${bot.name}.`
          if (error?.response.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[submitEnrollment] error', error)
        })
        .finally(() => {
          this.isBusy = false
          this.busyBotId = null
        })
    },
    onHidden () {
      this.isOpen = false
      setTimeout(() => {
        this.isBusy = true
        this.isLoading = true
        this.searchText = ''
        this.selectedBotId = null
        this.selectedBotType = 'all'
        this.busyBotId = null
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
          this.fetchContactBotEnrollments()
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
        this.$generalNotification('Error while fetching AloAi Agents.', 'error')
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
          enabled: true
        })
        return data?.data ?? []
      } catch (error) {
        console.error('[fetchBots] error', error)
        return []
      }
    },
    async fetchContactDisengagedBots () {
      try {
        // Only fetch disengaged bots if we have a single contact
        if (!this.contact?.id) {
          return []
        }

        const { data } = await talk2Api.V2.aloAiBot.getContactDisengagedBots(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactDisengagedBots] error', error)
        return []
      }
    },
    async fetchContactBotEnrollments () {
      try {
        // Only fetch enrollments if we have a single contact
        if (!this.contact?.id) {
          return []
        }

        const { data } = await talk2Api.V2.aloAiBot.getContactBotEnrollments(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactBotEnrollments] error', error)
        return []
      }
    },
    getEnrollButtonText (botId) {
      if (this.busyBotId === botId) {
        return 'Enrolling...'
      }
      if (this.isEnrolled(botId)) {
        return 'Re-enroll'
      }
      return 'Enroll'
    },
    getBotEnrollments (botId) {
      return this.bot_enrollments.filter(
        enrollment => enrollment.aloai_bot_id === botId
      )
    }
  }
}
</script>

<style scoped>
.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
}
.custom-badge-margin-text {
  margin-top: 1px;
}
</style>
