<template>
  <div class="contact-save-bar-wrapper d-flex w-100"
       data-testid="contact-save-bar-wrapper"
       :class="contentClass"
       v-if="isVisible">
    <span class="label">
      You've changed {{ changedContactProperties.length + changedContactAttributes.length }} property
    </span>
    <div class="w-auto"
         :class="actionButtonsClass">
      <b-button class="ml-2"
                size="sm"
                variant="outline-primary"
                :disabled="isBusy"
                data-testid="cancel-button"
                @click="onCancel">
        Cancel
      </b-button>
      <b-button class="ml-2"
                size="sm"
                variant="primary"
                :disabled="isBusy || isDisposing"
                data-testid="save-button"
                @click="onSave">
        <q-spinner-bars v-if="isBusy || isDisposing" color="white" />
        {{ saveButtonLabel }}
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
import { saveBarMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-save-bar',

  mixins: [
    saveBarMixin
  ],

  computed: {
    ...mapState('contacts', [
      'changedContactProperties',
      'contact',
      'contactClone',
      'changingSelectedContact',
      'changedContactAttributes'
    ]),

    saveButtonLabel () {
      if (this.isBusy || this.isDisposing) {
        return 'Saving changes..'
      }

      return 'Save'
    },

    isVisible () {
      return this.contact.id === this.contactClone.id &&
        (this.changedContactProperties.length > 0 || this.changedContactAttributes.length > 0) &&
        !this.changingSelectedContact
    }
  },

  data () {
    return {
      isBusy: false,
      isDisposing: false
    }
  },

  mounted () {
    this.resetChangedContactProperties()
  },

  methods: {
    ...mapActions('contacts', [
      'setContact',
      'setContactClone',
      'resetChangedContactProperties',
      'setChangedContactProperties',
      'resetChangedContactAttributes'
    ]),

    onCancel () {
      if (this.contactClone.id === this.contact.id) {
        this.setContact({ ...this.contactClone })
      }

      this.resetChangedContactProperties()
      this.resetChangedContactAttributes()
      this.$VueEvent.fire('cancelContactChanges')
    },

    onSave () {
      this.isBusy = true
      this.$VueEvent.fire('saveContact')

      return Promise.all([
        this.saveChanges(),
        this.disposeContact(),
        this.saveCustomAttributes()
      ]).then(response => {
        this.$VueEvent.fire('contactUpdated')

        if (response?.[0]?.status || response?.[1]?.status) {
          let contact = null

          if (response?.[0]?.contact) {
            contact = response[0].contact
          }

          if (response?.[1]?.contact) {
            contact = _.cloneDeep(this.contact)
            contact.disposition_status_id = response[1].contact.disposition_status_id
          }

          if (contact) {
            this.setContact(contact)
          }

          this.setContactClone(this.contact)
          this.resetChangedContactProperties()
          this.resetChangedContactAttributes()
        }

        // contact has been updated while disposition is not
        if (response?.[0]?.status && !response?.[1]?.status) {
          this.setChangedContactProperties([...this.changedContactProperties.filter(item => item.property === 'disposition_status_id')])
        }

        // contact has not been updated while disposition is
        if (!response?.[0]?.status && response?.[1]?.status) {
          this.setChangedContactProperties([...this.changedContactProperties.filter(item => item.property !== 'disposition_status_id')])
        }
      }).finally(() => {
        this.isBusy = false
      })
    },

    saveChanges () {
      const parameters = this.getParameters()

      if (!Object.entries(parameters).length) {
        return
      }

      return talk2Api.V1.contact.update(this.contact.id, parameters)
        .then(response => {
          this.$generalNotification('Your changes has been saved.')

          if (response.data.id === this.contact.id) {
            return { status: true, contact: response.data }
          }

          return { status: true }
        }).catch(err => {
          if (err.response.data && err.response.data.errors) {
            Object.keys(err.response.data.errors).forEach((value) => {
              this.$generalNotification(err.response.data.errors[value][0], 'error')
            })
          }

          return { status: false }
        })
    },

    disposeContact () {
      const dispositionStatusProp = this.changedContactProperties.find(item => item.property === 'disposition_status_id')

      if (!dispositionStatusProp) {
        return
      }

      return talk2Api.V1.contact.dispose(this.contact.id, { 'disposition_status': this.contact.disposition_status_id })
        .then(response => {
          this.$generalNotification('Contact disposition status has been saved.')

          if (response.data.id === this.contact.id) {
            return { status: true, contact: response.data }
          }

          return { status: true }
        }).catch((err) => {
          this.$handleErrors(err.response)
          return { status: false }
        })
    },

    saveCustomAttributes () {
      if (!this.changedContactAttributes.length) {
        return
      }

      return talk2Api.V1.contact.bulkSaveCustomAttributes(this.contact.id, { contact_attributes: this.changedContactAttributes })
        .then(response => {
          this.$generalNotification('Contact custom attributes has been saved.')
          this.$VueEvent.fire('customAttributesUpdated', this.contact)
          this.resetChangedContactAttributes()
          return { status: true }
        }).catch((err) => {
          this.$handleErrors(err.response)
          return { status: false }
        })
    },

    getParameters () {
      const params = {}

      this.changedContactProperties.filter(item => item.property !== 'disposition_status_id').forEach(function (item) {
        params[item.property] = item.value
      })

      return params
    }
  }
}
</script>
