<template>
  <b-modal id="tags-delete-dialog"
           modal-class="tags__modal"
           size="md"
           centered
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
      <h6>{{ formName }}</h6>
    </template>

    <span v-html="promptMessage" />

    <b-form-checkbox value="yes"
                     unchecked-value="no"
                     class="mt-4"
                     v-if="!isBulk"
                     v-show="!isBulk && showDeleteContactsQuestion"
                     v-model="isDeleteContacts">
      Do you also want to delete the tagged contacts of this tag?
    </b-form-checkbox>

    <div class="text-left break-word mt-4 mb-0"
         v-if="!isBulk"
         v-show="showConfirmDeleteInfo">
      <p>
          You're about to delete <span class="font-weight-bold">{{ (tag?.contacts_count || 0) | numFormat }} contacts</span>.
          Use the text field below to confirm the number of contacts you want to delete.
      </p>
     <b-form-group invalid-feedback="Number of contacts does not match"
                   :state="validateState('confirmDeleteContactsCount')">
        <b-form-input :placeholder="`${tag?.contacts_count}`"
                      v-model.trim="$v.confirmDeleteContactsCount.$model" />
       </b-form-group>
    </div>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    @click.prevent="closeModalPrompt">
              Cancel
            </button>
            <button class="btn btn-sm btn-danger text-white"
                    :disabled="disabled"
                    @click.prevent="deleteTag">
              Delete
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { numeric, requiredIf } from 'vuelidate/lib/validators'
import { tagsMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'delete-tag-dialog',

  mixins: [
    tagsMixin
  ],

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
      isDeleteContacts: 'no',
      confirmDeleteWithContacts: false,
      confirmDeleteContactsCount: null
    }
  },

  validations () {
    return {
      confirmDeleteContactsCount: {
        required: requiredIf(this.isDeleteContacts === 'yes'),
        numeric,
        equalsTagContactsCount: (value) => +value === +this.tag.contacts_count
      }
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

    disabled () {
      if (this.isBulk) {
        return false
      }

      // for contacts tag with delete contacts
      return this?.tag?.category === this.ContactTags &&
        this.isDeleteContacts === 'yes' &&
        this.$v.$invalid
    },

    showDeleteContactsQuestion () {
      if (!this.tag) {
        return false
      }

      return this?.tag?.category === this.ContactTags &&
              this?.tag?.contacts_count > 0 &&
              !this.confirmDeleteWithContacts
    },

    showConfirmDeleteInfo () {
      if (!this.tag) {
        return false
      }

      return this?.tag?.category === this.ContactTags &&
              this.isDeleteContacts === 'yes' &&
              this.confirmDeleteWithContacts
    },

    equalsTagContactsCount () {
      return this.confirmDeleteContactsCount === this.tag.contacts_count
    },

    promptMessage () {
      let msg = 'Deleting '

      if (!this.isBulk) {
        msg += `<span class='font-italic font-weight-bold'>${this.tagName}</span> tag`
      } else {
        msg += 'tag(s)'
      }

      msg += ` will remove it from all contacts and communications. Continue?`

      return msg
    },

    formName () {
      const noun = this.isBulk ? 'Tags' : 'Tag'
      return `Delete ${this.tagCategoryName} ${noun}`
    }
  },

  methods: {
    validateState (input) {
      const { $dirty, $error } = this.$v[input]
      return $dirty ? !$error : null
    },

    reset () {
      if (this.confirmDeleteContactsCount && this.confirmDeleteContactsCount) {
        this.$v.$reset()
      }

      this.isDeleteContacts = 'no'
      this.confirmDeleteWithContacts = false
      this.confirmDeleteContactsCount = null
    },

    closeModalPrompt (bvModalEvent) {
      if (!this.confirmDeleteWithContacts) {
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
          if (!confirm) {
            this.loading = false
            return
          }

          this.closeModal()
        })
    },

    closeModal () {
      this.$emit('closeDeleteTagDialog')
      this.reset()
      this.$bvModal.hide('tag-contacts-splitter-modal')
    },

    deleteTag () {
      // sanity check: contact tags with delete contacts
      if (!this.isBulk &&
        this.confirmDeleteWithContacts &&
        +this.confirmDeleteContactsCount !== this.tag.contacts_count) {
        this.validateState('confirmDeleteContactsCount')
        return
      }

      this.loading = true
      let xhr = null

      if (this.isBulk) {
        xhr = API.V1.tags.bulkDelete({
          data: {
            category: this.selectedTagCategory,
            ids: this.getSelectedTagIds
          }
        })
      } else {
        xhr = API.V1.tags.delete(this.tag.id, {
          data: {
            should_delete_contacts: this.confirmDeleteWithContacts
          }
        })
      }

      xhr
        .then(res => {
          this.loading = false
          this.$generalNotification(res.data.message)

          if (this.isBulk) {
            this.clearAllSelectedTags()
            this.$emit('reloadTags')
          }

          this.closeModal()
        })
        .catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  },

  watch: {
    isDeleteContacts (value) {
      if (value === 'yes') {
        this.confirmDeleteWithContacts = true
        return
      }

      this.confirmDeleteWithContacts = false
    }
  }
}
</script>
