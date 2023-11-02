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
                  :id="`${SettingsMap.go_to_available_after_login.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Available by Default, But Allow Manual Changes
              <span class="mx-1">
                <information-circle-icon color="#2F80ED">
                </information-circle-icon>
                <q-tooltip anchor="center start"
                           self="center left"
                           :offset="[-20, 10]">
                  <div>
                    <span class="d-flex mb-2"
                      v-if="statics.whitelabel">
                      Sets all users' statuses to 'Offline' by default after they login or have 5 minutes of app inactivity
                    </span>
                    <span class="d-flex mb-2"
                          v-else>
                      By default, we set all users' statuses to 'Offline' after they login or have 5 minutes of app inactivity
                    </span>
                    <span class="d-flex font-weight-bold">Turning on 'Force Users to Always Available' Setting:</span>
                    <ul class="mb-0">
                      <li>Users' statuses are set to 'Available' even after they login or have 5 minutes of app inactivity</li>
                      <li>Users cannot manually change their status</li>
                      <li>User's application will receive inbound calls until they logout</li>
                      <li>Admins can still manually change agent's statuses in Wallboard</li>
                    </ul>
                  </div>
                </q-tooltip>
              </span>
              <b-badge variant="warning"
                       v-if="currentCompany && currentCompany.force_users_always_available">
                Forced at account level
              </b-badge></h5>
            <p class="form-helper-text">Put user on available status after login and disable idle mode detection (auto offline).</p>
          </div>

          <b-form-group label="">
            <b-form-checkbox switch
                             v-model="user.go_to_available_after_login"
                             :disabled="currentCompany && currentCompany.force_users_always_available || viewOnly"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'go_to_available_after_login')">
              Enable available by default, but allow manual changes
            </b-form-checkbox>
            <q-tooltip anchor="center start"
                       self="center left"
                       :offset="[-20, 10]"
                       v-if="currentCompany && currentCompany.force_users_always_available">
              Disabled - Requires Admin to change Account Setting
            </q-tooltip>
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

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.url_shortener_enabled.hash_keyword}-container`"
                  v-if="currentCompany.url_shortener_enabled">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">URL Shortener</h5>
            <p class="form-helper-text">Here you can enable or disable auto Short URL generation feature for SMS/MMS forms.</p>
          </div>

          <b-form-group
            label=""
          >
            <b-form-checkbox switch
                             :disabled="viewOnly"
                             v-model="user.url_shortener_enabled"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'url_shortener_enabled')">
              Enable URL Shortener
            </b-form-checkbox>
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
import { aclMixin, kycMixin } from 'src/plugins/mixins'
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'personalization',

  mixins: [aclMixin, kycMixin],

  components: {
    WrapUpSelector,
    InformationCircleIcon
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState(['statics'])
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
