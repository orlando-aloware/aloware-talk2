<template>
  <div class="templates-list-wrapper">
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Agent Templates</span>
      <b-link class="action-links" href="" @click="onAdd('user')">
        <add-icon-circle width="14" height="14"></add-icon-circle>
        New
      </b-link>
    </div>
    <message-templates-list @templateSelected="templateSelected" @templateDeleted="onDelete" template_scope="user"></message-templates-list>
    <hr/>
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Account Templates</span>
      <b-link class="action-links" href="" @click="onAdd('company')">
        <add-icon-circle width="14" height="14"></add-icon-circle>
        New
      </b-link>
    </div>
    <message-templates-list @templateSelected="templateSelected" @templateDeleted="onDelete" template_scope="company"></message-templates-list>
    <b-overlay :show="showDeleteConfirmation" no-wrap @shown="onShown" @hidden="onHidden">
      <template #overlay>
        <div v-if="isDeleting" class="text-center p-4 text-light rounded">
          <q-spinner-bars color="success" size="40px" />
          <div class="mb-3">Deleting template...</div>
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
          <p><strong id="form-confirm-label">Do you wish to delete selected template?</strong></p>
          <div class="d-flex">
            <b-button variant="outline-danger" class="mr-3" @click="onCancel">
              No, keep
            </b-button>
            <b-button variant="outline-success" @click="onConfirmDeletion">Yes, delete</b-button>
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
export default {
  name: 'message-templates',
  components: { AddIconCircle, MessageTemplatesList },
  data () {
    return {
      selectedTemplate: {},
      showDeleteConfirmation: false,
      isDeleting: false
    }
  },
  methods: {
    ...mapActions(['deleteSmsTemplate']),
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
      let _this = this
      this.showDeleteConfirmation = false
      this.$nextTick(function () {
        setTimeout(function () {
          _this.$root.$emit('bv::show::popover', 'sms-templates-popover')
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
            this.deleteSmsTemplate(this.selectedTemplate)
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
