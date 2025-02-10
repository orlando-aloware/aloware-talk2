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
        AloAi Bot Enrollment
      </h1>
      <div class="text-center">
        Select the bot and channel you want to use to initiate a conversation with this contact.
      </div>
      <div class="w-75 my-2 mx-auto">
        <search placeholder="Search bot"
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
                <!-- Show all enrollments for this bot -->
                <template v-for="enrollment in getBotEnrollments(bot.id)">
                  <q-badge
                    :key="`enrolled-badge-${bot.id}-${enrollment.type}`"
                    :id="`enrolled-badge-${bot.id}-${enrollment.type}`"
                    color="green-6"
                    class="mr-2"
                  >
                    <span class="custom-badge-margin-text">
                      Enrolled ({{ getEnrollmentTypeText(bot.id, enrollment.type) }})
                    </span>
                  </q-badge>
                </template>
              </div>
            </div>

            <!-- Bot Description -->
            <p class="text-muted small mb-2" v-if="bot.description">
              {{ bot.description }}
            </p>

            <!-- Channel Selection and Enrollment -->
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <label class="mr-2 mb-0">Channel:</label>
                <b-form-radio-group
                  v-model="botChannels[bot.id]"
                  buttons
                  button-variant="outline-primary"
                  size="sm"
                >
                  <!-- SMS Channel -->
                  <b-form-radio
                    v-if="canUseSMS(bot)"
                    :value="'sms'"
                  >
                    SMS
                  </b-form-radio>

                  <!-- Call Channel -->
                  <b-form-radio
                    v-if="canUseCall(bot)"
                    :value="'call'"
                  >
                    Call
                  </b-form-radio>
                </b-form-radio-group>
              </div>

              <button
                class="btn btn-sm btn-primary"
                @click="confirmEnrollment($event, bot)"
                :disabled="!botChannels[bot.id] || busyBotId === bot.id"
              >
                {{ getEnrollButtonText(bot.id) }}
                <q-tooltip v-if="!botChannels[bot.id]">
                  Please select a channel to enroll this contact
                </q-tooltip>
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div class="d-flex items-center justify-center">
        <button class="btn btn-sm btn-outline-dark"
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
    filteredOutboundBots () {
      let bots = this.bots.filter((bot) => bot.direction === AloAi.DIRECTION_OUTBOUND)
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
      AloAi,
      botChannels: {}
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
      const channel = this.botChannels[bot.id]
      if (!channel) {
        this.$generalNotification(
          'Please select a channel for enrollment.',
          'error'
        )
        return
      }

      this.busyBotId = bot.id
      this.isBusy = true

      talk2Api.V2.aloAiBot
        .enrollContacts(bot.id, {
          contact_ids: [this.contact.id],
          channel: channel
        })
        .then(() => {
          this.bot_enrollments.push({
            aloai_bot_id: bot.id,
            enrollment_expired_at: new Date(Date.now() + (24 * 60 * 60 * 1000)),
            type: channel === 'sms' ? AloAi.ENROLLMENT_TYPE_TEXT : AloAi.ENROLLMENT_TYPE_VOICE
          })

          this.$generalNotification(
            `Contact successfully enrolled to ${bot.name} via ${channel.toUpperCase()}.`
          )
          this.$emit('contactEnrolled')
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
        this.botChannels = {}
        this.busyBotId = null
      }, 300)
    },
    onShown () {
      this.load().then(() => {
        // Auto-select channels after bots are loaded
        this.bots.forEach(bot => {
          this.autoSelectChannel(bot)
        })
      })
    },
    isEnrolled (botId) {
      return this.bot_enrollments.some((enrollment) => enrollment.aloai_bot_id === botId)
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
        const { data } = await talk2Api.V2.aloAiBot.getContactBotEnrollments(
          this.contact.id
        )
        return data
      } catch (error) {
        console.error('[fetchContactBotEnrollments] error', error)
        return []
      }
    },
    canUseSMS (bot) {
      return [AloAi.TYPE_TEXT, AloAi.TYPE_AGENT].includes(bot.type)
    },
    canUseCall (bot) {
      return [AloAi.TYPE_VOICE, AloAi.TYPE_AGENT].includes(bot.type)
    },
    getChannelTooltip (bot, channel) {
      if (channel === 'sms' && !this.canUseSMS(bot)) {
        return 'This bot does not support SMS communications'
      }

      if (channel === 'call' && !this.canUseCall(bot)) {
        return 'This bot does not support voice calls'
      }

      return '' // Return empty string for enabled channels
    },
    getAvailableChannels (bot) {
      return [
        {
          text: 'SMS',
          value: 'sms',
          disabled: !this.canUseSMS(bot)
        },
        {
          text: 'Call',
          value: 'call',
          disabled: !this.canUseCall(bot)
        }
      ]
    },
    formatDirection (direction) {
      return direction === AloAi.DIRECTION_OUTBOUND ? 'Outbound' : 'Inbound'
    },
    getBotTypeLabel (type) {
      switch (type) {
        case AloAi.TYPE_TEXT:
          return 'Text Bot'
        case AloAi.TYPE_VOICE:
          return 'Voice Bot'
        case AloAi.TYPE_AGENT:
          return 'Agent Bot'
        default:
          return 'Unknown'
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
    getEnrollmentType (botId) {
      const enrollment = this.bot_enrollments.find(
        enrollment => enrollment.aloai_bot_id === botId
      )
      return enrollment?.type || null
    },
    getEnrollmentTypeText (botId, type = null) {
      if (type !== null) {
        switch (type) {
          case AloAi.ENROLLMENT_TYPE_TEXT:
            return 'SMS'
          case AloAi.ENROLLMENT_TYPE_VOICE:
            return 'Call'
          default:
            return ''
        }
      }

      const enrollment = this.bot_enrollments.find(
        enrollment => enrollment.aloai_bot_id === botId
      )
      return this.getEnrollmentTypeText(botId, enrollment?.type)
    },
    getEnrollmentTypeIcon (botId) {
      const type = this.getEnrollmentType(botId)
      switch (type) {
        case AloAi.ENROLLMENT_TYPE_TEXT:
          return 'chat' // or 'message' for SMS icon
        case AloAi.ENROLLMENT_TYPE_VOICE:
          return 'phone' // or 'call' for phone icon
        default:
          return 'check' // fallback icon
      }
    },
    getBotEnrollments (botId) {
      return this.bot_enrollments.filter(
        enrollment => enrollment.aloai_bot_id === botId
      )
    },
    autoSelectChannel (bot) {
      const canSMS = this.canUseSMS(bot)
      const canCall = this.canUseCall(bot)

      // If only one channel is available, auto-select it
      if (canSMS && !canCall) {
        this.$set(this.botChannels, bot.id, 'sms')
      } else if (!canSMS && canCall) {
        this.$set(this.botChannels, bot.id, 'call')
      }
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

/* Style for disabled radio buttons */
.btn-group-toggle .btn:disabled {
  background-color: #e9ecef;
  border-color: #e9ecef;
  color: #6c757d;
  opacity: 1;
  cursor: not-allowed;
}

.btn-group-toggle .btn:disabled:hover {
  background-color: #e9ecef;
  border-color: #e9ecef;
}
</style>
