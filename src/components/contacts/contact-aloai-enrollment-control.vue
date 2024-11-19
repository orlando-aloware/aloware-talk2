<template>
  <b-overlay
    :show="isBusy"
    rounded="sm"
    data-testid="contact-bot-enrollment-overlay"
    variant="white"
  >
    <template #overlay>
      <q-spinner-bars
        color="primary"
        size="40px"
      />
    </template>

    <b-card
      v-if="profile?.company?.aloai_enabled"
      class="border-0 position-relative contact-about-wrapper"
    >
      <h4>AloAi Text Bot Enrollment</h4>

      <b-card-text class="fs-14 mt-2">
        <span v-if="hasBotEnrollments">Currently enrolled to:</span>
        <span v-else>Enroll this contact to any of your Sales Bots and let them do the work for you!</span>
      </b-card-text>

      <b-card-text
        v-if="hasBotEnrollments"
        class="fs-14 mt-2"
      >
        <b-media data-testid="contact-bot-enrollment-media">
          <!-- Bot Icon -->
          <template #aside>
            <aloai-icon
              class="mr-1"
              height="42"
              width="42"
            />
          </template>

          <!-- Bot name -->
          <h5 class="mt-0">{{ displayedBot?.name }}</h5>

          <!-- Bot Use Case Badge -->
          <p class="mb-0 text-muted fs-13 mt-1">
            <q-badge
              :color="useCaseColor(displayedBot?.use_case)"
              class="mr-1"
            >
              <span>{{ formatUseCase(displayedBot?.use_case) }}</span>
            </q-badge>
          </p>
        </b-media>

        <div class="mt-3">
          <b-button
            href="#"
            variant="outline-primary"
            size="sm"
            class="mr-1"
            data-testid="refresh-sequence-info-button"
            @click="refreshBots"
          >
            <i class="fa fa-sync-alt"/>
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Refresh bots information
            </q-tooltip>
          </b-button>
          <!-- Previous bot arrow button -->
          <b-button
            v-if="isEnrolledToMultipleBots"
            @click="prevBot"
            href="#"
            variant="outline-secondary"
            size="sm"
            class="mr-1"
            data-testid="previous-bot-button"
          >
            <i class="fa fa-angle-left"/>
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Previous Bot
            </q-tooltip>
          </b-button>
          <!-- Current bot vs bots count -->
          <span
            v-if="isEnrolledToMultipleBots"
            class="fs-14 mx-2 no-select"
          >
            {{ activeBotIndex + 1 }}/{{ botEnrollments.length }}
          </span>
          <!-- Next bot arrow button -->
          <b-button
            v-if="isEnrolledToMultipleBots"
            @click="nextBot"
            href="#"
            variant="outline-secondary"
            size="sm"
            class="ml-1 mr-1"
            data-testid="ntext-bot-button">
            <i class="fa fa-angle-right"/>
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Next Bot
            </q-tooltip>
          </b-button>
          <!-- Disenroll bot button when only 1 bot -->
          <b-button
            v-if="!isEnrolledToMultipleBots"
            @click="openDisenrollmentConfirmation"
            href="#"
            variant="outline-danger"
            size="sm"
            data-testid="disenroll-single-bot-contact-button"
          >
            <i class="fa fa-trash"/> Disenroll from Bot
          </b-button>
        </div>

        <!-- Disenroll bot button when multiple bots -->
        <b-button
          v-if="isEnrolledToMultipleBots"
          @click="openDisenrollmentConfirmation"
          class="mt-3"
          variant="outline-danger"
          size="sm"
          block
          data-testid="disenroll-contact-button"
        >
          <i class="fa fa-trash"/> Disenroll from Bot
        </b-button>
      </b-card-text>

      <div id="enroll-control-popover">
        <!-- Enroll bot button -->
        <b-button
          @click="openEnrollmentControlModal"
          class="btn-aloai-enrollment-control"
          size="sm"
          block
          variant="outline-primary"
          data-testid="aloai-enrollment-control-button"
        >
          <aloai-icon
            class="mr-1"
            height="22"
            width="22"
          />
          <span v-if="!hasBotEnrollments">Enroll to Bot</span>
          <span v-else>Enroll to more Bots</span>
        </b-button>
      </div>

      <aloai-enrollment-control-modal
        ref="aloaiEnrollmentControlModalRef"
        @contactEnrolled="onContactEnrolled"
      />
    </b-card>
  </b-overlay>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import AloaiIcon from 'components/icons/aloai-icon'
import AloaiEnrollmentControlModal from 'components/aloai-enrollment-control-modal.vue'
import { mapGetters } from 'vuex'
import { aloaiMixin } from 'src/plugins/mixins'
import _ from 'lodash'

export default {
  name: 'contact-aloai-enrollment-control',

  components: { AloaiEnrollmentControlModal, AloaiIcon },

  mixins: [aloaiMixin],

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      bots: [],
      botEnrollments: [],
      activeBotIndex: 0,
      isBusy: false
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    hasBotEnrollments () {
      return !_.isEmpty(this.botEnrollments)
    },
    isEnrolledToMultipleBots () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return false
      }

      return this.botEnrollments.length > 1
    },
    extraEnrolledBotsCount () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return 0
      }

      return this.botEnrollments.length - 1
    },
    displayedBot () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return null
      }

      // Filter bots using the botEnrollments aloai_bot_id
      let enrolledBots = this.bots.filter((bot) => bot.id === this.botEnrollments.find(enrollment => enrollment.aloai_bot_id === bot.id)?.aloai_bot_id)

      // Sanity check
      if (_.isEmpty(enrolledBots)) {
        console.warn('No bot found for the current enrollment')
        return null
      }

      return enrolledBots[this.activeBotIndex]
    }
  },

  mounted () {
    this.refreshBots()
  },

  methods: {
    onContactEnrolled () {
      // Make it busy, refreshing the bots will turn it off
      this.isBusy = true
      // Give our queue some time to process the enrollment
      setTimeout(() => {
        this.refreshBots()
        // Select the newly enrolled bot
        this.activeBotIndex = 0
      }, 2000)
    },
    refreshBots () {
      this.isBusy = true
      const previousActiveBotIndex = this.activeBotIndex

      this.fetchBots()
        .then((bots) => {
          this.bots = bots
          this.fetchContactBotEnrollments()
            .then((botEnrollments) => {
              this.botEnrollments = botEnrollments

              // Determine the new activeBotIndex based on:
              if (previousActiveBotIndex === 0) {
                this.activeBotIndex = 0 // First bot, keep it as 0
              } else if (previousActiveBotIndex >= botEnrollments.length) {
                this.activeBotIndex = botEnrollments.length - 1 // Last bot, move to the previous valid index
              } else {
                this.activeBotIndex = previousActiveBotIndex // Middle, keep the previous index
              }

              this.isBusy = false
            })
        })
    },
    prevBot () {
      if (!this.hasBotEnrollments) {
        return
      }

      if (this.activeBotIndex > 0) {
        this.activeBotIndex--
      } else {
        this.activeBotIndex = this.botEnrollments.length - 1
      }
    },
    nextBot () {
      if (!this.hasBotEnrollments) {
        return
      }

      if (this.activeBotIndex < this.botEnrollments.length - 1) {
        this.activeBotIndex++
      } else {
        this.activeBotIndex = 0
      }
    },
    openEnrollmentControlModal () {
      if (this.$refs.aloaiEnrollmentControlModalRef) {
        this.$refs.aloaiEnrollmentControlModalRef.isOpen = true
      }
    },
    openDisenrollmentConfirmation () {
      this.$bvModal.msgBoxConfirm(`Disenrolling this contact from #${this.displayedBot.id} ${this.displayedBot.name} Bot will . Continue?`, {
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
          this.disenrollContact()
        }
      })
    },
    disenrollContact () {
      talk2Api.V2.aloAiBot
        .disenrollContact(this.displayedBot.id, { contact_id: this.contact.id })
        .then(() => {
          this.$generalNotification(
            'Contact successfully disenrolled from the selected AloAi Text Bot.'
          )

          // Make it busy, refreshing the bots will turn it off
          this.isBusy = true
          // Give our api some time to process the disenrollment
          setTimeout(() => {
            this.refreshBots()
          }, 2000)
        })
        .catch((error) => {
          let errorMsg = 'Error while disenrolled contact to AloAi Text Bot.'
          if (error?.response?.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[submitEnrollment] error', error)
        })
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
    }
  }
}
</script>

<style lang="scss">
.btn-aloai-enrollment-control {
  &:hover {
    svg {
      path {
        fill: #FFFFFF;
      }
    }
  }

  svg {
    margin-top: -4px;

    path {
      fill: #1976d3;
    }
  }
}
</style>
