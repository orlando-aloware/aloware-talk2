<template>
  <div ref="templateWrapper" data-testid="messages-templates-list-wrapper">
    <ul class="pl-0">
      <li class="d-flex justify-content-between"
          v-for="template in templates"
          :key="template.id">
        <div class="template-title ellipsis">{{ template.name }}</div>
        <div class="d-flex justify-content-between template-actions">
          <b-link href="#"
                  class="active"
                  data-testid="message-templates-list-use-template-link"
                  @click="templateSelected(template)">
            <q-tooltip anchor="top middle"
                       data-testid="message-templates-use-tooltip"
                       self="center middle">
              Use
            </q-tooltip>
            <add-icon-square data-testid="message-templates-list-add-icon-square"></add-icon-square>
          </b-link>
          <b-link href="#"
                  data-testid="message-templates-list-view-template-link"
                  :id="`template-view-${template.id}`">
            <q-tooltip anchor="top middle"
                       data-testid="message-templates-view-tooltip"
                       self="center middle">
              View
            </q-tooltip>
            <eye-icon height="16" width="16" data-testid="message-templates-list-eye-icon"></eye-icon>
            <q-menu content-class="mx-height-300 template-preview"
                    ref="templatesMenu"
                    max-width="15rem"
                    data-testid="message-templates-list-body-menu"
                    :offset="[225, 0]">
              <div class="row no-wrap q-pa-md">
                {{ template.body }}
              </div>
            </q-menu>
          </b-link>
          <b-link v-if="canEdit(template)"
                  href="#"
                  data-testid="message-templates-list-edit-template-link"
                  @click="onEdit(template)">
            <q-tooltip anchor="top middle"
                       data-testid="message-templates-edit-tooltip"
                       self="center middle">
              Edit
            </q-tooltip>
            <pencil-o-icon color="#62666E" data-testid="message-templates-list-pencil-icon"/>
          </b-link>
          <b-link v-if="canDelete(template)"
                  href="#"
                  data-testid="message-templates-list-delete-template-link"
                  @click="onDelete(template)">
            <q-tooltip anchor="top middle"
                       self="center middle">
              Delete
            </q-tooltip>
            <trash-o-icon/>
          </b-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PencilOIcon from 'components/icons/pencil-o-icon'
import AddIconSquare from 'components/icons/add-icon-square'
import EyeIcon from 'components/icons/eye-icon'
import TrashOIcon from 'components/icons/trash-o-icon'
import { aclMixin } from 'src/plugins/mixins'
import * as Roles from 'src/constants/roles'
export default {
  name: 'sms-templates-list',

  mixins: [aclMixin],

  components: { TrashOIcon, EyeIcon, AddIconSquare, PencilOIcon },

  props: {
    template_scope: {
      default: 'user',
      validator: function (value) {
        return ['user', 'company'].indexOf(value) !== -1
      }
    }
  },

  computed: {
    ...mapState({ smsTemplates: 'templates' }),
    ...mapGetters('contacts', ['messageComposer']),
    agentTemplates () {
      return this.smsTemplates.filter(template => template.is_on_user === 1)
    },
    accountTemplates () {
      return this.smsTemplates.filter(template => template.is_on_company === 1)
    },
    templates () {
      return this.template_scope === 'user' ? this.agentTemplates : this.accountTemplates
    },

    isCompanyAdmin () {
      return this.hasRole(Roles.COMPANY_ADMIN) || this.hasRole(Roles.BILLING_ADMIN)
    }
  },

  data () {
    return {
      selectedTemplate: {}
    }
  },

  methods: {
    ...mapActions('contacts', ['setSmsTemplateModal']),
    templateSelected (template) {
      this.$emit('templateSelected', template)
    },

    canEdit (template) {
      return this.canDoActions(template, 'update')
    },

    canDelete (template) {
      return this.canDoActions(template, 'archive')
    },

    canDoActions (template, action) {
      if (template.deleted_at) {
        return false
      }

      switch (this.template_scope) {
        case 'user':
          return this.hasPermissionTo(action + ' sms template')
        case 'company':
          return this.isCompanyAdmin &&
            this.hasPermissionTo(action + ' sms template')
      }

      return false
    },

    onDelete (template) {
      this.$emit('templateDeleted', template)
    },
    onEdit (template) {
      this.setSmsTemplateModal({
        isOpen: true,
        scope: this.template_scope,
        template: template
      })
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  li{
    font-size: 14px;
    color: #62666E;
    font-weight: normal;
    line-height: 16px;
    padding: 10px;
    cursor: pointer;
  }

  li:hover{
    background: #F4F4F6;
    border-radius: 8px;
  }

  li .template-title {
    max-width: 300px;
    padding-right: 20px;
  }

  li a:not(:last-child) {
    padding-right: 10px;
  }
}

</style>
