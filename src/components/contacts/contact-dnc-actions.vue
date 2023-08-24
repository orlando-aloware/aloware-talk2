<template>
  <div>
    <b-button v-if="hasPermissionTo('toggle block contact') && !contact.is_dnc"
              variant="light"
              size="sm"
              class="custom-action-button"
              @click="dncContact">
      <q-tooltip v-if="!contact.is_dnc"
                 anchor="bottom middle"
                 self="center middle">
        DNC
      </q-tooltip>

      <q-spinner-bars v-if="isProcessingDNC"
                      class="mr-1"
                      color="blue" />
      <i v-if="!isProcessingDNC"
         class="fa fa-ban">
      </i>
    </b-button>

    <b-button v-if="hasRole('Company Admin') && contact.is_dnc && currentCompany && currentCompany.undnc_enabled"
              variant="light"
              size="sm"
              class="custom-action-button"
              :disabled="isProcessingDNC"
              @click="onShowUnDncModal">
      <q-tooltip v-if="contact.is_dnc"
                 anchor="bottom middle"
                 self="center middle">
        Un-DNC
      </q-tooltip>

      <q-spinner-bars v-if="isProcessingDNC"
                      class="mr-1"
                      color="white" />
      <i v-if="!isProcessingDNC"
         class="fa fa-ban">
      </i>
    </b-button>
    <contact-undnc-modal :contact="contact"
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
