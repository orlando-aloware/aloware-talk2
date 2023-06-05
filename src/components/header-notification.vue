<template>
  <div class="bg-red-9 px-2 text-red-130 w-100 py-2 px-3 position-relative"
       id="notification-container"
       v-if="isShow">
    <div class="d-flex">
      <div class="pr-1 align-self-center flex-grow-1">
        <strong :class="diagnosisClass">
          <i class="fa fa-exclamation-triangle"/>
          {{ firstDiagnosis }}
        </strong>
        <a target="_blank"
           class="text-red-130 text-decoration-underline"
           :class="diagnosisLinkClass"
           :href="link.learn_more_href"
           v-if="link && link.learn_more_href">
          {{ link.learn_more_title ?? 'Learn more' }}
        </a>
        <portal-target class="d-inline"
                       name="diagnosisButtons"
                       v-if="staticsLoaded && !statics.whitelabel && isMobile">
        </portal-target>
      </div>
      <div class="ml-auto d-flex flex-md-row flex-column justify-content-center align-items-center"
           v-if="staticsLoaded && !statics.whitelabel">
        <portal-target name="diagnosisButtons"
                       v-if="!isMobile">
        </portal-target>
        <compact-btn customClass="fs-14 _500 position-relative primary not-focusable ml-2 text-danger"
                     borderless
                     :variant="filterButtonVariant"
                     v-if="link && link.closeable"
                     @clicked="close">
          <i class="fa fa-times"/>
        </compact-btn>
      </div>
    </div>

    <portal to="diagnosisButtons">
      <strong class="mr-2"
              v-if="!link && !issueCodes.includes(CompanyIssues.ISSUE_ACTIVE_DUNNING)">
        Contact Support:
        <a href="tel:(855) 256-2001">
          (855) 256-2001
        </a>
      </strong>

      <div v-if="!link && issueCodes.includes(CompanyIssues.ISSUE_ACTIVE_DUNNING) && hasPermissionTo('see chargebee portal')">
        <b-button class="mr-2 text-nowrap"
                  variant="danger"
                  size="sm"
                  round
                  @click="chargebeePortal">
          <strong>Manage Payment</strong>
        </b-button>
      </div>

      <a :href="getLink(link)"
         v-if="link && !link.external">
        <b-button class="text-nowrap"
                  variant="primary"
                  size="sm">
          {{ link.title }}
        </b-button>
      </a>

      <a target="_blank"
         :href="getLink(link)"
         v-if="link && link.external">
        <b-button class="text-nowrap"
                  variant="primary"
                  size="sm">
          {{ link.title }}
        </b-button>
      </a>
    </portal>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import * as CompanyIssues from 'src/constants/company-issues'
import CompactBtn from 'components/compact-btn'

export default {
  name: 'header-notification',
  components: { CompactBtn },
  mixins: [
    aclMixin
  ],

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState([
      'statics',
      'staticsLoaded',
      'isMobile'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    isShow () {
      return this.showNotification && this.diagnosis.length > 0 &&
        this.shouldShowDiagnosis
    },

    firstDiagnosis () {
      if (this.diagnosis.length > 0) {
        return this.diagnosis[0]
      }

      return 'We are having issues with your account and calls might not route at this time. Please contact support as soon as possible.'
    },

    currentRouteName () {
      return this.$route.name
    },

    shouldShowDiagnosis () {
      if (this.currentCompany && this.currentCompany.reseller_id === 357) {
        return this.currentRouteName && ['Broadcasts', 'Bulk Message', 'Bulk RVM'].includes(this.currentRouteName)
      }

      return true
    },

    diagnosisClass () {
      const rightClass = !this.link?.learn_more_href ? 'mr-2' : ''

      return [
        rightClass
      ]
    },

    diagnosisLinkClass () {
      const mobileClass = this.isMobile ? 'mr-2' : ''

      return [
        mobileClass
      ]
    }
  },

  data: () => {
    return {
      issueCodes: [],
      diagnosis: [],
      link: null,
      showDiagnosis: false,
      showNotification: true,
      CompanyIssues
    }
  },

  mounted () {
    this.runDiagnosis()
  },

  methods: {
    runDiagnosis () {
      this.$axios.get(`/api/v1/status/diagnosis`).then(res => {
        this.issueCodes = res.data.issue_codes
        this.diagnosis = res.data.issues
        this.link = res.data.link
        this.showDiagnosis = res.data.has_issues

        // if account has reached max negative balance and auto recharge is not set
        if (this.issueCodes.length &&
          this.issueCodes.includes(CompanyIssues.ISSUE_MAX_NEGATIVE_BALANCE) &&
          !this.profile.usage.auto_recharge) {
          this.$router.push({
            name: 'Account', query: { tab: 'billing' }
          }).catch(err => {
            console.log(err)
          })
        }
      })
    },

    chargebeePortal () {
      if (this.hasPermissionTo('see chargebee portal')) {
        let cbInstance = window.Chargebee.getInstance()
        let cbPortal = cbInstance.createChargebeePortal()
        cbPortal.open()
      }
    },

    close () {
      this.showNotification = false
    },

    getLink (link) {
      if (!link.external) {
        return `${process.env.API_URL}${link.href}`
      }

      return link.href
    }
  }
}
</script>
