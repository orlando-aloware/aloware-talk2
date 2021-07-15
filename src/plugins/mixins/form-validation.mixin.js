import _ from 'lodash'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  data () {
    return {
      validated: false,
      CommunicationCurrentStatus
    }
  },
  methods: {
    preValidateForm: _.debounce(function (formName, reset = false, forceValidate = false, override = null) {
      let formElement = _.get(this.$refs, formName, null)

      if (!formElement) {
        return
      }

      if (reset === true) {
        formElement.clearValidate()

        // halt if we don't want to continue the validation
        if (!forceValidate) {
          return
        }
      }

      let fields = formElement.fields
      if (fields.find((f) => f.validateState === 'validating')) {
        setTimeout(() => {
          this.preValidateForm(formName)
        }, 100)

        return
      }

      this.validated = this.validateForm(formName)

      if (override === false && this.validated) {
        this.validated = false
      }
    }, 100),

    validateForm (formName) {
      let formElement = _.get(this.$refs, formName, null)

      if (!formElement) {
        return false
      }

      let res = null
      formElement.validate((valid) => {
        res = valid
      })

      if (res) {
        formElement.clearValidate()
      }

      return res
    },

    resetForm (formName) {
      let formElement = _.get(this.$refs, formName, null)

      if (!formElement) {
        return
      }

      formElement.resetFields()
      setTimeout(() => {
        formElement.clearValidate()
      }, 100)
    }
  }
}
