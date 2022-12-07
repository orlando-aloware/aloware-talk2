<template>
  <b-container fluid>
    <b-row class="row-no-padding">
      <b-col sm="12" md="12">
        <div class="d-inline-flex">
          <slot name="header">
          </slot>
          <h1 class="mt-2"> SMS Templates </h1>
        </div>
      </b-col>
    </b-row>
    <b-row class="mt-4 row-no-padding">
      <b-col sm="12" md="12" class="no-gutters">
        <b-button variant="primary" size="sm" @click="onAdd('user')">
          <i class="fa fa-plus mr-1"></i> New Template
        </b-button>
      </b-col>
    </b-row>

    <b-row class="mt-3 row-no-padding">
      <b-col sm="12" md="12" class="no-gutters">
        <datatable :columns="columns"
                   :is-scrollable="false"
                   :is-loading-more="isLoading">
          <template slot="tbody">
            <tr class="datatable-row" v-for="template in userTemplates" :key="template.id">
              <template v-for="column in columns">
                <td
                  :key="column.name"
                  class="datatable-row__name"
                  v-if="column.name === 'id'"
                >
                  <div class="d-flex align-items-center">

                    <div class="flex-grow-1">
                      {{ template.id }}
                    </div>
                  </div>
                </td>

                <td
                  :key="column.name"
                  class="datatable-row__name"
                  v-else-if="column.name === 'template_name'"
                >
                  <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                     {{ template.name }}
                    </div>
                  </div>
                </td>

                <td
                  :key="column.name"
                  v-else-if="column.name === 'body'"
                  class="datatable-row__phone"
                >
                  <div class="ellipse">
                   {{ template.body }}
                  </div>
                </td>
                <td
                  :key="column.name"
                  v-else-if="column.name === 'action'"
                  class="datatable-row__phone"
                >
                  <div>
                    <b-button size="sm"
                              variant="primary"
                              @click="onEdit(template)">

                      <pencil-o-icon color="#FFF"></pencil-o-icon>
                    </b-button>
                    <b-button size="sm"
                              variant="danger"
                              class="ml-1"
                              @click="onDelete(template)">

                      <trash-o-icon color="#FFF"></trash-o-icon>
                    </b-button>
                  </div>
                </td>
              </template>
            </tr>
          </template>
        </datatable>
      </b-col>
    </b-row>
    <sms-template-modal @templateSaved="templateSaved"></sms-template-modal>
  </b-container>
</template>

<script>
import Datatable from 'components/datatable'
import { mapActions } from 'vuex'
import SmsTemplateModal from 'components/sms-template-modal'
import talk2Api from 'src/plugins/api/api'
import TrashOIcon from 'components/icons/trash-o-icon'
import PencilOIcon from 'components/icons/pencil-o-icon'

export default {
  name: 'sms-templates',

  components: { PencilOIcon, TrashOIcon, SmsTemplateModal, Datatable },

  props: {
    user: {
      required: true
    }
  },

  computed: {
    userTemplates () {
      return this.templates.filter(item => item.user_id === this.user.id)
    }
  },

  data () {
    return {
      columns: [
        {
          name: 'id',
          label: 'ID',
          default: true,
          sticky: true,
          sortable: false
        },
        {
          name: 'template_name',
          label: 'Name',
          resizable: false,
          sortable: false,
          minWidth: 225

        },
        {
          name: 'body',
          label: 'Body',
          default: true,
          sticky: true,
          resizable: false,
          sortable: false,
          minWidth: 225
        },
        {
          name: 'action',
          label: 'Action',
          default: true,
          sticky: true,
          resizable: false,
          sortable: false
        }
      ],
      templates: [],
      isLoading: false
    }
  },

  methods: {
    ...mapActions('contacts', ['setSmsTemplateModal']),
    onAdd (scope) {
      this.setSmsTemplateModal(
        {
          isOpen: true,
          scope: scope
        }
      )
    },
    onEdit (template) {
      this.setSmsTemplateModal({
        isOpen: true,
        scope: 'user',
        template: template
      })
    },

    onDelete (template) {
      this.$bvModal.msgBoxConfirm('Do you wish to delete this template?', {
        buttonSize: 'sm',
        okTitle: 'Yes, delete',
        cancelTitle: 'No, keep'
      }).then(confirm => {
        if (confirm) {
          talk2Api.V1.smsTemplate.delete(template.id)
            .then(response => {
              if (response.status === 204) {
                this.templates = this.templates.filter(item => item.id !== template.id)
                this.$generalNotification(`SMS template has been successfully deleted.`, 'success')
              }
            }).catch(() => {
              this.$generalNotification(`Error while deleting selected template.`, 'error')
            })
        }
      })
    },

    templateSaved () {
      this.getTemplates()
    },

    getTemplates () {
      this.isLoading = true
      return talk2Api.V1.smsTemplate.get()
        .then(response => {
          this.isLoading = false
          this.templates = response.data
        }).catch((error) => {
          this.$handleErrors(error.response)
        })
    }
  },

  mounted () {
    this.getTemplates()

    this.setSmsTemplateModal(
      {
        isOpen: false
      }
    )
  }
}
</script>
