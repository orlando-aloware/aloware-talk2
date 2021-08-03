<template>
  <div class="contacts-filter-sidebar" v-if="show">
    <b-overlay class="full-width"
               spinner-variant="success"
               spinner-type="grow"
               rounded="sm"
    >
      <b-card header="Primary"
              header-bg-variant="primary"
              header-text-variant="white">
        <template #header>
          <div class="d-flex justify-content-between">
            <div class="d-inline-flex">
              <b-button variant="outline-primary header-buttons"
                        size="sm"
                        @click="backToStep"
                        v-if="step !== 1"
              >
                <i class="fa fa-arrow-left"></i>
              </b-button>
              <h6 class="mb-0">Filters</h6>
            </div>

            <b-button variant="outline-primary header-buttons btn-close-filter" size="sm" @click="onCloseFilter"><i class="fa fa-times"></i> </b-button>
          </div>
        </template>
        <div class="">
          <div>
            <!-- Using slots -->
            <div class="filter-contents step-1 pt-2 pr-1"
                 v-if="step === 1">
              <compact-btn
                v-if="isEmptyListFilters"
                variant="primary"
                customClass="px-4 add-filters m-2"
                @clicked="toAddFiltersStep"
              >
                <i class="material-icons mr-1 add-icon">add</i> Add a Filter
              </compact-btn>
              <div class="textual-filters"
                   v-else>
                <template v-for="(group, groupIndex) in visibleListFilters">
                  <div class="d-flex full-width mb-2"
                       :key="`group-remove-${groupIndex}`">
                    <div v-if="visibleListFilters.length >= 2 && groupIndex >= 1"
                         class="font-weight-bold group-conjunction"
                    >
                      {{ group.is_conjunction ? 'AND' : 'OR'}}
                    </div>
                    <compact-btn class="py-0 delete-group-filter ml-auto"
                                 @clicked="onDeleteGroupFilter(groupIndex)"
                    >
                      Remove
                    </compact-btn>
                  </div>
                  <b-card class="p-1 mb-2"
                          :key="groupIndex">
                    <template v-for="(filter, key, index) in group.filters">
                      <b-card class="mb-2 filter-item"
                              role="button"
                              :key="key"
                              @click="selectFilterByKey(filter.key, groupIndex, group.is_conjunction)">
                        <span class="filter-name">{{ filter.label }}</span>
                        <span class="text-lowercase"> {{ filter.operator }}</span>
                        <span class="font-weight-bold">
                          {{ getFormattedFilterSummary(filter, key) }}
                        </span>
                        <compact-btn class="py-0 delete-filter"
                                     @clicked="onDeleteFilter(groupIndex, filter.key)">
                          <i class="fa fa-trash"></i>
                          <q-tooltip>
                            Remove this condition
                          </q-tooltip>
                        </compact-btn>
                      </b-card>
                      <div v-if="getFilterLength(group.filters) >= 2 && index < (getFilterLength(group.filters) - 1)"
                            class="mb-2 font-weight-bold"
                            :key="`filter-${filter.key}`"
                      >
                        AND
                      </div>
                    </template>
                    <compact-btn
                      variant="outlined-light"
                      customClass="add-filters with-border conjunction-button"
                      @clicked="toAddFiltersStep(groupIndex)"
                    >
                      AND
                    </compact-btn>
                  </b-card>
                </template>
                <!--compact-btn
                  variant="outlined-light"
                  customClass="mb-2 mr-2 add-filters with-border conjunction-button"
                  @clicked="toAddFiltersStep(visibleListFilters.length, true)"
                >
                  AND
                </compact-btn-->
                <compact-btn
                  variant="outlined-light"
                  customClass="mb-2 add-filters with-border conjunction-button"
                  @clicked="toAddFiltersStep(visibleListFilters.length, false)"
                >
                  OR
                </compact-btn>
              </div>
            </div>
            <div class="filter-contents step-2 p-2"
                 v-else-if="step === 2">
              <div class="mb-3">
                <h6 class="contact-prop-label">Contact properties</h6>
                <search placeholder="Search"
                        @search="searchFilter"/>
              </div>
              <b-list-group class="filter-list">
                <b-list-group-item class="filter-divider">
                  All properties
                </b-list-group-item>
                <div v-for="filter in filterGroups"
                     :key="filter">
                  <b-list-group-item class="filter-divider pt-3" v-if="filterByGroup(filter).filters.length > 0">
                    {{ filterByGroup(filter).label }}
                  </b-list-group-item>
                  <b-list-group-item
                    class="filter-list-item"
                    v-for="filter in filterByGroup(filter).filters"
                    :key="filter.key"
                    @click="selectFilter(filter)"
                    >
                    {{ filter.label }}
                  </b-list-group-item>
                </div>
                <div>
                  <b-list-group-item class="filter-divider pt-3" v-if="filterByGroup().filters.length > 0">
                    Custom
                  </b-list-group-item>
                  <b-list-group-item
                    class="filter-list-item"
                    v-for="filter in filterByGroup().filters"
                    :key="filter.key"
                    @click="selectFilter(filter)"
                  >
                    {{ filter.label }}
                  </b-list-group-item>
                </div>

              </b-list-group>
            </div>
            <div class="filter-contents step-3 p-2 pr-1"
                 v-else-if="step === 3">
              <span class="filter-label">{{ selectedFilter.label }}</span>
              <contacts-filter-types :filter="selectedFilter"
                                     :filterGroupIndex="filterGroupIndex"
                                     :filterConjunction="filterConjunction"
                                     @filtersApplied="filtersApplied"
              >
              </contacts-filter-types>
            </div>
          </div>
        </div>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import Search from 'src/components/search.vue'
import ContactsFilterTypes from 'src/components/contacts/contacts-filter-types.vue'
import CompactBtn from 'components/compact-btn.vue'
import _ from 'lodash'
import {
  GROUP_PRIMARY_INFO,
  GROUP_CONTACT_LOCATION,
  GROUP_CONTACT_RELEVANCE,
  GROUP_CONTACT_COMM_METADATA } from 'src/constants/contact-filter-groups'

export default {
  components: { Search, CompactBtn, ContactsFilterTypes },
  props: {
    listFilters: {
      required: false
    }
  },
  data () {
    return {
      items: Array.from(new Array(10)),
      show: false,
      filterSearch: '',
      step: 1,
      selectedFilter: null,
      visibleListFilters: '',
      filterGroupIndex: 0,
      filterConjunction: true,
      filterGroups: {
        GROUP_PRIMARY_INFO,
        GROUP_CONTACT_LOCATION,
        GROUP_CONTACT_RELEVANCE,
        GROUP_CONTACT_COMM_METADATA
      }
    }
  },
  computed: {
    ...mapState('contacts', ['isFiltersOpen', 'filters']),
    ...mapGetters('contacts', ['currentListFilters']),
    filtersFiltered () {
      if (_.isEmpty(this.visibleListFilters) &&
        (!this.filterSearch || !this.filterSearch.length)) {
        return this.filters
      }
      return this.filters.filter(filter => filter.label.trim().toLowerCase().includes(this.filterSearch.trim().toLowerCase()))
    },
    isEmptyListFilters () {
      return _.isEmpty(this.visibleListFilters)
    },
    filterByGroup () {
      // eslint-disable-next-line camelcase
      return function (groupId) {
        let label = ''
        // eslint-disable-next-line camelcase
        switch (groupId) {
          case this.filterGroups.GROUP_PRIMARY_INFO:
            label = 'Primary Information'
            break
          case this.filterGroups.GROUP_CONTACT_LOCATION:
            label = 'Contact Location'
            break
          case this.filterGroups.GROUP_CONTACT_RELEVANCE:
            label = 'Contact Relevance'
            break
          case this.filterGroups.GROUP_CONTACT_COMM_METADATA:
            label = 'Contact Communication'
        }

        const compare = function (a, b) {
          // Use toUpperCase() to ignore character casing
          const filterA = a.label.toUpperCase()
          const filterB = b.label.toUpperCase()

          let comparison = 0
          if (filterA > filterB) {
            comparison = 1
          } else if (filterA < filterB) {
            comparison = -1
          }
          return comparison
        }

        let filters = !groupId ? this.filtersFiltered.filter(list => !list.group_id || list.group_id.length < 1)
          : this.filtersFiltered.filter(list => list.group_id === groupId)

        return { filters: filters.sort(compare), label: label }
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['openFilters', 'closeFilters', 'setFilters', 'setCurrentListFilters']),
    getFilters: function () {
      this.$axios
        .get('/api/v2/contacts/filters')
        .then((response) => response.data.filters)
        .then(this.setFilters)
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            message: 'Unable to load filters please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    },
    searchFilter (filterName) {
      this.filterSearch = filterName
    },
    toAddFiltersStep (index, conjunction = true, skipStep = false) {
      if (typeof index === 'number') {
        this.filterGroupIndex = index
      }
      this.filterConjunction = conjunction
      this.$VueEvent.stop('filters-back')
      if (!skipStep) {
        this.step = 2
      }
    },
    selectFilter (filter) {
      this.selectedFilter = filter
      this.step = 3
    },
    selectFilterByKey (key, index, conjunction) {
      const found = this.filters.find(filter => filter.key === key)
      if (found) {
        this.selectedFilter = found
        this.toAddFiltersStep(index, conjunction, true)
        this.step = 3
      }
    },
    onCloseFilter () {
      this.show = false
      this.closeFilters()
    },
    backToStep () {
      this.$VueEvent.fire('filters-back')
      if (this.step > 1) {
        this.step -= 1
        // make all filters visible
        if (this.step === 2) { this.filterSearch = '' }
      }
    },
    filtersApplied () {
      this.step = 1
      this.$emit('filtersUpdated')
    },
    generateListFilters () {
      let filterGroups = JSON.parse(JSON.stringify(this.currentListFilters))
      for (let groupIndex in filterGroups) {
        for (let filterIndex in filterGroups[groupIndex].filters) {
          const found = this.filters.find(filter => filter.key === filterIndex)
          if (found) {
            const operator = found.operators.find(operator => operator.value === filterGroups[groupIndex].filters[filterIndex].operator)
            filterGroups[groupIndex].filters[filterIndex] = {
              key: filterIndex,
              label: found.label,
              operator: operator.label,
              trueValue: filterGroups[groupIndex].filters[filterIndex].value,
              value: JSON.stringify(filterGroups[groupIndex].filters[filterIndex].value)
            }
          }
        }
      }
      return filterGroups
    },
    getFormattedFilterSummary (filter, key) {
      if (!filter.trueValue) {
        return ''
      }
      if (typeof filter.trueValue === 'object') {
        const filterFound = this.filters.find(filter => filter.key === key)
        const isRelationType = filterFound && ['relation', 'multi_relation'].includes(filterFound.type)
        let values = []
        switch (true) {
          case filter.trueValue.length === 1 || (isRelationType):
            values = filter.trueValue
            break
          case filter.trueValue.length === 2 && filter.operator !== 'Is between':
            return filter.trueValue.join(' or ')
          case filter.trueValue.length === 2 && filter.operator === 'Is between':
            return filter.trueValue.join(' and ')
        }
        let labels = []
        if (filterFound && isRelationType) {
          for (let item of values) {
            const optionFound = filterFound.options.find(option => option.value === item)
            labels.push(optionFound ? optionFound.label : '')
          }
        }
        const joinedValues = labels.join(', ')
        return joinedValues.substring(0, joinedValues.lastIndexOf(',')) + ' or' + joinedValues.substring(joinedValues.lastIndexOf(',') + 1, joinedValues.length)
      } else {
        return filter.trueValue
      }
    },
    getFilterLength (filter) {
      return Object.keys(filter).length
    },
    onDeleteFilter (index, key) {
      let updatedFilter = JSON.parse(JSON.stringify(this.currentListFilters))
      delete updatedFilter[index].filters[key]
      if (_.isEmpty(updatedFilter[index].filters)) {
        updatedFilter.splice(index, 1)
      }
      this.setCurrentListFilters(updatedFilter)
    },
    onDeleteGroupFilter (index) {
      let updatedFilter = JSON.parse(JSON.stringify(this.currentListFilters))
      updatedFilter.splice(index, 1)
      this.setCurrentListFilters(updatedFilter)
    },
    emitFiltersCount () {
      let filtersCount = 0
      if (this.currentListFilters.length) {
        for (let group of this.currentListFilters) {
          const filter = _.get(group, 'filters', null)
          filtersCount += filter ? Object.keys(filter).length : 0
        }
      }
      this.$emit('filtersCount', filtersCount)
    }
  },
  mounted () {
    this.step = 1
    this.getFilters()
    if (this.isFiltersOpen) {
      this.show = true
    }
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      this.show = isFiltersOpen
    },
    currentListFilters () {
      this.visibleListFilters = this.generateListFilters()
      this.emitFiltersCount()
    }
  }
}
</script>
