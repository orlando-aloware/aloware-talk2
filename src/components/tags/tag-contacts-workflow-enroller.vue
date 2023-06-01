<template>
  <b-modal id="tag-enroll-tag-contacts-to-sequence-modal"
           modal-class="tags__modal"
           size="md"
           no-close-on-esc
           no-close-on-backdrop
           centered
           v-model="openModal"
           @hidden="closeModal">
    <b-overlay no-wrap
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>Enroll to Sequence</h6>
    </template>

    <div>
      <label class="label mt-2 mb-1">Choose the sequence you want this tagged contacts to enroll</label>
      <sequence-selector :generic-styling="false"
                         @change="setWorkflowId" />
    </div>

    <ul class="list-unstyled py-4 mb-0">
      <li class="mb-2">
        <div class="d-flex flex-row">
          <div class="mr-2">
            <i class="fa fa-info-circle text-warning" aria-hidden="true"></i>
          </div>
          <div>
            Contacts that are already enrolled in a sequence will not be enrolled.
          </div>
        </div>
      </li>
      <li class="mb-2">
        <div class="d-flex flex-row">
          <div class="mr-2">
            <i class="fa fa-info-circle text-warning" aria-hidden="true"></i>
          </div>
          <div>
            Contacts the has a DNC status will not be enrolled.
          </div>
        </div>
      </li>
      <li>
        <div class="d-flex flex-row">
          <div class="mr-2">
            <i class="fa fa-info-circle text-warning" aria-hidden="true"></i>
          </div>
          <div>
            Contact groups that has thousands of contacts will take time to enroll.
          </div>
        </div>
      </li>
    </ul>

    <p class="text-13 mt-2 mb-0"
       v-if="!isBulk"
       v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`" />

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModal">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  :disabled="!selectedWorkflowId"
                  @click.prevent="enrollContacts">
            Enroll Contacts
          </button>
        </div>
      </div>
    </template>

  </b-modal>
</template>

<script>
import SequenceSelector from 'components/generic-selectors/sequence-selector'
import { tagsMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'tag-contacts-workflow-enroller',

  mixins: [
    tagsMixin
  ],

  components: {
    SequenceSelector
  },

  props: {
    tag: {
      type: Object,
      required: false
    },

    isShow: {
      type: Boolean,
      required: true
    },

    isBulk: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      selectedWorkflowId: null
    }
  },

  computed: {
    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    }
  },

  methods: {
    closeModal () {
      this.$bvModal.hide('tag-enroll-tag-contacts-to-sequence-modal')
      this.$emit('closeEnrollTagContactsToSequenceDialog')
      this.reset()
    },

    reset () {
      this.selectedWorkflowId = null
    },

    setWorkflowId (id) {
      this.selectedWorkflowId = id
    },

    enrollContacts () {
      this.loading = true

      let payload = {
        model: 'tag'
      }
      let xhr = null

      if (this.isBulk) {
        payload.tag_ids = this.getSelectedTagIds
        xhr = API.V1.automations.workflows.bulkEnroll(this.selectedWorkflowId, payload)
      } else {
        payload.id = this.tag.id
        xhr = API.V1.automations.workflows.enroll(this.selectedWorkflowId, payload)
      }

      xhr
        .then(res => {
          this.loading = false
          this.$generalNotification(res.data.message)
          this.closeModal()
        })
        .catch(err => {
          const msg = err.status_code !== 500
            ? err.response.data.message
            : 'Encountered error while enrolling contacts'
          this.$handleErrors(msg)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>
