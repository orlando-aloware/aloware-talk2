<template>
  <b-modal id="lists-rename-form-modal"
           modal-class="lists__modal"
           centered
           v-model="openModal"
           @hide="closeModalPrompt"
           @show="openListForm">
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
      <h6>Rename List</h6>
    </template>

    <b-form ref="listForm"
            class="lists__form">
      <b-form-group class="font-weight-light text-13"
                    label="Name"
                    invalid-feedback="Please provide a list name"
                    :state="validateState('name')">
        <b-form-input placeholder="Enter list name"
                      data-testid="lists-edit-modal-input-name"
                      required
                      v-model="$v.list.name.$model"/>
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    data-testid="lists-edit-modal-cancel-button"
                    @click.prevent="closeModalPrompt">
              Cancel
            </button>
            <button class="btn btn-sm bg-primary text-white"
                    :disabled="$v.$invalid"
                    data-testid="lists-edit-modal-update-button"
                    @click.prevent="saveList">
              Save
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'lists-rename-form',

  props: {
    isShow: {
      type: Boolean,
      required: true
    },

    editableList: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      loading: false,
      list: {
        name: null
      },
      disabled: false
    }
  },

  validations () {
    return {
      list: {
        name: {
          required
        }
      }
    }
  },

  mounted () {
    this.setList()
  },

  computed: {
    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    }
  },

  methods: {
    ...mapActions('listsModule', [
      'updateList'
    ]),

    validateState (input) {
      const { $dirty, $error } = this.$v.list[input]
      return $dirty ? !$error : null
    },

    setList () {
      if (!this.editableList) {
        return
      }

      this.list.name = this.editableList.name
      this.disabled = true
    },

    openListForm () {
      // Add data-testid to elements that can't be accessed inside template code
      this.$nextTick(() => {
        document.querySelector('.modal-header > .close').setAttribute('data-testid', 'lists-edit-modal-close-button')
      })

      this.setList()
    },

    closeModalPrompt (bvModalEvent) {
      if (!this.$v.list.$anyDirty) {
        this.closeListForm()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the Rename List form?`, {
        title: `Close Rename List`,
        okTitle: 'Yes, I\'m sure',
        cancelTitle: 'No, I\'m not',
        size: 'sm',
        buttonSize: 'sm',
        centered: true,
        footerClass: 'close-edit-modal-footer-class'
      })
        .then(confirm => {
          if (confirm) {
            this.closeListForm()
          }
        })

      this.$nextTick(() => {
        document.querySelector('.close-edit-modal-footer-class > .btn-primary').setAttribute('data-testid', 'lists-close-edit-modal-confirm-button')
        document.querySelector('.close-edit-modal-footer-class > .btn-secondary').setAttribute('data-testid', 'lists-close-edit-modal-cancel-button')
        console.log('Button', document.querySelector('.close-edit-modal-footer-class > .btn-primary'))
      })
    },

    closeListForm () {
      this.$emit('closeListForm')
      this.resetForm()
    },

    resetForm () {
      this.list = {
        name: null
      }

      this.$v.$reset()
    },

    saveList () {
      this.$v.$touch()
      this.loading = true
      let xhr = null
      let msg = ''

      if (this.editableList) {
        const params = {
          name: this.list.name
        }

        xhr = this.updateList({
          id: this.editableList.id,
          data: params
        })
        msg = this.list.name + ' list updated successfully'
      }

      xhr
        .then(() => {
          this.loading = false
          this.$generalNotification(msg)
          this.$emit('listUpdated', { id: this.editableList.id, name: this.list.name })
          this.closeListForm()
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
