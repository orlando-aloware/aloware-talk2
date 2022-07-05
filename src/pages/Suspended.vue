<template>
  <div class="row w-100">
    <b-alert :show="showDiagnosis"
             dismissible
             variant="danger"
             v-if="diagnosis.length > 0 && shouldShowDiagnosis">
      <div class="d-flex justify-content-between">
        <div>
          <i class="material-icons">warning</i> {{ firstDiagnosis }}
        </div>
        <span v-if="currentCompany && currentCompany.reseller_id !== 357">
          Contact Support: (818) 740-6004
        </span>
        <span v-if="currentCompany && currentCompany.reseller_id === 357">
          Contact Support: (888) 829-1110
        </span>
      </div>
    </b-alert>
    <section class="w-100 mx-0 mt-5">
      <!-- brand -->
      <div class="d-flex justify-content-center w-100 mt-5 mb-5">
        <img :src="`${apiURL + statics.logo}`"
             height="70px"
             v-if="!loadingWhitelabel"
             alt="logo">
      </div>
      <!-- / brand -->
      <div class="w-100 mb-4">
        <div class="margin-auto p-2"
             style="max-width: 550px;">
          <h2>Hey! It looks like that your account has been suspended. Please
            contact our support at
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id != 357">
                              support@aloware.com
                          </span>
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id == 357">
                              support@simpsocial.com
                          </span>
            or call
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id != 357">
                              855-256-2001
                          </span>
            <span class="text-primary"
                  v-if="currentCompany && currentCompany.reseller_id == 357">
                              888-829-1110
                          </span>
            for assistance.
          </h2>
        </div>
      </div>
      <div class="w-100 text-center-align">
        <b-button href="mailto:support@aloware.com"
                  variant="success"
                  size="sm"
                  class="mr-2"
                  v-if="currentCompany && currentCompany.reseller_id !== 357">
          Send an Email
        </b-button>
        <b-button href="mailto:support@simpsocial.com"
                  variant="success"
                  size="sm"
                  class="mr-2"
                  v-if="currentCompany && currentCompany.reseller_id === 357">
          Send an Email
        </b-button>
        <b-button href="tel:+18552562001"
                  variant="primary"
                  size="sm"
                  v-if="currentCompany && currentCompany.reseller_id !== 357">
          Call us
        </b-button>
        <b-button href="tel:+18888291110"
                  variant="primary"
                  size="sm"
                  v-if="currentCompany && currentCompany.reseller_id === 357">
          Call us
        </b-button>
      </div>
    </section>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { mapState } from 'vuex'
import { ISSUE_MAX_NEGATIVE_BALANCE } from 'src/constants/company-issues-default'

export default {
  name: 'Suspended',
  data () {
    return {
      statics: null,
      loadingWhitelabel: false,
      apiURL: process.env.API_URL,
      issueCodes: [],
      diagnosis: [],
      link: null,
      showDiagnosis: false
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', [
      'authenticated',
      'profile'
    ]),
    shouldShowDiagnosis () {
      return !(this.currentCompany && this.currentCompany.reseller_id === 357)
    },
    firstDiagnosis () {
      if (this.diagnosis.length > 0) {
        return this.diagnosis[0]
      }
      return 'We are having issues with your account and calls might not route at this time. Please contact support as soon as possible.'
    }
  },
  created () {
    this.getStatics()
    this.runDiagnosis()
  },
  methods: {
    getStatics () {
      this.loadingWhitelabel = true
      talk2Api.V1.statics.get().then(response => {
        this.statics = response.data
        this.loadingWhitelabel = false
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingWhitelabel = false
      })
    },
    runDiagnosis () {
      talk2Api.V1.status.runDiagnosis().then(res => {
        this.issueCodes = res.data.issue_codes
        this.diagnosis = res.data.issues
        this.link = res.data.link
        this.showDiagnosis = res.data.has_issues
        // if account has reached max negative balance and auto recharge is not set
        if (this.issueCodes.length && this.issueCodes.includes(ISSUE_MAX_NEGATIVE_BALANCE) && !this.profile.usage.auto_recharge) {
          this.$router.push({ name: 'Account', query: { tab: 'billing' } })
            .catch(err => {
              console.log(err)
            })
        }
      })
    }
  }
}
</script>
