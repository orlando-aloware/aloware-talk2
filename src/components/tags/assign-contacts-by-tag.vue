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
        v-if="!isBulk"
        v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`" />

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModal">
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
import axios from 'axios'
import { mapGetters } from 'vuex'

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
    ...mapGetters('tagsModule', [
      'getSelectedTagIds'
    ]),

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
      this.ringGroupId = null
    },

    setRingGroupId (ringGroupId) {
      this.ringGroupId = ringGroupId
      this.userId = null
    },

    assignContacts () {
      this.loading = true

      let msg = `Are you sure you want the contacts under `
      msg += (this.isBulk ? `these tags` : 'this tag')
      msg += ` to be assigned to this ${this.tabNameLabel}?`

      this.$bvModal.msgBoxConfirm(msg, {
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

          if (this.isBulk) {
            this.bulkAssign()
            return
          }

          this.assign()
        })
    },

    assign () {
      const payload = {
        assign_contacts_to: this.tabName,
        user_id: this.userId,
        ring_group_id: this.ringGroupId,
        force: this.distributeContacts
      }

      axios.post(`/api/v1/tags/${this.tag.id}/assign-contacts-to`, payload)
        .then(res => {
          this.$generalNotification(res.data.message)
        }).catch(err => {
          this.$handleErrors(err.response)
          console.log(err)
        }).finally(() => {
          this.loading = false
          this.closeModal()
        })
    },

    bulkAssign () {
      if (!this.isBulk || !this.hasSelectedTagIds) {
        return
      }

      const payload = {
        assign_contacts_to: this.tabName,
        user_id: this.userId,
        ring_group_id: this.ringGroupId,
        force: this.distributeContacts,
        tag_ids: this.getSelectedTagIds
      }

      axios.post(`/api/v1/tags/bulk-assign-contacts`, payload)
        .then(res => {
          this.$generalNotification(res.data.message)
          this.clearAllSelectedTags()
        }).catch(err => {
          this.$handleErrors(err.response)
          console.log(err)
        }).finally(() => {
          this.loading = false
          this.closeModal()
        })
    }
  }
}
</script>
