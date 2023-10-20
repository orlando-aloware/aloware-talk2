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
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.first_name"
                    />

                    <input-field
                      label="Last Name"
                      placeholder="Type your last name"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.last_name"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="Email Address"
                      placeholder="youremail@domain.com"
                      type="email"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :rules="[validateEmail]"
                      v-model="form.email"
                    />

                    <input-field
                      label="Phone Number"
                      placeholder="+1 222 333 4444"
                      mask="+# ### ### ####"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      :rules="[validatePhoneNumber]"
                      v-model="form.phone_number"
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
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      :options="countries"
                      v-model="form.country"
                    />

                    <input-field
                      label="Business Name"
                      placeholder="Ex. Aloware Inc."
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.company_name"
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
                      is-password
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.password"
                    >
                      <template
                        v-slot:hint
                        v-if="form.password">
                        <ul class="text-left pl-2 text-weight-regular password-hint">
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
            <div class="stepper__content">
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
                <iframe
                  sandbox="allow-same-origin"
                  class="terms-iframe mt-2 mb-2"
                  src="https://aloware.com/terms-and-conditions?embedded=1">
                </iframe>
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
                  @click="$refs.stepper.next()"
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
import { recaptchaMixin } from 'src/plugins/mixins'
import businessTypes from '../../constants/account-registration-business-types'
import businessIdTypes from '../../constants/account-registration-business-registration-identifiers'
import regionsOfOperations from '../../constants/account-registration-business-regions-of-operations'
import businessIndustries from '../../constants/account-registration-business-industries'
import StepHeader from 'src/components/account-registration/step-header.vue'
import InputGroup from 'src/components/account-registration/input-group.vue'
import InputField from 'src/components/account-registration/input-field.vue'
import SelectField from 'src/components/account-registration/select-field.vue'
import BusinessInformationForm from 'src/components/account-registration/business-information-form.vue'
import Banner from 'src/components/account-registration/banner.vue'

export default {
  name: 'account-registration',
  components: {
    StepHeader,
    InputGroup,
    InputField,
    SelectField,
    BusinessInformationForm,
    Banner
  },
  mixins: [recaptchaMixin],
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
    ...mapState('accountRegistration', ['form']),
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
    }
  },

  methods: {
    ...mapActions('accountRegistration', ['setBusinessInformationFieldsEmpty']),
    updateValidationState (rule, isValid) {
      const index = this.password_validation.indexOf(rule)
      if (isValid && index === -1) {
        this.password_validation.push(rule)
      } else if (!isValid && index !== -1) {
        this.password_validation.splice(index, 1)
      }
    },

    validateEmail (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email) || 'Invalid email address'
    },

    validatePhoneNumber (phone) {
      const formattedPhone = this.$options.filters.fixPhone(phone, 'E164', true)

      if (!formattedPhone || formattedPhone === phone || formattedPhone === '-') {
        return 'Invalid phone number'
      }
      return true
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

    onCaptchaVerified (response) {
      this.disabledSubmit = false

      if (!this.$q.platform.is.electron) {
        this.user.recaptchaResponse = response
      }
    },

    getPreSignUpData () {
      this.isLoading = true
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
        phone_number: this.$options.filters.fixPhone(this.form.phone_number, 'E164', true),
        ...this.getBusinessInformationFieldsValue
      }

      console.log('submit', payload)

      this.$axios.post('/api/admin/company-registration', payload)
        .then((res) => {
          this.isSubmitted = true
          this.$generalNotification('Your information has been submitted. We will contact you shortly.')
        })
        .catch((err) => {
          this.$handleErrors(err)
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  },

  created () {
    this.validateAllPasswordRules()
    this.setTimezone()
  }
}
</script>
