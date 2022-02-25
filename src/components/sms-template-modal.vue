<template>
  <b-modal :title="title"
           size="md"
           v-model="isOpen"
           scrollable
           @hidden="onHidden"
           @shown="onShown">

    <b-form class="appointment-form"
            ref="appointmentForm"
            @submit.prevent="onSubmit">
      <b-form-row>
        <b-col sm="12">
          <b-form-group
            id="input-group-1"
            label="Name"
            label-for="input-1"
            description=""
          >
            <b-input v-model="template.name" placeholder="Template name"></b-input>
          </b-form-group>
        </b-col>

        <b-col>
          <b-form-group id="input-group-2" label="Template Body" label-for="input-2">
            <b-form-textarea
              class="textarea-no-auto-shrink"
              placeholder="Enter template body.."
              rows="3"
              max-rows="8"
              no-auto-shrink
              v-model="template.body"
            ></b-form-textarea>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
          <b-button
            id="btn-sms-variables"
            variant="primary"
            class="custom-btn"
            size="sm"
          >
            Add Variable
            <q-menu content-class="mx-height-300"
                    anchor="bottom right"
                    self="bottom left"
                    ref="variablesMenu"
                    persistent
                    auto-close>
              <div class="row no-wrap q-pa-md">
                <variables @variableSelected="variableSelected" always-open></variables>
              </div>
            </q-menu>
          </b-button>
        </div>
        <div class="flex-grow-1"></div>
        <b-button
          variant="success"
          class="custom-btn mr-1"
          size="sm"
          @click="onHidden"
        >
          Close
        </b-button>
        <b-button
          variant="primary"
          class="custom-btn"
          size="sm"
          :disabled="isSaving || !isValid"
          @click="onSubmit"
        >
          <q-spinner-bars v-if="isSaving" color="white" />
          {{ isSaving ? 'Saving Template...' : 'Save Template' }}
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import auth from 'src/boot/auth'
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
      auth,
      isSaving: false,
      template: {
        id: '',
        name: '',
        body: ''
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['setSmsTemplateModal']),
    ...mapActions(['setSmsTemplates']),
    onHidden () {
      this.setSmsTemplateModal({
        isOpen: false
      })
    },

    onShown () {
      if (this.smsTemplateModal.template) {
        this.template = { ...this.template, body: this.smsTemplateModal.template.body, name: this.smsTemplateModal.template.name, id: this.smsTemplateModal.template.id }
      }
    },

    variableSelected (variable) {
      this.template.body = (this.template.body ?? '') + ' ' + variable
      this.$refs.variablesMenu.hide()
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
        if (error.response.data && error.response.data.errors) {
          Object.keys(error.response.data.errors).forEach((value) => {
            this.$generalNotification(error.response.data.errors[value][0], 'error')
          })
        } else {
          this.$generalNotification(`Error while ${presentActionText.data.toLowerCase()} sms template.`, 'error')
        }
      }).finally(() => {
        this.isSaving = false
      })
    },

    getSmsTemplates () {
      return talk2Api.V1.smsTemplate.get().then(response => {
        this.setSmsTemplates(response.data)
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
