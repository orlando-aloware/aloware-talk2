<template>
  <b-modal title="Create A List"
           size="lg"
           modal-class="integration-import-list-modal"
           scrollable
           centered
           hide-footer
           hide-header
           no-close-on-esc
           no-close-on-backdrop
           v-model="isOpen">
    <b-overlay spinner-variant="primary"
               spinner-type="grow"
               spinner-small
               rounded="sm"
               :show="isLoading">
      <div class="d-flex flex-column integration-import-list-modal__body position-relative">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1 integration-import-list-modal__title">{{ getTitle }}</div>
          <button class="btn btn-link small text-muted integration-import-list-modal__close"
                  @click="onClose">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="pt-3">
          <p class="mb-2">
            Currently enabled integration: <span class="text-bold"> {{ integrationName | capitalize }} </span>
          </p>
          <integration-list-selector
            :multiple="false"
            :use-chips="false"
            :clearable="true"
            :generic-styling="false"
            @change="onListSelectorChange"/>
        </div>

        <div class="d-flex align-items-center pt-3">
          <button class="btn btn-block btn-light mt-0 mr-2"
                  :disabled="isLoading"
                  @click="onClose">
            Cancel
          </button>
          <button class="btn btn-block btn-primary mt-0"
                  :disabled="!list || isLoading"
                  @click="onSubmit">
            Next
          </button>
        </div>
      </div>
      <power-dialer-add-modal 
        :params="powerDialerParams"
        mode="integration"
        v-if="isAddPowerDialerOpen"
        @hidden="onHiddenPowerDialerModal"
        @submit="onClose">
      </power-dialer-add-modal>
    </b-overlay>
  </b-modal>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import IntegrationListSelector from 'components/generic-selectors/integration-list-selector'
import PowerDialerAddModal from 'src/components/power-dialer/power-dialer-add-modal.vue'
import { integrationMixin } from 'src/plugins/mixins'

export default {
  name: 'integration-list-import-modal',

  components: {
    IntegrationListSelector,
    PowerDialerAddModal
  },

  mixins: [integrationMixin],

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
      list: null,
      integration: null
    }
  },

  computed: {
    ...mapState('contacts', [
      'isAddPowerDialerOpen'
    ]),
    getTitle () {
      return 'Import From Integration'
    },
    powerDialerParams () {
      return {
        target: this.list.listId || this.list.id,
        size: _.get(this.list, 'metaData.size', null)
      }
    }
  },

  methods: {
    ...mapActions('contacts', [
      'addPowerDialerOpen'
    ]),
    onClose (data = null) {
      if (!this.isLoading) {
        this.$emit('close', data)
      }
    },
    onListSelectorChange (payload) {
      this.list = payload.list
      this.integration = payload.integration
    },
    onSubmit () {
      this.addPowerDialerOpen(true)
    },
    onHiddenPowerDialerModal () {
      this.addPowerDialerOpen(false)
    }
  }
}
</script>
