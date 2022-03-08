<template>
  <div v-if="isVisible"
       class="contact-save-bar-wrapper text-right">
    <span class="label">
      You've changed {{ changedContactProperties.length }} property
    </span>
    <b-button size="sm"
              class="ml-2"
              variant="outline-primary"
              :disabled="isBusy"
              @click="onCancel">
      Cancel
    </b-button>
    <b-button size="sm"
              class="ml-2"
              variant="primary"
              @click="onSave"
              :disabled="isBusy || isDisposing">
      <q-spinner-bars v-if="isBusy || isDisposing" color="white" />
      {{ saveButtonLabel }}
    </b-button>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'contact-save-bar',
  computed: {
    ...mapState('contacts', ['changedContactProperties', 'contact', 'contactClone', 'changingSelectedContact']),
    saveButtonLabel () {
      if (this.isBusy || this.isDisposing) {
        return 'Saving changes..'
      }

      return 'Save'
    },
    isVisible () {
      return this.contact.id === this.contactClone.id && this.changedContactProperties.length > 0 && !this.changingSelectedContact
    }
  },
  data () {
    return {
      isBusy: false,
      isDisposing: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone', 'resetChangedContactProperties']),
    onCancel () {
      if (this.contactClone.id === this.contact.id) {
        this.setContact({ ...this.contactClone })
      }
      this.resetChangedContactProperties()
    },
    onSave () {
      this.isBusy = true
      return Promise.all([
        this.saveChanges(),
        this.disposeContact()
      ]).finally(() => {
        this.resetChangedContactProperties()
        this.isBusy = false
        this.$generalNotification('Your changes has been saved.')
      })
    },
    saveChanges () {
      const parameters = this.getParameters()
      if (Object.entries(parameters).length > 0) {
        return talk2Api.V1.contact.update(this.contact.id, parameters).then(response => {
          if (response.data.id === this.contact.id) {
            this.setContact(response.data)
            this.setContactClone(response.data)
          }
        })
      }
    },
    disposeContact () {
      const dispositionStatusProp = this.changedContactProperties.find(item => item.property === 'disposition_status_id')
      if (dispositionStatusProp) {
        return talk2Api.V1.contact.dispose(this.contact.id, { 'disposition_status': this.contact.disposition_status_id }).then(response => {
          if (response.data.id === this.contact.id) {
            this.setContact(response.data)
            this.setContactClone(response.data)
          }
        }).catch((err) => {
          this.$handleErrors(err.response)
          return Promise.reject('Error while saving changes.')
        })
      }
    },
    getParameters () {
      const params = {}
      this.changedContactProperties.filter(item => item.property !== 'disposition_status_id').forEach(function (item) {
        params[item.property] = item.value
      })
      return params
    }
  },

  mounted () {
    this.resetChangedContactProperties()
  },

  watch: {
    contact: function () {
      this.resetChangedContactProperties()
    }
  }
}
</script>
