<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> Visibility Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-3"
                  :id="`${SettingsMap.contacts_visibility.hash_keyword}-container`">
        <b-col sm="12"
               md="6">
          <div>
            <h5 class="form-label">Contacts Visibility</h5>
            <p class="form-helper-text">Select the contacts visibility settings for this user</p>
          </div>

          <b-form-group label="" >
            <visibility-selector v-model="user.contacts_visibility"
                                 @select="(eventPayload) => onUpdateFields(eventPayload, 'contacts_visibility')">
            </visibility-selector>
          </b-form-group>
          <b-form-group label="" v-if="user.contacts_visibility !== ContactAccessTypes.CONTACTS_ACCESS_EVERYONE">
            <b-form-checkbox
              v-model="user.can_view_unassigned_contacts"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'can_view_unassigned_contacts')"
            >
              Can view unassigned contacts
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.communications_visibility.hash_keyword}-container`">
        <b-col sm="12"
               md="6">
          <div>
            <h5 class="form-label">Communications Visibility</h5>
            <p class="form-helper-text">Communication visibility settings for this user</p>
          </div>

          <b-form-group label="" >
            <visibility-selector v-model="user.communications_visibility"
                                 :is-contact-access-type="false"
                                 @select="(eventPayload) => onUpdateFields(eventPayload, 'communications_visibility')">
            </visibility-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.line_access_limit.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Line Visibility Limit</h5>
            <p class="form-helper-text">By default, agents have access to all lines. Here, you can define exactly what lines they have access to.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              switch
              v-model="user.line_access_limit"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'line_access_limit')">
              Limit user's visibility
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row v-if="user.line_access_limit">
        <b-col sm="12" md="12">
          <b-alert :show="sortedCampaigns && sortedCampaigns.length < 1">Lines data not available</b-alert>
        </b-col>
        <b-col sm="12" md="12">
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-checkbox-group
              stacked
              class="group-checkbox d-flex flex-wrap custom-checkbox-w-100"
              value-field="id"
              text-field="name"
              v-model="user.selected_campaign_ids"
              :options="sortedCampaigns"
              :aria-describedby="ariaDescribedby"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'selected_campaign_ids')"
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="user.line_access_limit">
        <b-col sm="12" md="12">
          <b-form-group label="" >
            <b-form-checkbox
              switch
              v-model="user.line_communication_limit"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'line_communication_limit')">
              Apply visibility limit to communications
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-0" v-if="user.line_access_limit">
        <b-col sm="12" md="12">
          <b-form-group label="" >
            <b-form-checkbox
              switch
              v-model="user.line_contact_limit"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'line_contact_limit')">
              Apply visibility limit to contacts
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.read_only_access.hash_keyword}-container`"
                  v-if="!hasRole('Company Admin')">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Reporter Access</h5>
            <p class="form-helper-text">Users with reporter access can only see the reports and they can not interact with the contacts or make calls.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              switch
              v-model="user.read_only_access"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'read_only_access')">
              Make this user a reporter
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.user_access_limit.hash_keyword}-container`"
                  v-if="user.role_name && user.read_only_access && hasRole('Company Admin')">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">User Access Limit</h5>
            <p class="form-helper-text">Limit which users this user has reporting access to.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              switch
              v-model="user.user_access_limit"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'user_access_limit')">
              Limit visibility of other users
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row v-if="user.user_access_limit">
        <b-col sm="12" md="12">
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-checkbox-group
              stacked
              class="group-checkbox d-flex flex-wrap custom-checkbox-w-100"
              value-field="id"
              text-field="name"
              v-model="user.selected_user_ids"
              :options="sortedUsers"
              :aria-describedby="ariaDescribedby"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'selected_user_ids')"
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import VisibilitySelector from 'components/generic-selectors/visibility-selector'
import { aclMixin, kycMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'
import * as ContactAccessTypes from 'src/constants/contact-access-types'

import SettingsMap from 'components/settings/settings-map'

export default {
  name: 'visibility',

  mixins: [aclMixin, kycMixin],

  components: { VisibilitySelector },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState(['campaigns', 'users']),
    ...mapState('settings', ['userClone']),
    sortedUsers () {
      return this.$options.filters.objAlphabeticalOrder(this.users, 'name')
    },
    sortedCampaigns () {
      return this.$options.filters.objAlphabeticalOrder(this.campaigns, 'name')
    }
  },

  data () {
    return {
      SettingsMap,
      ContactAccessTypes
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties']),
    answerTypeSelected (type) {
      this.user.answer_by = type
    },
    campaignSelected (campaignId) {
      this.user.campaign_id = campaignId
    },

    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })

      if (prop === 'line_access_limit' && !this.user[prop]) {
        this.user.selected_campaign_ids = this.userClone.selected_campaign_ids
        this.updateChangedUserProperties({
          name: 'selected_campaign_ids',
          value: this.userClone.selected_campaign_ids
        })

        this.user.line_communication_limit = this.userClone.line_communication_limit
        this.updateChangedUserProperties({
          name: 'line_communication_limit',
          value: this.userClone.line_communication_limit
        })

        this.user.line_contact_limit = this.userClone.line_contact_limit
        this.updateChangedUserProperties({
          name: 'line_contact_limit',
          value: this.userClone.line_contact_limit
        })
      }

      if (prop === 'read_only_access' && !this.user[prop]) {
        this.user.user_access_limit = this.userClone.user_access_limit
        this.updateChangedUserProperties({
          name: 'user_access_limit',
          value: this.userClone.user_access_limit
        })

        this.user.selected_user_ids = this.userClone.selected_user_ids
        this.updateChangedUserProperties({
          name: 'selected_user_ids',
          value: this.userClone.selected_user_ids
        })
      }

      if (prop === 'user_access_limit' && !this.user[prop]) {
        this.user.selected_user_ids = this.userClone.selected_user_ids
        this.updateChangedUserProperties({
          name: 'selected_user_ids',
          value: this.userClone.selected_user_ids
        })
      }
    }
  }
}
</script>
