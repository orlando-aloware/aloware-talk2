<template>
  <b-overlay :show="isBusy"
             v-if="profile.company.alohabot_enabled"
             rounded="sm"
             variant="white">

    <b-card class="border-0 position-relative contact-about-wrapper">
      <h4>AlohaBot</h4>
      <div v-if="is_disengaged">
        <b-card-text class="fs-14 mt-3">
          <span>This contact has disengaged with the bots</span>
        </b-card-text>
        <b-button variant="outline-primary"
                  size="sm"
                  class="btn-contact-sequence-enrol"
                  block
                  @click="disengageContact(false)">
          <i class="fa fa-unlock-alt"></i>
          Engage
        </b-button>
      </div>

      <div v-else>
        <b-card-text class="fs-14 mt-2">
          This contact has not disengaged with the bots.
        </b-card-text>

        <b-button variant="outline-danger"
                  size="sm"
                  class="btn-contact-sequence-enrol"
                  block
                  @click="disengageContact(true)">
          <i class="fa fa-user-lock"></i>
          Disengage
        </b-button>
      </div>
    </b-card>
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

<script>
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'contact-aloha-bot',

  data () {
    return {
      is_disengaged: false,
      session: null,
      isBusy: false
    }
  },

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('auth', ['profile'])
  },

  methods: {
    getContactSessionInfo () {
      if (!this.contact.id || !this.profile.company.alohabot_enabled) {
        return
      }
      this.isBusy = true
      return talk2Api.V1.alohabot.getContactSession(this.contact.id).then(response => {
        this.is_disengaged = response.data.is_disengaged
        this.session = response.data
        this.isBusy = false
      }).catch(() => {
        this.isBusy = false
      })
    },
    disengageContact (shouldDisengage = false) {
      let message = 'Do you want to engage this contact with all the bots?'
      if (shouldDisengage) {
        message = 'Do you want to disengage this contact from all the bots?'
      }
      this.$bvModal.msgBoxConfirm(message, {
        okTitle: 'Yes',
        cancelTitle: 'No'
      }).then(value => {
        if (value) {
          this.isBusy = true
          talk2Api.V1.alohabot.disengageContact(
            this.contact.id, { disengage: shouldDisengage }
          ).then(response => {
            this.isBusy = false
            this.getContactSessionInfo()
            this.$generalNotification('Successfully Updated', 'success')
          })
        }
      })
    }
  },

  mounted () {
    this.isBusy = true
    setTimeout(() => {
      this.getContactSessionInfo()
    }, 3000)
  },

  watch: {
    'contact.id': _.debounce(function (value) {
      if (this.contact && this.contact.id && this.$route.params.id === this.contact.id.toString()) {
        this.getContactSessionInfo()
      }
    }, 500)
  }
}
</script>
