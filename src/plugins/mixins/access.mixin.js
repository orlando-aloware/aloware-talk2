import { mapActions, mapState, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { getCookie, setCookie } from 'src/plugins/helpers/functions'
import { isInteger } from 'lodash'

export default {
  data () {
    return {
      isLoadingAccesses: false
    }
  },

  computed: {
    ...mapState([
      'showAccountSelector',
      'showAccountSelectorFullscreen',
      'showAccountSelectorFirstLoad',
      'accesses'
    ]),
    ...mapGetters('auth', ['profile'])
  },

  methods: {
    ...mapActions([
      'setShowAccountSelector',
      'setShowAccountSelectorFullscreen',
      'setShowAccountSelectorFirstLoad',
      'setAccesses'
    ]),

    ...mapActions('auth', ['logout']),

    getCompanyIdFromUrl () {
      const urlParams = new URLSearchParams(window.location.search)
      const companyId = urlParams.get('company_id')
      return companyId ? parseInt(companyId) : null
    },

    getAccesses (firstLoad = false) {
      this.isLoadingAccesses = true
      talk2Api.V1.users.getCompanyAccesses()
        .then(res => {
          this.setAccesses(res.data)

          // Check if URL contains company_id parameter
          const urlCompanyId = this.getCompanyIdFromUrl()
          if (isInteger(urlCompanyId)) {
            // if zero then use the first available company
            if (urlCompanyId === 0 && this.accesses.length > 0) {
              this.companyLogin(this.accesses[0])
              return
            }

            // define company id if accessed
            const urlCompanyAccess = this.accesses.find(access => access.company_id === urlCompanyId)
            if (urlCompanyAccess) {
              this.companyLogin(urlCompanyAccess)
              return
            }
          }

          if (this.accesses.length > 1) {
            this.loginWithSavedCompany(firstLoad)
          } else if (this.accesses.length === 1) {
            this.companyLogin(this.accesses[0])
          }
        })
        .catch(err => {
          console.error(err)
          this.$handleErrors(err.response)
        })
        .finally(() => {
          this.isLoadingAccesses = false
        })
    },

    loginWithSavedCompany (firstLoad = false) {
      const selectedCompanyId = parseInt(getCookie('selected_company_id'))

      if (!selectedCompanyId) {
        this.setShowAccountSelector(true)

        if (firstLoad) {
          this.setWelcomeAccountSelectorDialog()
        }

        return
      }

      const selectedCompany = this.accesses.find(access => access.company_id === selectedCompanyId)

      if (selectedCompany) {
        this.companyLogin(selectedCompany)
      }
    },

    companyLogin (access) {
      const currentCompanyId = parseInt(localStorage.getItem('company_id'))
      if (currentCompanyId === access.company_id) {
        setCookie('selected_company_id', access.company_id, 30)
        return this.closeDialog()
      }

      this.isLoadingAccesses = true
      talk2Api.V1.auth.impersonate(access.id, true, this.profile)
        .then(() => {
          if (this.accesses.length > 1) {
            setCookie('selected_company_id', access.company_id, 30)
          }

          window.location.reload()
        })
        .catch(err => {
          console.error(err)
          this.$handleErrors(err.response)
          this.isLoadingAccesses = false
        })
    },

    closeDialog () {
      this.setShowAccountSelector(false)
      this.setShowAccountSelectorFullscreen(false)
    },

    setWelcomeAccountSelectorDialog () {
      this.setShowAccountSelector(true)
      this.setShowAccountSelectorFullscreen(true)
      this.setShowAccountSelectorFirstLoad(true)
    },

    resetDialog () {
      this.setShowAccountSelector(false)
      this.setShowAccountSelectorFullscreen(false)
      this.setShowAccountSelectorFirstLoad(false)
    }
  }
}
