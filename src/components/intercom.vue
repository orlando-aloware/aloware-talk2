<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'intercom',

  mixins: [aclMixin],

  data () {
    return {
      intercomBannerHeight: 0,
      env: null,
      statics: null,
      app_id: process.env.INTERCOM_APP_ID
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated'])
  },

  methods: {
    getStatics () {
      return window.axios.get('/get-statics').then(res => {
        this.statics = res.data
        return Promise.resolve(res.data)
      }).catch(err => {
        console.log(err)
        return Promise.reject(err)
      })
    },

    setup (newRoute = false) {
      let self = this
      window.axios.get('/api/v1/profile/intercom-user-hash').then(response => {
        if (window.Intercom) {
          window.Intercom('boot', {
            alignment: 'right',
            app_id: this.app_id,
            name: this.profile.name, // Current user's name
            email: this.profile.email, // Current user email address
            user_id: this.profile.id, // Current user id
            user_hash: response.data, // Current user hash
            background_color: '#15163f',
            action_color: '#15163f',
            vertical_padding: 80
          })

          setInterval(function () {
            let intercomIframe = document.querySelector('[name=intercom-banner-frame]')
            let intercomIframeHeight = self.getIntercomIframeHeight(intercomIframe)

            if (intercomIframeHeight !== self.intercomBannerHeight || newRoute) {
              self.fixTopMenu(intercomIframeHeight)
            }

            self.intercomBannerHeight = intercomIframeHeight
          }, 1 * 1000)
        }
      })
    },
    fixTopMenu () {
      let intercomIframe = document.querySelector('[name=intercom-banner-frame]')
      let intercomIframeHeight = this.getIntercomIframeHeight(intercomIframe)
      let isTopNotification = intercomIframe ? intercomIframe.getBoundingClientRect().top === 0 : true

      if (intercomIframeHeight > 0 && intercomIframe && intercomIframe.offsetWidth === window.innerWidth && isTopNotification) {
        document.getElementsByTagName('header')[0].style.top = intercomIframeHeight + 'px'
        document.getElementsByTagName('aside')[0].style.top = intercomIframeHeight + 'px'

        document.getElementsByClassName('main-content')[0].setAttribute(
          'style',
          'height: calc(100% - ' + intercomIframeHeight + 'px) !important;'
        )
        document.getElementsByClassName('datatable-wrapper')[0].getElementsByTagName('div')[0].setAttribute(
          'style',
          'height: calc(100% - ' + intercomIframeHeight + 'px) !important;'
        )
      } else if (intercomIframeHeight === 0) {
        document.getElementsByTagName('header')[0].style.top = 0
        document.getElementsByTagName('aside')[0].style.top = 0

        document.getElementsByClassName('main-content')[0].setAttribute('style', '')
        document.getElementsByClassName('datatable-wrapper')[0].getElementsByTagName('div')[0].setAttribute('style', '')
      }
    },
    getIntercomIframeHeight (intercomIframe) {
      let intercomIframeInnerDoc = intercomIframe ? (intercomIframe.contentDocument || intercomIframe.contentWindow.document) : null
      let intercomIframeDomBody = intercomIframeInnerDoc ? intercomIframeInnerDoc.getElementById('intercom-container-body') : null
      return intercomIframeDomBody ? intercomIframeDomBody.clientHeight : 0
    }
  },

  created () {
    let self = this
    this.$router.beforeEach((to, from, next) => {
      self.setup(true)
      next()
    })

    this.getStatics().then(() => {
      if (!this.hasReporterAccess &&
        (this.statics && !this.statics.whitelabel) &&
        this.currentCompany &&
        !this.currentCompany.reseller_id &&
        this.profile &&
        process.env.APP_ENV !== 'local') {
        this.setup()
      }
    })
  }
}
</script>
