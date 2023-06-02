<template>
  <b-modal id="tag-assign-contact-modal"
           modal-class="tags__modal"
           centered
           size="md"
           v-model="openModal"
           @hide="closeModalPrompt">
    <b-overlay no-wrap
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>{{ formName }}</h6>
    </template>

    <b-tabs content-class="mt-3"
            v-model="selectedTabIndex">
      <b-tab title="User">
        <p>Assign the leads to this user</p>
        <user-selector :generic-styling="false"
                       v-model="userId"
                       @change="setUserId" />
      </b-tab>

      <b-tab title="Ring Group">
        <p>Assign the leads evenly and randomly between the users on this ring group</p>
        <ring-group-selector class="text-13"
                             :generic-multiselect="false"
                             v-model="ringGroupId"
                             @change="setRingGroupId" />
      </b-tab>
    </b-tabs>

    <div class="py-4">
      <p class="mb-1">By default, this tool only distributes unassigned contacts.</p>
      <b-form-checkbox v-model="distributeContacts"
                       switch>
        <span class="font-weight-bold">Also distribute assigned contacts</span>
      </b-form-checkbox>
    </div>

     <p class="text-13 mt-2 mb-0"
        v-if="!isBulk"
        v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`" />

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModalPrompt">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  :disabled="!userId && !ringGroupId"
                  @click.prevent="assignContacts">
            Assign
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import UserSelector from 'components/generic-selectors/user-selector.vue'
import RingGroupSelector from 'components/generic-selectors/ring-group-selector.vue'
import { tagsMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'assign-contacts-by-tag',

  mixins: [
    tagsMixin
  ],

  components: {
    RingGroupSelector,
    UserSelector
  },

  props: {
    tag: {
      type: Object,
      required: false
    },

    isShow: {
      type: Boolean,
      required: true
    },

    isBulk: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      distributeContacts: false,
      selectedTabIndex: 0,
      userId: null,
      ringGroupId: null
    }
  },

  computed: {
    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    },

    tabName () {
      return this.selectedTabIndex === 1 ? 'ring_group' : 'user'
    },

    tabNameLabel () {
      return this.tabName.replace('_', ' ')
    },

    formName () {
      return `Assign Contacts to`
    }
  },

  methods: {
    closeModalPrompt (bvModalEvent) {
      if (!this.userId && !this.ringGroupId && !this.distributeContacts) {
        this.closeModal()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the ${this.formName} form?`, {
        title: `Close ${this.formName}`,
        okTitle: 'Yes, I\'m sure',
        cancelTitle: 'No, I\'m not',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (confirm) {
            this.closeModal()
          }
        })
    },

    closeModal () {
      this.$emit('closeAssignContactsTagModal')
      this.reset()
      this.$bvModal.hide('tag-assign-contact-modal')
    },

    reset () {
      this.selectedTabIndex = 0
      this.userId = null
      this.ringGroupId = null
      this.distributeContacts = false
    },

    setUserId (userId) {
      this.userId = userId
      this.ringGroupId = null
    },

    setRingGroupId (ringGroupId) {
      this.ringGroupId = ringGroupId
      this.userId = null
    },

    assignContacts () {
      this.loading = true

      let msg = `Are you sure you want the contacts under `
      msg += (this.isBulk) ? `these tags` : 'this tag'
      msg += ` to be assigned to this ${this.tabNameLabel}?`

      this.$bvModal.msgBoxConfirm(msg, {
        title: 'Event Confirmation',
        okTitle: 'Yes',
        cancelTitle: 'No',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (confirm) {
            this.assign()
          }
        })
    },

    assign () {
      let payload = {
        assign_contacts_to: this.tabName,
        user_id: this.userId,
        ring_group_id: this.ringGroupId,
        force: this.distributeContacts
      }
      let xhr = null

      if (this.isBulk) {
        payload.tag_ids = this.getSelectedTagIds
        xhr = API.V1.tags.bulkAssignContactsTo(payload)
      } else {
        xhr = API.V1.tags.assignContactsTo(this.tag.id, payload)
      }

      xhr
        .then(res => {
          this.loading = false
          this.$generalNotification(res.data.message)
          this.closeModal()
        }).catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>
