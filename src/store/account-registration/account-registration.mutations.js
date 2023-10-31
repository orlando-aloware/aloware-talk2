export default {
  SET_BUSINESS_INFORMATION_FIELDS_EMPTY (state) {
    state.form.legal_name = ''
    state.form.business_type = ''
    state.form.company_status = null
    state.form.business_registration_identifier = ''
    state.form.business_registration_number = ''
    state.form.business_regions_of_operation = ''
    state.form.business_industry = ''
    state.form.website_url = ''
    state.form.street = ''
    state.form.region = ''
    state.form.city = ''
    state.form.legal_country = ''
    state.form.postal_code = ''
    state.form.auth_rep_first_name = ''
    state.form.auth_rep_last_name = ''
    state.form.auth_rep_email = ''
    state.form.auth_rep_phone_number = ''
    state.form.auth_rep_business_title = ''
    state.form.auth_rep_job_position = ''
    state.form.kyc_filled = 0
  },

  SET_KYC_FILLED (state) {
    state.form.kyc_filled = 1
  },

  SET_FIELD_ERRORS (state, errors) {
    state.fieldErrors = errors
  },

  CLEAN_FIELD_ERROR (state, field) {
    state.fieldErrors = Object.keys(state.fieldErrors).reduce((acc, key) => {
      if (key !== field) {
        acc[key] = state.fieldErrors[key]
      }

      return acc
    }, {})
  },

  SET_PRE_FILLED_DATA (state, data) {
    Object.keys(data).forEach(key => {
      state.form[key] = data[key]
    })

    if (data.business_name) {
      state.form.company_name = data.business_name
    }

    if (data.password) {
      state.form.password = ''
    }
  },

  SET_SHOULD_REDIRECT_TO_LOGIN (state, value) {
    state.shouldRedirectToLogin = value
  }
}
