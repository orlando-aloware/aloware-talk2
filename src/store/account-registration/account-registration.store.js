export default function () {
  return {
    // form: {
    //   // Account Registration/Creation
    //   first_name: 'Jeff',
    //   last_name: 'Bruchado',
    //   email: 'jefferson@aloware.com',
    //   phone_number: '48996461911',
    //   country: {
    //     id: 'US',
    //     name: 'United States'
    //   },
    //   company_name: 'Aloware Inc.',
    //   password: 'SomeText!2',
    //   password_confirmation: 'SomeText!2',

    //   // Business Information
    //   legal_name: 'Aloware Inc.',
    //   business_type: {
    //     'id': 2,
    //     'value': 'Sole Proprietorship'
    //   },
    //   company_status: 1,
    //   business_registration_identifier: {
    //     value: 'EIN',
    //     label: 'USA: Employer Identification Number (EIN)'
    //   },
    //   other_identifier: '',
    //   business_registration_number: 'C1234567',
    //   business_regions_of_operation: {
    //     label: 'Latin America',
    //     value: 'LATIN_AMERICA'
    //   },
    //   business_industry: {
    //     name: 'Financial',
    //     value: 'FINANCIAL'
    //   },
    //   website_url: 'aloware.com',

    //   // Address Information
    //   street: 'Fifth Avenue',
    //   region: 'San Francisco',
    //   city: 'California',
    //   legal_country: {
    //     id: 'US',
    //     name: 'United States'
    //   },
    //   postal_code: '11223',

    //   // Authorized representative information
    //   auth_rep_first_name: 'Eleonor',
    //   auth_rep_last_name: 'Somosot',
    //   auth_rep_email: 'eleonor@aloware.com',
    //   auth_rep_phone_number: '48996461911',
    //   auth_rep_business_title: 'Dev',
    //   auth_rep_job_position: 'Other',

    //   agreed_to_terms: false,
    //   timezone: 'America/Los_Angeles',
    //   kyc_filled: 1
    // }

    form: {
      // Account Registration/Creation
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      country: '',
      company_name: '',
      password: '',
      password_confirmation: '',

      // Business Information
      legal_name: '',
      business_type: '',
      company_status: 1,
      business_registration_identifier: '',
      other_identifier: '',
      business_registration_number: '',
      business_regions_of_operation: '',
      business_industry: '',
      website_url: '',

      // Address Information
      street: '',
      region: '',
      city: '',
      legal_country: '',
      postal_code: '',

      // Authorized representative information
      auth_rep_first_name: '',
      auth_rep_last_name: '',
      auth_rep_email: '',
      auth_rep_phone_number: '',
      auth_rep_business_title: '',
      auth_rep_job_position: '',

      agreed_to_terms: false,
      timezone: 'America/Los_Angeles',
      kyc_filled: 1
    }
  }
}
