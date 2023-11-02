export default {
  getBusinessInformationFieldsValue (state) {
    return {
      legal_name: state.form.legal_name,
      business_type: state.form.business_type?.value,
      company_status: state.form.company_status,
      business_registration_identifier: state.form.business_registration_identifier?.value,
      other_identifier: state.form.other_identifier,
      business_registration_number: state.form.business_registration_number,
      business_regions_of_operation: state.form.business_regions_of_operation?.value,
      business_industry: state.form.business_industry?.value,
      website_url: state.form.website_url,
      street: state.form.street,
      region: state.form.region,
      city: state.form.city,
      legal_country: state.form.legal_country?.id,
      postal_code: state.form.postal_code,
      country: state.form.country?.id,
      auth_rep_first_name: state.form.auth_rep_first_name,
      auth_rep_last_name: state.form.auth_rep_last_name,
      auth_rep_email: state.form.auth_rep_email,
      auth_rep_business_title: state.form.auth_rep_business_title,
      auth_rep_job_position: state.form.auth_rep_job_position?.value
    }
  }
}
