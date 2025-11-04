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
      v-if="isAloAiEnabled()"
      class="border-0 position-relative contact-about-wrapper"
    >
      <h4>AloAi Agent Enrollments</h4>

      <b-card-text class="fs-14 mt-2">
        <span v-if="hasBotEnrollments">Currently enrolled to:</span>
        <span v-else>Enroll this contact to any of your Outbound Agents and let them do the work for you!</span>
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

          <!-- Agent name -->
          <h5 class="mt-0">{{ displayedAgent?.name }}</h5>

          <!-- Agent Type Badge -->
          <p class="mb-0 text-muted fs-13 mt-1">
            <!-- Direction Badge -->
            <q-badge
              :color="directionColor(displayedAgent?.direction)"
              class="mr-1"
            >
              <span>{{ formatDirection(displayedAgent?.direction) }}</span>
            </q-badge>

            <!-- Type Badge -->
            <q-badge
              color="black"
              class="mr-1"
            >
              <span>{{ getAgentTypeLabel(displayedAgent?.type) }}</span>
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
            @click="refreshBots(true)"
          >
            <i class="fa fa-sync-alt"/>
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Refresh agents information
            </q-tooltip>
          </b-button>
          <!-- Previous agent arrow button -->
          <b-button
            v-if="isEnrolledToMultipleAgents"
            @click="prevAgent"
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
              Previous Agent
            </q-tooltip>
          </b-button>
          <!-- Current agent vs agents count -->
          <span
            v-if="isEnrolledToMultipleAgents"
            class="fs-14 mx-2 no-select"
          >
            {{ activeBotIndex + 1 }}/{{ botEnrollments.length }}
          </span>
          <!-- Next agent arrow button -->
          <b-button
            v-if="isEnrolledToMultipleAgents"
            @click="nextAgent"
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
              Next Agent
            </q-tooltip>
          </b-button>
          <!-- Re-enroll agent button -->
          <b-button
            v-if="displayedAgent?.direction === AloAi.DIRECTION_OUTBOUND"
            @click="openReEnrollmentConfirmation"
            href="#"
            variant="outline-success"
            size="sm"
            :class="isEnrolledToMultipleAgents ? 'mt-3 btn-with-icon-spacing' : 'mr-1 btn-with-icon-spacing'"
            :block="isEnrolledToMultipleAgents"
            data-testid="re-enroll-contact-button"
            :disabled="isReadOnly || busyReEnrollBotId === displayedAgent?.id"
          >
            <i class="fa fa-redo"/> <span v-if="busyReEnrollBotId === displayedAgent?.id">Re-enrolling...</span><span v-else>Re-enroll</span>
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Re-enroll contact to this agent
            </q-tooltip>
          </b-button>
          <!-- Disenroll agent button -->
          <b-button
            @click="openDisenrollmentConfirmation"
            href="#"
            variant="outline-danger"
            size="sm"
            :class="isEnrolledToMultipleAgents ? 'mt-2 btn-with-icon-spacing' : 'btn-with-icon-spacing'"
            :block="isEnrolledToMultipleAgents"
            data-testid="disenroll-contact-button"
            :disabled="isReadOnly"
          >
            <i class="fa fa-trash"/> Disenroll
            <q-tooltip
              anchor="top middle"
              self="center middle"
            >
              Remove contact from this agent
            </q-tooltip>
          </b-button>
        </div>
      </b-card-text>

      <div id="enroll-control-popover">
        <!-- Enroll agent button -->
        <b-button
          @click="openEnrollmentControlModal"
          class="btn-aloai-enrollment-control"
          size="sm"
          block
          variant="outline-primary"
          data-testid="aloai-enrollment-control-button"
          :disabled="isReadOnly"
        >
          <aloai-icon
            class="mr-1"
            height="22"
            width="22"
          />
          <span v-if="!hasBotEnrollments">Enroll to agent</span>
          <span v-else>Enroll to more agents</span>
        </b-button>
      </div>

      <aloai-enrollment-control-modal
        ref="aloaiEnrollmentControlModalRef"
        @contactEnrolled="onContactEnrolled"
      />
    </b-card>

    <confirm-dialog
      id="contact-disenroll-from-bot"
      title="Disenroll Contact from AloAi Agent"
      @close="closeDisenrollmentConfirmation"
    >
      <div slot="content">
        <p v-html="confirmDeletionMessage"/>
      </div>
      <div slot="footer">
        <div class="d-flex w-100">
          <div class="flex-grow-1"/>
          <button class="btn btn-sm btn-outline-dark mr-2"
                  :disabled="isBusy"
                  @click="closeDisenrollmentConfirmation">
            Cancel
          </button>
          <button class="btn btn-sm btn-danger"
                  :disabled="isBusy"
                  @click="disenrollContact">
            <span v-if="isBusy">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            Yes, I'm sure
          </button>
        </div>
      </div>
    </confirm-dialog>

    <confirm-dialog
      id="contact-re-enroll-to-bot"
      title="Re-enroll Contact to AloAi Agent"
      @close="closeReEnrollmentConfirmation"
    >
      <div slot="content">
        <p v-html="confirmReEnrollmentMessage"/>
      </div>
      <div slot="footer">
        <div class="d-flex w-100">
          <div class="flex-grow-1"/>
          <button class="btn btn-sm btn-outline-dark mr-2"
                  :disabled="isBusy"
                  @click="closeReEnrollmentConfirmation">
            Cancel
          </button>
          <button class="btn btn-sm btn-warning"
                  :disabled="isBusy"
                  @click="reEnrollContact">
            <span v-if="isBusy">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            Yes, I'm sure
          </button>
        </div>
      </div>
    </confirm-dialog>
  </b-overlay>
</template>

<script>
import AloaiEnrollmentControlModal from 'components/aloai-enrollment-control-modal.vue'
import ConfirmDialog from 'components/confirm-dialog.vue'
import AloaiIcon from 'components/icons/aloai-icon'
import _ from 'lodash'
import * as AloAi from 'src/constants/aloai'
import talk2Api from 'src/plugins/api/api'
import { aloaiMixin } from 'src/plugins/mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'contact-aloai-enrollment-control',

  components: { AloaiEnrollmentControlModal, AloaiIcon, ConfirmDialog },

  mixins: [aloaiMixin],

  props: {
    contact: {
      type: Object,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      botEnrollments: [],
      activeBotIndex: 0,
      isBusy: false,
      busyReEnrollBotId: null,
      AloAi
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    hasBotEnrollments () {
      return !_.isEmpty(this.botEnrollments)
    },
    isEnrolledToMultipleAgents () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return false
      }

      return this.botEnrollments.length > 1
    },
    extraEnrolledAgentsCount () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return 0
      }

      return this.botEnrollments.length - 1
    },
    displayedAgent () {
      // Sanity check
      if (!this.hasBotEnrollments) {
        return null
      }

      const currentEnrollment = this.botEnrollments[this.activeBotIndex]
      if (!currentEnrollment) {
        return null
      }

      return currentEnrollment.bot
    },
    confirmDeletionMessage () {
      let name = this.contact.first_name || 'No Name'

      // Add safety check for empty enrollments
      if (!this.hasBotEnrollments || !this.displayedAgent) {
        return `Are you sure you want to remove <b>${name}</b> from this agent?`
      }

      return `Are you sure you want to disenroll <b>${name}</b> from <b>${this.displayedAgent?.name}</b>?`
    },
    confirmReEnrollmentMessage () {
      let name = this.contact.first_name || 'No Name'

      // Add safety check for empty enrollments
      if (!this.hasBotEnrollments || !this.displayedAgent) {
        return `Are you sure you want to re-enroll <b>${name}</b> to this agent?`
      }

      return `Are you sure you want to re-enroll <b>${name}</b> to <b>${this.displayedAgent?.name}</b>?`
    }
  },

  mounted () {
    this.refreshBots(false)
  },

  methods: {
    onContactEnrolled () {
      // Make it busy, refreshing the agents will turn it off
      this.isBusy = true
      // Give our queue some time to process the enrollment
      setTimeout(() => {
        this.refreshBots(true)
        // Select the newly enrolled agent
        this.activeBotIndex = 0
      }, 2000)
    },
    refreshBots (force = false) {
      this.isBusy = true
      const previousActiveBotIndex = this.activeBotIndex

      this.fetchContactBotEnrollments()
        .then((botEnrollments) => {
          this.botEnrollments = botEnrollments

          // Determine the new activeBotIndex based on:
          if (previousActiveBotIndex === 0) {
            this.activeBotIndex = 0 // First agent, keep it as 0
          } else if (previousActiveBotIndex >= botEnrollments.length) {
            this.activeBotIndex = botEnrollments.length - 1 // Last agent, move to the previous valid index
          } else {
            this.activeBotIndex = previousActiveBotIndex // Middle, keep the previous index
          }

          this.isBusy = false
        })
    },
    prevAgent () {
      if (!this.hasBotEnrollments) {
        return
      }

      if (this.activeBotIndex > 0) {
        this.activeBotIndex--
      } else {
        this.activeBotIndex = this.botEnrollments.length - 1
      }
    },
    nextAgent () {
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
      this.$bvModal.show('contact-disenroll-from-bot')
    },
    closeDisenrollmentConfirmation () {
      this.$bvModal.hide('contact-disenroll-from-bot')
    },
    openReEnrollmentConfirmation () {
      this.$bvModal.show('contact-re-enroll-to-bot')
    },
    closeReEnrollmentConfirmation () {
      this.$bvModal.hide('contact-re-enroll-to-bot')
    },
    getEnrollmentTypeText (botId, type = null) {
      // Add safety check for null/undefined type
      if (!type) {
        return ''
      }

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

      // Add safety check for empty enrollments
      if (!this.bot_enrollments) {
        return ''
      }

      const enrollment = this.bot_enrollments.find(
        enrollment => enrollment.aloai_bot_id === botId
      )
      return this.getEnrollmentTypeText(botId, enrollment?.type)
    },
    disenrollContact () {
      // Add safety check for empty enrollments
      if (!this.hasBotEnrollments || !this.displayedAgent) {
        this.closeDisenrollmentConfirmation()
        return
      }

      const currentEnrollment = this.botEnrollments[this.activeBotIndex]
      if (!currentEnrollment) {
        this.closeDisenrollmentConfirmation()
        return
      }

      talk2Api.V2.aloAiBot
        .disenrollContact(this.displayedAgent.id, {
          contact_id: this.contact.id,
          type: currentEnrollment.type
        })
        .then(() => {
          this.$generalNotification(
            `Contact successfully disenrolled from AloAi Agent: ${this.displayedAgent.name}.`
          )

          this.closeDisenrollmentConfirmation()

          // Make it busy, refreshing the agents will turn it off
          this.isBusy = true
          // Give our api some time to process the disenrollment
          setTimeout(() => {
            this.refreshBots(true)
          }, 2000)
        })
        .catch((error) => {
          let errorMsg = `Error while disenrolling contact from AloAi Agent: ${this.displayedAgent.name}.`
          if (error?.response?.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[disenrollContact] error', error)
        })
    },
    reEnrollContact () {
      // Add safety check for empty enrollments
      if (!this.hasBotEnrollments || !this.displayedAgent) {
        this.closeReEnrollmentConfirmation()
        return
      }

      const currentEnrollment = this.botEnrollments[this.activeBotIndex]
      if (!currentEnrollment) {
        this.closeReEnrollmentConfirmation()
        return
      }

      this.busyReEnrollBotId = this.displayedAgent.id
      this.isBusy = true

      // Construct enrollment data
      const enrollmentData = {
        contact_ids: [this.contact.id],
        prevent_duplicates: true,
        multiple_phone_numbers: false,
        allow_international_phone_numbers: false
      }

      talk2Api.V2.aloAiBot
        .enrollContacts(this.displayedAgent.id, enrollmentData)
        .then(() => {
          this.$generalNotification(
            `Contact successfully re-enrolled to AloAi Agent: ${this.displayedAgent.name}.`
          )

          this.closeReEnrollmentConfirmation()
          this.busyReEnrollBotId = null

          // Make it busy, refreshing the agents will turn it off
          this.isBusy = true
          // Give our api some time to process the re-enrollment
          setTimeout(() => {
            this.refreshBots(true)
          }, 2000)
        })
        .catch((error) => {
          let errorMsg = `Error while re-enrolling contact to AloAi Agent: ${this.displayedAgent.name}.`
          if (error?.response?.data?.message) {
            errorMsg = error.response.data.message
          }

          this.$generalNotification(errorMsg, 'error')
          console.error('[reEnrollContact] error', error)
          this.busyReEnrollBotId = null
          this.isBusy = false
        })
    },
    async fetchContactBotEnrollments () {
      try {
        const { data } = await talk2Api.V2.aloAiBot.getContactBotEnrollments(
          this.contact.id
        )
        // Handle both wrapped and unwrapped responses
        return Array.isArray(data) ? data : (data?.data ?? [])
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

.btn-with-icon-spacing {
  i {
    margin-right: 4px;
  }
}
</style>
