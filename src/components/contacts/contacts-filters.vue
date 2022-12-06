<template>
  <div class="contacts-filter-sidebar"
       v-if="show">
    <b-overlay class="full-width"
               spinner-variant="success"
               spinner-type="grow"
               rounded="sm">
      <b-card class="filter-container">
        <template #header>
          <div class="d-flex justify-content-between">
            <div class="d-inline-flex">
              <b-button variant="light"
                        class="header-buttons border-0 grey-90"
                        size="sm"
                        @click="backToStep"
                        v-if="step !== 1">
                <i class="fa fa-arrow-left"></i>
              </b-button>
              <h6 class="mb-0 ml-1 d-flex align-items-center">Filters</h6>
            </div>

            <b-button variant="light"
                      class="header-buttons btn-close-filter border-0 grey-90"
                      size="sm"
                      @click="onCloseFilter">
              <i class="fa fa-times"></i>
            </b-button>
          </div>
        </template>
        <div class="">
          <div>
            <!-- Using slots -->
            <div class="filter-contents step-1 pt-2 pr-1"
                 v-if="step === 1">
              <compact-btn v-if="isEmptyListFilters"
                           variant="primary"
                           customClass="px-4 add-filters m-2"
                           @clicked="toAddFiltersStep">
                <i class="material-icons mr-1 add-icon">add</i> Add a Filter
              </compact-btn>
              <div class="textual-filters"
                   v-else>
                <template v-for="(group, groupIndex) in visibleListFilters">
                  <div class="d-flex full-width mb-2"
                       :key="`group-remove-${groupIndex}`">
                    <div v-if="visibleListFilters.length >= 2 && groupIndex >= 1"
                         class="font-weight-bold group-conjunction">
                      {{ group.is_conjunction ? 'AND' : 'OR' }}
                    </div>
                    <compact-btn class="py-0 delete-group-filter ml-auto"
                                 v-if="!hasDefault(group)"
                                 @clicked="onDeleteGroupFilter(groupIndex)">
                      Remove
                    </compact-btn>
                  </div>
                  <b-card class="p-1 mb-2"
                          :key="groupIndex">
                    <template v-for="(filter, key, index) in group.filters">
                      <b-card class="mb-2 filter-item"
                              role="button"
                              :class="[isDefault(filter) ? 'cursor-default' : '']"
                              :key="key"
                              @click="selectFilterByKey(filter, groupIndex, group.is_conjunction)">
                        <span v-if="!filter.operator && typeof filter.trueValue === 'number' && !filter.trueValue">
                          Not
                        </span>
                        <span class="filter-name">{{ filter.label }}</span>
                        <span class="text-lowercase"
                              v-if="filter.operator">
                          &nbsp;{{ filter.operator }}
                        </span>
                        <span class="font-weight-bold">
                          {{ getFormattedFilterSummary(filter, key) }}
                        </span>
                        <compact-btn v-if="!isDefault(filter)"
                                     class="py-0 delete-filter"
                                     @clicked="onDeleteFilter(groupIndex, filter.key)">
                          <i class="fa fa-trash"></i>
                          <q-tooltip>
                            Remove this condition
                          </q-tooltip>
                        </compact-btn>
                        <q-tooltip v-if="isDefault(filter)">
                          This is a default filter for this list and cannot be modified.
                        </q-tooltip>
                      </b-card>
                      <div v-if="getFilterLength(group.filters) >= 2 && index < (getFilterLength(group.filters) - 1)"
                           class="mb-2 font-weight-bold"
                           :key="`filter-${filter.key}`">
                        AND
                      </div>
                    </template>
                    <compact-btn variant="outlined-light"
                                 customClass="add-filters with-border conjunction-button"
                                 @clicked="toAddFiltersStep(groupIndex)">
                      AND
                    </compact-btn>
                  </b-card>
                </template>
                <!--compact-btn variant="outlined-light"
                             customClass="mb-2 add-filters with-border conjunction-button"
                             @clicked="toAddFiltersStep(Object.keys(visibleListFilters).length, false)">
                  OR
                </compact-btn-->
              </div>
              <p
                class="px-2 pt-2"
                v-if="unsavedList && isEmptyListFilters">
                To save list, add at least 1 filter
              </p>
            </div>
            <div class="filter-contents step-2 p-2"
                 v-else-if="step === 2">
              <div class="mb-3">
                <h6 class="contact-prop-label mb-1">Contact properties</h6>
                <search placeholder="Search"
                        @search="searchFilter"/>
              </div>
              <b-list-group class="filter-list">
                <b-list-group-item class="filter-divider">
                  All properties
                </b-list-group-item>
                <div v-for="filter in filterGroups"
                     :key="filter">
                  <b-list-group-item class="filter-divider pt-3"
                                     v-if="filterByGroup(filter).filters.length > 0">
                    {{ filterByGroup(filter).label }}
                  </b-list-group-item>
                  <b-list-group-item class="filter-list-item"
                                     v-for="filter in filterByGroup(filter).filters"
                                     :key="filter.key"
                                     @click="selectFilter(filter)">
                    {{ filter.label }}
                  </b-list-group-item>
                </div>
                <div>
                  <b-list-group-item class="filter-divider pt-3" v-if="filterByGroup().filters.length > 0">
                    Custom
                  </b-list-group-item>
                  <b-list-group-item class="filter-list-item"
                                     v-for="filter in filterByGroup().filters"
                                     :key="filter.key"
                                     @click="selectFilter(filter)">
                    {{ filter.label }}
                  </b-list-group-item>
                </div>

              </b-list-group>
            </div>
            <div class="filter-contents step-3 p-2 pr-1"
                 v-else-if="step === 3">
              <span class="filter-label">{{ selectedFilter.label }}</span>
              <contacts-filter-types ref="contact-filter-types"
                                     :filter="selectedFilter"
                                     :filterGroupIndex="filterGroupIndex"
                                     :filterConjunction="filterConjunction"
                                     @filtersApplied="filtersApplied">
              </contacts-filter-types>
            </div>
          </div>
        </div>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import Search from 'src/components/search.vue'
import ContactsFilterTypes from 'src/components/contacts/contacts-filter-types.vue'
import CompactBtn from 'components/compact-btn.vue'
import { GROUP_CONTACT_COMM_METADATA, GROUP_CONTACT_LOCATION, GROUP_CONTACT_RELEVANCE, GROUP_PRIMARY_INFO } from 'src/constants/contact-filter-groups'
import talk2Api from 'src/plugins/api/api'

import { aclMixin } from 'src/plugins/mixins'

export default {

  mixins: [aclMixin],

  components: {
    Search,
    CompactBtn,
    ContactsFilterTypes
  },

  data () {
    return {
      loadingFilters: false,
      items: Array.from(new Array(10)),
      show: false,
      filterSearch: '',
      step: 1,
      selectedFilter: null,
      visibleListFilters: '',
      filterGroupIndex: 0,
      filterConjunction: true,
      relationTypes: [
        'relation',
        'multi_relation',
        'boolean',
        'selection'
      ],
      filterGroups: {
        GROUP_PRIMARY_INFO,
        GROUP_CONTACT_LOCATION,
        GROUP_CONTACT_RELEVANCE,
        GROUP_CONTACT_COMM_METADATA
      }
    }
  },

  computed: {
    ...mapState('contacts', [
      'isFiltersOpen',
      'selectedList'
    ]),
    ...mapState(['filters']),
    ...mapGetters('contacts', [
      'currentListFilters',
      'unsavedList'
    ]),

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
        const label = { data: '' }
        // eslint-disable-next-line camelcase
        switch (groupId) {
          case this.filterGroups.GROUP_PRIMARY_INFO:
            label.data = 'Primary Information'
            break
          case this.filterGroups.GROUP_CONTACT_LOCATION:
            label.data = 'Contact Location'
            break
          case this.filterGroups.GROUP_CONTACT_RELEVANCE:
            label.data = 'Contact Relevance'
            break
          case this.filterGroups.GROUP_CONTACT_COMM_METADATA:
            label.data = 'Contact Communication'
        }

        const compare = function (a, b) {
          // Use toUpperCase() to ignore character casing
          const filterA = a.label.toUpperCase()
          const filterB = b.label.toUpperCase()

          return filterA > filterB ? 1 : (filterA < filterB ? -1 : 0)
        }

        const filters = !groupId ? this.filtersFiltered.filter(list => !list.group_id || list.group_id.length < 1)
          : this.filtersFiltered.filter(list => list.group_id === groupId)

        return {
          filters: filters.sort(compare),
          label: label.data
        }
      }
    }
  },

  created () {
    if (this.filters.length < 1) {
      this.getFilters()
    } else {
      this.visibleListFilters = this.generateListFilters()
    }
  },

  mounted () {
    this.step = 1

    if (this.isFiltersOpen) {
      this.show = true
    }
  },

  methods: {
    getFilters () {
      if (this.hasPermissionTo('list filter')) {
        this.loadingFilters = true
        return talk2Api.V2.filters.get()
          .then(response => {
            this.loadingFilters = false
            this.setFilters(response.data.filters)
            this.visibleListFilters = this.generateListFilters()
            return Promise.resolve()
          })
          .catch((err) => {
            console.error(err)
            this.loadingFilters = false
            this.$handleErrors(err.response)
            return Promise.reject()
          })
      }
    },

    searchFilter (filterName) {
      this.filterSearch = filterName
    },

    toAddFiltersStep (index, conjunction = true, skipStep = false) {
      // check if index is a number
      if (!isNaN(index / 1)) {
        this.filterGroupIndex = parseInt(index)
      }

      this.filterConjunction = conjunction
      this.$VueEvent.stop('filters-back')

      if (!skipStep) {
        this.step = 2
      }

      if (this.isEmptyListFilters) {
        this.filterSearch = ''
      }
    },

    selectFilter (filter) {
      this.selectedFilter = filter
      this.filterSearch = ''
      this.step = 3

      this.$nextTick(() => {
        if (typeof this.$refs['contact-filter-types'] === 'undefined') {
          return
        }

        if (filter && filter.type === 'boolean') {
          this.$refs['contact-filter-types'].updateIsValidated(true)
          return
        }

        this.$refs['contact-filter-types'].isValidated = false
      })
    },

    selectFilterByKey (filter, index, conjunction) {
      if (typeof filter.default !== 'undefined' && filter.default === 1) {
        return
      }
      const found = this.filters.find(item => item.key === filter.key)
      if (found) {
        this.selectedFilter = found
        this.toAddFiltersStep(index, conjunction, true)
        this.step = 3
      }
    },

    onCloseFilter () {
      this.show = false
      this.closeFilters()
      this.step = 1
    },

    backToStep () {
      this.$VueEvent.fire('filters-back')

      if (this.step > 1) {
        this.step -= 1
        // make all filters visible
        if (this.step === 2) {
          this.filterSearch = ''
        }
      }
    },

    filtersApplied () {
      this.step = 1
      this.$emit('filtersUpdated')
    },

    generateListFilters () {
      const filterGroups = JSON.parse(JSON.stringify(this.currentListFilters))
      const groupIndex = { data: null }
      const filterIndex = { data: null }
      const operators = { data: null }
      const found = { data: null }
      const operator = { data: null }
      const options = { data: null }
      const option = { data: null }
      const trueValue = { data: null }
      const field = { field: null }

      for (groupIndex.data in filterGroups) {
        if (isNaN(groupIndex.data / 1) || groupIndex.data === 'search') {
          filterGroups instanceof Array && filterGroups.splice(groupIndex.data, 1)
          !(filterGroups instanceof Array) && delete filterGroups[groupIndex.data]
          continue
        }

        for (filterIndex.data in filterGroups[groupIndex.data].filters) {
          if (filterIndex.data === 'search') {
            continue
          }

          found.data = this.filters.find(filter => filter.key === filterIndex.data)

          if (!found.data) {
            continue
          }

          operators.data = found.data ? _.get(found.data, 'operators', null) : null

          if (operators.data) {
            operator.data = found.data.operators.find(item => item.value === filterGroups[groupIndex.data].filters[filterIndex.data].operator)
            options.data = operator.data ? _.get(operator.data, 'options', null) : null
            option.data = options.data ? options.data.find(item => item.value === filterGroups[groupIndex.data].filters[filterIndex.data].value) : null
            trueValue.data = filterGroups[groupIndex.data].filters[filterIndex.data].value
            trueValue.data = option.data ? [option.data.label] : trueValue.data
            trueValue.data = typeof filterGroups[groupIndex.data].filters[filterIndex.data].value === 'string' ? filterGroups[groupIndex.data].filters[filterIndex.data].value.split(',') : [trueValue.data]

            // When 'field' is present, change values between 'field' and 'value' to make use of the current logic for the 'value' attribute
            // The content in 'field' will be concatenated at the end of the string
            if ('field' in filterGroups[groupIndex.data].filters[filterIndex.data]) {
              field.field = Array.isArray(trueValue.data) ? trueValue.data[0] : trueValue.data

              trueValue.data = filterGroups[groupIndex.data].filters[filterIndex.data].field
              trueValue.data = option.data ? [option.data.label] : trueValue.data
              trueValue.data = typeof filterGroups[groupIndex.data].filters[filterIndex.data].field === 'string' ? filterGroups[groupIndex.data].filters[filterIndex.data].field.split(',') : [trueValue.data]
            }

            filterGroups[groupIndex.data].filters[filterIndex.data] = {
              ...field,
              key: filterIndex.data,
              label: found.data.label,
              operator: operator.data ? _.get(operator.data, 'label', null) : null,
              trueValue: trueValue.data,
              value: JSON.stringify((trueValue.data ? [trueValue.data.join(' and ')] : trueValue.data)),
              default: filterGroups[groupIndex.data].filters[filterIndex.data].default || 0
            }
          } else {
            filterGroups[groupIndex.data].filters[filterIndex.data] = {
              key: filterIndex.data,
              label: found.data.label,
              trueValue: filterGroups[groupIndex.data].filters[filterIndex.data].value,
              value: JSON.stringify(filterGroups[groupIndex.data].filters[filterIndex.data].value),
              default: filterGroups[groupIndex.data].filters[filterIndex.data].default || 0
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

      const filterFound = this.filters.find(filter => filter.key === key)
      const isRelationType = filterFound && this.relationTypes.includes(filterFound.type)
      const isBoolean = filterFound && filterFound.type === 'boolean'
      const isSimpleType = filterFound && _.get(filterFound, 'type', null)
      const isSelectionType = filterFound && filterFound.type === 'selection' // DNC or opt out filter
      let values = []
      let labels = []

      if (typeof filter.trueValue === 'object') {
        switch (true) {
          case filter.trueValue.length === 1 || (isRelationType):
            values = filter.trueValue
            break
          case filter.trueValue.length === 2 && filter.operator !== 'Is between':
            return filter.trueValue.join(' or ')
          case filter.trueValue.length === 2 && filter.operator === 'Is between':
            return filter.trueValue.join(' and ')
        }

        if (filterFound && (isRelationType || isSelectionType)) {
          for (let index of values) {
            filterFound
              .options
              // if is array search inside it, if not compare with the value
              .filter(option => Array.isArray(index) ? index.includes(option.value) : index === option.value)
              .forEach(option => {
                labels.push(option.label)
              })
          }
        } else if (isBoolean) {
          labels.push(filter.trueValue[0] === 1)
        } else {
          labels = filter.trueValue
        }

        let joinedValues = labels.join(', ')
        let data = labels.length > 1
          ? joinedValues.substring(0, joinedValues.lastIndexOf(',')) + ' or' + joinedValues.substring(joinedValues.lastIndexOf(',') + 1, joinedValues.length)
          : joinedValues

        // add field values at the end if they are present
        if (filter.field) {
          let joinedFields = filter.field.join(', ')

          data += ' as ' + (filter.field.length > 1
            ? joinedFields.substring(0, joinedFields.lastIndexOf(',')) + ' or' + joinedFields.substring(joinedFields.lastIndexOf(',') + 1, joinedFields.length)
            : joinedFields)
        }

        return data
      } else {
        return !isSimpleType ? filter.trueValue : ''
      }
    },

    getFilterLength (filter) {
      return Object.keys(filter).length
    },

    onDeleteFilter (index, key) {
      this.setListContactsLoaded(false)
      const updatedFilter = _.cloneDeep(JSON.parse(JSON.stringify(this.currentListFilters)))
      const initialListFilters = JSON.parse(JSON.stringify(this.currentListFilters))
      delete updatedFilter[index].filters[key]

      if (typeof updatedFilter[index] !== 'undefined' &&
        _.isEmpty(updatedFilter[index].filters) &&
        updatedFilter.constructor.name === 'Array') {
        updatedFilter.splice(index, 1)
      }

      if (typeof updatedFilter[index] !== 'undefined' &&
        _.isEmpty(updatedFilter[index].filters) &&
        updatedFilter.constructor.name === 'Object') {
        delete updatedFilter[index]
      }

      if (!_.isEqual(updatedFilter, initialListFilters)) {
        this.$VueEvent.fire('filteredFetchContacts', { clear: true })
      }

      this.setCurrentListFilters(updatedFilter)
      this.updateContactsListFilter({
        id: this.selectedList.id,
        filters: updatedFilter
      })
      this.$emit('filtersUpdated')
    },

    onDeleteGroupFilter (index) {
      this.setListContactsLoaded(false)
      const updatedFilter = JSON.parse(JSON.stringify(this.currentListFilters))

      if (updatedFilter.constructor.name === 'Array') {
        updatedFilter.splice(index, 1)
      }

      if (updatedFilter.constructor.name === 'Object') {
        delete updatedFilter[index]
      }

      if (!_.isEqual(this.updatedFilter, this.currentListFilters)) {
        this.$VueEvent.fire('filteredFetchContacts', { clear: true })
      }

      this.setCurrentListFilters(updatedFilter)
      this.updateContactsListFilter({
        id: this.selectedList.id,
        filters: updatedFilter
      })
      this.$emit('filtersUpdated')
    },

    hasDefault (filter) {
      const keys = Object.keys(filter.filters)
      const result = { hasDefault: 0 }
      for (let value of keys) {
        if (filter.filters[value].default === 1) {
          result.hasDefault = 1
          break
        }
      }

      return result.hasDefault
    },

    isDefault (filter) {
      return typeof filter.default !== 'undefined' && filter.default === 1
    },

    ...mapActions('contacts', [
      'openFilters',
      'closeFilters',
      'setFilters',
      'setCurrentListFilters',
      'updateContactsListFilter',
      'setListContactsLoaded'
    ]),
    ...mapActions(['setFilters'])
  },

  watch: {
    isFiltersOpen (isFiltersOpen) {
      this.show = isFiltersOpen

      if (!isFiltersOpen) {
        this.step = 1
      }
    },
    currentListFilters () {
      this.visibleListFilters = this.generateListFilters()
    },
    $route: {
      deep: true,
      handler: function () {
        this.step = 1
      }
    }
  }
}
</script>
