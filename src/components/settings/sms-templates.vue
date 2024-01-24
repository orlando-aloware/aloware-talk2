<template>
  <b-container fluid
               :class="horizontalPaddingClass">
    <b-row class="row-no-padding">
      <b-col class="pt-2"
             sm="12"
             md="12"
             :class="horizontalPaddingClass">
        <div class="d-inline-flex">
          <slot name="header">
          </slot>
          <h1 class="mt-2"> SMS Templates </h1>
        </div>
      </b-col>
    </b-row>
    <b-row class="mt-4 row-no-padding">
      <b-col class="no-gutters"
             sm="12"
             md="12"
             :class="horizontalPaddingClass">
        <block-tooltip placement="left"
                       triggers="click"
                       target="sms-template-popover"
                       task="sms.template">
        </block-tooltip>
        <div id="sms-template-popover">
          <b-button variant="primary"
                    size="sm"
                    @click="onAdd('user')">
            <i class="fa fa-plus mr-1" /> New Template
          </b-button>
        </div>
      </b-col>
    </b-row>

    <b-row class="mt-3 row-no-padding">
      <b-col class="no-gutters"
             sm="12"
             md="12"
             :class="horizontalPaddingClass">
        <datatable :customClass="horizontalPaddingClass.join(' ')"
                   :columns="columns"
                   :is-scrollable="false"
                   :is-loading-more="isLoading">
          <template slot="tbody">
            <tr class="datatable-row"
                :key="template.id"
                v-for="template in userTemplates">
              <template v-for="column in columns">
                <td class="datatable-row__name"
                    :key="column.name"
                    v-if="column.name === 'id'">
                  <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                      {{ template.id }}
                    </div>
                  </div>
                </td>

                <td class="datatable-row__name"
                    :key="column.name"
                    v-else-if="column.name === 'template_name'">
                  <div class="d-flex align-items-center">
                    <div class="flex-grow-1">
                     {{ template.name }}
                    </div>
                  </div>
                </td>

                <td class="datatable-row__phone"
                    :key="column.name"
                    v-else-if="column.name === 'body'">
                  <div class="ellipse">
                   {{ template.body }}
                  </div>
                </td>
                <td class="datatable-row__phone"
                    :key="column.name"
                    v-else-if="column.name === 'action'">
                  <div>
                    <b-button size="sm"
                              variant="primary"
                              @click="onEdit(template)">

                      <pencil-o-icon color="#FFF"/>
                    </b-button>
                    <b-button size="sm"
                              variant="danger"
                              class="ml-1"
                              @click="onDelete(template)">

                      <trash-o-icon color="#FFF"/>
                    </b-button>
                  </div>
                </td>
              </template>
            </tr>
          </template>
        </datatable>
      </b-col>
    </b-row>
    <sms-template-modal @templateSaved="templateSaved"/>
  </b-container>
</template>

<script>
import Datatable from 'components/datatable'
import { mapActions } from 'vuex'
import SmsTemplateModal from 'components/sms-template-modal'
import talk2Api from 'src/plugins/api/api'
import TrashOIcon from 'components/icons/trash-o-icon'
import PencilOIcon from 'components/icons/pencil-o-icon'
import BlockTooltip from 'components/kyc/block-tooltip'
import { settingsLayoutMixin, kycMixin } from 'src/plugins/mixins'

export default {
  name: 'sms-templates',

  components: {
    PencilOIcon,
    TrashOIcon,
    SmsTemplateModal,
    Datatable,
    BlockTooltip
  },

  mixins: [
    settingsLayoutMixin,
    kycMixin
  ],

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

  mounted () {
    this.getTemplates()

    this.setSmsTemplateModal(
      {
        isOpen: false
      }
    )
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
        if (!confirm) {
          return
        }

        talk2Api.V1.smsTemplate.delete(template.id)
          .then(response => {
            if (response.status === 204) {
              this.templates = this.templates.filter(item => item.id !== template.id)
              this.$generalNotification(`SMS template has been successfully deleted.`, 'success')
            }
          }).catch(() => {
            this.$generalNotification(`Error while deleting selected template.`, 'error')
          })
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
  }
}
</script>
