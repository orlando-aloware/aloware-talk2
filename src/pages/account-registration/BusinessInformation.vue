<template>
  <div class="account-registration row">
    <div class="col-xl-8 col-md-12 col-sm-12">
      <div class="logo absolute-top q-pt-xl q-px-xl">
        <img src="app-icons/menu/logo_dark.svg" alt="Logo" />
      </div>
      <div class="stepper__container">
        <business-information-form class="business-information__form"
                                   ref="businessInformationForm"
                                   :should-show-action-buttons="true"
                                   :is-loading="isLoading"
                                   @submit="onSubmit"
                                   @back-to-dashboard="onBackToPreviousRoute"
                                   @skip-for-now="onBackToPreviousRoute" />
      </div>
    </div>
    <banner :current-step="1" />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import BusinessInformationForm from 'src/components/account-registration/business-information-form.vue'
import Banner from 'src/components/account-registration/banner.vue'

export default {
  name: 'BusinessInformation',

  components: {
    BusinessInformationForm,
    Banner
  },

  data () {
    return {
      isLoading: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('accountRegistration', ['form']),
    ...mapGetters('accountRegistration', ['getBusinessInformationFieldsValue'])
  },

  methods: {
    ...mapActions(['setKycFilled']),
    ...mapActions('accountRegistration', [
      'setBusinessInformationFieldsEmpty',
      'setFieldErrors'
    ]),

    getCleanedPhoneNumber (phone) {
      return phone.replace(/[^\d]/g, '')
    },

    onBackToPreviousRoute () {
      this.$router.push({ name: 'Inbox' })
    },

    onSubmit () {
      this.isLoading = true
      const preSignupId = this.$route.params.company_id

      const payload = {
        ...this.getBusinessInformationFieldsValue,
        pre_signup_id: preSignupId,
        auth_rep_phone_number: this.$options.filters.fixPhone(this.getCleanedPhoneNumber(this.form.auth_rep_phone_number), 'E164', true),
        kyc_filled: 1,
        user_id: this.profile.id
      }

      console.log('submit', payload)

      this.$axios.patch(`/api/admin/company-registration/${preSignupId}`, payload)
        .then((res) => {
          this.isSubmitted = true
          this.setKycFilled({
            kyc_filled_status: true
          })

          this.$generalNotification('The Business information has been submitted.')
          this.$router.push({ name: 'Inbox' })
        })
        .catch((err) => {
          if (err.response && err.response.data && err.response.data.errors) {
            this.setFieldErrors(err.response.data.errors)
            this.$refs.businessInformationForm.verifyFieldErrors()
          }

          this.$handleErrors(err?.response)
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
