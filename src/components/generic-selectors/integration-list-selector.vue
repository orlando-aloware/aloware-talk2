<template>
  <div>
    <template v-if="isIntegrationEnabled('hubspot')">
      <q-form ref="add_hubspot_list"
              :model="hubspotList"
              :rules="rulesHubspotList"
              @submit.prevent.native="addHubspotList">
        <hubspot-list-selector />
      </q-form>
    </template>
    <template v-else-if="isIntegrationEnabled('zoho')">
      <q-form ref="add_zoho_view"
              :model="zohoView"
              :rules="rulesZohoView"
              @submit.prevent.native="addZohoView">
        <zoho-view-selector v-model="zohoView.view_id"
                            :value="zohoView.view_id"
                            @change="zohoViewChanged"/>
        <div class="row no-gutter centered-content">
          <button class="btn btn-block greenish"
                  :loading="loadingAddZohoView"
                  :disabled="(loadingAddZohoView || disableAddView)"
                  @click.prevent="addZohoView">
            <i class="material-icons loader"
                v-if="loadingAddZohoView">&#xE863;</i>
            Add Contacts
          </button>
        </div>
      </q-form>
    </template>
    <template v-else-if="isIntegrationEnabled('pipedrive')">
      <q-form ref="add_pipedrive_filter"
              :model="pipedriveFilter"
              :rules="rulesPipedriveFilter"
              @submit.prevent.native="addPipedriveFilter">
        <pipedrive-filter-selector v-model="pipedriveFilter.filter_id"
                                  :value="pipedriveFilter.filter_id"
                                  @selectedFilter="pipedriveFilterChanged"/>
        <div class="row no-gutter centered-content">
          <button class="btn btn-block greenish"
                  :loading="loadingAddPipedriveFilter"
                  :disabled="loadingAddPipedriveFilter || disableAddView"
                  @click.prevent="addPipedriveFilter">
            <i class="material-icons loader"
                v-if="loadingAddPipedriveFilter">&#xE863;</i>
            Add Contacts
          </button>
        </div>
      </q-form>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PipedriveFilterSelector from 'src/components/integrations/pipedrive-filter-selector.vue'
import ZohoViewSelector from 'src/components/integrations/zoho-view-selector.vue'
import axios from 'axios'

export default {
  name: 'integration-list-selector',

  components: {
    PipedriveFilterSelector,
    ZohoViewSelector
  },

  props: {
    value: {
      required: false
    },
    exclude: {
      required: false,
      default: null
    },
    blockBroadcast: {
      type: Boolean,
      required: false,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false
    },
    clearable: {
      type: Boolean,
      default: false,
      required: false
    },
    useChips: {
      type: Boolean,
      default: false,
      required: false
    },
    disable: {
      type: Boolean,
      default: false,
      required: false
    },
    prepend: {
      type: String,
      required: false
    },
    genericStyling: {
      type: Boolean,
      default: true
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),
    placeholder () {
      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return 'Select lists'
        case !this.multiple && !this.selectedId:
          return 'Select list'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },
    sorted () {
      if (this.lists.length > 0) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.lists.sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  data () {
    return {
      selectedId: this.value,
      isLoading: false,
      options: [],
      reference: 'hubspotListSelector',
      fullOptionsProperty: 'sorted',
      lists: [],
      disableAddView: false,
      pipedriveFilter: {
        filter_id: null
      },
      zohoView: {
        view_id: null
      },
      loadingAddZohoView: false,
      rulesZohoView: {
        view_id: [
          {
            required: true,
            message: 'Please select a Zoho custom view',
            trigger: 'change'
          }
        ]
      },
      loading_add_pipedrive_filter: false,
      rulesPipedriveFilter: {
        filter_id: [
          {
            required: true,
            message: 'Please select a Pipedrive custom filter',
            trigger: 'change'
          }
        ]
      }
    }
  },

  methods: {
    isIntegrationEnabled (name) {
      if (!name) {
        return false
      }

      switch (name) {
        case 'hubspot':
          return this.currentCompany.hubspot_integration_enabled
        case 'zoho':
          return this.currentCompany.zoho_integration_enabled
        case 'pipedrive':
          return this.currentCompany.pipedrive_integration_enabled
      }

      return false
    },
    zohoViewChanged (viewId) {
      this.zohoView.view_id = viewId
      this.disableAddView = !this.validateForm('add_zoho_view')
    },
    pipedriveFilterChanged (filter) {
      this.pipedriveFilter.filter_id = filter.id
      this.disableAddView = !this.validateForm('add_pipedrive_filter')
    },
    addZohoView () {
      if (this.validateForm('add_zoho_view') === true) {
        this.loading_add_zoho_view = true
        let params = {}
        params.direction = this.direction
        params.multiple_phone_numbers = this.multiple_phone_numbers
        params.prevent_duplicates = this.prevent_duplicates
        params.own_contacts_only = this.own_contacts_only
        if (this.future_scheduled) {
          params.future_scheduled_time = this.future_scheduled_time
        }
        axios.post(`/api/v1/auto-dialer/add-zoho-view/${this.zoho_view.view_id}`, params).then(() => {
          this.loading_add_zoho_view = false
          this.resetForms()
          this.$notify({
            offset: 175,
            title: 'PowerDialer',
            message: 'Zoho custom view contacts are now being added to your PowerDialer.',
            type: 'success',
            showClose: true
          })
          this.$emit('success', true)
        }).catch((err) => {
          this.loading_add_zoho_view = false
          this.resetAddZohoView()

          const res = err.response
          this.$notify({
            offset: 175,
            title: 'PowerDialer',
            message: res.data?.message,
            type: 'error',
            showClose: true
          })

          console.log(err)
        })
      } else {
        return false
      }
    },
    addPipedriveFilter () {
      if (this.validateForm('add_pipedrive_filter') === true) {
        this.loading_add_pipedrive_filter = true
        let params = {}
        params.direction = this.direction
        params.multiple_phone_numbers = this.multiple_phone_numbers
        params.prevent_duplicates = this.prevent_duplicates
        params.own_contacts_only = this.own_contacts_only
        params.allow_international_phone_numbers = this.allow_international_phone_numbers
        if (this.future_scheduled) {
          params.future_scheduled_time = this.future_scheduled_time
        }
        axios.post(`/api/v1/auto-dialer/add-pipedrive-filter/${this.pipedrive_filter.filter_id}`, params).then(() => {
          this.loading_add_pipedrive_filter = false
          this.resetForms()
          this.$notify({
            offset: 175,
            title: 'PowerDialer',
            message: 'Pipedrive custom filter contacts are now being added to your PowerDialer.',
            type: 'success',
            showClose: true
          })
          this.$emit('success', true)
        }).catch((err) => {
          this.loading_add_pipedrive_filter = false
          this.resetAddPipedriveFilter()

          const res = err.response
          this.$notify({
            offset: 175,
            title: 'PowerDialer',
            message: res.data?.message,
            type: 'error',
            showClose: true
          })

          console.log(err)
        })
      } else {
        return false
      }
    }
  },

  mounted () {
    this.getLists()
  },

  watch: {
    value () {
      this.selectedId = this.value
    },
    selectedId: function (value) {
      this.$emit('change', value)
      this.showInputPlaceholder()
    }
  }
}
</script>
