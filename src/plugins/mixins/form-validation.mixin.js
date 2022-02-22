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
      const formElement = _.get(this.$refs, formName, null)

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

      const fields = formElement.fields
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
      const formElement = _.get(this.$refs, formName, null)

      if (!formElement) {
        return false
      }

      const res = { data: null }
      formElement.validate((valid) => {
        res.data = valid
      })

      if (res.data) {
        formElement.clearValidate()
      }

      return res.data
    },

    resetForm (formName) {
      const formElement = _.get(this.$refs, formName, null)

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
