<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> General Information </h1>
          </div>
        </b-col>
      </b-form-row>

      <div v-if="!statics.whitelabel">
        <b-form-row class="mt-3 general-settings-app-block">
          <b-col sm="12" md="12">
            <div class="d-inline-flex align-items-center">
              <h5 :class="mobileHeaderTransitionWidthClass"> Have you considered using Aloware app on your smartphone 📱? </h5>
              <b-button href="https://aloware.com/apps"
                        variant="outline-success"
                        class="ml-sm-2"
                        target="_blank"
                        size="sm">Get the App
              </b-button>
            </div>
          </b-col>
        </b-form-row>
      </div>

      <b-alert show
               variant="warning"
               v-if="currentCompany && !currentCompany.default_outbound_campaign_id && profile.answer_by === AnswerTypes.BY_IP_PHONE">
        This user will not send outbound calls unless you select a default outbound line for your company.
      </b-alert>

      <b-form-row class="mt-3">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Ring Groups</h5>
            <p class="form-helper-text"
               v-if="profile.ring_group_ids && profile.ring_group_ids.length > 0">
              This user is a member of the following ring groups
            </p>

            <ul class="list inset mb-0 ring-group-list"
                v-if="profile.ring_group_ids && profile.ring_group_ids.length > 0">
              <span
                  :key="ringGroupId"
                  v-for="ringGroupId in profile.ring_group_ids">
                  <span class="text-grey-90 _400 fs-12"
                        v-if="ringGroups.length > 0">
                      <span v-if="shouldDisplayRingGroup(ringGroupId)">
                        <li class="pb-0">{{ getRingGroupName(ringGroupId) || 'Ring group data not available' }}</li>
                      </span>
                  </span>
                  <q-skeleton type="text"
                              animation="fade"
                              height="20px"
                              v-else />
              </span>
            </ul>

            <p class="form-helper-text text-bold text-red-8"
               v-else>
              You are not connected to any ring group.
            </p>
          </div>
        </b-col>
      </b-form-row>

      <div v-if="showSIPData">
        <b-form-row class="mt-4 no-gutters">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">SIP URI</h5>
              <p class="form-helper-text">
                A SIP-URI is the SIP addressing scheme that communicates who to call via SIP. In other words, a SIP URI is a user’s SIP phone number. The SIP URI resembles an e-mail address.
              </p>
            </div>

            <b-form-group label=""
                          class="form-label">
              <input-group-with-copy v-model="profile.sip_uri" />
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">SIP Domain</h5>
              <p class="form-helper-text">This is the domain the SIP phones connect to.</p>
            </div>

            <b-form-group label=""
                          class="form-label">
              <input-group-with-copy :value="profile.sip_uri | filterDomain" />
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">SIP Username</h5>
              <p class="form-helper-text">The username / authorization name for this SIP device.</p>
            </div>

            <b-form-group label=""
                          class="form-label">
              <input-group-with-copy v-model="profile.sip_details.username" />
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">SIP Password</h5>
              <p class="form-helper-text">Password for this SIP device.</p>
            </div>

            <b-form-group label=""
                          class="form-label">
              <input-group-with-copy v-model="profile.sip_details.password" />
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">SIP Alias</h5>
              <p class="form-helper-text">An internal label for this device. Might be displayed on the physical phone.</p>
            </div>

            <b-form-group label=""
                          class="form-label">
              <input-group-with-copy v-model="profile.sip_details.alias" />
            </b-form-group>
          </b-col>
        </b-form-row>
      </div>
    </b-form>
  </b-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import InputGroupWithCopy from 'components/input-group-with-copy'
import * as AnswerTypes from 'src/constants/answer-types'
import { MOBILE_HEADER_TRANSITION_WIDTH } from 'src/constants/viewport-sizes'

export default {
  name: 'general-information',

  components: { InputGroupWithCopy },

  props: {
    statics: {
      required: true
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),

    ...mapState('cache', ['currentCompany']),

    ...mapState(['ringGroups']),

    mobileHeaderTransitionWidthClass () {
      return this.$q.screen.width < MOBILE_HEADER_TRANSITION_WIDTH ? 'w-100' : ''
    }
  },

  data () {
    return {
      user: this.profile,
      AnswerTypes,
      showSIPData: false
    }
  },

  methods: {
    copyCode (code) {
      this.$copyToClipboard(code)
      this.$generalNotification('Copied to clipboard.')
    },

    getRingGroup (id) {
      return this.ringGroups.find(item => item.id === id)
    },

    getRingGroupName (id) {
      const ringGroup = this.getRingGroup(id)

      return ringGroup ? this.$options.filters.fixName(ringGroup.name) : null
    },

    shouldDisplayRingGroup (id) {
      const ringGroup = this.getRingGroup(id)

      return !ringGroup?.call_waiting
    }
  }
}
</script>
