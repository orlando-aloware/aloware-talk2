<template>
  <div class="bg-yellow-12 px-2 w-100 py-2 px-3 position-relative notification-container-header"
       id="notification-container"
       v-if="isShow">
    <div class="d-flex">
      <div class="pr-1 align-self-center flex-grow-1">
        <strong :class="diagnosisClass">
          <i class="fa fa-exclamation-triangle"/>
          {{ firstDiagnosis }}
          <template v-if="secondDiagnosis">
              <br>
              {{ secondDiagnosis }}
          </template>
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
           v-if='staticsLoaded && !statics.whitelabel'>
        <portal-target name="diagnosisButtons"
                       v-if="!isMobile">
        </portal-target>
      </div>
    </div>

    <portal to="diagnosisButtons">
      <a @click="onOpenFinishRegistration(link)"
         v-if="link && !link.external">
        <b-button class="text-nowrap"
                  variant="primary"
                  size="sm">
          {{ link.title }}
        </b-button>
      </a>

      <a target="_blank"
         @click="onOpenFinishRegistration(link)"
         v-if="link && link.external">
        <b-button class="text-nowrap"
                  variant="primary"
                  size="sm">
          {{ link.title }}
        </b-button>
      </a>

      <compact-btn customClass="fs-14 _500 position-relative not-focusable ml-2 text-red-130"
                   borderless
                   @clicked="close">
        <i class="fa fa-times"/>
      </compact-btn>
    </portal>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { aclMixin, kycMixin } from 'src/plugins/mixins'
import * as CompanyIssues from 'src/constants/company-issues'
import CompactBtn from 'components/compact-btn'

export default {
  name: 'header-notification',

  components: { CompactBtn },

  mixins: [
    aclMixin,
    kycMixin
  ],

  computed: {
    ...mapState([
      'statics',
      'staticsLoaded',
      'isMobile'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    ...mapState(['isSimpsocialMigrationBannerVisible']),

    isShow () {
      return this.showNotification && this.diagnosis.length > 0 && !this.isSimpsocialMigrationBannerVisible
    },

    firstDiagnosis () {
      if (this.diagnosis.length > 0) {
        return this.diagnosis[0]
      }

      return 'We are having issues with your account and calls might not route at this time. Please contact support as soon as possible.'
    },

    secondDiagnosis () {
      if (this.diagnosis.length > 1 && this?.is10DlcError) {
        return this.diagnosis[1]
      }

      return ''
    },

    currentRouteName () {
      return this.$route.name
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
    },

    is10DlcError () {
      return this.issueCodes.includes(CompanyIssues.ISSUE_A2P_10DLC_NOT_REGISTERED) ||
        this.issueCodes.includes(CompanyIssues.ISSUE_A2P_10DLC_INCOMPLETE) ||
        this.issueCodes.includes(CompanyIssues.ISSUE_BRAND_REGISTRATION_FAILED) ||
        this.issueCodes.includes(CompanyIssues.ISSUE_BRAND_NOT_REGISTERED) ||
        this.issueCodes.includes(CompanyIssues.ISSUE_BRAND_REGISTRATION_FAILED_TCR_ZERO)
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
      })
    },

    close () {
      this.showNotification = false
    },

    isAbsoluteURL (url) {
      let regEx = new RegExp('^(?:[a-z+]+:)?//', 'i')

      return regEx.test(url)
    },

    onOpenFinishRegistration (link) {
      if (!this.isCompanyKYC) {
        const link = this.getLink(this.link)

        return window.open(link, '_self')
      }
    },

    getLink (link) {
      if (!link.external || !this.isAbsoluteURL(link.href)) {
        return `${process.env.API_URL}${link.href}`
      }

      return link.href
    }
  }
}
</script>
