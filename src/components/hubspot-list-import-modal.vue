<template>
  <b-modal
    v-model="isOpen"
    title="Create A List"
    size="lg"
    modal-class="integration-import-list-modal"
    scrollable
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
  >
    <b-overlay
      spinner-variant="primary"
      spinner-type="grow"
      spinner-small
      rounded="sm"
      :show="isLoading"
    >
      <div class="d-flex flex-column integration-import-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 integration-import-list-modal__title">{{ getTitle }}</div>
          <button
            class="btn btn-link small text-muted integration-import-list-modal__close"
            @click="onClose"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="pt-3">
          <hubspot-list-selector :multiple="false"
                                 :use-chips="false"
                                 :clearable="true"
                                 :generic-styling="false"
                                 @change="onListSelectorChange"/>
        </div>

        <div class="text-red">
          {{ errorMsg }}
        </div>

        <div class="d-flex align-items-center pt-3">
          <button
            class="btn btn-block btn-light mt-0 mr-2"
            @click="onClose"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            class="btn btn-block btn-primary mt-0"
            @click="onSubmit"
            :disabled="!list || isLoading"
          >
            Next
          </button>
        </div>
      </div>
      <power-dialer-add-modal :params="powerDialerParams"
                              mode="hubspot"
                              v-if="isAddPowerDialerOpen"
                              @hidden="onHiddenPowerDialerModal">
      </power-dialer-add-modal>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import HubspotListSelector from 'components/generic-selectors/hubspot-list-selector'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal.vue'

export default {
  name: 'hubspot-list-import-modal',

  components: {
    HubspotListSelector,
    PowerDialerAddModal
  },

  props: {
    isContactModule: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isLoading: false,
      errorMsg: '',
      list: null
    }
  },

  computed: {
    ...mapState('contacts', [
      'isAddPowerDialerOpen'
    ]),
    getTitle () {
      return 'Import From Hubspot List'
    },
    listsEndpoint () {
      return '/api/v2/power-dialer-lists'
    },
    foldersEndpoint () {
      return '/api/v2/power-dialer-folders'
    },
    powerDialerParams () {
      return {
        target: this.list.listId,
        size: this.list.metaData.size
      }
    }
    // redirectPath () {
    //   return `/power-dialer/list`
    // }
  },

  methods: {
    ...mapActions('contacts', [
      'foldersLoaded',
      'addPowerDialerOpen'
    ]),
    onClose () {
      if (!this.isLoading) {
        this.$emit('close')
      }
    },
    onListSelectorChange (list) {
      this.list = list
    },
    onSubmit () {
      this.addPowerDialerOpen(true)
      // this.isLoading = true

      // // TODO send request to api endpoint
      // this.$axios
      //   .post(this.listsEndpoint + '/import-hubspot-list/' + this.listId)
      //   .then(response => response.data)
      //   .then(data => {
      //     if (data.message) {
      //       this.$generalNotification(data.message)
      //     }

      //     this.isLoading = false
      //     this.onClose()
      //   })
      //   .catch(_err => {
      //     this.$generalNotification('Unable to load contacts from folder, please try again.', 'error')
      //   })
    },
    loadFolders () {
      this.$axios
        .get(this.foldersEndpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onHiddenPowerDialerModal () {
      this.addPowerDialerOpen(false)
    }
  }
}
</script>
