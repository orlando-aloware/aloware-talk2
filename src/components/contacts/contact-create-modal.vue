<template>
  <b-modal
    :id="id"
    size="lg"
    modal-class="confirm-dialog br-8"
    hide-header-close
    hide-header
    hide-footer
    ref="create-contact-modal"
    data-testid="contact-create-modal"
    @hidden="onReset">

    <div class="modal-body-wrapper">

        <b-form @submit.prevent="onSubmit" data-testid="contact-create-form">
          <h5 class="mb-4 section-header fs-24 text-bold _600 text-center">Create Contact</h5>

          <div class="scrollable p-2">
            <b-form-row class="mt-2" data-testid="contact-create-row">
              <b-col sm="12" md="6">
                <b-form-group label="First Name">
                  <b-form-input
                    type="text"
                    placeholder="John"
                    ref="first_name"
                    autofocus
                    :state = "validateState('first_name')"
                    data-testid="contact-create-first-name-input"
                    v-model.trim="$v.contact.first_name.$model">
                  </b-form-input>
                  <b-form-invalid-feedback v-if="!$v.contact.first_name.required">First name is required</b-form-invalid-feedback>
                  <b-form-invalid-feedback v-if="!$v.contact.first_name.maxLength">First name must not exceed 191 characters</b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <b-col sm="12" md="6">
                <b-form-group label="Last Name">
                  <b-form-input
                    type="text"
                    placeholder="Doe"
                    ref="first_name"
                    :state = "validateState('last_name')"
                    data-testid="contact-create-last-name-input"
                    v-model.trim="$v.contact.last_name.$model">
                  </b-form-input>
                  <b-form-invalid-feedback v-if="!$v.contact.first_name.required">Last name is required</b-form-invalid-feedback>
                  <b-form-invalid-feedback v-if="!$v.contact.first_name.maxLength">Last name must not exceed 191 characters</b-form-invalid-feedback>
                </b-form-group>
              </b-col>
            </b-form-row>

            <b-form-row class="mt-2">
              <b-col sm="12" md="6">
                <b-form-group label="Phone Number">
                  <b-form-input
                    type="text"
                    placeholder="+18185005050"
                    ref="phone_number"
                    :state="validateState('phone_number')"
                    data-testid="contact-create-phone-number-input"
                    v-model.trim="$v.contact.phone_number.$model">
                  </b-form-input>
                  <b-form-invalid-feedback v-if="!$v.contact.phone_number.validPhone">Enter valid phone number</b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <b-col sm="12" md="6">
                <b-form-group label="Email Address (Optional)">
                  <b-form-input
                    type="text"
                    placeholder="e.g. john.doe@email.com"
                    ref="email"
                    :state = "validateState('email')"
                    data-testid="contact-create-email-input"
                    v-model.trim="$v.contact.email.$model">
                  </b-form-input>
                  <b-form-invalid-feedback v-if="!$v.contact.email.email">Enter a valid email address</b-form-invalid-feedback>
                </b-form-group>
              </b-col>
            </b-form-row>
            <b-form-row class="mt-2">
              <b-col sm="12" md="6">
                <b-form-group
                  label="Initial Line (Optional)"
                  class="form-label">
                  <line-selector v-model="contact.initial_campaign_id"
                                 :multiple="false"
                                 :use-chips="false"
                                 :generic-styling="false"
                                 :generic-multiselect="false"
                                 data-testid="contact-create-initial-line-selector"
                                 @change="onLineSelected">
                  </line-selector>
                </b-form-group>
              </b-col>

              <b-col sm="12"
                     md="6">
                <b-form-group class="form-label"
                              label="Owner (Optional)">
                  <user-selector v-model="contact.user_id"
                                 :generic-styling="false"
                                 :multiple="false"
                                 :use-chips="false"
                                 data-testid="contact-create-owner-selector"
                                 @change="onUserSelected">
                  </user-selector>
                </b-form-group>
              </b-col>
            </b-form-row>
            <b-form-row class="mt-2">
              <b-col md="12">
                <b-form-group
                  label="Tags (Optional)"
                  class="form-label">
                  <entity-tags data-testid="contact-create-tag-selector"
                               entity="contact"
                               entity-type="contacts"
                               placeholder="Type to search tags"
                               :dense="true"
                               :category="TagCategories.CAT_CONTACTS"
                               :is-filter="true"
                               :filter-values="contact.tag_ids"
                               :filter-values-objects="appliedTags"
                               @filter="onTagsSelected"/>
                </b-form-group>
              </b-col>
            </b-form-row>
          </div>
          <div class="p-2">
            <b-form-row class="mt-2">
              <b-col sm="12"
                     md="6">
                <b-button block
                          class="btn-grey-80"
                          data-testid="contact-create-hide-modal-button"
                          @click="hideModal">
                  Cancel
                </b-button>
              </b-col>

              <b-col sm="12"
                     md="6">
                <b-button block
                          type="submit"
                          variant="primary"
                          data-testid="contact-create-submit-button"
                          :disabled="isCreating">
                  <q-spinner-bars v-if="isCreating" color="white" />
                  {{ isCreating ? 'Saving Contact...' : 'Save' }}
                </b-button>
              </b-col>
            </b-form-row>
          </div>
        </b-form>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from 'vuex'
import { formValidationMixin } from 'src/plugins/mixins'
import LineSelector from 'components/generic-selectors/line-selector'
import UserSelector from 'components/generic-selectors/user-selector'
import EntityTags from 'components/generic-selectors/entity-tags'
import talk2Api from 'src/plugins/api/api'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'

import { required, maxLength, email } from 'vuelidate/lib/validators'
export default {
  name: 'contact-create-modal',

  mixins: [ formValidationMixin ],

  props: {
    id: {
      type: String,
      default: 'create-contact-modal'
    }
  },

  components: {
    UserSelector,
    LineSelector,
    EntityTags
  },

  computed: {
    ...mapState('contacts', ['selectedList', 'lists']),
    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.contact.phone_number)
    },
    invalidPhoneNumber () {
      return 'Enter a valid phone number'
    }
  },

  validations () {
    return {
      contact: {
        first_name: {
          required,
          maxLength: maxLength(191)
        },
        last_name: {
          required,
          maxLength: maxLength(191)
        },
        phone_number: {
          validPhone: (value) => this.$options.filters.fixPhone(value) !== false && value.length > 0
        },
        email: {
          email
        }
      }
    }
  },

  data () {
    return {
      contact: {
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        initial_campaign_id: null,
        user_id: null,
        tag_ids: []
      },
      isCreating: false,
      isDupeContact: false,
      createdContact: null,
      appliedTags: [],
      TagCategories
    }
  },

  methods: {

    validateState (input) {
      const { $dirty, $error } = this.$v.contact[input]
      return $dirty ? !$error : null
    },

    hideModal () {
      this.$refs['create-contact-modal'].hide()
    },

    onReset () {
      this.contact = {
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        initial_campaign_id: null,
        user_id: null,
        tag_ids: []
      }

      this.appliedTags = []
      this.isDupeContact = false
      this.$v.contact.$reset()
    },

    onSubmit () {
      this.$v.$touch()
      if (this.$v.$invalid || !this.validPhoneNumber) {
        return
      }
      this.isCreating = true
      this.isDupeContact = false
      return talk2Api.V1.contact.create(this.contact)
        .then(res => {
          if (!res.data.is_newly_added) {
            this.isCreating = false
            return this.notifyForExistingContact(res.data)
          }
          this.$VueEvent.fire('fetchContacts', { clear: true })
          if (!['my-contacts', 'unassigned'].includes(this.selectedList.id)) {
            this.$VueEvent.fire('getListCount', this.contact.user_id ? this.lists['my-contacts'] : this.lists['unassigned'])
          }

          this.$generalNotification('Contact created.')
          this.$emit('created', res.data)
          this.onReset()
          this.isCreating = false
          this.hideModal()
        })
        .catch(err => {
          this.isCreating = false
          this.$handleErrors(err.response)
        })
    },

    onLineSelected (lineId) {
      this.contact.initial_campaign_id = lineId
    },

    onUserSelected (userId) {
      this.contact.user_id = userId
    },

    onTagsSelected (tags, tagsObjects) {
      this.contact.tag_ids = tags
      this.appliedTags = tagsObjects
    },
    notifyForExistingContact (contact) {
      const h = this.$createElement
      const titleVNode = h('div', { domProps: { innerHTML: 'This contact\'s phone number already exists and is assigned to an existing contact, <b>' + contact.name + '</b>.<br><br> This contact requires a unique phone number.' } })

      this.$bvModal.msgBoxConfirm([titleVNode], {
        title: 'Phone Number Already Exists',
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'primary',
        okTitle: 'Open ' + contact.name,
        cancelTitle: 'Go back',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: false
      }).then(value => {
        if (value) {
          this.onReset()
          this.hideModal()
          this.$router.push({
            name: 'Contact',
            params: {
              id: contact.id
            }
          })
        }
      }).catch(err => {
        // An error occurred
        console.log(err)
      })
    }
  }
}
</script>
