<template>
  <div class="account-registration">
    <div class="col-lg-8 col-md-8 col-sm-12">
      <div class="absolute-top q-pt-xl q-px-xl">
        <img src="app-icons/menu/logo_dark.svg" alt="Logo">
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
            <h4 class="text-h4 text-weight-bold">
              Welcome to Aloware!
            </h4>
            <p class="text-body1">
              We are thrilled for you to better communicate with your customers today. In these 4 simple steps, we need important information to get you going
            </p>

            <div class="flex justify-center col-10 pt-4">
              <div class="col-5 pr-4">
                <label class="flex mb-1 text-weight-medium">
                  First Name
                </label>
                <q-input
                  placeholder="Type your first name"
                  rounded
                  outlined
                  v-model="form.first_name"
                />
              </div>

              <div class="col-5 pl-4">
                <label class="flex mb-1 text-weight-medium">
                  Last Name
                </label>
                <q-input
                  placeholder="Type your last name"
                  rounded
                  outlined
                  v-model="form.last_name"
                />
              </div>
            </div>

            <div class="flex justify-center col-10 pt-3">
              <div class="col-5 pr-4">
                <label class="flex mb-1 text-weight-medium">
                  Email Address
                </label>
                <q-input
                  placeholder="youremail@domain.com"
                  type="email"
                  rounded
                  outlined
                  :rules="[validateEmail]"
                  v-model="form.email"
                />
              </div>

              <div class="col-5 pl-4">
                <label class="flex mb-1 text-weight-medium">
                  Phone Number
                </label>
                <q-input
                  placeholder="+1 222 333 4444"
                  mask="+# ### ### ####"
                  rounded
                  outlined
                  :rules="[validatePhoneNumber]"
                  v-model="form.phone_number"
                />
              </div>
            </div>

            <div class="flex justify-center col-10 pt-3">
              <div class="col-5 pr-4">
                <label class="flex mb-1 text-weight-medium">
                  Job Title
                </label>
                <q-input
                  placeholder="Ex. CEO, CTO, Product Director"
                  rounded
                  outlined
                  v-model="form.job_title"
                />
              </div>
              <div class="col-5" />
            </div>

            <div class="flex justify-center col-10 pt-3">
              <div class="col-5 pr-4">
                <h4 class="text-h5 text-weight-bold">
                  Password
                </h4>
              </div>
              <div class="col-5" />
            </div>

            <div class="flex justify-center col-10 pt-3">
              <div class="col-5 pr-4 pb-5">
                <label class="flex mb-1 text-weight-medium">
                  Create a Password
                </label>
                <q-input
                  placeholder="Type here"
                  rounded
                  outlined
                  bottom-slots
                  :type="show_password ? 'text' : 'password'"
                  v-model="form.password"
                >
                  <template v-slot:append>
                    <q-icon
                      class="cursor-pointer"
                      :name="show_password ? 'visibility_off' : 'visibility'"
                      @click="show_password = !show_password"
                    />
                  </template>

                  <template
                    v-slot:hint
                    v-if="form.password">
                    <ul class="flex pl-1 text-weight-regular password-hint">
                      <li>
                        <q-icon
                          class="q-mr-xs"
                          :class="getPasswordRuleClass(validatePasswordLength(form.password))"
                          :name="iconForValidation(validatePasswordLength(form.password))">
                        </q-icon>
                        8 characters long
                      </li>
                      <li>
                        <q-icon
                          class="q-mr-xs"
                          :class="getPasswordRuleClass(validatePasswordCases(form.password))"
                          :name="iconForValidation(validatePasswordCases(form.password))">
                        </q-icon>
                        Must contain upper and lower case letters
                      </li>
                      <li>
                        <q-icon
                          class="q-mr-xs"
                          :class="getPasswordRuleClass(validatePasswordDigit(form.password))"
                          :name="iconForValidation(validatePasswordDigit(form.password))">
                        </q-icon>
                        Include at least one numerical digit
                      </li>
                    </ul>
                  </template>
                </q-input>
              </div>
              <div class="col-5 pl-4 pb-5">
                <label class="flex mb-1 text-weight-medium">
                  Repeat your Password
                </label>
                <q-input
                  placeholder="Type your password again"
                  rounded
                  outlined
                  bottom-slots
                  :type="show_password ? 'text' : 'password'"
                  v-model="form.repeat_password"
                >
                  <template v-slot:append>
                    <q-icon
                      class="cursor-pointer"
                      :name="show_password ? 'visibility_off' : 'visibility'"
                      @click="show_password = !show_password"
                    />
                  </template>

                  <template v-slot:hint
                    v-if="form.password.length > 0">
                    <ul class="flex pl-1 text-weight-regular password-hint">
                      <li>
                        <q-icon
                          class="q-mr-xs"
                          :class="getPasswordRuleClass(validatePasswordMatch(form.repeat_password))"
                          :name="iconForValidation(validatePasswordMatch(form.repeat_password))">
                        </q-icon>
                        {{ validatePasswordMatch(form.repeat_password) ? 'The passwords match' : 'The passwords doesn\'t match' }}
                      </li>
                    </ul>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- <div class="flex justify-center col-10">
              <div class="col-5 pr-4">
                <ul class="flex mb-1 pl-3 text-weight-regular password-hint">
                  <li>
                    <q-icon
                      class="q-mr-xs"
                      :class="getPasswordRuleClass(validatePasswordLength(form.password))"
                      :name="iconForValidation(validatePasswordLength(form.password))">
                    </q-icon>
                    8 characters long
                  </li>
                  <li>
                    <q-icon
                      class="q-mr-xs"
                      :class="getPasswordRuleClass(validatePasswordCases(form.password))"
                      :name="iconForValidation(validatePasswordCases(form.password))">
                    </q-icon>
                    Must contain upper and lower case letters
                  </li>
                  <li>
                    <q-icon
                      class="q-mr-xs"
                      :class="getPasswordRuleClass(validatePasswordDigit(form.password))"
                      :name="iconForValidation(validatePasswordDigit(form.password))">
                    </q-icon>
                    Include at least one numerical digit
                  </li>
                </ul>
              </div>

              <div class="col-5 pr-4">
                <ul class="flex mb-1 pl-4 text-weight-regular password-hint">
                  <li>
                    <q-icon
                      class="q-mr-xs"
                      :class="getPasswordRuleClass(validatePasswordLength(form.password))"
                      :name="iconForValidation(validatePasswordLength(form.password))">
                    </q-icon>
                    The passwords doesn't match
                  </li>
                </ul>
              </div>
            </div> -->
          </q-step>

          <q-step
            title="Your Business"
            prefix="2"
            :name="2"
            :done="step > 2"
          >
            <h4 class="text-h4 text-weight-bold">
              Welcome to Aloware!
            </h4>
            <p class="text-body1">
              We are thrilled for you to better communicate with your customers today. In these 4 simple steps, we need important information to get you going
            </p>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation
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
                rounded
                dense
                no-caps
                unelevated
                :disabled="isNextButtonDisabled"
                :label="step === 2 ? 'Submit' : 'Next'"
                @click="$refs.stepper.next()"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </div>
    </div>
    <div class="banner col-lg-4 col-md-4">
    </div>
  </div>
</template>

<script>
export default {
  name: 'account-registration',
  data () {
    return {
      step: 1,
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        job_title: '',
        password: '',
        repeat_password: ''
      },
      password_validation: [],
      show_password: false
    }
  },

  computed: {
    isNextButtonDisabled () {
      return this.step === 1 && !this.validateFirstStepFieldsFilled()
    }
  },

  watch: {
    'form.password' () {
      this.validateAllPasswordRules()
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
      return this.form.first_name.length &&
        this.form.last_name.length &&
        this.validateEmail(this.form.email) === true &&
        this.validatePhoneNumber(this.form.phone_number) === true &&
        this.form.job_title.length &&
        this.form.password.length &&
        this.form.repeat_password.length &&
        this.password_validation.length === 4
    },

    getPasswordRuleClass (rule) {
      return rule ? 'text-green' : 'text-red'
    }
  }
}
</script>

<style lang="scss">
.account-registration {
  display: flex;
  height: 100vh;

  @media (max-width: 600px) {
    .q-stepper__header {
      max-width: 100%;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;
    }
  }

  @media (min-width: 600px) and (max-width: 1024px) {
    .stepper__container {
      display: flex;
      text-align: -webkit-center;
    }
  }

  @media (min-width: 1024px) {
    .q-stepper__header {
      max-width: 600px !important;
    }

    .stepper__container {
      display: flex;
      text-align: -webkit-center;
      padding-left: 4vh;
    }
  }

  .row.q-input
  .q-field__control
  .q-field__native {
    height: 35px !important;
  }

  .q-stepper__dot {
    height: 32px !important;
    width: 32px !important;
  }

  .stepper__container {
    display: flex;
    text-align: -webkit-center;
  }

  &-form-container {

  }

  .text-h4 {
    font-size: 2.5rem !important;
  }

  .text-h5 {
    text-align: start;
    font-size: 1.25rem !important;
  }

  .text-body1 {
    font-size: 1.25rem !important;
    margin-top: 28px;
  }

  &-action-btn {
    .row.q-field,
    .row.q-field__control-container,
    .row.q-field__control,
    .row.q-field__control-container,
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

  .banner {
    background: linear-gradient(240deg, #0037ff2a 0%, #22ff001c 100%);
  }
}
</style>
