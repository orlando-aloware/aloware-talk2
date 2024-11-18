<template>
  <b-overlay
    :show="isBusy"
    rounded="sm"
    data-testid="contact-bot-overlay"
    variant="white"
  >
  <b-card class="border-0 position-relative contact-about-wrapper" v-if="profile?.company?.aloai_enabled">
    <h4>AloAi Text Bot Enrollment</h4>

    <b-card-text
      v-if="!isEnrolledToABot"
      class="fs-14 mt-2"
    >
      Enroll this contact to any of your Sales Bots and let them do the work for you!
    </b-card-text>

    <b-card-text
      v-else
      class="fs-14 mt-2"
    >
      Currently enrolled to:
    </b-card-text>

    <b-card-text
      v-if="isEnrolledToABot"
      class="fs-14 mt-2"
    >
      <b-media data-testid="contact-sequence-media">
        <template #aside>
          <aloai-icon
            class="mr-1"
            height="42"
            width="42"
          />
        </template>

        <h5 class="mt-0">{{ displayedBot?.name }}</h5>
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
        <b-button href="#"
                  variant="outline-primary"
                  size="sm"
                  class="mr-1"
                  data-testid="refresh-sequence-info-button"
                  @click="refreshBots">
          <i class="fa fa-sync-alt"></i>
          <q-tooltip anchor="top middle"
                      self="center middle">
            Refresh bots information
          </q-tooltip>
        </b-button>
        <!-- Arrows for Pagination -->
        <b-button v-if="isEnrolledToMultipleBots" href="#"
                  variant="outline-secondary"
                  size="sm"
                  class="mr-1"
                  data-testid="refresh-sequence-info-button"
                  @click="prevBot">
          <i class="fa fa-angle-left"></i>
          <q-tooltip anchor="top middle"
                      self="center middle">
            Previous Bot
          </q-tooltip>
        </b-button>
        <span v-if="isEnrolledToMultipleBots" class="fs-14 mx-2 no-select">{{ activeBotIndex + 1 }}/{{ botEnrollments.length }}</span>
        <b-button v-if="isEnrolledToMultipleBots" @click="nextBot" href="#"
                  variant="outline-secondary"
                  size="sm"
                  class="ml-1 mr-1"
                  data-testid="refresh-sequence-info-button">
          <i class="fa fa-angle-right"></i>
          <q-tooltip anchor="top middle"
                      self="center middle">
            Next Bot
          </q-tooltip>
        </b-button>
        <b-button href="#"
                  variant="outline-danger"
                  size="sm"
                  data-testid="disenroll-contact-button"
                  v-if="!isEnrolledToMultipleBots"
                  @click="openDisenrollmentConfirmation">
          <i class="fa fa-trash"></i> Disenroll from Bot
        </b-button>
      </div>

      <b-button
        class="mt-3"
        variant="outline-danger"
        size="sm"
        block
        data-testid="disenroll-contact-button"
        v-if="isEnrolledToMultipleBots"
        @click="openDisenrollmentConfirmation"
      >
        <i class="fa fa-trash"></i> Disenroll from Bot
      </b-button>
    </b-card-text>
    <b-card-text
      v-else
      class="fs-14 mt-2"
    >
      This contact is currently not enrolled to a Bot.
    </b-card-text>

    <div id="engage-control-popover">
      <b-button
        variant="outline-primary"
        size="sm"
        class="btn-aloai-enrollment-control"
        block
        data-testid="aloai-enrollment-control-button"
        @click="openEnrollmentControlModal"
      >
        <aloai-icon
          class="mr-1"
          height="22"
          width="22"
        />
        <span v-if="!isEnrolledToABot">Enroll to Bot</span>
        <span v-else>Enroll to another Bot</span>
      </b-button>
    </div>

    <aloai-enrollment-control-modal
      ref="aloaiEnrollmentControlModalRef"
      @contactEnrolled="refreshBots"
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
    isEnrolledToABot () {
      if (_.isEmpty(this.botEnrollments)) {
        return false
      }

      return this.botEnrollments.length > 0
    },
    isEnrolledToMultipleBots () {
      if (_.isEmpty(this.botEnrollments)) {
        return false
      }

      return this.botEnrollments.length > 1
    },
    extraEnrolledBotsCount () {
      if (_.isEmpty(this.botEnrollments)) {
        return 0
      }

      return this.botEnrollments.length - 1
    },
    displayedBot () {
      if (_.isEmpty(this.botEnrollments)) {
        return null
      }

      return this.bots[this.activeBotIndex]
    }
  },

  mounted () {
    this.refreshBots()
  },

  methods: {
    refreshBots () {
      this.isBusy = true
      this.fetchBots()
        .then((bots) => {
          this.bots = bots
          this.fetchContactBotEnrollments()
            .then((botEnrollments) => {
              this.botEnrollments = botEnrollments
              this.isBusy = false
            })
        })
    },
    prevBot () {
      if (_.isEmpty(this.botEnrollments)) {
        return
      }

      if (this.activeBotIndex > 0) {
        this.activeBotIndex--
      } else {
        this.activeBotIndex = this.botEnrollments.length - 1
      }
    },
    nextBot () {
      if (_.isEmpty(this.botEnrollments)) {
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
      }).catch(() => {
        // Do nothing
      })
    },
    disenrollContact () {
      this.isBusy = true
      talk2Api.V2.aloAiBot
        .disenrollContact(this.displayedBot.id, { contact_ids: [this.contact.id] })
        .then(() => {
          this.$generalNotification(
            'Contact successfully disenrolled from the selected AloAi Text Bot.'
          )
          this.onHidden()
        })
        .catch((error) => {
          let errorMsg = 'Error while enrolling contact to AloAi Text Bot.'
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
