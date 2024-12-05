<template>
  <b-container>
    <b-form autocomplete="off">
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> Profile Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4"
                  :id="`${SettingsMap.profile_settings_name.hash_keyword}-container`">
        <b-col sm="12"
               md="6">
          <b-form-group
            label="First Name"
            class="form-label"
            :disabled="isCompanyKYCNotAbleToAddUser"
          >
            <b-form-input
              type="text"
              placeholder="First Name"
              required
              v-model.trim="$v.user.first_name.$model"
              :state = "validateState('first_name')"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'first_name')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.first_name.required">Enter your first name.</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.user.first_name.maxLength">First name must not exceed 191 characters</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm="12"
               md="6">
          <b-form-group
            class="form-label"
            label="Last Name"
            :disabled="isCompanyKYCNotAbleToAddUser"
          >
            <b-form-input
              v-model.trim="$v.user.last_name.$model"
              :state = "validateState('last_name')"
              type="text"
              placeholder="Last Name"
              required
              @input="(eventPayload) => onUpdateFields(eventPayload, 'last_name')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.last_name.required">Enter your last name.</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.user.last_name.maxLength">First name must not exceed 191 characters</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4">
        <b-col
          sm="12"
          md="12"
          :id="`${SettingsMap.profile_settings_description.hash_keyword}-container`">
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
          md="6"
          :id="`${SettingsMap.profile_settings_email.hash_keyword}-container`">
          <b-form-group
            class="form-label"
            label="Email"
            :disabled="isCompanyKYCNotAbleToAddUser"
          >
            <b-form-input
              type="text"
              placeholder="name@company.com"
              required
              :state="validateState('email')"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'email')"
              v-model.trim="$v.user.email.$model">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.email.required">Enter your email address.</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.user.email.email">Enter a valid email address.</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row :id="`${SettingsMap.profile_settings_password.hash_keyword}-container`"
                  class="mt-4"
                  v-if="(user.id === profile.id || isAdmin) && !user.is_destination">
        <b-col sm="12"
               md="12"
               class="d-flex justify-between">
          <div>
            <h5 class="form-label">Change Password</h5>
            <p class="form-helper-text">Toggle the switch to change password</p>
            <b-form-group label="" >
              <b-form-checkbox
                switch
                v-model="showPasswordFields"
                :value="true"
                :unchecked-value="false"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'showPasswordFields')">
                Change password
              </b-form-checkbox>
            </b-form-group>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" v-if="showPasswordFields">
        <b-col sm="12" md="6">
          <b-form-group
            label="Password"
            class="form-label">
            <b-form-input
              type="password"
              placeholder="New Password"
              autocomplete="off"
              :state="validateState('password')"
              v-model.trim="$v.user.password.$model"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'password')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.password.minLength">
              <b-icon class="mr-xs text-red"
                      icon="x">
              </b-icon>
              Password must be at least 8 character length.
            </b-form-invalid-feedback>

            <b-form-invalid-feedback v-if="!$v.user.password.passwordCases">
              <b-icon class="mr-xs text-red"
                      icon="x">
              </b-icon>
              Must contain upper and lower case letters
            </b-form-invalid-feedback>

            <b-form-invalid-feedback v-if="!$v.user.password.passwordDigit">
              <b-icon class="mr-xs text-red"
                      icon="x">
              </b-icon>
              Include at least one numerical digit
            </b-form-invalid-feedback>
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
              type="password"
              placeholder="Password Confirmation"
              autocomplete="off"
              :state="validateState('password_confirmation')"
              v-model.trim="$v.user.password_confirmation.$model"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'password_confirmation')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.password_confirmation.sameAsPassword">
              <b-icon class="mr-xs text-red"
                      icon="x">
              </b-icon>
              The passwords don't match
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.role.hash_keyword}-container`"
                  v-if="!user.is_destination && isAdmin">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Role</h5>
            <p class="form-helper-text">Choose a role for this user</p>
          </div>

          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio inline
                          value="Company Admin"
                          v-model="user.role_name"
                          :aria-describedby="ariaDescribedby"
                          @change="(eventPayload) => onUpdateFields(eventPayload, 'role_name')">
              Admin
              <q-tooltip anchor="top left"
                         self="top left"
                         :offset="[0, -33]">
                Admins have full access to everything.
              </q-tooltip>
            </b-form-radio>
            <b-form-radio inline
                          value="Company Agent"
                          v-model="user.role_name"
                          :aria-describedby="ariaDescribedby"
                          @change="(eventPayload) => onUpdateFields(eventPayload, 'role_name')">
              Agent
              <q-tooltip anchor="top left"
                         self="top left"
                         :offset="[0, -33]">
                Agents have read access to all your lines, users, contacts, and sequences. <br/>
                Agent's visibility can be configured in the Visibility Settings tab.
              </q-tooltip>
            </b-form-radio>
            <b-form-radio inline
                          value="Company Supervisor"
                          :disabled="viewOnly"
                          :aria-describedby="ariaDescribedby"
                          v-model="user.role_name"
                          @change="(eventPayload) => onUpdateFields(eventPayload, 'role_name')">
              Supervisor
              <q-tooltip anchor="top left"
                         self="top left"
                         :offset="[0, -33]">
                Supervisors have limited admin access.
              </q-tooltip>
            </b-form-radio>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row  class="mt-4"
                   :id="`${SettingsMap.answer_type.hash_keyword}-container`">
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

      <b-form-row class="mt-4">
        <b-col sm="12">
          <h5 class="form-label">Contact Card</h5>
          <p class="form-helper-text">Only personal lines routed to your user will show. Admins can set personal lines in the Lines settings. You can send this contact card via SMS to your clients.</p>

          <a href="javascript:void(0)"
             class="text-primary" style="text-decoration: underline;"
             @click="showPreviewContactCard = !showPreviewContactCard">
            {{ showPreviewContactCard ? 'Hide Card' : 'Preview Card' }}
          </a>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-2"
                  v-if="showPreviewContactCard">
        <b-col sm="12" md="6">
          <div class="preview-card-box">
            <div class="d-flex align-items-center mb-2">
              <div class="preview-avatar mr-3">
                {{ getInitials(user.contact_card_name) }}
              </div>
              <div>
                <h5 class="mb-0">{{ user.contact_card_name }}</h5>
                <p class="mb-0 text-muted">{{ selectedNumberContactCard | fixPhone('NATIONAL', true, false, true) }}</p>
              </div>
            </div>
            <div class="d-flex justify-content-around mt-4">
              <div class="text-center icon-container">
                <div class="icon-circle">
                  <b-icon icon="telephone-fill" class="text-white"></b-icon>
                </div>
                Call
              </div>
              <div class="text-center icon-container">
                <div class="icon-circle">
                  <b-icon icon="chat-dots-fill" class="text-white"></b-icon>
                </div>
                Message
              </div>
            </div>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="align-items-center"
                  :id="`${SettingsMap.contact_card.hash_keyword}-container`">
        <b-col sm="12" md="6">

          <b-form-group label="Name" class="form-label mb-0">
            <b-form-input class="contact-card-name"
                          type="text"
                          placeholder="Enter name"
                          :state="validateState('contact_card_name')"
                          v-model.trim="$v.user.contact_card_name.$model"
                          @input="(eventPayload) => onUpdateFields(eventPayload, 'contact_card_name')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.contact_card_name.maxLength">Name must not exceed 191 characters.</b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6">
          <b-form-group class="form-label mb-0">
            <div class="d-flex align-items-center">
              <label class="col-form-label">Phone Number</label>
              <span class="mx-1 d-flex align-items-center" v-if="user.contact_card_campaign_id">
                <information-circle-icon color="#2F80ED"></information-circle-icon>
                <q-tooltip anchor="center start" self="center left" :offset="[-20, 10]">
                  <p>The phone number for contact card can't be cleared, only changed.</p>
                </q-tooltip>
              </span>
            </div>
            <user-campaign-selector :key="contactCardCampaignSelectorKey"
                                    :user="user"
                                    v-model.trim="user.contact_card_campaign_id"
                                    @select="(eventPayload) => onUpdateFields(eventPayload, 'contact_card_campaign_id')"
                                    @selectedNumber="updateSelectedNumberContactCard">
            </user-campaign-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12">
          <h5 class="form-label">Company Card</h5>
          <p class="form-helper-text">You can send this company card via SMS to your clients.</p>

          <a href="javascript:void(0)"
             class="text-primary" style="text-decoration: underline;"
             @click="showPreviewCompanyCard = !showPreviewCompanyCard">
            {{ showPreviewCompanyCard ? 'Hide Card' : 'Preview Card' }}
          </a>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-2"
                  v-if="showPreviewCompanyCard">
        <b-col sm="12" md="6">
          <div class="preview-card-box">
            <div class="d-flex align-items-center mb-2">
              <div class="preview-avatar mr-3">
                {{ getInitials(user.company_contact_card_name) }}
              </div>
              <div>
                <h5 class="mb-0">{{ user.company_contact_card_name }}</h5>
                <p class="mb-0 text-muted">{{ selectedNumberCompanyCard | fixPhone('NATIONAL', true, false, true) }}</p>
              </div>
            </div>
            <div class="d-flex justify-content-around mt-4">
              <div class="text-center icon-container">
                <div class="icon-circle">
                  <b-icon icon="telephone-fill" class="text-white"></b-icon>
                </div>
                Call
              </div>
              <div class="text-center icon-container">
                <div class="icon-circle">
                  <b-icon icon="chat-dots-fill" class="text-white"></b-icon>
                </div>
                Message
              </div>
            </div>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="align-items-center"
                  :id="`${SettingsMap.company_contact_card.hash_keyword}-container`">
        <b-col sm="12" md="6">

          <b-form-group label="Name" class="form-label mb-0">
            <b-form-input class="company-card-name"
                          type="text"
                          placeholder="Enter name"
                          :state="validateState('company_contact_card_name')"
                          v-model.trim="$v.user.company_contact_card_name.$model"
                          @input="(eventPayload) => onUpdateFields(eventPayload, 'company_contact_card_name')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.company_contact_card_name.maxLength">Name must not exceed 191 characters.</b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6">
          <b-form-group class="form-label mb-0">
              <label class="col-form-label">Phone Number</label>
              <line-selector :value="user.company_contact_card_campaign_id"
                             :multiple="false"
                             :use-chips="false"
                             :generic-styling="false"
                             :generic-multiselect="false"
                             :clearable="true"
                             :useInput="true"
                             v-model.trim="user.company_contact_card_campaign_id"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'company_contact_card_campaign_id')"
                             @selectedNumber="updateSelectedNumberCompanyCard">
            </line-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.backup_routing.hash_keyword}-container`"
           v-show="canBeEdited && [AnswerTypes.BY_BROWSER, AnswerTypes.BY_IP_PHONE].includes(user.answer_by)">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Backup Routing (Beta)</h5>
              <p class="form-helper-text">Call routing will check if the user is online{{ whiteLabelProfileText }}. If you check this, the backup phone number will ring if you're not available.</p>
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

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.backup_phone_number.hash_keyword}-container`"
                  v-show="userDestinationEditable && (([AnswerTypes.BY_BROWSER, AnswerTypes.BY_IP_PHONE].includes(user.answer_by) && user.phone_number_as_backup) || user.answer_by === AnswerTypes.BY_PHONE_NUMBER)">
        <b-col sm="12" md="6">
          <b-form-group
            :label="`Backup Phone Number`"
            class="form-label"
          >
            <b-form-input
              type="text"
              placeholder="(123) 456-7890"
              v-model.trim="$v.user.phone_number.$model"
              :state="validateState('phone_number')"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'phone_number')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.phone_number.validPhone">Enter valid phone number (e.g. (123) 456-7890).</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.respect_agent_status.hash_keyword}-container`"
           v-if="canBeEdited && user.answer_by !== AnswerTypes.BY_BROWSER && user.answer_by !== AnswerTypes.BY_NONE">
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

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.text_message_handling.hash_keyword}-container`"
                  v-if="canBeEdited && isNotOwnSettings && user.role_name === 'Company Agent'">
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

      <template v-if="!isAdmin && !user.is_destination">
        <div :id="`${SettingsMap.can_change_contact_ownership.hash_keyword}-container`"
             v-if="isNotOwnSettings && user.role_name === 'Company Agent'">
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

        <b-form-row class="mt-4"
                    :id="`${SettingsMap.can_modify_contact_ring_groups.hash_keyword}-container`"
                    v-if="isNotOwnSettings && user.role_name === 'Company Agent'">
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

        <b-form-row class="mt-4"
                    :id="`${SettingsMap.can_barge_and_whisper_on_call.hash_keyword}-container`"
                    v-if="isNotOwnSettings && user.role_name === 'Company Agent'">
          <b-col sm="12"
                 md="12">
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
      </template>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.has_broadcast_access.hash_keyword}-container`"
                  v-if="isNotOwnSettings && user.role_name === 'Company Agent' && !user.is_destination">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="
            form-label">Can Broadcast</h5>
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

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.can_delete_contact.hash_keyword}-container`"
                  v-if="isNotOwnSettings && user.role_name === 'Company Agent' && !user.is_destination">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="
            form-label">Delete Contact</h5>
            <p class="form-helper-text">Grant user the ability to delete a contact.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.can_delete_contact"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'can_delete_contact')">
              Can delete a contact
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row v-if="isAdminOrSupervisor && connectedCampaigns.length"
                  class="mt-4"
                  :id="`${SettingsMap.campaign_id.hash_keyword}-container`">
        <b-col sm="12"
               md="6">
          <div>
            <h5 class="form-label">User's Personal Line</h5>
          </div>

          <b-form-group label=""
                        class="mt-2">
            <user-campaign-selector v-model="user.campaign_id"
                                    :user="user"
                                    :disable="!isAdmin"
                                    @select="(eventPayload) => onUpdateFields(eventPayload, 'campaign_id')">
            </user-campaign-selector>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import AnswerTypeSelector from 'components/generic-selectors/answer-type-selector'
import UserCampaignSelector from 'components/generic-selectors/user-campaign-selector'
import LineSelector from 'components/generic-selectors/line-selector'
import * as AnswerTypes from 'src/constants/answer-types'
import * as Roles from 'src/constants/roles'
import {
  aclMixin,
  settingsMixin,
  kycMixin,
  simpsocialMixin
} from 'src/plugins/mixins'
import * as KycLogs from 'src/constants/kyc-logs'
import { mapActions, mapState } from 'vuex'
import SettingsMap from 'components/settings/settings-map'
import { required, maxLength, minLength, email, sameAs, helpers } from 'vuelidate/lib/validators'
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'profile',

  mixins: [
    aclMixin,
    settingsMixin,
    kycMixin,
    simpsocialMixin
  ],

  components: { UserCampaignSelector, AnswerTypeSelector, LineSelector, InformationCircleIcon },

  computed: {
    ...mapState(['campaigns', 'statics']),

    ...mapState('settings', ['userClone']),

    ...mapState('auth', ['profile']),

    userDestinationEditable () {
      return this.user.role_name && !this.user.read_only_access
    },

    isNotOwnSettings () {
      if (!this.profile) {
        return false
      }

      return this.hasRole(Roles.COMPANY_ADMIN) && +this.user.id !== +this.profile.id
    },

    canBeEdited () {
      return this.user.role_name && !this.user.read_only_access && !this.user.is_destination
    },

    requirePassword () {
      return this.showPasswordFields
    },

    connectedCampaigns () {
      return this.campaigns.filter((campaign) => {
        return campaign.user_id === this.user.id
      })
    },

    isCompanyKYCNotAbleToAddUser () {
      return this.profile?.company?.kyc_status !== KycLogs.KYC_STATUS_APPROVED
    }
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  validations () {
    const passwordCases = (pass) => !helpers.req(pass) || (/[a-z]/.test(pass) && /[A-Z]/.test(pass))
    const passwordDigit = (pass) => !helpers.req(pass) || /\d/.test(pass)

    return {
      user: {
        first_name: {
          required,
          maxLength: maxLength(191)
        },
        last_name: {
          required,
          maxLength: maxLength(191)
        },
        email: {
          required,
          email
        },
        phone_number: {
          validPhone: (value) => this.$options.filters.fixPhone(value) !== false
        },
        password: {
          minLength: minLength(8),
          passwordCases,
          passwordDigit
        },
        password_confirmation: {
          sameAsPassword: sameAs('password')
        },
        contact_card_name: {
          maxLength: maxLength(191)
        },
        company_contact_card_name: {
          maxLength: maxLength(191)
        }
      }
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
      Roles,
      SettingsMap,
      contactCardCampaignSelectorKey: 0,
      showPreviewContactCard: false,
      selectedNumberContactCard: '',
      showPreviewCompanyCard: false,
      selectedNumberCompanyCard: ''
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties', 'setFormValidity']),

    onUpdateFields (value, prop) {
      if (!['showPasswordFields'].includes(prop)) {
        this.user[prop] = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if (prop === 'showPasswordFields' && !value) {
        this.user.password = ''
        this.updateChangedUserProperties({
          name: 'password',
          value: ''
        })

        this.user.password_confirmation = ''
        this.updateChangedUserProperties({
          name: 'password_confirmation',
          value: ''
        })
      }

      // reset phone number when backup routing is disabled
      if (prop === 'phone_number_as_backup' && !this.user[prop]) {
        this.user.phone_number = this.userClone.phone_number
        this.updateChangedUserProperties({
          name: 'phone_number',
          value: this.userClone.phone_number
        })
      }

      this.updateFormValidity()
    },

    getInitials (name) {
      if (!name) return ''
      const words = name.split(' ')
      const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase())
      return initials.join('')
    },

    updateSelectedNumberContactCard (number) {
      this.selectedNumberContactCard = number
    },

    updateSelectedNumberCompanyCard (number) {
      this.selectedNumberCompanyCard = number
    }
  },

  mounted () {
    this.$VueEvent.listen('resetSettingsForm', () => {
      this.user.password = ''
      this.user.password_confirmation = ''
      this.showPasswordFields = false
    })
  },

  watch: {
    'showPasswordFields': function () {
      this.user.password = ''
      this.user.password_confirmation = ''
      this.updateFormValidity()
    },

    'connectedCampaigns': function () {
      this.$nextTick(() => {
        this.contactCardCampaignSelectorKey++
      })
    }
  }
}
</script>

<style scoped>
.contact-card-name {
  height: 39px;
}

.company-card-name {
  height: 39px;
}
</style>
