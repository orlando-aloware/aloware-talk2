<template>
  <div>
    <step-header title="Your Business"
                 :description="headerDescription"
                 :class="shouldShowActionButtons ? 'q-pt-xl q-mx-6' : ''" />

    <div class="business-information__container min-w-100"
         :class="shouldShowActionButtons ? 'overflow-auto q-pt-xl q-pb-xl' : ''">

      <input-group>
        <template v-slot:content>
          <input-field label="Business Legal Name"
                       placeholder="Aloware Inc."
                       ref="legal_name-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('legal_name')]"
                       v-model="form.legal_name"
                       @input="cleanFieldError('legal_name')" />

          <div class="col-5 pr-0 pl-0">
            <select-field label="Business Type"
                          option-label="value"
                          option-value="value"
                          col-md="col-md-12"
                          ref="business_type-input"
                          :rules="[validateFieldError('business_type')]"
                          :paddingClasses="isLargeScreen ? 'q-pr-0 q-pl-0' : ''"
                          :options="businessTypes"
                          v-model="form.business_type" />
            <div class="flex items-center"
                 :class="validateFieldError('business_type') ? '' : 'negative-top'">
              <label class="flex mb-1 text-weight-bold pl-3 pr-4">
                Company Status
              </label>
              <q-btn-toggle class="toggle-border"
                            toggle-color="primary"
                            color="white"
                            text-color="#4F4F4F"
                            spread
                            no-caps
                            unelevated
                            dense
                            rounded
                            :options="[
                              { label: 'Private', value: 1 },
                              { label: 'Public', value: 2 }
                            ]"
                            v-model="form.company_status" />
            </div>
          </div>
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <select-field label="Business ID Type"
                        option-label="label"
                        option-value="value"
                        ref="business_registration_identifier-input"
                        :rules="[validateFieldError('business_registration_identifier')]"
                        :paddingClasses="paddingRightClasses"
                        :options="businessIdTypes"
                        v-model="form.business_registration_identifier" />

          <input-field label="Business Registration Number"
                       placeholder="Ex: C1234567"
                       ref="business_registration_number-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('business_registration_number')]"
                       v-model="form.business_registration_number"
                       @input="cleanFieldError('business_registration_number')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <select-field label="Region of Operation"
                        option-label="label"
                        option-value="value"
                        ref="business_regions_of_operation-input"
                        :rules="[validateFieldError('business_regions_of_operation')]"
                        :paddingClasses="paddingRightClasses"
                        :options="regionsOfOperations"
                        v-model="form.business_regions_of_operation" />

          <input-field label="Website URL"
                       placeholder="Ex: yourcompany.com"
                       ref="website_url-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('website_url')]"
                       v-model="form.website_url"
                       @input="cleanFieldError('website_url')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <select-field label="Business Industry"
                        option-label="name"
                        option-value="value"
                        ref="business_industry-input"
                        :rules="[validateFieldError('business_industry')]"
                        :paddingClasses="paddingRightClasses"
                        :options="businessIndustries"
                        v-model="form.business_industry" />

          <div class="col-5"
               v-if="isLargeScreen" />
        </template>
      </input-group>

      <div class="flex justify-center  pt-4 q-row">
        <div class="col-xs-12 col-md-5 q-pl-none q-pr-none q-lg-pl-4">
          <h4 class="text-h5 text-weight-bold">Business Address</h4>
        </div>
        <div class="col-5" />
      </div>

      <input-group>
        <template v-slot:content>
          <input-field label="Street"
                       placeholder="Ex: Fifth Avenue"
                       col-md="col-md-10"
                       ref="street-input"
                       :paddingClasses="paddingRightClasses"
                       :rules="[validateFieldError('street')]"
                       v-model="form.street"
                       @input="cleanFieldError('street')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <input-field label="State/Province/Region"
                       placeholder="Ex: California"
                       ref="region-input"
                       :paddingClasses="paddingRightClasses"
                       :rules="[validateFieldError('region')]"
                       v-model="form.region"
                       @input="cleanFieldError('region')" />

          <input-field label="City"
                       placeholder="Ex: Los Angeles"
                       ref="city-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('city')]"
                       v-model="form.city"
                       @input="cleanFieldError('city')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <select-field label="Legal Country"
                        placeholder="Ex: United States"
                        option-label="name"
                        option-value="id"
                        ref="legal_country-input"
                        :rules="[validateFieldError('legal_country')]"
                        :paddingClasses="paddingLeftClasses"
                        :options="countries"
                        v-model="form.legal_country" />

          <input-field label="Postal Code"
                       placeholder="Ex: 11223"
                       ref="postal_code-input"
                       bottom-slots
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('postal_code')]"
                       v-model="form.postal_code"
                       @input="cleanFieldError('postal_code')">
            <template v-slot:hint
                      v-if="form.postal_code.length">
              <div class="zipcode-hint"
                   :class="validateFieldError('postal_code') ? 'negative-top' : ''">
                <q-icon class="q-mr-xs"
                        :class="getZipCodeRuleClass(validateZipCode(form.postal_code))"
                        :name="iconForValidation(validateZipCode(form.postal_code))">
                </q-icon>
                  {{
                    validateZipCode(form.postal_code)
                      ? 'The Postal Code is valid'
                      : 'Please enter a valid Postal Code'
                  }}
              </div>
            </template>
          </input-field>
        </template>
      </input-group>

      <div class="flex justify-center  pt-4 q-row">
        <div class="col-xs-12 col-md-5 q-pl-none q-pr-none q-lg-pl-4">
          <h4 class="text-h5 text-weight-bold">Authorized Representative Information</h4>
        </div>
        <div class="col-5" />
      </div>

      <input-group>
        <template v-slot:content>
          <input-field label="First Name"
                       placeholder="Type here"
                       ref="auth_rep_first_name-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('auth_rep_first_name')]"
                       v-model="form.auth_rep_first_name"
                       @input="cleanFieldError('auth_rep_first_name')" />

          <input-field label="Last Name"
                       placeholder="Type here"
                       ref="auth_rep_last_name-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('auth_rep_last_name')]"
                       v-model="form.auth_rep_last_name"
                       @input="cleanFieldError('auth_rep_last_name')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <input-field label="Email"
                       placeholder="email@domain.com"
                       type="email"
                       ref="auth_rep_email-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateEmail, validateFieldError('auth_rep_email')]"
                       v-model="form.auth_rep_email"
                       @input="cleanFieldError('auth_rep_email')" />

          <phone-number-field label="Phone Number"
                              placeholder="222 333 4444"
                              ref="auth_rep_phone_number-input"
                              :paddingClasses="paddingLeftClasses"
                              :rules="[validatePhoneNumber, validateFieldError('auth_rep_phone_number')]"
                              v-model="form.auth_rep_phone_number"
                              @input="cleanFieldError('auth_rep_phone_number')" />
        </template>
      </input-group>

      <input-group>
        <template v-slot:content>
          <input-field label="Business Title"
                       placeholder="Type here"
                       ref="auth_rep_business_title-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('auth_rep_business_title')]"
                       v-model="form.auth_rep_business_title"
                       @input="cleanFieldError('auth_rep_business_title')" />

          <input-field label="Job Position"
                       placeholder="Ex. CEO, CTO, Product Director"
                       ref="auth_rep_job_position-input"
                       :paddingClasses="paddingLeftClasses"
                       :rules="[validateFieldError('auth_rep_job_position')]"
                       v-model="form.auth_rep_job_position"
                       @input="cleanFieldError('auth_rep_job_position')" />
        </template>
      </input-group>
    </div>

    <div class="business-information-actions"
         v-if="shouldShowActionButtons">
      <div class="flex justify-end w-100 pt-4">
        <div>
          <q-btn class="q-mr-xs account-registration-action-btn"
                 color="#62666E"
                 size="md"
                 label="Skip for now"
                 rounded
                 dense
                 no-caps
                 unelevated
                 flat
                 @click="skipForNow" />

          <q-btn class="q-mr-xl account-registration-action-btn"
                 color="primary"
                 size="md"
                 label="Next"
                 rounded
                 dense
                 no-caps
                 unelevated
                 :disabled="isNextButtonDisabled"
                 @click="onSubmit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { maskMixin } from 'src/plugins/mixins'
import StepHeader from 'src/components/account-registration/step-header.vue'
import InputGroup from 'src/components/account-registration/input-group.vue'
import InputField from 'src/components/account-registration/input-field.vue'
import SelectField from 'src/components/account-registration/select-field.vue'
import PhoneNumberField from 'src/components/account-registration/phone-number-field.vue'
import businessTypes from '../../constants/account-registration-business-types'
import businessIdTypes from '../../constants/account-registration-business-registration-identifiers'
import regionsOfOperations from '../../constants/account-registration-business-regions-of-operations'
import businessIndustries from '../../constants/account-registration-business-industries'

export default {
  name: 'BusinessInformationForm',

  mixins: [maskMixin],

  components: {
    StepHeader,
    InputGroup,
    InputField,
    SelectField,
    PhoneNumberField
  },

  props: {
    shouldShowActionButtons: {
      type: Boolean,
      default: false
    },

    isLoading: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      businessTypes,
      businessIdTypes,
      regionsOfOperations,
      businessIndustries
    }
  },

  computed: {
    ...mapState('accountRegistration', [
      'form',
      'fieldErrors'
    ]),

    isLargeScreen () {
      return this.$q.screen.width > 767
    },

    paddingLeftClasses () {
      return this.isLargeScreen ? 'q-pl-4' : ''
    },

    paddingRightClasses () {
      return this.isLargeScreen ? 'q-pr-4' : ''
    },

    countries () {
      const countries = window.CountriesAndTimezones.getAllCountries()

      // first exclude US & CA, and then extract only id, name fields of the countries
      const countriesArr = Object.values(countries)
        .filter(({ id }) => id !== 'US' && id !== 'CA')
        .map(({ id, name }) => {
          return { id, name }
        })

      // add US & CA to the top and return
      return [
        { id: 'US', name: 'United States' },
        { id: 'CA', name: 'Canada' },
        ...countriesArr
      ]
    },

    phoneMask () {
      return this.getMaskByCountry(this.form.auth_rep_phone_number)
    },

    headerDescription () {
      return !this.shouldShowActionButtons
        ? 'Great! Now, we need important information to verify your business.'
        : 'Welcome back! We need important information to verify your business.'
    },

    isNextButtonDisabled () {
      return !this.validateFieldsFilled() || this.isLoading
    }
  },

  methods: {
    ...mapActions('accountRegistration', [
      'cleanFieldError'
    ]),

    getZipCodeRuleClass (rule) {
      return rule ? 'text-green' : 'text-red'
    },

    verifyFieldErrors () {
      this.$nextTick(() => {
        Object.keys(this.fieldErrors).forEach(field => {
          const fieldRef = `${field}-input`

          if (this.$refs[fieldRef] && this.$refs[fieldRef].validate) {
            this.$refs[fieldRef].validate()
          }
        })
      })
    },

    validateFieldError (fieldName) {
      return () => {
        if (this.fieldErrors && this.fieldErrors[fieldName]) {
          return this.fieldErrors[fieldName][0]
        }
        return true
      }
    },

    validateFieldsFilled () {
      return (
        this.form.legal_name.length &&
        this.form.business_type &&
        this.form.business_registration_identifier &&
        this.form.business_registration_number.length &&
        this.form.business_regions_of_operation &&
        this.form.business_industry &&
        this.form.website_url.length &&
        this.form.street.length &&
        this.form.region.length &&
        this.form.city.length &&
        this.form.legal_country &&
        this.validateZipCode(this.form.postal_code) &&
        this.form.auth_rep_first_name.length &&
        this.form.auth_rep_last_name.length &&
        this.validateEmail(this.form.auth_rep_email) === true &&
        this.validatePhoneNumber(this.form.auth_rep_phone_number) === true &&
        this.form.auth_rep_business_title &&
        this.form.auth_rep_job_position
      )
    },

    validateZipCode (zip) {
      const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/

      return zipRegex.test(zip)
    },

    validatePhoneNumber (phone) {
      const cleanedPhone = phone.replace(/[^\d]/g, '')
      const formattedPhone = this.$options.filters.fixPhone(cleanedPhone, 'E164', true)

      if (!formattedPhone || formattedPhone === cleanedPhone || formattedPhone === '-') {
        return 'Invalid phone number'
      }

      return true
    },

    validateEmail (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      return emailRegex.test(email) || 'Invalid email address'
    },

    iconForValidation (isValid) {
      return isValid ? 'check' : 'close'
    },

    backToDashboard () {
      this.$emit('back-to-dashboard')
    },

    skipForNow () {
      this.$emit('skip-for-now')
    },

    onSubmit () {
      this.$emit('submit', this.form)
    }
  },

  mounted () {
    this.verifyFieldErrors()
  }
}
</script>
