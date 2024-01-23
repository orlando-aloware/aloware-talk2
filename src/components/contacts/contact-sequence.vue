<template>
  <b-overlay :show="isBusy"
             rounded="sm"
             variant="white">

    <b-card class="border-0 position-relative contact-about-wrapper">
      <h4>Sequence</h4>

      <div v-if="sequence">
        <b-card-text class="fs-14 mt-3">

          <b-media>
            <template #aside>
              <b-img width="34"
                     alt="The Sequence icon"
                     :src="getIconUrl(sequence.img_src)"></b-img>
            </template>

            <h5 class="mt-0">{{ workflow.name }}</h5>
            <p class="mb-0 text-muted fs-13 mt-1">
              #{{ sequence.order }} {{ sequence.name }}
            </p>
          </b-media>
        </b-card-text>
        <b-button href="#"
                  variant="outline-primary"
                  size="sm"
                  class="mr-1"
                  @click="getSequenceInfo">
          <i class="fa fa-sync-alt"></i>
          <q-tooltip anchor="top middle"
                     self="center middle">
            Refresh sequence information
          </q-tooltip>
        </b-button>
        <b-button href="#"
                  variant="outline-danger"
                  size="sm"
                  @click="disenrollContact">
          <i class="fa fa-trash"></i> Disenroll from sequence
        </b-button>
      </div>

      <div v-if="!sequence">
        <b-card-text class="fs-14 mt-2">
          This contact is currently not enrolled to a sequence.
        </b-card-text>

        <b-button variant="outline-primary"
                  size="sm"
                  class="btn-contact-sequence-enrol"
                  block
                  @click="openSequenceModal">
          <add-sequence-icon color="white"
                             :height="12"
                             :width="12">

          </add-sequence-icon>
          Enroll To Sequence
        </b-button>
        <enroll-sequence-modal></enroll-sequence-modal>
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
import AddSequenceIcon from 'components/icons/add-sequence-icon'
import EnrollSequenceModal from 'components/enroll-sequence-modal'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'

export default {
  name: 'contact-sequence',

  components: { EnrollSequenceModal, AddSequenceIcon },

  data () {
    return {
      workflow: null,
      sequence: null,
      required: null,
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
    ...mapState('contacts', [
      'sequenceInfo',
      'sequenceInfoLoading'
    ]),

    isContactValid () {
      return this.contact && this.contact.id
    },

    isRouteMatch () {
      return this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer'
    },

    isContactAndRouteValid () {
      return this.isContactValid && this.isRouteMatch
    }
  },

  methods: {
    ...mapActions('contacts', ['enrollSequenceOpen']),
    openSequenceModal () {
      this.enrollSequenceOpen(true)
    },
    getSequenceInfo () {
      if (!this.contact.id) {
        return
      }
      this.isBusy = true
      return talk2Api.V1.contact.getSequenceInfo(this.contact.id).then(response => {
        this.sequence = response.data.sequence
        this.workflow = response.data.workflow
        this.isBusy = false
        this.emitSequenceInfo()
      }).catch(() => {
        this.isBusy = false
      })
    },
    emitSequenceInfo () {
      this.$emit('sequenceLoaded', { sequence: this.sequence, workflow: this.workflow })
    },
    disenrollContact () {
      this.$bvModal.msgBoxConfirm('Do you wish to disenroll this contact from all sequences?', {
        okTitle: 'Yes, disenroll',
        cancelTitle: 'No'
      }).then(value => {
        if (value) {
          this.isBusy = true
          talk2Api.V1.contact.disenrollFromSequence(this.contact.id).then(response => {
            this.resetSequence()
            this.isBusy = false
            this.$emit('contactDisenrolled')
            this.$generalNotification(response.data.message, 'success')
          })
        }
      })
    },
    resetSequence () {
      this.sequence = null
      this.workflow = null
    },
    getIconUrl (src) {
      return process.env.API_URL + src
    }
  },

  mounted () {
    this.sequence = this.sequenceInfo.sequence
    this.workflow = this.sequenceInfo.workflow

    if (!_.isEmpty(this.sequence) && !_.isEmpty(this.workflow)) {
      this.emitSequenceInfo()
    }

    this.$VueEvent.listen('contactSequenceEnrolled', (contactId) => {
      if (this.contact.id !== contactId) {
        return
      }

      this.isBusy = true
      setTimeout(() => {
        this.getSequenceInfo()
      }, 3000)
    })
  },

  watch: {
    'contact.id': _.debounce(function (value) {
      if (this.isContactAndRouteValid) {
        this.resetSequence()
        this.getSequenceInfo()
      }
    }, 500),

    sequenceInfoLoading (value) {
      this.isBusy = value
    },

    sequenceInfo: {
      deep: true,
      handler (data) {
        this.sequence = data.sequence
        this.workflow = data.workflow

        this.emitSequenceInfo()
      }
    }
  }
}
</script>
