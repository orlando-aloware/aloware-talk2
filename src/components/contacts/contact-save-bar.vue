<template>
  <div v-if="changedContactProperties.length > 0 && !changingSelectedContact"
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
      this.setContact({ ...this.contactClone })
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
        this.$q.notify({
          message: 'Your changes has been saved.',
          type: 'positive',
          textColor: 'white',
          position: 'bottom-right'
        })
      })
    },
    saveChanges () {
      let parameters = this.getParameters()
      if (Object.entries(parameters).length > 0) {
        return talk2Api.V1.contact.update(this.contact.id, parameters).then(response => {
          this.setContact(response.data)
          this.setContactClone(response.data)
        })
      }
    },
    disposeContact () {
      let dispositionStatusProp = this.changedContactProperties.find(item => item.property === 'disposition_status_id')
      if (dispositionStatusProp) {
        return talk2Api.V1.contact.dispose(this.contact.id, { 'disposition_status': this.contact.disposition_status_id }).then(response => {
          this.setContact(response.data)
          this.setContactClone(response.data)
        }).catch(() => {
          return Promise.reject('Error while saving changes.')
        })
      }
    },
    getParameters () {
      let params = {}
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
