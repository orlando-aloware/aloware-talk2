<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import { get } from 'lodash'

export default {
  name: 'intercom',

  mixins: [aclMixin],

  data () {
    return {
      intercomBannerHeight: 0,
      env: null,
      app_id: process.env.INTERCOM_APP_ID,
      timeInterval: null
    }
  },

  computed: {
    ...mapState(['statics']),

    ...mapState('cache', ['currentCompany']),

    ...mapState('auth', ['profile', 'authenticated']),

    isWhiteLabel () {
      return get(this.statics, 'whitelabel', false)
    }
  },

  methods: {
    setup (newRoute = false) {
      // @custom for The Moderate Genius Reseller & SimpSocial
      if (this.currentCompany && [2132, 357].includes(this.currentCompany.reseller_id)) {
        return
      }

      if (!this.authenticated || !this.profile?.enabled || this.isWhiteLabel) {
        return
      }

      window.axios.get('/api/v1/profile/intercom-user-hash').then(response => {
        if (window.Intercom) {
          window.Intercom('boot', {
            alignment: 'left',
            app_id: this.app_id,
            name: this.profile.name, // Current user's name
            email: this.profile.email, // Current user email address
            user_id: this.profile.id, // Current user id
            user_hash: response.data // Current user hash
          })

          this.timeInterval = setInterval(() => {
            let intercomIframe = document.querySelector('[name=intercom-banner-frame]')
            let intercomIframeHeight = this.getIntercomIframeHeight(intercomIframe)

            if (intercomIframeHeight !== this.intercomBannerHeight || newRoute) {
              this.fixTopMenu(intercomIframeHeight)
            }

            this.intercomBannerHeight = intercomIframeHeight
          }, 1 * 1000)
        }
      }).catch(err => {
        console.log(err)
      })
    },

    fixTopMenu () {
      let intercomIframe = document.querySelector('[name=intercom-banner-frame]')
      let intercomIframeHeight = this.getIntercomIframeHeight(intercomIframe)
      let isTopNotification = intercomIframe ? intercomIframe.getBoundingClientRect().top === 0 : true

      let mainContent = document.getElementsByClassName('main-content')[0]
      let datatableWrapper = document.getElementsByClassName('datatable-wrapper')[0]
      let dataTableWrapperDiv = datatableWrapper ? datatableWrapper.getElementsByTagName('div')[0] : null
      let headerElement = document.getElementsByTagName('header')[0]
      let asideElement = document.getElementsByTagName('aside')[0]
      let bodyElement = document.getElementsByTagName('body')[0]

      if (intercomIframeHeight > 0 && intercomIframe && intercomIframe.offsetWidth === window.innerWidth && isTopNotification) {
        headerElement && (headerElement.style.top = intercomIframeHeight + 'px')
        asideElement && (asideElement.style.top = intercomIframeHeight + 'px')

        if (mainContent) {
          mainContent.setAttribute(
            'style',
            'height: calc(100% - ' + intercomIframeHeight + 'px) !important;'
          )
        }

        if (dataTableWrapperDiv) {
          dataTableWrapperDiv.setAttribute(
            'style',
            'height: calc(100% - ' + intercomIframeHeight + 'px) !important;'
          )
        }
      } else if (intercomIframeHeight === 0) {
        headerElement && (headerElement.style.top = 0)
        asideElement && (asideElement.style.top = 0)
        bodyElement && (bodyElement.style.marginTop = 0)

        if (mainContent) {
          mainContent.setAttribute('style', '')
        }
        if (dataTableWrapperDiv) {
          dataTableWrapperDiv.setAttribute('style', '')
        }
      }
    },

    getIntercomIframeHeight (intercomIframe) {
      let intercomIframeInnerDoc = intercomIframe ? (intercomIframe.contentDocument || intercomIframe.contentWindow.document) : null
      let intercomIframeDomBody = intercomIframeInnerDoc ? intercomIframeInnerDoc.getElementById('intercom-container-body') : null
      return intercomIframeDomBody ? intercomIframeDomBody.clientHeight : 0
    },

    processSetup (newRoute = false) {
      if (!this.hasReporterAccess &&
        !this.isWhiteLabel &&
        this.profile &&
        process.env.APP_ENV !== 'local') {
        this.setup(newRoute)
      }
    }
  },

  created () {
    this.$router.beforeEach((to, from, next) => {
      this.processSetup(true)
      next()
    })

    this.processSetup()
  },

  watch: {
    'statics.whitelabel': function (newValue) {
      if (!newValue) {
        this.processSetup()
      }
    }
  },

  beforeDestroy () {
    clearInterval(this.timeInterval)
  }
}
</script>
