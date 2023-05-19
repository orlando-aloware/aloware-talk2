<template>
  <b-modal id="tag-assign-contact-modal"
           modal-class="tags__modal"
           no-close-on-esc
           no-close-on-backdrop
           centered
           size="md"
           v-model="openModal"
           @hidden="closeModal">
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
      <h6>Assign Contacts to</h6>
    </template>

    <b-tabs content-class="mt-3"
            v-model="selectedTabIndex">
      <b-tab title="User">
        <p>Assign the leads to this user</p>
        <user-selector :generic-styling="false"
                       v-model="userId"
                       @change="setUserId"/>
      </b-tab>

      <b-tab title="Ring Group">
        <p>Assign the leads evenly and randomly between the users on this ring group</p>
        <ring-group-selector class="text-13"
                             v-model="ringGroupId"
                             :force-remove-missing-values="true"
                             :generic-multiselect="false"
                             @change="setRingGroupId"/>
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
       v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`" />

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModal">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
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
import axios from 'axios'

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
    }
  },

  methods: {
    closeModal () {
      this.reset()
      this.$emit('closeAssignContactsTagModal')
    },

    reset () {
      this.selectedTabIndex = 0
      this.userId = null
      this.ringGroupId = null
      this.distributeContacts = false
    },

    setUserId (userId) {
      this.userId = userId
    },

    setRingGroupId (ringGroupId) {
      this.ringGroupId = ringGroupId
    },

    assignContacts () {
      this.loading = true

      this.$bvModal.msgBoxConfirm(`Are you sure you want the contacts under this tag to be assigned to this ${this.tabName}?`, {
        title: 'Event Confirmation',
        okTitle: 'Yes',
        cancelTitle: 'No',
        size: 'sm',
        buttonSize: 'sm'
      })
        .then(confirm => {
          if (!confirm) {
            this.loading = false
            return
          }

          let data = {
            assign_contacts_to: this.tabName,
            user_id: this.userId,
            ring_group_id: this.ringGroupId,
            force: this.distributeContacts
          }

          axios.post(`/api/v1/tags/${this.tag.id}/assign-contacts-to`, data)
            .then(res => {
              this.$generalNotification(res.data.message)
            }).catch(err => {
              this.$handleErrors(err.response)
              console.log(err)
            }).finally(() => {
              this.loading = false
              this.closeModal()
            })
        })
    }
  }
}
</script>
