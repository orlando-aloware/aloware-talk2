<template>
  <div class="contact-save-bar-wrapper d-flex"
       :class="contentClass"
       v-if="isVisible">
    <span class="label">
      You've changed {{ changedUserProperties.length }} property
    </span>
    <div class="w-auto"
         :class="actionButtonsClass">
      <b-button class="ml-2"
                size="sm"
                variant="outline-primary"
                :disabled="isBusy"
                @click="onCancel">
        Cancel
      </b-button>
      <b-button class="ml-2"
                size="sm"
                variant="primary"
                :disabled="isBusy || !formIsValid"
                @click="onSave">
        <q-spinner-bars color="white"
                        v-if="isBusy"/>
        {{ saveButtonLabel }}
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import _ from 'lodash'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import { settingsMixin, saveBarMixin } from 'src/plugins/mixins'
export default {
  name: 'settings-save-bar',

  mixins: [
    settingsMixin,
    saveBarMixin
  ],

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

  data: () => {
    return {
      isBusy: false
    }
  },

  methods: {
    ...mapActions('settings', [
      'resetChangedUserProperties',
      'setUserClone',
      'setUser',
      'setFormValidity'
    ]),

    ...mapActions('contacts', [
      'setDefaultIsShortenedUrlRemembered'
    ]),

    async resetSetting () {
      this.setUser(_.cloneDeep(this.userClone))
      this.resetChangedUserProperties()
      this.setFormValidity(true)
    },

    async onCancel () {
      this.resetSetting().then(() => {
        this.$VueEvent.fire('resetSettingsForm')
      })
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
      const parameters = this.getParameters()

      if (!Object.entries(parameters).length) {
        return
      }

      const passwordIndex = this.changedUserProperties.findIndex(item => item.property === 'password')
      const user = _.cloneDeep(this.user)

      // Check if password is one of changed field
      // If not changed, we need to remove it to prevent unintentional change of password
      if (passwordIndex < 0) {
        delete user.password
        delete user.password_confirmation
      }

      if (user.outbound_calling_selector === 1) {
        user.outbound_calling_mode = UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT
      }

      if (user.outbound_calling_selector === 2) {
        user.default_outbound_campaign_id = null
        user.outbound_calling_mode = UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT
      }

      if (user.outbound_calling_selector === 3) {
        user.default_outbound_campaign_id = null
        user.outbound_calling_mode = UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK
      }

      return talk2Api.V1.user.update(this.user.id, user).then(response => {
        this.localUser = response.data
        this.setupUser()

        this.localUser.password = ''
        this.localUser.password_confirmation = ''

        this.setUserClone(_.cloneDeep(this.localUser))
        this.setUser(_.cloneDeep(this.userClone))

        const propFound = this.changedUserProperties.find(userProp => userProp.property === 'url_shortener_enabled')

        if (propFound && !propFound.value) {
          this.setDefaultIsShortenedUrlRemembered()
        }

        this.resetChangedUserProperties()
        this.setFormValidity(true)

        this.$VueEvent.fire('resetSettingsForm')
      })
    },

    getParameters () {
      const params = {}

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
