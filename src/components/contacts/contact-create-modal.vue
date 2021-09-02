<template>
  <b-modal
    id="create-contact-modal"
    size="lg"
    modal-class="confirm-dialog br-8"
    hide-header-close
    hide-header
    hide-footer
    ref="create-contact-modal"
    @hidden="onReset">

    <div class="modal-body-wrapper">

        <b-form @submit.prevent="onSubmit">
          <h5 class="mb-4 section-header fs-24 text-bold _600 text-center">Create Contact</h5>

          <div class="scrollable p-2">
            <b-form-row class="mt-2">
              <b-col sm="12" md="6">
                <b-form-group label="First Name">
                  <b-form-input
                    type="text"
                    placeholder="First Name"
                    ref="first_name"
                    required
                    autofocus
                    v-model="contact.first_name">
                  </b-form-input>
                </b-form-group>
              </b-col>

              <b-col sm="12" md="6">
                <b-form-group label="Last Name">
                  <b-form-input
                    type="text"
                    placeholder="Last Name"
                    ref="first_name"
                    required
                    v-model="contact.last_name">
                  </b-form-input>
                </b-form-group>
              </b-col>
            </b-form-row>
            <b-form-row class="mt-2">
              <b-col sm="12" md="6">
                <b-form-group label="Phone Number"
                              :invalid-feedback="invalidPhoneNumber"
                              :state="validPhoneNumber">
                  <b-form-input
                    type="text"
                    placeholder="Phone Number"
                    ref="phone_number"
                    required
                    v-model="contact.phone_number"
                  ></b-form-input>
                </b-form-group>
              </b-col>

              <b-col sm="12" md="6">
                <b-form-group label="Email Address (Optional)">
                  <b-form-input
                    type="text"
                    placeholder="Email Address"
                    ref="email"
                    v-model="contact.email"
                  ></b-form-input>
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
                  <tag-selector :multiple="true"
                                v-model="contact.tag_ids"
                                @change="onTagsSelected">
                  </tag-selector>
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
                          @click="hideModal">
                  Cancel
                </b-button>
              </b-col>

              <b-col sm="12"
                     md="6">
                <b-button block
                          type="submit"
                          variant="primary">
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
import TagSelector from 'components/generic-selectors/tag-selector'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-create-modal',

  mixins: [ formValidationMixin ],

  components: { UserSelector, LineSelector, TagSelector },

  computed: {
    ...mapState('inbox', ['channelChangedFilterFields']),
    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phone_number) !== false
    },
    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
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
      rules: {
        first_name: [
          {
            validator: this.firstNameValidator,
            trigger: 'blur'
          }
        ],
        last_name: [
          {
            validator: this.lastNameValidator,
            trigger: 'blur'
          }
        ],
        phone_number: [
          {
            validator: this.phoneValidator,
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: false,
            message: 'Please provide an email address',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: 'Please provide correct email address',
            trigger: 'blur'
          }
        ]
      },
      isCreating: false
    }
  },

  methods: {
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
    },

    onSubmit () {
      this.isCreating = true
      return talk2Api.V1.contact.create(this.contact).then(res => {
        this.$emit('created', res.data)
        this.onReset()
        this.isCreating = false
        this.hideModal()
      })
    },

    onLineSelected (lineId) {
      this.contact.initial_campaign_id = lineId
    },

    onUserSelected (userId) {
      this.contact.user_id = userId
    },

    onTagsSelected (tags) {
      this.contact.tag_ids = tags
    }
  }
}
</script>
