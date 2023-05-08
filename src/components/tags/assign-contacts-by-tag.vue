<template>
  <b-modal id="tag-assign-contact-modal"
           modal-class="tags__modal"
           no-close-on-esc
           no-close-on-backdrop
           centered
           size="md"
           v-model="openModal"
           @hidden="closeModal">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>Assign Contacts to</h6>
    </template>

    <b-tabs content-class="mt-3">
      <b-tab title="User" active>
        <p>Assign the leads to this user</p>
        <user-selector />
      </b-tab>

      <b-tab title="Ring Group">
        <p>Assign the leads evenly and randomly between the users on this ring group</p>
        <ring-group-selector :force-remove-missing-values="true"
                             :generic-multiselect="false" />
      </b-tab>
    </b-tabs>

    <div class="py-4">
      <p class="mb-1">By default, this tool only distributes unassigned contacts.</p>
      <b-form-checkbox v-model="distributeContacts"
                       value="yes"
                       unchecked-value="no">
        <span class="font-weight-bold">Also distribute assigned contacts</span>
      </b-form-checkbox>
    </div>

    <p class="text-11 mt-2 mb-0">
      <span class="font-weight-bold">Tag:</span> {{ tagName }}
    </p>

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

export default {
  name: 'assign-contacts-by-tag',

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
      distributeContacts: 'no'
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

    tagName () {
      return this?.tag?.name || ''
    }
  },

  methods: {
    closeModal () {
      this.$emit('closeAssignContactsTagModal')
    },

    assignContacts () {
      console.log('assign contacts')
    }
  }
}
</script>
