<template>
  <div ref="templateWrapper" data-testid="messages-templates-list-wrapper">
    <div v-if="filteredTemplates.length === 0 && searchQuery" class="no-results p-3 text-center text-muted">
      <small>No templates found matching "{{ searchQuery }}"</small>
    </div>
    <ul class="pl-0" v-else>
      <li class="d-flex justify-content-between"
          v-for="template in filteredTemplates"
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
import AddIconSquare from 'components/icons/add-icon-square'
import EyeIcon from 'components/icons/eye-icon'
import PencilOIcon from 'components/icons/pencil-o-icon'
import TrashOIcon from 'components/icons/trash-o-icon'
import * as Roles from 'src/constants/roles'
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
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
    },
    searchQuery: {
      type: String,
      default: ''
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
    filteredTemplates () {
      if (!this.searchQuery || this.searchQuery.trim() === '') {
        return this.templates
      }

      const query = this.searchQuery.toLowerCase().trim()
      return this.templates.filter(template => {
        const nameMatch = template.name && template.name.toLowerCase().includes(query)

        // Word matching for body content
        const bodyMatch = template.body && this.matchWords(template.body.toLowerCase(), query)

        return nameMatch || bodyMatch
      })
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

    matchWords (text, query) {
      // Split query into individual words
      const queryWords = query.split(/\s+/).filter(word => word.length > 0)

      // Check if all query words exist as complete words in the text
      return queryWords.every(queryWord => {
        // Use word boundary regex to match complete words only
        const wordRegex = new RegExp(`\\b${queryWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        return wordRegex.test(text)
      })
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

.no-results {
  font-style: italic;
  color: #888;
}
</style>
