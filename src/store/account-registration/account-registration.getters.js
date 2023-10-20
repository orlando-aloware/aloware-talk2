export default {
  getBusinessInformationFieldsValue (state) {
    return {
      business_type: state.form.business_type?.value,
      business_registration_identifier: state.form.business_registration_identifier?.value,
      business_regions_of_operation: state.form.business_regions_of_operation?.value,
      business_industry: state.form.business_industry?.value,
      country: state.form.country?.id,
      legal_country: state.form.legal_country?.id
    }
  }
}
