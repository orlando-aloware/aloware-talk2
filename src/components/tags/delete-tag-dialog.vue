<template>
  <b-modal id="tags-delete-dialog"
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
      <h6>Delete {{ tagCategoryName }} Tag</h6>
    </template>

    <span>
      Deleting <span class="font-italic font-weight-bold">{{ tagName }}</span> tag will remove it from all contacts and communications. Continue?
    </span>

    <b-form-checkbox v-show="showDeleteContactsQuestion"
                     v-model="isDeleteContacts"
                     value="yes"
                     unchecked-value="no"
                     class="mt-4">
      Do you also want to delete the tagged contacts of this tag?
    </b-form-checkbox>

    <div class="text-left break-word mt-4 mb-0"
         v-show="showConfirmDeleteInfo">
      <p>
          You're about to delete <span class="font-weight-bold">{{ (tag?.contacts_count || 0) | numFormat }} contacts</span>.
          Use the text field below to confirm the number of contacts you want to delete.
      </p>
     <b-form-group invalid-feedback="Number of contacts does not match"
                   :state="validateState('confirmDeleteContactsCount')">
        <b-form-input placeholder="Confirm number of contacts here"
                      v-model.trim="$v.confirmDeleteContactsCount.$model" />
       </b-form-group>
    </div>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    @click.prevent="closeModal">
              Cancel
            </button>
            <button class="btn btn-sm btn-danger text-white"
                    :disabled="$v.$invalid"
                    @click.prevent="deleteTag">
              Delete
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'
import { numeric, requiredIf } from 'vuelidate/lib/validators'
import axios from 'axios'

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
        equalsTagContactsCount: (value) => +value === this.tag.contacts_count
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

    tagName () {
      if (!this.tag) {
        return ''
      }

      return `#${this.tag.id} - ${this.tag.name}`
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

    closeModal () {
      this.reset()
      this.$emit('closeDeleteTagDialog')
    },

    deleteTag () {
      // sanity check
      if (this.confirmDeleteWithContacts && +this.confirmDeleteContactsCount !== this.tag.contacts_count) {
        this.validateState('confirmDeleteContactsCount')
        return
      }

      this.loading = true

      axios.delete(`/api/v1/tag/${this.tag.id}`, {
        data: { should_delete_contacts: this.confirmDeleteWithContacts }
      })
        .then(res => {
          this.$generalNotification(res.data.message)
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        }).finally(() => {
          this.loading = false
          this.closeModal()
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
