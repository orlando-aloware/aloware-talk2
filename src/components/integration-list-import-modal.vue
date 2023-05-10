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
          <div class="mb-3"
               v-if="integrationsEnabled.length > 1">
            <div class="row">
              <div class="col-6 d-flex align-items-center pl-0">
                <span>Select from available integrations: </span>
              </div>
              <div class="col-6 pr-0">
                <q-select style="word-break: break-all;"
                          color="primary"
                          use-input
                          emit-value
                          map-options
                          dense
                          hide-bottom-space
                          v-model="selectedIntegration"
                          :options="integrationsEnabled">
                </q-select>
              </div>
            </div>
          </div>
          <p class="mb-2"
             v-else>
            Currently enabled integration: <span class="text-bold"> {{ integrationsEnabled[0] }} </span>
          </p>
          <integration-list-selector ref="list-selector"
                                     :use-chips="false"
                                     :multiple="false"
                                     :clearable="true"
                                     :generic-styling="false"
                                     :disable="shouldDisableListSelector"
                                     :integration="selectedIntegration"
                                     @change="onListSelectorChange"/>
        </div>

        <div class="d-flex align-items-center pt-3">
          <button class="btn btn-block btn-primary mt-0"
                  :disabled="!list || isLoading"
                  @click="onSubmit">
            Next
          </button>
        </div>
      </div>
      <power-dialer-add-modal mode="integration"
                              :params="powerDialerParams"
                              :integration="selectedIntegration"
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
      integration: null,
      selectedIntegration: null
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
    },

    shouldDisableListSelector () {
      return this.selectedIntegration === null
    }
  },

  mounted () {
    if (this.integrationsEnabled.length === 1) {
      this.selectedIntegration = this.integrationsEnabled[0]
      this.loadSelectionOptions()
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
    },

    loadSelectionOptions () {
      if (this.$refs['list-selector'] === undefined) {
        return
      }

      this.$refs['list-selector'].selectedId = null
      this.$refs['list-selector'].getListsOfEnabledIntegration()
    }
  }
}
</script>
