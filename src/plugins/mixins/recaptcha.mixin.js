export default {
  data () {
    return {
      disabledSubmit: true
    }
  },

  computed: {
    siteKey () {
      return process.env.RECAPTCHA_SITE_KEY
    }
  },

  mounted () {
    this.disabledSubmit = true

    window.recaptchaOnloadCallback = () => {
      if (document.querySelector('#recaptcha-element')) {
        window.grecaptcha.render('recaptcha-element', {
          sitekey: this.siteKey,
          callback: this.onCaptchaVerified
        })
      }
    }

    this.loadRecaptchaScript()
  },

  methods: {
    loadRecaptchaScript () {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?onload=recaptchaOnloadCallback&render=explicit`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    },

    onCaptchaVerified () {
      this.disabledSubmit = false
    }
  }
}
