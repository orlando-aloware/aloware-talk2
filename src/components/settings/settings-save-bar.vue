<template>
  <div v-if="isVisible"
       class="contact-save-bar-wrapper text-right">
    <span class="label">
      You've changed {{ changedUserProperties.length }} property
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
              :disabled="isBusy || !formIsValid">
      <q-spinner-bars v-if="isBusy" color="white" />
      {{ saveButtonLabel }}
    </b-button>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
export default {
  name: 'settings-save-bar',

  props: {
    user: {
      required: true
    }
  },

  computed: {
    ...mapGetters('settings', ['changedUserProperties']),
    ...mapState('settings', ['userClone', 'formIsValid']),
    ...mapState('auth', ['profile']),
    saveButtonLabel () {
      if (this.isBusy) {
        return 'Saving changes..'
      }

      return 'Save'
    },
    isVisible () {
      return this.changedUserProperties.length > 0
    }
  },
  data () {
    return {
      isBusy: false
    }
  },
  methods: {
    ...mapActions('settings', ['resetChangedUserProperties', 'setUserClone', 'setUser', 'setFormValidity']),
    onCancel () {
      this.setUser(_.cloneDeep(this.userClone))
      this.resetChangedUserProperties()
      this.setFormValidity(true)

      this.$VueEvent.fire('resetSettingsForm')
    },
    onSave () {
      this.isBusy = true
      return Promise.all([
        this.saveChanges()
      ]).finally(() => {
        this.resetChangedUserProperties()
        this.isBusy = false
        this.$generalNotification('Your changes has been saved.')
      })
    },
    saveChanges () {
      let parameters = this.getParameters()
      if (Object.entries(parameters).length > 0) {
        let passwordIndex = this.changedUserProperties.findIndex(item => item.property === 'password')

        let user = _.cloneDeep(this.user)

        // Check if password is one of changed field
        // If not changed, we need to remove it to prevent unintentional change of password
        if (passwordIndex < 0) {
          delete user.password
          delete user.password_confirmation
        }

        return talk2Api.V1.user.update(this.user.id, user).then(response => {
          let data = { ...response.data, operating_hours: JSON.parse(response.data.operating_hours) }
          data.password = ''
          data.password_confirmation = ''
          this.setUserClone(_.cloneDeep(data))
          this.setUser(_.cloneDeep(this.userClone))

          this.resetChangedUserProperties()
          this.setFormValidity(true)

          this.$VueEvent.fire('resetSettingsForm')
        })
      }
    },
    getParameters () {
      let params = {}
      this.changedUserProperties.filter(item => item.property !== 'disposition_status_id').forEach(function (item) {
        params[item.property] = item.value
      })
      return params
    }
  },

  mounted () {
    this.resetChangedUserProperties()
  },

  watch: {
    contact: function () {
      this.resetChangedUserProperties()
    }
  }
}
</script>
