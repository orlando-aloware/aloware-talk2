<template>
  <b-modal
    size="md"
    centered
    data-testid="change-list-owner-modal"
    v-model="isOpen"
    @hidden="onHidden"
    @shown="onShown"
  >
  <b-overlay rounded="sm"
               no-wrap
               :show="true"
               v-show="isBusy">
    <template #overlay>
      <q-spinner-bars color="primary"
                      size="30px" />
    </template>
  </b-overlay>

  <template #modal-title>
      <h6>Change <em>{{ contactList?.name }}</em> Owner</h6>
    </template>

    <div class="p-2">
      <b-form-group class="form-label mb-0"
                    label="User">
        <user-selector custom-placeholder="Select new Owner"
                      :generic-styling="false"
                      :disabled="isBusy"
                      v-model="userId"
                      @change="onUserChanged" />
        <p class="d-block invalid-feedback mb-0"
           v-if="isSelectedUserCurrentListOwner">
          This user is already the Owner of this list
        </p>
      </b-form-group>
    </div>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    data-testid="change-list-owner-cancel-button"
                    @click="hideModal">
              Cancel
            </button>
            <button class="btn btn-sm bg-primary text-white"
                    :disabled="isSubmitDisabled"
                    data-testid="change-list-owner-update-button"
                    @click.prevent="onSubmit">
              Change Owner
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import UserSelector from 'components/generic-selectors/user-selector'

export default {
  name: 'change-list-owner-modal',
  components: { UserSelector },
  props: {
    contactList: {
      type: Object,
      default: null
    }
  },
  computed: {
    isSelectedUserValid () {
      return this.userId !== this.contactList?.contact_folder_created_by
    },

    isSubmitDisabled () {
      return this.isBusy || !this.userId || this.isSelectedUserCurrentListOwner
    },

    isSelectedUserCurrentListOwner () {
      return this.userId && this.userId === this.contactList?.contact_folder_created_by
    }
  },
  data () {
    return {
      isOpen: false,
      isBusy: false,
      userId: null
    }
  },
  methods: {
    hideModal () {
      this.isOpen = false
    },

    onHidden () {},

    onShown () {},

    onUserChanged (userId) {
      this.userId = userId
    },

    onSubmit () {
      this.isBusy = true

      talk2Api.V2.contactsList.changeOwner(this.contactList.id, this.userId)
        .then(() => {
          this.isBusy = false
          this.$generalNotification('List owner changed successfully')
          this.$emit('listOwnerChanged')
          this.isOpen = false
        })
        .catch(err => {
          this.isBusy = false
          this.$handleErrors(err.response)
          console.log(err)
        })
    }
  }
}
</script>
