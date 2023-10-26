<template>
  <div class="account-registration row">
    <div class="col-xl-8 col-md-12 col-sm-12">
      <div class="absolute-top q-pt-xl q-px-xl">
        <img
          src="app-icons/menu/logo_dark.svg"
          alt="Logo"
        />
      </div>
      <div class="stepper__container">
        <q-stepper
          class="q-pl-lg-xl q-pt-lg"
          color="primary"
          ref="stepper"
          alternative-labels
          animated
          flat
          v-model="step"
        >
          <q-step
            title="Your Information"
            prefix="1"
            :name="1"
            :done="step > 1"
          >
            <step-header
              title="Welcome to Aloware!"
              description="We are thrilled for you to better communicate with your customers today. In these 4 simple steps, we need important information to get you going"
            />

            <div class="stepper__content">
              <div class="min-w-100">
                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="First Name"
                      placeholder="Type your first name"
                      ref="first_name-input"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :rules="[validateFieldError('first_name')]"
                      v-model="form.first_name"
                      @input="cleanFieldError('first_name')"
                    >
                      <template v-slot:hint v-if="fieldErrors.first_name">
                        {{ fieldErrors.first_name[0] }}
                      </template>
                    </input-field>

                    <input-field
                      label="Last Name"
                      placeholder="Type your last name"
                      ref="last_name-input"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      :rules="[validateFieldError('last_name')]"
                      v-model="form.last_name"
                      @input="cleanFieldError('last_name')"
                    >
                      <template v-slot:hint v-if="fieldErrors.last_name">
                        <span>{{ fieldErrors.last_name[0] }}</span>
                      </template>
                    </input-field>
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="Email Address"
                      placeholder="youremail@domain.com"
                      type="email"
                      ref="email-input"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :rules="[validateEmail, validateFieldError('email')]"
                      v-model="form.email"
                      @input="cleanFieldError('email')"
                    />

                    <phone-number-field
                      label="Phone Number"
                      placeholder="222 333 4444"
                      ref="phone_number-input"
                      :rules="[validatePhoneNumber, validateFieldError('phone_number')]"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.phone_number"
                      @input="cleanFieldError('phone_number')"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <!-- <input-field
                      label="Job Title"
                      placeholder="Ex. CEO, CTO, Product Director"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.job_title"
                    /> -->

                    <select-field
                      label="Country"
                      placeholder="Ex: United States"
                      option-label="name"
                      option-value="id"
                      ref="country-input"
                      :rules="[validateFieldError('country')]"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      :options="countries"
                      v-model="form.country"
                    />

                    <input-field
                      label="Business Name"
                      placeholder="Ex. Aloware Inc."
                      ref="company_name-input"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :rules="[validateFieldError('company_name')]"
                      v-model="form.company_name"
                      @input="cleanFieldError('company_name')"
                    />
                  </template>
                </input-group>

                <div class="flex justify-center pt-4 q-row">
                  <div class="col-xs-12 col-md-5 q-pl-none q-pr-none q-lg-pl-4">
                    <h4 class="text-h5 text-weight-bold">Password</h4>
                  </div>
                  <div class="col-5" />
                </div>

                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="Create a Password"
                      placeholder="Type here"
                      ref="password-input"
                      is-password
                      :rules="[validateFieldError('password')]"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.password"
                      @input="cleanFieldError('password')"
                    >
                      <template
                        v-slot:hint
                        v-if="form.password">
                        <ul class="text-left pl-2 text-weight-regular password-hint"
                            :class="validateFieldError('password') ? 'negative-top' : ''">
                          <li>
                            <q-icon
                              class="q-mr-xs"
                              :class="getPasswordRuleClass(validatePasswordLength(form.password))"
                              :name="iconForValidation(validatePasswordLength(form.password))"
                            >
                            </q-icon>
                            8 characters long
                          </li>
                          <li>
                            <q-icon
                              class="q-mr-xs"
                              :class="getPasswordRuleClass(validatePasswordCases(form.password))"
                              :name="iconForValidation(validatePasswordCases(form.password))"
                            >
                            </q-icon>
                            Must contain upper and lower case letters
                          </li>
                          <li>
                            <q-icon
                              class="q-mr-xs"
                              :class="getPasswordRuleClass(validatePasswordDigit(form.password))"
                              :name="iconForValidation(validatePasswordDigit(form.password))"
                            >
                            </q-icon>
                            Include at least one numerical digit
                          </li>
                        </ul>
                      </template>
                    </input-field>

                    <input-field
                      label="Repeat your Password"
                      placeholder="Type your password again"
                      is-password
                      v-model="form.password_confirmation"
                    >
                      <template
                        v-slot:hint
                        v-if="form.password.length > 0">
                        <ul class="text-left pl-2 text-weight-regular password-hint">
                          <li>
                            <q-icon
                              class="q-mr-xs"
                              :class="getPasswordRuleClass(validatePasswordMatch(form.password_confirmation))"
                              :name="iconForValidation(validatePasswordMatch(form.password_confirmation))"
                            >
                            </q-icon>
                            {{
                              validatePasswordMatch(form.password_confirmation)
                                ? 'The passwords match'
                                : "The passwords doesn't match"
                            }}
                          </li>
                        </ul>
                      </template>
                    </input-field>
                  </template>
                </input-group>
              </div>
            </div>
          </q-step>

          <q-step
            title="Your Business"
            prefix="2"
            :name="2"
            :done="step > 2">
            <div class="business-information__form">
              <business-information-form/>
            </div>
          </q-step>

          <q-step
            title="Confirmation"
            prefix="3"
            :name="3"
            :done="isSubmitted">
            <div class="min-h-60 flex items-center">
              <div v-if="!isSubmitted">
                <step-header
                  title="Confirmation"
                  description="Please read our Terms and Conditions before proceeding. By checking the boxes below, you indicate that you have read, understood, and agree to the Terms and Conditions."
                />
                <div class="q-mt-xl q-mb-xl">
                  <a class="text-primary text-weight-bold text-h5"
                     href="https://aloware.com/terms-and-conditions"
                     target="_blank"
                     rel="noopener noreferrer">
                     Terms and conditions, and Acceptable Use Policy
                  </a>
                </div>

                <div class="accept-box">
                  <div>
                    <q-checkbox
                      class="mb-4 pl-2"
                      color="primary"
                      label="I agree to Terms and Conditions, and Acceptable Use Policy."
                      dense
                      v-model="form.agreed_to_terms"
                    />
                    <div
                      id="recaptcha-element"
                      class="g-recaptcha pb-2"/>
                  </div>
                </div>
              </div>
              <div v-else>
                <step-header
                  title="Success!"
                  description="Your information has been submitted. Please check your email for further instructions."/>
              </div>
            </div>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation
              v-if="(step === 1 || step === 2 || step === 3) && !isSubmitted"
              class="flex w-100"
              :class="{
                'justify-end': step === 1,
                'justify-between': step > 1
              }"
            >
              <q-btn
                class="q-mx-xl account-registration-action-btn"
                color="primary"
                label="Back"
                size="md"
                outline
                dense
                rounded
                no-caps
                unelevated
                v-if="step > 1"
                @click="$refs.stepper.previous()"
              />
              <div>
                <q-btn
                  class="q-mr-xs account-registration-action-btn"
                  color="#62666E"
                  size="md"
                  label="Skip for now"
                  rounded
                  dense
                  no-caps
                  unelevated
                  flat
                  v-if="step === 2"
                  @click="skipForNow()"
                />
                <q-btn
                  class="q-mr-xl account-registration-action-btn"
                  color="primary"
                  size="md"
                  label="Next"
                  rounded
                  dense
                  no-caps
                  unelevated
                  :disabled="isNextButtonDisabled"
                  v-if="step < 3"
                  @click="nextStep"
                />
              </div>

              <q-btn
                class="q-mx-xl account-registration-action-btn"
                color="primary"
                size="md"
                label="Create my Account"
                rounded
                dense
                no-caps
                unelevated
                :disabled="isNextButtonDisabled"
                v-if="step === 3"
                @click="onSubmit"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </div>
    </div>
    <banner :current-step="step" />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { guestMixin, recaptchaMixin, maskMixin } from 'src/plugins/mixins'
import businessTypes from '../../constants/account-registration-business-types'
import businessIdTypes from '../../constants/account-registration-business-registration-identifiers'
import regionsOfOperations from '../../constants/account-registration-business-regions-of-operations'
import businessIndustries from '../../constants/account-registration-business-industries'
import StepHeader from 'src/components/account-registration/step-header.vue'
import InputGroup from 'src/components/account-registration/input-group.vue'
import InputField from 'src/components/account-registration/input-field.vue'
import SelectField from 'src/components/account-registration/select-field.vue'
import PhoneNumberField from 'src/components/account-registration/phone-number-field.vue'
import BusinessInformationForm from 'src/components/account-registration/business-information-form.vue'
import Banner from 'src/components/account-registration/banner.vue'

export default {
  name: 'account-registration',

  components: {
    StepHeader,
    InputGroup,
    InputField,
    SelectField,
    PhoneNumberField,
    BusinessInformationForm,
    Banner
  },

  mixins: [
    guestMixin,
    recaptchaMixin,
    maskMixin
  ],

  data () {
    return {
      step: 1,
      password_validation: [],
      show_password: false,
      isSubmitted: false,
      isLoading: false,
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

    ...mapGetters('accountRegistration', ['getBusinessInformationFieldsValue']),

    isNextButtonDisabled () {
      return (this.step === 1 && !this.validateFirstStepFieldsFilled()) ||
        (this.step === 2 && !this.validateSecondStepFieldsFilled()) ||
        (this.step === 3 && (this.disabledSubmit || !this.form.agreed_to_terms)) ||
        this.isLoading
    },

    isLargeScreen () {
      return this.$q.screen.width > 767
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
    }
  },

  watch: {
    'form.password' () {
      this.validateAllPasswordRules()
    },

    'form.password_confirmation' () {
      this.validateAllPasswordRules()
    },

    step (newStep) {
      if (newStep === 3 && !this.$q.platform.is.electron) {
        this.initRecaptcha()
      }

      if (newStep === 1 || newStep === 2) {
        this.verifyFieldErrors()
      }
    }
  },

  methods: {
    ...mapActions('accountRegistration', [
      'setBusinessInformationFieldsEmpty',
      'setKycFilled',
      'setFieldErrors',
      'cleanFieldError'
    ]),

    updateValidationState (rule, isValid) {
      const index = this.password_validation.indexOf(rule)
      if (isValid && index === -1) {
        this.password_validation.push(rule)
      } else if (!isValid && index !== -1) {
        this.password_validation.splice(index, 1)
      }
    },

    verifyFieldErrors () {
      this.$nextTick(() => {
        Object.keys(this.fieldErrors).forEach(field => {
          const fieldRef = `${field}-input`

          if (this.$refs[fieldRef]) {
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

    moveToStepWithFieldErrors () {
      const stepFieldsReference = {
        first_name: 1,
        last_name: 1,
        email: 1,
        phone_number: 1,
        company_name: 1,
        job_title: 1,
        password: 1,
        password_confirmation: 1,
        legal_name: 2,
        business_type: 2,
        business_registration_identifier: 2,
        business_registration_number: 2,
        business_regions_of_operation: 2,
        business_industry: 2,
        website_url: 2,
        street: 2,
        region: 2,
        city: 2,
        legal_country: 2,
        postal_code: 2,
        auth_rep_first_name: 2,
        auth_rep_last_name: 2,
        auth_rep_email: 2,
        auth_rep_phone_number: 2,
        auth_rep_business_title: 2,
        auth_rep_job_position: 2
      }

      const step = stepFieldsReference[Object.keys(this.fieldErrors)[0]]
      this.$refs.stepper.goTo(step)
    },

    validateEmail (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email) || 'Invalid email address'
    },

    validatePhoneNumber (phone) {
      const cleanedPhone = this.getCleanedPhoneNumber(phone)
      const formattedPhone = this.$options.filters.fixPhone(cleanedPhone, 'E164', true)

      if (!formattedPhone || formattedPhone === cleanedPhone || formattedPhone === '-') {
        return 'Invalid phone number'
      }
      return true
    },

    getCleanedPhoneNumber (phone) {
      return phone.replace(/[^\d]/g, '')
    },

    validateAllPasswordRules () {
      this.updateValidationState('length', this.validatePasswordLength(this.form.password))
      this.updateValidationState('cases', this.validatePasswordCases(this.form.password))
      this.updateValidationState('digit', this.validatePasswordDigit(this.form.password))
      this.updateValidationState('match', this.validatePasswordMatch(this.form.password_confirmation))
    },

    validateZipCode (zip) {
      const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/
      return zipRegex.test(zip)
    },

    iconForValidation (isValid) {
      return isValid ? 'check' : 'close'
    },

    validatePasswordLength (val) {
      return val.length >= 8
    },

    validatePasswordCases (val) {
      return /[a-z]/.test(val) && /[A-Z]/.test(val)
    },

    validatePasswordDigit (val) {
      return /\d/.test(val)
    },

    validatePasswordMatch (val) {
      return val === this.form.password
    },

    validateFirstStepFieldsFilled () {
      return (
        this.form.first_name.length &&
        this.form.last_name.length &&
        this.validateEmail(this.form.email) === true &&
        this.validatePhoneNumber(this.form.phone_number) === true &&
        this.form.country &&
        this.form.company_name.length &&
        // this.form.job_title.length &&
        this.form.password.length &&
        this.form.password_confirmation.length &&
        this.password_validation.length === 4
      )
    },

    validateSecondStepFieldsFilled () {
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

    getPasswordRuleClass (rule) {
      return rule ? 'text-green' : 'text-red'
    },

    setTimezone () {
      // const country = this.form.legal_country
      // const timezone = window.CountriesAndTimezones.getTimezonesForCountry(country.id)[0]
      // this.form.timezone = timezone.name

      const timezone = 'Intl' in window ? new Intl.DateTimeFormat().resolvedOptions().timeZone : ''
      this.form.timezone = timezone || 'America/Los_Angeles'
    },

    selectCountryBasedInTimezone () {
      const timezone = this.form.timezone
      const countries = window.CountriesAndTimezones.getAllCountries()
      const country = Object.values(countries).find(({ timezones }) => timezones.includes(timezone))

      if (country) {
        this.form.country = {
          id: country.id,
          name: country.name
        }
      }
    },

    onCaptchaVerified (response) {
      this.disabledSubmit = false

      if (!this.$q.platform.is.electron) {
        this.user.recaptchaResponse = response
      }
    },

    getPreSignUpData () {
      this.isLoading = true
    },

    nextStep () {
      if (this.step === 2) {
        this.setKycFilled()
      }

      this.$refs.stepper.next()
    },

    skipForNow () {
      this.setBusinessInformationFieldsEmpty()
      this.$refs.stepper.next()
    },

    onSubmit () {
      this.isLoading = true

      const payload = {
        ...this.form,
        pre_signup_id: this.$route.params.pre_signup_id,
        phone_number: this.$options.filters.fixPhone(this.getCleanedPhoneNumber(this.form.phone_number), 'E164', true),
        auth_rep_phone_number: this.$options.filters.fixPhone(this.getCleanedPhoneNumber(this.form.auth_rep_phone_number), 'E164', true),
        ...this.getBusinessInformationFieldsValue
      }

      console.log('submit', payload)

      this.$axios.post('/api/admin/company-registration', payload)
        .then((res) => {
          this.isSubmitted = true
          this.$generalNotification('Your information has been submitted. Please check your email for further instructions.')
          this.$router.push({ name: 'Login' })
        })
        .catch((err) => {
          if (err.response && err.response.data && err.response.data.errors) {
            this.setFieldErrors(err.response.data.errors)
            this.verifyFieldErrors()
          }

          this.$handleErrors(err?.response)
          this.moveToStepWithFieldErrors()
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  },

  created () {
    this.validateAllPasswordRules()
    this.setTimezone()
    this.selectCountryBasedInTimezone()
  },

  mounted () {
    this.verifyFieldErrors()
  }
}
</script>
