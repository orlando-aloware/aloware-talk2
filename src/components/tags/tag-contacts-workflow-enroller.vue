<template>
  <b-modal id="tag-enroll-tag-contacts-to-sequence-modal"
           modal-class="tags__modal"
           no-close-on-esc
           no-close-on-backdrop
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
      <h6>Enroll to sequence</h6>
    </template>

    <div>
      <label class="label mt-2 mb-1">Choose the sequence you want this tagged contacts to enroll</label>
      <workflow-selector />
    </div>

    <ul class="list-unstyled py-4 mb-0">
      <li class="mb-2">
        <div class="d-flex flex-row">
          <div class="mr-2"><i class="fa fa-info-circle text-warning" aria-hidden="true"></i></div>
          <div>
            Contacts that are already enrolled in a sequence will not be enrolled.
          </div>
        </div>
      </li>
      <li class="mb-2">
        <div class="d-flex flex-row">
          <div class="mr-2"><i class="fa fa-info-circle text-warning" aria-hidden="true"></i></div>
          <div>
            Contacts the has a DNC status will not be enrolled.
          </div>
        </div>
      </li>
      <li class="mb-2">
        <div class="d-flex flex-row">
          <div class="mr-2"><i class="fa fa-info-circle text-warning" aria-hidden="true"></i></div>
          <div>
            Contact groups that has thousands of contacts will take time to enroll.
          </div>
        </div>
      </li>
    </ul>

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
                  @click.prevent="enrollContacts">
            Enroll Contacts
          </button>
        </div>
      </div>
    </template>

  </b-modal>
</template>

<script>
import WorkflowSelector from 'components/integrations/workflow-selector.vue'

export default {
  name: 'tag-contacts-workflow-enroller',

  components: {
    WorkflowSelector
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
      loading: false
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
      this.$emit('closeEnrollTagContactsToSequenceDialog')
    },

    enrollContacts () {
      console.log('enroll to sequence')
    }
  }
}
</script>
