<template>
  <b-modal id="tag-contacts-splitter-modal"
           modal-class="tags__modal"
           size="sm"
           centered
           data-testid="tags-contact-splitter-modal"
           v-model="openModal"
           @hide="closeModalPrompt">
    <b-overlay rounded="sm"
               no-wrap
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6 data-testid="tags-contact-splitter-modal-title">{{ formName }}</h6>
    </template>

    <p v-html="`Split <span class='font-italic font-weight-bold'>${ tagName }</span> tag into smaller tags.`">
    <div>
      <vue-multiselect track-by="value"
                       label="label"
                       class="mr-1 chip__clear-blue shrink-options"
                       placeholder="Select page size"
                       :searchable="true"
                       :showNoResults="false"
                       :close-on-select="true"
                       :options="options"
                       :show-labels="false"
                       :allow-empty="false"
                       data-testid="tags-contact-splitter-modal-page-size"
                       v-model="selectedPageSize"
                       @select="setSplitPageSize" />
    </div>
    <p class="text-red text-11 mb-0 mt-1"
       v-show="!allowSplit">
      Contact count is less than or equal to page size.
    </p>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  data-testid="tags-contact-splitter-modal-cancel-button"
                  @click.prevent="closeModalPrompt">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  :disabled="!splitPageSize || !selectedPageSize || !allowSplit"
                  data-testid="tags-contact-splitter-modal-split-button"
                  @click.prevent="split">
            Split
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { tagsMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'tag-contacts-splitter',

  mixins: [
    tagsMixin
  ],

  components: {
    VueMultiselect
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
      options: [
        {
          value: 50,
          label: '50'
        },
        {
          value: 100,
          label: '100'
        },
        {
          value: 200,
          label: '200'
        },
        {
          value: 500,
          label: '500'
        },
        {
          value: 1000,
          label: '1000'
        }
      ],
      splitPageSize: null,
      selectedPageSize: null
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

    allowSplit () {
      if (!this.tag) {
        return false
      }

      return this.tag.contacts_count > this.splitPageSize
    },

    formName () {
      return `Split Tag`
    }
  },

  methods: {
    closeModalPrompt (bvModalEvent) {
      if (!this.selectedPageSize) {
        this.closeModal()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the ${this.formName}form?`, {
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
    },

    reset () {
      this.splitPageSize = null
      this.selectedPageSize = null
    },

    setSplitPageSize () {
      this.splitPageSize = this.selectedPageSize.value
    },

    split () {
      if (!this.allowSplit) {
        return
      }

      this.loading = true

      const payload = {
        page_size: this.splitPageSize
      }

      API.V1.tags.split(this.tag.id, payload)
        .then(res => {
          this.loading = false

          switch (res.status) {
            case 200:
              this.$generalNotification('Currently splitting the tag into smaller tags.')
              break
            default:
              this.$generalNotification(res.data.message, 'error')
          }

          this.closeModal()
        })
        .catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
