<template>
  <b-modal :title="title"
           size="md"
           v-model="isOpen"
           scrollable
           @hidden="onHidden">

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
    <b-popover ref="popover"
               id="templates-sms-variables-popover"
               placement="topright"
               target="btn-sms-variables"
               triggers="click blur">
      <variables @variableSelected="variableSelected" always-open></variables>
    </b-popover>
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
    ...mapState({
      currentCompany: 'currentCompany'
    }),
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

    variableSelected (variable) {
      this.template.body = (this.template.body ?? '') + ' ' + variable
      this.$root.$emit('bv::hide::popover', 'templates-sms-variables-popover')
    },

    onSubmit () {
      this.isSaving = true
      let pastActionText = 'Created'
      let presentActionText = 'Creating'
      let params = this.getParams()

      let request = null

      if (this.smsTemplateModal.template && this.smsTemplateModal.template.id) {
        params.company_id = this.currentCompany.id

        request = talk2Api.V1.smsTemplate.update(this.smsTemplateModal.template.id, params)
        pastActionText = 'Updated'
        presentActionText = 'Updating'
      } else {
        request = talk2Api.V1.smsTemplate.create(params)
      }

      request.then(response => {
        console.log(response)
        this.getSmsTemplates()
        this.onHidden()
        this.$q.notify({
          duration: 2500,
          title: 'Event',
          message: `Template has been ${pastActionText.toLowerCase()}.`,
          type: 'positive',
          position: 'bottom-right'
        })
      }).catch(error => {
        console.log(error)
        this.$q.notify({
          duration: 2500,
          title: 'Event',
          message: `Error while ${presentActionText.toLowerCase()} event.`,
          type: 'negative',
          position: 'bottom-right'
        })
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

<style lang="scss" scoped>
.time-picker-column::-webkit-scrollbar {
  display: block;
}

.appointment-form {
  font-size: 12px;

  .form-title {
    font-size: 11px;
  }
  .sms-reminder-template-variables {
    cursor: pointer;
  }

  .sms-reminder-template-variables:hover {
    color: #C4183C !important;
  }

  .checkbox-wrapper .custom-control-label {
    padding-top: 3px;
  }

  span.sms-reminder-label {
    display: block;
    margin-top: 4px;
  }
}
</style>
