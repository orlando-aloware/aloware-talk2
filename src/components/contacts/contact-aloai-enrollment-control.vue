<template>
  <b-card class="border-0 position-relative contact-about-wrapper" v-if="this.profile.company.aloai_enabled">
    <h4>AloAi Text Bot Enrollment</h4>

    <b-card-text class="fs-14 mt-2">
      Enroll this contact to any of your Sales Bots and let them do the work for you!
    </b-card-text>

    <b-card-text
      v-if="isEnrolledToABot"
      class="fs-14 mt-2"
    >
      Currently enrolled to:
      <br />
      <!-- Bot Use Case Label -->
      <q-badge
        :color="useCaseColor(firstEnrolledBot.use_case)"
        class="mr-1"
      >
        <span>{{ formatUseCase(firstEnrolledBot.use_case) }}</span>
      </q-badge>
      <b>{{ firstEnrolledBot.name }}</b>
      <br />
      <q-badge
        v-if="isEnrolledToMultipleBots"
        color="blue-6"
      >
        <span>+ {{ extraEnrolledBotsCount }} bot(s)</span>
      </q-badge>
    </b-card-text>

    <div id="engage-control-popover">
      <b-button
        variant="outline-primary"
        size="sm"
        class="btn-aloai-enrollment-control"
        block
        data-testid="aloai-enrollment-control-button"
        @click="openEnrollmententControlModal"
      >
        <aloai-icon height="10" width="10" />
        Enroll to Bot
      </b-button>
    </div>

    <aloai-enrollment-control-modal ref="aloaiEnrollmentControlModalRef" />
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import AloaiIcon from 'components/icons/aloai-icon'
import AloaiEnrollmentControlModal from 'components/aloai-enrollment-control-modal.vue'
import { mapGetters } from 'vuex'
import { aloaiMixin } from 'src/plugins/mixins'

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
      botEnrollments: []
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    isEnrolledToABot () {
      return this.botEnrollments.length > 0
    },
    isEnrolledToMultipleBots () {
      return this.botEnrollments.length > 1
    },
    extraEnrolledBotsCount () {
      return this.botEnrollments.length - 1
    },
    firstEnrolledBot () {
      if (!this.isEnrolledToABot) {
        return null
      }

      let bot = this.bots.find((bot) => bot.id === this.botEnrollments[0].aloai_bot_id)

      console.log('firstEnrolledBot', bot)

      // Get the first enrolled bot with the id coming from the enrollments
      return this.bots.find((bot) => bot.id === this.botEnrollments[0].aloai_bot_id)
    }
  },

  mounted () {
    this.fetchBots()
      .then((bots) => {
        this.bots = bots
      })

    this.fetchContactEnrolledBots()
      .then((botEnrollments) => {
        this.botEnrollments = botEnrollments
      })
  },

  methods: {
    openEnrollmententControlModal () {
      if (this.$refs.aloaiEnrollmentControlModalRef) {
        this.$refs.aloaiEnrollmentControlModalRef.isOpen = true
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
