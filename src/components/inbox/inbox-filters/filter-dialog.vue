<template>
  <b-modal
    id="inbox-channel-filter-modal"
    size="lg"
    modal-class="confirm-dialog"
    hide-header-close
    hide-header
    hide-footer
    ref="inbox-channel-filter-modal"
    @hidden="onHidden"
    @show="getFilters">

    <div class="modal-body-wrapper d-flex">
      <div class="w-50 left-column-wrapper">
        <span class="filter-type-description">{{ channelFilterName }}</span>

        <div class="mt-5">
          <div class="mb-4">
            <div class="filter-items cursor-pointer text-italic"
                 v-bind:class="{ 'active' : !selectedFilter }"
                 @click="onSelectFilter(null)">
              <span>Create New</span>
            </div>
          </div>
          <h5 class="text-uppercase filter-group-title">Personal Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect" v-if="isGettingFilters" />
            <p class="text-muted fs-12 text-center text-italic" v-show="!isGettingFilters" v-if="personalFilters.length < 1">No personal filters found</p>
            <filter-list-items v-for="item in personalFilters"
                               :key="item.id"
                               :filter="item"
                               @filterSelected="onSelectFilter"
                               @filterRename="onRenameFilter"
                               @filterDelete="(e) => onDeleteFilter(e, item)">
            </filter-list-items>
          </div>
          <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
          <div class="saved-filters">
            <q-skeleton type="rect" v-if="isGettingFilters" />
            <p class="text-muted fs-12 text-center text-italic" v-show="!isGettingFilters" v-if="companyFilters.length < 1">No company filters found</p>
            <div class="filter-items cursor-pointer"
                 v-bind:class="{ 'active' : selectedFilter && selectedFilter.id === item.id }"
                 v-for="item in companyFilters"
                 :key="item.id"
                 @click="onSelectFilter(item)">
              <span>
                <q-tooltip anchor="top middle"
                               self="center middle">
                  {{ item.name }}
                </q-tooltip>
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="container d-flex justify-content-between mb-3 action-option-container">
          <div>
            <span class="filter-name">(Unsaved) Filter</span>
          </div>
          <div>
            <compact-btn variant="secondary"
                         class="bg-grey-80 mr-3"
                         :disabled="channelChangedFilterFields.length < 1"
                         @clicked="onResetFilter">Reset</compact-btn>
            <compact-btn variant="primary"
                         :disabled="!(!selectedFilter || selectedFilterHasChanges) || isUpdatingFilter"
                         @clicked="onSaveFilter">
              <q-spinner-bars v-if="isUpdatingFilter" color="white" />
              {{ isUpdatingFilter ? ' Saving...' : ' Save' }}
              </compact-btn>
            <compact-btn variant="primary"
                         class="ml-3"
                         :disabled="!(selectedFilter && selectedFilterHasChanges)"
                         v-b-modal:create-filter-modal>
              Save as New
            </compact-btn>
          </div>
        </div>
        <filter-form :filter="filter"></filter-form>
        <create-filter-dialog :filter-model="filterModel"
                              @created="filterCreated">
        </create-filter-dialog>
      </div>
    </div>
    <template #modal-footer="{ hide }">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        @click="hide()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import FilterForm from 'components/inbox/inbox-filters/filter-form'
import { mapActions, mapState } from 'vuex'
import CompactBtn from 'components/compact-btn'
import CreateFilterDialog from 'components/inbox/inbox-filters/create-filter-dialog'
import talk2Api from 'src/plugins/api/api'
import FilterListItems from 'components/inbox/inbox-filters/filter-list-items'

let inputTimeout

export default {
  name: 'filter-dialog',

  components: { FilterListItems, CreateFilterDialog, CompactBtn, FilterForm },

  props: {
    filter: {
      type: Object,
      required: true
    }

  },

  computed: {
    ...mapState('inbox', ['channelChangedFilterFields', 'selectedFilter']),
    channelFilterName () {
      switch (true) {
        case ['messages'].includes(this.$route.params.channel):
          return 'Messages'
        case ['voicemails'].includes(this.$route.params.channel):
          return 'Voicemails'
        case ['mentions'].includes(this.$route.params.channel):
          return 'Mentions'
        case ['calls', 'recordings'].includes(this.$route.params.channel):
        default:
          return 'Calls & Recordings'
      }
    },
    filterModel () {
      let filterModel = {
        name: '',
        type: 2,
        filter: [],
        scope: 'user'
      }
      switch (true) {
        case ['voicemails'].includes(this.$route.params.channel):
          filterModel.type = 3
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            tags: this.filter.tags,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['calls'].includes(this.$route.params.channel):
          filterModel.type = 1
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            min_talk_time: this.filter.min_talk_time,
            transfer_type: this.filter.transfer_type,
            callback_status: this.filter.callback_status,
            tags: this.filter.tags,
            call_dispositions: this.filter.call_dispositions,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['recordings'].includes(this.$route.params.channel):
          filterModel.type = 4
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            ring_groups: this.filter.ring_groups,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            min_talk_time: this.filter.min_talk_time,
            transfer_type: this.filter.transfer_type,
            callback_status: this.filter.callback_status,
            tags: this.filter.tags,
            call_dispositions: this.filter.call_dispositions,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows
          }
          break
        case ['messages'].includes(this.$route.params.channel):
        default:
          filterModel.type = 2
          filterModel.filter = {
            campaigns: this.filter.campaigns,
            direction: this.filter.direction,
            answer_status: this.filter.answer_status,
            tags: this.filter.tags,
            first_time_only: this.filter.first_time_only,
            untagged_only: this.filter.untagged_only,
            exclude_automated_communications: this.filter.exclude_automated_communications,
            incoming_numbers: this.filter.incoming_numbers,
            users: this.filter.users,
            workflows: this.filter.workflows,
            broadcasts: this.filter.broadcasts
          }
      }

      return filterModel
    },
    selectedFilterHasChanges () {
      if (!this.selectedFilter || !this.selectedFilterClone) {
        return false
      }

      return JSON.stringify(this.$options.filters.sortObjectByKey(this.selectedFilter.filter)) !== JSON.stringify(this.$options.filters.sortObjectByKey(this.selectedFilterClone.filter))
    }
  },

  data () {
    return {
      isRenaming: false,
      isDeletingFilter: false,
      isUpdatingFilter: false,
      isGettingFilters: false,
      selectedFilterClone: null,
      personalFilters: [],
      companyFilters: [],
      filterToEdit: null
    }
  },

  methods: {
    ...mapActions('inbox', ['toggleFilterModelForm', 'setSelectedFilter', 'updateChannelChangedFilterFields', 'resetChannelChangedFilterFields']),
    hideModal () {
      this.$refs['inbox-channel-filter-modal'].hide()
    },

    onHidden () {
      this.setSelectedFilter(null)
    },

    onResetFilter: function () {
      if (!this.selectedFilterClone) {
        this.$emit('onResetFilter')
      } else {
        this.resetChannelChangedFilterFields()
        const filterIdentifier = this.selectedFilterHasChanges ? this.selectedFilterClone.filter : this.selectedFilter.filter
        for (const prop in filterIdentifier) {
          this.filter[prop] = filterIdentifier[prop]
          this.updateChannelChangedFilterFields({
            name: prop,
            value: filterIdentifier[prop]
          })
        }
      }
    },

    onSaveFilter () {
      if (!this.selectedFilter) {
        this.toggleFilterModelForm(true)
      } else {
        this.isUpdatingFilter = true
        this.updateFilter(this.selectedFilter, { ...this.filterModel, name: this.selectedFilter.name, scope: this.selectedFilter.scope }).then(res => {
          this.isUpdatingFilter = false
        })
      }
    },

    onSelectFilter (item) {
      this.setSelectedFilter(item)
      this.selectedFilterClone = item
      this.applyFilter()
    },

    getFilters () {
      this.isGettingFilters = true
      return talk2Api.V2.inbox.filters.get({ type: this.filterModel.type }).then(response => {
        this.personalFilters = response.data.data.user || []
        this.companyFilters = response.data.data.company || []
        this.isGettingFilters = false
      })
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        let scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = { ...params, scope: scope }
      }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        let updatedFilter = res.data.filter
        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.setSelectedFilter(updatedFilter)
          this.selectedFilterClone = { ...this.selectedFilter }
        }

        if (!updatedFilter.is_on_company) {
          let index = this.personalFilters.findIndex(item => item.id === filter.id)
          if (index >= 0) {
            this.personalFilters[index] = updatedFilter
          }
        }
      })
    },

    onRenameFilter (filter) {
      this.updateFilter(filter, filter)
    },

    onDeleteFilter (filter) {
      this.isDeletingFilter = true
      return talk2Api.V2.inbox.filters.delete(filter.id).then(res => {
        this.selectedFilterClone = { ...this.selectedFilter }
        this.isDeletingFilter = false
        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.setSelectedFilter(null)
          this.selectedFilterClone = null
        }
        if (!filter.is_on_company) {
          this.personalFilters = this.personalFilters.filter(item => item.id !== filter.id)
        }
      })
    },

    filterCreated (filter) {
      if (filter.is_on_company) {
        this.companyFilters.push(filter)
      } else {
        this.personalFilters.push(filter)
      }
    },

    applyFilter () {
      if (!this.selectedFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
        this.updateChannelChangedFilterFields({
          name: prop,
          value: this.selectedFilter.filter[prop]
        })
      }
    }
  },

  watch: {
    filter: {
      deep: true,
      handler () {
        if (this.selectedFilter) {
          this.setSelectedFilter({ ...this.selectedFilter, filter: this.filterModel.filter })
        }
      }
    },
    '$route.params.channel': function () {
      this.setSelectedFilter(null)
    }
  },
  created () {
    this.setSelectedFilter(null)
  },

  beforeDestroy () {
    clearTimeout(inputTimeout)
  }
}
</script>
