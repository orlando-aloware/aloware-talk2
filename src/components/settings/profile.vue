<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <h1 class="mt-2"> Profile Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4">
        <b-col sm="12" md="6">
          <b-form-group
            label="First Name"
            class="form-label"
          >
            <b-form-input
              v-model="user.first_name"
              type="text"
              placeholder="First Name"
              required
              @input="(eventPayload) => onUpdateFields(eventPayload, 'first_name')">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Last Name"
          >
            <b-form-input
              v-model="user.last_name"
              type="text"
              placeholder="Last Name"
              required
              @input="(eventPayload) => onUpdateFields(eventPayload, 'last_name')">
            </b-form-input>
          </b-form-group>
        </b-col>

        <b-col
          sm="12"
          md="12">
          <b-form-group
            class="form-label"
            label="Description (Optional)"
          >
            <b-form-textarea
              id="textarea"
              v-model="user.description"
              placeholder="Enter something..."
              rows="3"
              max-rows="6"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'description')"
            ></b-form-textarea>
          </b-form-group>
        </b-col>

        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Email"
          >
            <b-form-input
              v-model="user.email"
              type="text"
              placeholder="name@company.com"
              required
              @input="(eventPayload) => onUpdateFields(eventPayload, 'email')">
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="hasRole('Company Admin') && !user.is_destination">
        <b-col sm="12" md="12" class="d-flex justify-between">
          <div>
            <h5 class="form-label">Change Password</h5>
            <p class="form-helper-text">Toggle the switch to change password</p>
          </div>
          <b-form-group
            label=""
            class="form-label"
          >
            <b-form-checkbox switch size="md" v-model="showPasswordFields"></b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4" v-if="showPasswordFields">
        <b-col sm="12" md="6">
          <b-form-group
            label="Password"
            class="form-label">
            <b-form-input
              v-model="user.password"
              type="password"
              placeholder="New Password"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'password')">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col
          sm="12"
          md="6">
          <b-form-group
            class="form-label"
            label="Password Confirmation"
          >
            <b-form-input

              v-model="user.confirm_password"
              type="text"
              placeholder="Password Confirmation"
              required>
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="!user.is_destination && hasRole('Company Admin')">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Role</h5>
            <p class="form-helper-text">Choose a role for this user</p>
          </div>

          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              id="radio-slots"
              v-model="user.role_name"
              :options="options"
              :aria-describedby="ariaDescribedby"
              name="radio-options-slots"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'role_name')">
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12" md="6">
          <div>
            <h5 class="form-label">Answer Type</h5>
            <p class="form-helper-text">Choose how this user answers calls</p>
          </div>

          <b-form-group label="" >
            <answer-type-selector v-model="user.answer_by"
                                  @select="(eventPayload) => onUpdateFields(eventPayload, 'answer_by')">
            </answer-type-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div v-if="canBeEdited && [AnswerTypes.BY_BROWSER, AnswerTypes.BY_IP_PHONE].includes(user.answer_by)">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Backup Routing (Beta)</h5>
              <p class="form-helper-text">Call routing will check if the user is online on Aloware. If you check this, the backup phone number will ring if your not available.</p>
            </div>

            <b-form-group label="" >
              <b-form-checkbox
                v-model="user.phone_number_as_backup"
                :value="true"
                :unchecked-value="false"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'phone_number_as_backup')">
                Use a phone number as backup.
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-form-row>
      </div>

      <b-form-row class="mt-4" v-show="userDestinationEditable && (([AnswerTypes.BY_BROWSER, AnswerTypes.BY_IP_PHONE].includes(user.answer_by) && user.phone_number_as_backup) || user.answer_by === AnswerTypes.BY_PHONE_NUMBER)">
        <b-col sm="12" md="6">
          <b-form-group
            label="Backup Phone Number"
            class="form-label"
          >
            <b-form-input
              v-model="user.phone_number"
              type="text"
              placeholder="(123) 456-7890"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'phone_number')">
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div v-if="canBeEdited && user.answer_by !== AnswerTypes.BY_BROWSER && user.answer_by !== AnswerTypes.BY_NONE">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Respect agent availability status (Beta)</h5>
              <p class="form-helper-text"></p>
            </div>

            <b-form-group label="" >
              <b-form-checkbox
                v-model="user.respect_agent_status"
                :value="true"
                :unchecked-value="false"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'respect_agent_status')"
              >
                Respect agent availability status
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-form-row>
      </div>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Text Message Handling (Beta)</h5>
            <p class="form-helper-text">If you don't want this user to be assigned to text messages please uncheck "Answers text messages."</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.answers_messages"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'answers_messages')"
            >
              Answers text messages
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div v-if="isNotOwnSettings">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Change Contact Ownership</h5>
              <p class="form-helper-text">If you don't want to allow this user to change contact ownership, please uncheck the checkbox below.</p>
            </div>

            <b-form-group label="" >
              <b-form-checkbox
                v-model="user.can_change_contact_ownership"
                :value="true"
                :unchecked-value="false"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'can_change_contact_ownership')"
              >
                Can change contact ownership
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-form-row>

      </div>

      <b-form-row class="mt-4" v-if="isNotOwnSettings">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Allow Contact Ring Groups Modification</h5>
            <p class="form-helper-text">If you don't want to allow this user to modify the contact ring groups, please uncheck the checkbox below.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.can_modify_contact_ring_groups"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'can_modify_contact_ring_groups')"
            >
              Can modify contact ring groups
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="isNotOwnSettings">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Allow Call Barge and Whisper</h5>
            <p class="form-helper-text">If you don't want to allow this user to barge and/or whisper on a call, please uncheck "Can barge and whisper on a call".</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.can_barge_and_whisper_on_call"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'can_barge_and_whisper_on_call')"
            >
              Can barge and whisper on a call
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12" md="6">
          <div>
            <h5 class="form-label">User's Personal Line</h5>
          </div>

          <b-form-group label=""  class="mt-2">
            <user-campaign-selector v-model="user.campaign_id"
                                    :user="user"
                                    @select="(eventPayload) => onUpdateFields(eventPayload, 'campaign_id')">
            </user-campaign-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="isNotOwnSettings">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Can Broadcast</h5>
            <p class="form-helper-text">Grant broadcast access to the user</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.has_broadcast_access"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'has_broadcast_access')">
              Can create and update broadcast
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import AnswerTypeSelector from 'components/generic-selectors/answer-type-selector'
import UserCampaignSelector from 'components/generic-selectors/user-campaign-selector'
import * as AnswerTypes from 'src/constants/answer-types'
import * as Roles from 'src/constants/roles'
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'profile',

  mixins: [aclMixin],

  components: { UserCampaignSelector, AnswerTypeSelector },

  computed: {
    ...mapState('settings', ['userClone'])
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      showPasswordFields: false,
      selected: '',
      status: '',
      options: [
        { text: 'Admin', value: 'Company Admin' },
        { text: 'Agent', value: 'Company Agent' }
      ],
      AnswerTypes,
      Roles
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties']),

    userDestinationEditable () {
      return this.user.role_name && !this.user.read_only_access
    },

    isNotOwnSettings () {
      if (this.auth && (!this.auth.hasOwnProperty('user') || !this.auth.user.hasOwnProperty('profile'))) {
        return false
      }

      return this.hasRole(Roles.COMPANY_ADMIN) && +this.user.id !== +this.auth.user.profile.id
    },

    canBeEdited () {
      return this.user.role_name && !this.user.read_only_access && !this.user.is_destination
    },

    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })

      // reset phone number when backup routing is disabled
      if (prop === 'phone_number_as_backup' && !this.user[prop]) {
        this.user.phone_number = this.userClone.phone_number
        this.updateChangedUserProperties({
          name: 'phone_number',
          value: this.userClone.phone_number
        })
      }
    }
  }
}
</script>
