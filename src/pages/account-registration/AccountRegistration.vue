<template>
  <div class="account-registration row">
    <div class="col-xl-8 col-md-12 col-sm-12">
      <div class="absolute-top q-pt-xl q-px-xl">
        <img src="app-icons/menu/logo_dark.svg" alt="Logo" />
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
                    <input-field
                      label="Job Title"
                      placeholder="Ex. CEO, CTO, Product Director"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.job_title"
                    />
                    <div
                      class="col-5"
                      v-if="isLargeScreen"/>
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
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      is-password
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

            <step-header
              title="Your Business"
              description="Great! Now, we need important information to verify your business."
            />

            <div class="stepper__content">
              <div class="min-w-100">
                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="Business Name"
                      placeholder="Aloware Inc."
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.legal_name"
                    />

                    <div class="col-5 pr-0 pl-0">
                      <select-field
                        label="Business Type"
                        option-label="value"
                        option-value="value"
                        col-md="col-md-12"
                        :paddingClasses="isLargeScreen ? 'q-pr-0 q-pl-0' : ''"
                        :options="businessTypes"
                        v-model="form.business_type"
                      />
                      <div class="flex items-center">
                        <label class="flex mb-1 text-weight-bold pl-3 pr-4">
                          Company Status
                        </label>
                        <q-btn-toggle
                          class="toggle-border"
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
                          v-model="form.company_status"
                        />
                      </div>
                    </div>
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <select-field
                      label="Business ID Type"
                      option-label="label"
                      option-value="value"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :options="businessIdTypes"
                      v-model="form.business_registration_identifier"
                    />

                    <input-field
                      label="Business Registration Number"
                      placeholder="Ex: C1234567"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.business_registration_number"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <select-field
                      label="Region of Operation"
                      option-label="label"
                      option-value="value"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :options="regionsOfOperations"
                      v-model="form.business_regions_of_operation"
                    />

                    <input-field
                      label="Website URL"
                      placeholder="Ex: yourcompany.com"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.website_url"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <select-field
                      label="Business Industry"
                      option-label="name"
                      option-value="value"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      :options="businessIndustries"
                      v-model="form.business_industry"
                    />

                    <div
                      class="col-5"
                      v-if="isLargeScreen"/>
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
                    <input-field
                      label="Street"
                      placeholder="Ex: Fifth Avenue"
                      col-md="col-md-10"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.street"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <input-field
                      label="State/Province/Region"
                      placeholder="Ex: California"
                      v-model="form.region"
                    />

                    <input-field
                      label="City"
                      placeholder="Ex: Los Angeles"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      v-model="form.city"
                    />
                  </template>
                </input-group>

                <input-group>
                  <template v-slot:content>
                    <!-- <input-field
                      label="legal_country"
                      placeholder="Ex: United States"
                      :paddingClasses="isLargeScreen ? 'q-pr-4' : ''"
                      v-model="form.legal_country"
                    /> -->

                    <select-field
                      label="Country"
                      placeholder="Ex: United States"
                      option-label="name"
                      option-value="id"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      :options="countries"
                      v-model="form.legal_country"
                    />

                    <input-field
                      label="Postal Code"
                      placeholder="Ex: 11223"
                      :paddingClasses="isLargeScreen ? 'q-pl-4' : ''"
                      bottom-slots
                      v-model="form.postal_code"
                    >
                      <template
                        v-slot:hint
                        v-if="form.postal_code.length">
                        <div class="zipcode-hint">
                          <q-icon
                            class="q-mr-xs"
                            :class="getZipCodeRuleClass(validateZipCode(form.postal_code))"
                            :name="iconForValidation(validateZipCode(form.postal_code))"
                          >
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
              </div>
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
                      label="I agree to Terms and Conditions and fair use."
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
                  title="Verification"
                  description="Thanks for sending us your information. We are reviewing it now. Once validated, we will send you an email with instructions for logging into your account."
                  icon="app-icons/misc/clock.svg"/>
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
                @click="$refs.stepper.previous()"
                v-if="step > 1"
              />
              <q-btn
                class="q-mx-xl account-registration-action-btn"
                color="primary"
                size="md"
                label="Next"
                rounded
                dense
                no-caps
                unelevated
                :disabled="isNextButtonDisabled"
                @click="$refs.stepper.next()"
                v-if="step < 3"
              />
              <q-btn
                class="q-mx-xl account-registration-action-btn"
                color="primary"
                size="md"
                label="Submit"
                rounded
                dense
                no-caps
                unelevated
                :disabled="isNextButtonDisabled"
                @click="submit"
                v-if="step === 3"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </div>
    </div>
    <div class="banner col-xl-4 q-xl-show q-md-hide q-sm-hide">
      <div class="text-center items-center align-center">
        <img
          :src="getBannerImageSrc()"
          alt="phone" />
        <div class="card text-center">
          <h3 class="mb-4 mt-4">{{ getBannerTitle() }}</h3>
          <p v-html="getBannerDescription()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { recaptchaMixin } from 'src/plugins/mixins'
import businessTypes from '../../constants/account-registration-business-types'
import businessIdTypes from '../../constants/account-registration-business-registration-identifiers'
import regionsOfOperations from '../../constants/account-registration-business-regions-of-operations'
import businessIndustries from '../../constants/account-registration-business-industries'
import StepHeader from 'src/components/account-registration/step-header.vue'
import InputGroup from 'src/components/account-registration/input-group.vue'
import InputField from 'src/components/account-registration/input-field.vue'
import SelectField from 'src/components/account-registration/select-field.vue'

export default {
  name: 'account-registration',
  components: {
    StepHeader,
    InputGroup,
    InputField,
    SelectField
  },
  mixins: [recaptchaMixin],
  data () {
    return {
      step: 1,
      // form: {
      //   first_name: 'Jeff',
      //   last_name: 'Bruchado',
      //   email: 'jeff@gmail.com',
      //   phone_number: '+1 222 333 4444',
      //   job_title: 'CTO',
      //   password: 'SomeText!2',
      //   password_confirmation: 'SomeText!2',
      //   legal_name: 'Aloware Inc.',
      //   business_type: 'Partnership',
      //   company_status: 1,
      //   business_registration_identifier: 'BIN',
      //   business_registration_number: 'C1234567',
      //   business_regions_of_operation: 'USA_AND_CANADA',
      //   business_industry: 'Software',
      //   website_url: 'aloware.com',
      //   street: 'Fifth Avenue',
      //   region: 'San Francisco',
      //   city: 'California',
      //   legal_country: 'US',
      //   postal_code: '11223',
      //   agreed_to_terms: false,
      //   timezone: 'America/Los_Angeles'
      // },
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        job_title: '',
        password: '',
        password_confirmation: '',
        legal_name: '',
        business_type: '',
        company_status: 1,
        business_registration_identifier: '',
        business_registration_number: '',
        business_regions_of_operation: '',
        business_industry: '',
        website_url: '',
        street: '',
        region: '',
        city: '',
        legal_country: '',
        postal_code: '',
        agreed_to_terms: false,
        timezone: 'America/Los_Angeles'
      },
      password_validation: [],
      show_password: false,
      isSubmitted: false,
      businessTypes,
      businessIdTypes,
      regionsOfOperations,
      businessIndustries
    }
  },

  computed: {
    isNextButtonDisabled () {
      return (this.step === 1 && !this.validateFirstStepFieldsFilled()) ||
        (this.step === 2 && !this.validateSecondStepFieldsFilled()) ||
        (this.step === 3 && (this.disabledSubmit || !this.form.agreed_to_terms))
    },
    shouldShowStepperNavigation () {
      return (this.step === 1 || this.step === 2 || this.step === 3) && !this.isSubmitted
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
    step (newStep) {
      if (newStep === 3 && !this.$q.platform.is.electron) {
        this.initRecaptcha()
      }
    },
    'form.legal_country' () {
      this.setTimezone()
    }
  },

  methods: {
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
      const phoneRegex = /^\+\d{1} \d{3} \d{3} \d{4}$/
      return phoneRegex.test(phone) || 'Invalid phone number'
    },

    validateAllPasswordRules () {
      this.updateValidationState('length', this.validatePasswordLength(this.form.password))
      this.updateValidationState('cases', this.validatePasswordCases(this.form.password))
      this.updateValidationState('digit', this.validatePasswordDigit(this.form.password))
      this.updateValidationState('match', this.validatePasswordMatch(this.form.password))
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
        this.form.job_title.length &&
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
        this.validateZipCode(this.form.postal_code)
      )
    },

    getPasswordRuleClass (rule) {
      return rule ? 'text-green' : 'text-red'
    },

    getZipCodeRuleClass (rule) {
      return rule ? 'text-green' : 'text-red'
    },

    getBannerImageSrc () {
      switch (this.step) {
        case 1:
          return '/images/woman-agent.png'
        case 2:
          return '/images/man-agent.png'
        case 3:
          return '/images/woman-agent-in-call.png'
        default:
          return '/images/woman-agent.png'
      }
    },

    getBannerTitle () {
      switch (this.step) {
        case 1:
          return 'Your customers prefer text'
        case 2:
          return 'Supercharge your sales team'
        case 3:
          return 'Measure the metrics that matter'
        default:
          return 'Your customers prefer text'
      }
    },

    getBannerDescription () {
      switch (this.step) {
        case 1:
          return 'Research (and common sense!) shows that people look at their texts within 3 minutes, and open <span class="text-weight-bold">97% of messages</span> they receive.<br>Be where it matters most: their inbox. 📥'
        case 2:
          return 'Make <span class="text-weight-bold">300+ calls daily</span> with our AI-driven power dialer. Scale up text campaigns with smart sequence builder.<br>Your CRM has the fuel, Aloware brings the fire. 🚀'
        case 3:
          return 'Gain visibility into the metrics that matter to your business with advanced <span class="text-weight-bold">reporting, pre-built</span>, and <span class="text-weight-bold">customizable dashboards</span>. 📊'
        default:
          return 'Texting is the most preferred communication channel for customers. With Aloware, you can text your customers from your business phone number.'
      }
    },

    setTimezone () {
      const country = this.form.legal_country
      const timezone = window.CountriesAndTimezones.getTimezonesForCountry(country.id)[0]
      this.form.timezone = timezone.name
    },

    onCaptchaVerified (response) {
      this.disabledSubmit = false

      if (!this.$q.platform.is.electron) {
        this.user.recaptchaResponse = response
      }
    },

    submit () {
      this.isSubmitted = true

      const payload = {
        ...this.form,
        business_type: this.form.business_type.value,
        business_registration_identifier: this.form.business_registration_identifier.value,
        business_regions_of_operation: this.form.business_regions_of_operation.value,
        business_industry: this.form.business_industry.value,
        legal_country: this.form.legal_country.id
      }

      console.log('submit', payload)
    }
  },

  created () {
    this.validateAllPasswordRules()
  }
}
</script>

<style lang="scss">
@import 'src/css/breakpoints.scss';

.account-registration {
  display: flex;
  height: 100vh;

  // Base Styles
  .row.q-input .q-field__control .q-field__native {
    height: 35px !important;
  }

  .q-field--auto-height .q-field__control,
  .q-field--auto-height .q-field__native {
    min-height: 35px !important;
  }

  .toggle-border {
    border: 1px solid #256eff;
  }

  .q-stepper__dot {
    height: 32px !important;
    width: 32px !important;
  }

  .stepper__container {
    display: flex;
    text-align: -webkit-center;
  }

  .text-h4 {
    font-size: 2.5rem;
  }

  @include screen('xs') {
    .text-h4 {
      font-size: 20px;
    }
  }

  @include screen('sm') {
    .text-h4 {
      font-size: 20px;
    }
  }

  @include screen('md') {
    .text-h4 {
      font-size: 2.5rem;
    }
  }

  .text-h5 {
    text-align: start;

    font-size: 1.25rem !important;
  }

  .text-body1 {
    font-size: 1.25rem;
    margin-top: 28px;
    width: 65%;
  }

  @include screen('xs') {
    .text-body1 {
      font-size: 14px;
      margin-top: 10px;
      width: 100%;
    }
  }

  @include screen('sm') {
    .text-body1 {
      font-size: 14px;
      margin-top: 10px;
      width: 100%;
    }
  }

  @include screen('md') {
    .text-body1 {
      font-size: 1.25rem;
      margin-top: 28px;
      width: 65%;
    }
  }

  .password-hint {
    ul {
      padding-top: 10px;
    }

    li {
      list-style: none;
      font-size: 14px;
      color: #000000;
      margin-top: 4px;
    }
  }

  .zipcode-hint {
    padding-top: 0;
    padding-left: 10px;
    font-size: 14px;
    color: #000000;
    text-align: left;
  }

  .banner {
    align-items: center;
    background: linear-gradient(240deg, #0037ff2a 0%, #22ff001c 100%);
    height: 100vh;

    .card {
      background-color: #ffffff;
      border-radius: 12px;

      > h3 {
        font-family: Inter;
        font-size: 20px;
        font-weight: 700;
        line-height: 24px;
      }

      > p {
        font-family: Inter;
        font-size: 18px;
        font-weight: 400;
        line-height: 24px;
        text-align: center;
        padding: 0 24px 10px 24px;
      }
    }
  }

  &-form-container {
    // Base styles for form-container can be added here
  }

  &-action-btn {
    .row.q-field,
    .row.q-field__control-container,
    .row.q-field__control,
    .row.q-notification__wrapper,
    .row.q-notification__content,
    .row.q-btn__wrapper,
    .row.q-btn__content,
    .row.q-avatar__content,
    .row.q-item,
    .row.q-field__native,
    .row.q-chip__content,
    .row .q-field__inner {
      padding-right: 6px !important;
      padding-left: 6px !important;
      display: flex !important;
      align-content: center !important;
    }
  }

  // Stepper Container Details
  .stepper__container {
    display: flex;
    flex-direction: column;
    height: 80vh;

    .q-stepper__header,
    .stepper__content__header {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: white;
    }

    .stepper__content {
      overflow-y: auto;
      flex-grow: 1;
      height: 60vh;
      padding-bottom: 130px;
    }

    .q-stepper__nav {
      position: sticky;
      bottom: 0;
      background-color: white;
      padding: 0 16px 16px;
      z-index: 10;

      @include screen('xs') {
        padding: 0 16px 0;
      }

      @include screen('sm') {
        padding: 0 16px 0;

      }
    }
  }

  @include screen('xs') {
    .banner {
      display: none !important;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;

      .q-stepper__header,
      .stepper__content__header {
        max-width: 100%;
        position: relative;
        z-index: 10;
        background-color: white;
        font-size: 10px
      }
    }
  }

  @include screen('sm') {
    .banner {
      display: none !important;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;

      .stepper__container {
      display: flex;
      text-align: -webkit-center;

      .q-stepper__header,
      .stepper__content__header {
        max-width: 100%;
        position: relative;
        z-index: 10;
        background-color: white;
        font-size: 10px;
      }
    }
    }
  }

  @include screen('md') {
    .banner {
      display: none !important;
    }

    .min-w-100 {
      // width: 100vh !important;
    }

    .q-stepper__header {
      max-width: 600px !important;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;
      padding-left: 4vh;
    }
  }

  @include screen('lg') {
    .banner {
      display: none !important;
    }
  }

  @include screen('xl') {
    .banner {
      display: flex !important;
    }
  }

  @include screen('xs') {
    .q-stepper__header {
      max-width: 100%;
    }
    .stepper__container {
      display: flex;
      text-align: -webkit-center;
    }
  }

  @include screen('sm') {
    .stepper__container {
      display: flex;
      text-align: -webkit-center;
    }
  }

  @include screen('md') {
    .min-w-100 {
      // width: 100vh !important;
    }

    .q-stepper__header {
      max-width: 600px !important;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;
      padding-left: 4vh;
    }
  }

  // Miscellaneous Classes
  .w-65 {
    width: 65%;
  }

  .min-h-60 {
    min-height: 60vh;
  }

  .terms-iframe {
    border: 0;
    width: 100%;
    height: 30vh; /* Default iframe height */
    padding-bottom: 20px;
  }

  @include screen('xs') {
    .terms-iframe {
      height: 30vh;
    }
  }

  @include screen('sm') {
    .terms-iframe {
      height: 30vh;
      padding-right: 3rem;
      padding-left: 3rem;
    }
  }

  @include screen('md') {
    .terms-iframe {
      height: 30vh;
      padding-right: 3rem;
      padding-left: 3rem;
    }
  }

  @include screen('lg') {
    .terms-iframe {
      height: 30vh;
      padding-right: 3rem;
      padding-left: 3rem;
    }
  }

  .accept-box {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding-left: 2.8rem;
  }
}
</style>
