import { mapActions } from 'vuex'
import _ from 'lodash'

export default {

  computed: {
    getInvalidFields () {
      return _.findKey(this.$v.user.$params, (value, key) => this.$v.user[key].$invalid)
    }
  },

  methods: {
    ...mapActions('settings', ['setFormValidity']),
    scrollToElement () {
      this.$nextTick(function () {
        const targetEl = document.querySelector(this.$route.hash + '-container')
        const containerEl = document.querySelector('.setting-content-wrapper')
        containerEl.scrollTop = targetEl.offsetTop
      })
    },
    validateState (input) {
      const { $dirty, $error } = this.$v.user[input]
      return $dirty ? !$error : null
    },

    updateFormValidity () {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.setFormValidity(false)
      } else {
        this.setFormValidity(true)
      }
    }

  },

  watch: {
    '$route.hash': function () {
      if (['Settings Tab'].includes(this.$route.name) && this.$route.hash) {
        this.$nextTick(function () {
          const targetEl = document.querySelector(this.$route.hash + '-container')

          targetEl.classList.add('highlighted')

          setTimeout(function () {
            targetEl.classList.remove('highlighted')
          }, 2000)

          const containerEl = document.querySelector('.settings-content-wrapper')
          containerEl.scrollTop = targetEl.offsetTop - 10
        })
      }
    }
  }
}
