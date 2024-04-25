<template>
  <div class="templates-list-wrapper" data-testid="message-templates-wrapper">
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Agent Templates</span>
      <b-link class="action-links"
              href=""
              data-testid="message-agent-templates-new-agent-template-link"
              @click="onAdd('user')">
        <add-icon-circle width="14" height="14" data-testid="message-agent-templates-add-icon"></add-icon-circle>
        New
      </b-link>
    </div>
    <message-templates-list template_scope="user"
                            data-testid="message-agent-templates-list"
                            @templateSelected="templateSelected"
                            @templateDeleted="onDelete" ></message-templates-list>
    <hr/>
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Account Templates</span>
      <b-link v-if="isCompanyAdmin"
              class="action-links"
              href=""
              data-testid="message-templates-new-account-template-link"
              @click="onAdd('company')">
        <add-icon-circle width="14" height="14"></add-icon-circle>
        New
      </b-link>
    </div>
    <message-templates-list template_scope="company"
                            data-testid="message-account-templates-list"
                            @templateSelected="templateSelected"
                            @templateDeleted="onDelete" ></message-templates-list>
    <b-overlay :show="showDeleteConfirmation"
               data-testid="message-templates-delete-confirmation-overlay"
               no-wrap @shown="onShown"
               @hidden="onHidden">
      <template #overlay>
        <div v-if="isDeleting"
             class="text-center p-4 text-light rounded">
          <q-spinner-bars color="success"
                          data-testid="message-account-template-delete-spinner"
                          size="40px" />
          <div class="mb-3" data-testid="message-template-deleting-template">Deleting template...</div>
        </div>
        <div
          v-else
          ref="dialog"
          tabindex="-1"
          role="dialog"
          aria-modal="false"
          aria-labelledby="form-confirm-label"
          class="text-center p-3"
        >
          <p><strong id="form-confirm-label" data-testid="message-template-delete-selected-template">Do you wish to delete selected template?</strong></p>
          <div class="d-flex">
            <b-button variant="outline-danger"
                      class="mr-3"
                      data-testid="message-template-cancel-button"
                      @click="onCancel">
              No, keep
            </b-button>
            <b-button variant="outline-success" data-testid="message-template-delete-button" @click="onConfirmDeletion">Yes, delete</b-button>
          </div>
        </div>
      </template>
    </b-overlay>
  </div>
</template>

<script>

import MessageTemplatesList from 'components/message-composer/options/message-templates-list'
import AddIconCircle from 'components/icons/add-icon-circle'
import { mapActions } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as Roles from 'src/constants/roles'
import { aclMixin } from 'src/plugins/mixins'
export default {
  name: 'message-templates',

  mixins: [aclMixin],

  components: { AddIconCircle, MessageTemplatesList },

  computed: {
    isCompanyAdmin () {
      return this.hasRole(Roles.COMPANY_ADMIN) || this.hasRole(Roles.BILLING_ADMIN)
    }
  },

  data () {
    return {
      selectedTemplate: {},
      showDeleteConfirmation: false,
      isDeleting: false
    }
  },

  methods: {
    ...mapActions(['deleteTemplate']),
    ...mapActions('contacts', ['setSmsTemplateModal']),
    templateSelected (template) {
      this.$emit('templateSelected', template)
    },
    onAdd (scope) {
      this.setSmsTemplateModal(
        {
          isOpen: true,
          scope: scope
        }
      )
    },
    onCancel () {
      this.showDeleteConfirmation = false
      this.$nextTick(() => {
        setTimeout(() => {
          this.$root.$emit('bv::show::popover', 'sms-templates-popover')
        }, 500)
      })
    },
    onShown () {
      this.$refs.dialog.focus()
    },
    onHidden () {
      // TODO need to prevent closing of popover when overlay is hidden
    },
    onDelete (template) {
      this.selectedTemplate = template
      this.showDeleteConfirmation = true
    },
    onConfirmDeletion () {
      this.isDeleting = true
      talk2Api.V1.smsTemplate.delete(this.selectedTemplate.id)
        .then(response => {
          if (response.status === 204) {
            this.deleteTemplate(this.selectedTemplate)
            this.showDeleteConfirmation = false
          }
        }).finally(() => {
          this.isDeleting = false
          this.$root.$emit('bv::show::popover', 'sms-templates-popover')
        })
    }
  }
}
</script>
