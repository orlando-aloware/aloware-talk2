<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> Personalization </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4"
                  v-if="isAdmin"
                  :id="`${SettingsMap.focus_mode.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Focus Mode</h5>
            <p class="form-helper-text">Only show me contacts that are assigned to me.</p>
          </div>

          <b-form-group
            label=""
          >
            <b-form-checkbox switch
                             v-model="user.focus_mode"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'focus_mode')">
              Enable focus mode
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.go_to_available_after_login.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Available by Default, But Allow Manual Changes</h5>
            <p class="form-helper-text">Put user on available status after login and disable idle mode detection (auto offline).</p>
          </div>

          <b-form-group
            label=""
          >
            <b-form-checkbox switch
                             v-model="user.go_to_available_after_login"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'go_to_available_after_login')">
              Enable available by default, but allow manual changes
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.wrap_up_seconds.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Wrap up duration
              <b-badge variant="warning"
                       v-if="currentCompany && currentCompany.force_wrap_up">
                Forced at account level
              </b-badge>
            </h5>
            <p class="form-helper-text">Stay on wrap up for this amount of time before you go back to available for the next call.</p>
          </div>
        </b-col>
        <b-col sm="12" md="6">
          <b-form-group label="" >
            <wrap-up-selector v-model="user.wrap_up_seconds"
                              :disable="currentCompany && currentCompany.force_wrap_up"
                              @select="(eventPayload) => onUpdateFields(eventPayload, 'wrap_up_seconds')">
            </wrap-up-selector>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import WrapUpSelector from 'components/generic-selectors/wrap-up-selector'
import { mapActions, mapState } from 'vuex'
import SettingsMap from 'components/settings/settings-map'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'personalization',

  mixins: [aclMixin],

  components: { WrapUpSelector },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  data () {
    return {
      options: [
        { text: 'Admin', value: '1' },
        { text: 'Agent', value: '2' }
      ],
      SettingsMap
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties']),
    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })
    }
  }
}
</script>
