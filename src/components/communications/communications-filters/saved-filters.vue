<template>
  <div>
    <h5 class="text-uppercase filter-group-title"
        data-testid="filter-dialog-personal-filter-title">
      Personal Filters
    </h5>
    <div class="saved-filters">
      <q-skeleton type="rect"
                  data-testid="filter-dialog-skeleton"
                  v-if="isGettingFilters" />
      <p class="text-muted fs-12 empty-filter-placeholder pl-2"
         data-testid="filter-dialog-none-p"
         v-show="!isGettingFilters"
         v-if="personalFilters.length < 1"
      >
        None
      </p>
      <filter-list-items :filter="item"
                         data-testid="filter-dialog-filter-list-items"
                         v-for="item in personalFilters"
                         :key="item.id"
                         @filterSelected="(item) => $emit('filterSelected', item)"
                         @filterRename="onRenameFilter"
                         @filterDelete="(e) => onDeleteFilter(e, item)"
      />
    </div>

    <!-- TODO: company filters needs to be implemented in the talk2 way

    <h5 class="text-uppercase filter-group-title mt-4">
      Company Filters
    </h5>

    <div class="saved-filters">
      <q-skeleton type="rect"
                  data-testid="filter-dialog-skeleton"
                  v-if="isGettingFilters" />
      <p class="text-muted fs-12 empty-filter-placeholder pl-2"
         v-show="!isGettingFilters"
         v-if="companyFilters.length < 1">
        None
      </p>
      <div class="filter-items cursor-pointer"
           :class="getFilterItemClass(item)"
           data-testid="filter-dialog-select-filter"
           v-for="item in companyFilters"
           :key="item.id"
           @click="() => $emit('filterSelected', item)">
        <span>
          <q-tooltip anchor="top middle"
                     self="center middle">
            {{ item.name }}
          </q-tooltip>
          {{ item.name }}
        </span>
      </div>
    </div>
    -->
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'

import talk2Api from 'src/plugins/api/api'

import FilterListItems from 'components/communications/communications-filters/filter-list-items'

export default {
  name: 'SavedFilters',
  components: {
    FilterListItems
  },
  props: {
    filterType: {
      type: Number,
      required: true
    },

    fetchFilters: {
      type: Boolean,
      default: false
    },
    currentTags: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState('communications', [
      'personalFilters',
      'companyFilters',
      'selectedFilter'
    ])
  },
  data () {
    return {
      isGettingFilters: false
    }
  },

  methods: {
    ...mapActions(['setTags']),
    ...mapActions('communications', [
      'setPersonalFilters',
      'setCompanyFilters',
      'setSelectedFilter',
      'setIsDeletingFilter'
    ]),

    async onDeleteFilter (filter) {
      try {
        this.setIsDeletingFilter(true)

        await talk2Api.V2.inbox.filters.delete(filter.id)

        if (this.selectedFilter && this.selectedFilter.id === filter.id) {
          this.setSelectedFilter(null)
        }

        this.getFilters()
      } finally {
        this.setIsDeletingFilter(false)
      }
    },

    getFilterItemClass (item) {
      const selectedFilterClass = this.selectedFilter?.id === item.id
        ? 'active'
        : ''

      return [selectedFilterClass]
    },

    updateFilter (filter, params) {
      if (!params.scope) {
        const scope = [1, '1', true].includes(filter.is_on_company) ? 'company' : 'user'
        params = {
          ...params,
          scope: scope
        }
      }

      // TODO: when arrive to channels check this
      // if (this.loadedDefaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
      //  params.type = ChannelType.CHANNEL_CALLS
      // }

      return talk2Api.V2.inbox.filters.update(filter.id, params).then(res => {
        this.getFilters()
      })
    },

    onRenameFilter (filter) {
      this.updateFilter(filter, filter)
    },

    async getFilters () {
      this.isGettingFilters = true

      const personaFiltersResponse = await talk2Api.V2.inbox.filters.get({ type: this.filterType })
      const companyFilters = await talk2Api.V1.filters.get({ isOnCompany: true })
      const personalFilters = personaFiltersResponse.data.data.user || []

      this.setPersonalFilters(personalFilters)
      this.setCompanyFilters(companyFilters)

      // Gather all tags IDs from, filter data, personal and company filters into a single list for display in select
      let tagsIds = []

      if (this.currentTags) {
        tagsIds = [...new Set([...tagsIds, ...this.currentTags])]
      }

      personalFilters.forEach(filter => {
        if (filter.filter.tags) {
          tagsIds = [...new Set([...tagsIds, ...filter.filter.tags])]
        }
      })
      companyFilters.forEach(filter => {
        if (filter.filter.tags) {
          tagsIds = [...new Set([...tagsIds, ...filter.filter.tags])]
        }
      })
      this.getTagsByIds(tagsIds)
    },

    getTagsByIds (ids) {
      return talk2Api.V1.tags.get({ params: { tag_ids: ids } })
        .then(response => {
          this.setTags(response.data.data)
          this.isGettingFilters = false
          this.$emit('filtersFetched')
        })
    }

  },
  watch: {
    fetchFilters: {
      handler (val) {
        if (val) {
          this.getFilters()
        }
      },
      immediate: true
    }
  }

}

</script>
