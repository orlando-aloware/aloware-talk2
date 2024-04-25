<template>
  <b-modal size="md"
           no-close-on-backdrop
           no-close-on-esc
           v-model="isOpen"
           :title="title"
           data-testid="sms-template-modal"
           @hidden="onHidden"
           @shown="onShown">

    <b-form class="appointment-forms"
            ref="appointmentForm"
            data-testid="sms-template-modal-form"
            @submit.prevent="onSubmit">
      <b-form-group
        label="Name"
        description="">
        <b-input  placeholder="Template name"
                  ref="templateName"
                  data-testid="sms-template-name-input"
                  v-model="template.name"></b-input>
      </b-form-group>

      <b-form-group label="Template Body">
        <b-form-textarea
          class="textarea-no-auto-shrink"
          placeholder="Enter template body.."
          rows="3"
          max-rows="8"
          no-auto-shrink
          data-testid="sms-template-body-input"
          v-model="template.body"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="">
        <b-button
          v-if="!showVariableSelector"
          id="btn-sms-variables"
          variant="primary"
          class="custom-btn"
          size="sm"
          data-testid="sms-template-add-variable-btn"
          @click="showVariableSelector = true"
        >
          Add Variable
        </b-button>

        <variables v-if="showVariableSelector"
                   :close-on-select="false"
                   data-testid="sms-template-variable-selector"
                   @close="showVariableSelector = false"
                   @variableSelected="variableSelected">
        </variables>
      </b-form-group>
    </b-form>

    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
        </div>
        <div class="flex-grow-1"></div>
        <b-button
          variant="success"
          class="custom-btn mr-1"
          size="sm"
          data-testid="sms-template-close-btn"
          @click="onHidden"
        >
          Close
        </b-button>
        <b-button
          variant="primary"
          class="custom-btn"
          size="sm"
          :disabled="isSaving || !isValid"
          data-testid="sms-template-save-btn"
          @click="onSubmit"
        >
          <q-spinner-bars v-if="isSaving" color="white" data-testid="sms-temlate-modal-spinner" />
          {{ isSaving ? 'Saving Template...' : 'Save Template' }}
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import Variables from 'src/components/message-composer/options/variables'

export default {
  name: 'sms-template-modal',

  components: { Variables },

  props: {
    id: {
      type: Number,
      required: false
    },
    contact: {
      type: Object,
      required: false
    }
  },

  computed: {
    ...mapState('contacts', ['smsTemplateModal']),
    ...mapState('cache', ['currentCompany']),
    isValid () {
      return this.template.name && this.template.body
    },
    isOpen: {
      get () {
        return this.smsTemplateModal.open
      },
      set (isOpen) {
        return isOpen
      }
    },
    title () {
      return (!this.smsTemplateModal.template ? 'Create' : 'Edit') + ' SMS Template'
    }
  },

  data () {
    return {
      isSaving: false,
      template: {
        id: '',
        name: '',
        body: ''
      },
      showVariableSelector: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setSmsTemplateModal']),
    ...mapActions(['setTemplates']),
    onHidden () {
      this.template = {
        id: '',
        name: '',
        body: ''
      }
      this.setSmsTemplateModal({
        isOpen: false
      })
    },

    onShown () {
      if (this.smsTemplateModal.template) {
        this.template = { ...this.template, body: this.smsTemplateModal.template.body, name: this.smsTemplateModal.template.name, id: this.smsTemplateModal.template.id }
      }

      this.$refs.templateName.focus()
    },

    variableSelected (variable) {
      this.template.body = (this.template.body ?? '') + ' ' + variable
    },

    onSubmit () {
      this.isSaving = true
      const pastActionText = { data: 'Created' }
      const presentActionText = { data: 'Creating' }
      const params = this.getParams()

      const request = { data: null }

      if (this.smsTemplateModal.template && this.smsTemplateModal.template.id) {
        if (!this.currentCompany) {
          this.$generalNotification(`Missing company information.`, 'error')
          this.isSaving = false
          return
        }

        params.company_id = this.currentCompany.id

        request.data = talk2Api.V1.smsTemplate.update(this.smsTemplateModal.template.id, params)
        pastActionText.data = 'Updated'
        presentActionText.data = 'Updating'
      } else {
        request.data = talk2Api.V1.smsTemplate.create(params)
      }

      request.data.then(response => {
        this.getSmsTemplates()
        this.onHidden()
        this.$generalNotification(`Template has been ${pastActionText.data.toLowerCase()}.`)
        this.$emit('templateSaved', response.data)
      }).catch(error => {
        console.log(error)
        this.$handleErrors(error.response)
      }).finally(() => {
        this.isSaving = false
      })
    },

    getSmsTemplates () {
      return talk2Api.V1.smsTemplate.get().then(response => {
        this.setTemplates(response.data)
      })
    },

    getParams () {
      return {
        body: this.template.body,
        name: this.template.name,
        template_scope: this.smsTemplateModal.scope
      }
    }
  },
  watch: {
    'smsTemplateModal': function (value) {
      this.isOpen = value
    }
  },
  mounted () {
    if (this.smsTemplateModal.template) {
      this.template = { ...this.template, body: this.smsTemplateModal.template.body, name: this.smsTemplateModal.template.name, id: this.smsTemplateModal.template.id }
    }
  }
}
</script>
