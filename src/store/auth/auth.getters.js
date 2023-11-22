import { KYC_STATUS_NONE } from '../../constants/kyc-status'

export default {
  loading (state) {
    return state.loading
  },
  profile (state) {
    return state.profile
  },
  authenticated (state) {
    return state.authenticated
  },
  user (state) {
    return { profile: state.profile, authenticated: state.authenticated }
  },
  isCompanyKYC (state) {
    const ssuEnabled = process.env.KYC_SSU_ENABLED || false
    return ssuEnabled && (state.profile?.company?.kyc_status && state.profile?.company?.kyc_status !== KYC_STATUS_NONE)
  }
}
