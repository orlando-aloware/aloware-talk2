<template>
  <div>
    <b-button v-if="hasPermissionTo('toggle block contact') && !contact.is_dnc"
              variant="light"
              size="sm"
              class="custom-action-button"
              data-testid="contact-dnc-actions-button"
              :disabled="disabled"
              @click="dncContact">
      <q-tooltip anchor="top middle"
                 data-testid="contact-dnc-actions-tooltip"
                 self="center middle"
                 content-class="fs-12"
                 v-if="!contact.is_dnc">
        DNC
      </q-tooltip>

      <q-spinner-bars v-if="isProcessingDNC"
                      class="mr-1"
                      data-testid="contact-dnc-actions-spinner-bar"
                      color="blue" />
      <i v-if="!isProcessingDNC"
         class="fa fa-ban">
      </i>
    </b-button>

    <b-button v-if="hasRole('Company Admin') && contact.is_dnc && currentCompany && currentCompany.undnc_enabled"
              variant="light"
              size="sm"
              class="custom-action-button"
              :disabled="isProcessingDNC || disabled"
              data-testid="contact-undnc-actions-button"
              @click="onShowUnDncModal">
      <q-tooltip v-if="contact.is_dnc"
                 anchor="top middle"
                 data-testid="contact-undnc-actions-tooltip"
                 self="center middle">
        Un-DNC
      </q-tooltip>

      <q-spinner-bars v-if="isProcessingDNC"
                      class="mr-1"
                      data-testid="contact-undnc-actions-spinner-bar"
                      color="white" />
      <i v-if="!isProcessingDNC"
         class="fa fa-ban">
      </i>
    </b-button>
    <contact-undnc-modal :contact="contact"
                         data-testid="contact-dnc-undnc-modal"
                         @contactUnDnc="onUnDnc">
    </contact-undnc-modal>
  </div>

</template>

<script>

import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import ContactUndncModal from 'components/contacts/contact-undnc-modal'

export default {
  components: { ContactUndncModal },
  mixins: [aclMixin],

  name: 'contact-dnc-actions',

  props: {
    contact: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isProcessingDNC: false,
      isProcessingBlock: false,
      showUnDncModal: false,
      reason: ''
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    contactName () {
      if (this.contact) {
        return this.contact.name || 'No Name'
      }

      return 'No Name'
    }
  },

  methods: {
    dncContact () {
      if (this.isProcessingDNC) {
        return
      }

      this.$bvModal.msgBoxConfirm('DNC will disable all communications to a contact and is irreversible. Do you wish to continue?', {
        okTitle: 'Yes',
        cancelTitle: 'No'
      }).then(value => {
        if (value) {
          this.isProcessingDNC = true
          talk2Api.V1.contact.update(this.contact.id, { is_dnc: 1 }).then(response => {
            this.contact.is_dnc = true
            this.isProcessingDNC = false
            this.$generalNotification('Contact was successfully DNC.', 'success')
          })
        }
      })
    },
    onShowUnDncModal (e) {
      this.$root.$emit('bv::show::modal', 'contact-undnc-modal', e.target)
    },
    onUnDnc () {
      this.contact.is_dnc = false
    }
  }
}
</script>
