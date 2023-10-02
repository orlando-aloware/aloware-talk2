<template>
  <div class="contacts-filter-sidebar"
       v-if="show || keepOpen">
    <b-overlay class="full-width h-100"
               spinner-variant="success"
               spinner-type="grow"
               rounded="sm">
      <b-card class="filter-container h-100"
              header-class="flex-grow-0"
              body-class="flex-grow-1">
        <template #header>
          <div class="d-flex justify-content-between">
            <div class="d-inline-flex">
              <b-button variant="light"
                        class="header-buttons border-0 grey-90"
                        size="sm"
                        v-if="step !== 1"
                        @click="backToStep">
                <i class="fa fa-arrow-left"></i>
              </b-button>
              <h6 class="mb-0 ml-1 d-flex align-items-center">Filters</h6>
            </div>

            <b-button variant="light"
                      class="header-buttons btn-close-filter border-0 grey-90"
                      size="sm"
                      v-if="!noCloseButton"
                      @click="onCloseFilter">
              <i class="fa fa-times"></i>
            </b-button>
          </div>
        </template>
        <!-- Using slots -->
        <div class="filter-contents step-1 pt-2 pr-1 h-100"
             v-if="step === 1">
          <compact-btn variant="primary"
                       customClass="px-4 add-filters m-2"
                       v-if="isEmptyListFilters"
                       @clicked="toAddFiltersStep">
            <i class="material-icons mr-1 add-icon">add</i> Add a Filter
          </compact-btn>
          <div class="textual-filters"
               v-else>
            <template v-for="(group, groupIndex) in visibleListFilters">
              <div class="d-flex full-width mb-2"
                   :key="`group-remove-${groupIndex}`">
                <div class="font-weight-bold group-conjunction"
                     v-if="groupIndex >= 1">
                  OR
                </div>
                <compact-btn class="py-0 delete-group-filter ml-auto"
                             v-if="!hasDefault(group)"
                             @clicked="onDeleteGroupFilter(groupIndex)">
                  Remove
                </compact-btn>
              </div>
              <b-card class="p-1 mb-2"
                      :key="groupIndex">
                <template v-for="(filterItems, key, index) in group.filters">
                  <template v-for="(filter, filterItemIndex) in filterItems">
                    <b-card class="mb-2 filter-item"
                            role="button"
                            :class="[isDefault(filter) ? 'cursor-default' : '']"
                            :key="`filter-item-${key}-${filterItemIndex}`"
                            @click="selectFilterByKey(filter, groupIndex, filterItemIndex, group.is_conjunction)">
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
                      <compact-btn class="py-0 delete-filter"
                                   v-if="!isDefault(filter)"
                                   @clicked="onDeleteFilter(groupIndex, key, filterItemIndex)">
                        <i class="fa fa-trash"></i>
                        <q-tooltip>
                          Remove this condition
                        </q-tooltip>
                      </compact-btn>
                      <q-tooltip v-if="isDefault(filter)">
                        This is a default filter for this list and cannot be modified.
                      </q-tooltip>
                    </b-card>
                    <div class="mb-2 font-weight-bold"
                         :key="`filter-${filter.key}-${filterItemIndex}`"
                         v-if="isShowAndLabel(groupIndex, index, filter.key, filterItemIndex)">
                      AND
                    </div>
                  </template>
                </template>
                <compact-btn variant="outlined-light"
                             customClass="add-filters with-border conjunction-button"
                             v-if="!isMaxInnerFiltersReached(group.filters)"
                             @clicked="toAddFiltersStep(groupIndex)">
                  AND
                </compact-btn>
              </b-card>
            </template>
            <compact-btn variant="outlined-light"
                         customClass="mb-2 add-filters with-border conjunction-button"
                         v-if="!isMaxOuterFiltersReached"
                         @clicked="toAddFiltersStep(Object.keys(visibleListFilters).length, null, false, false)">
              OR
            </compact-btn>
          </div>
          <p class="px-2 pt-2"
             v-if="unsavedList && isEmptyListFilters">
            To save list, add at least 1 filter
          </p>
        </div>
        <div class="filter-contents step-2 p-2 h-100 d-flex flex-column"
             v-else-if="step === 2">
          <div class="mb-3 flex-grow-0">
            <h6 class="contact-prop-label mb-1">Contact properties</h6>
            <search placeholder="Search"
                    @search="searchFilter"/>
          </div>
          <b-list-group class="filter-list flex-grow-1">
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
              <b-list-group-item class="filter-divider pt-3"
                                 v-if="filterByGroup().filters.length > 0">
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
        <div class="filter-contents step-3 p-2 pr-1 h-100"
             v-else-if="step === 3">
          <span class="filter-label">{{ selectedFilter.label }}</span>
          <contacts-filter-types ref="contact-filter-types"
                                 :filter="selectedFilter"
                                 :filterGroupIndex="filterGroupIndex"
                                 :filterGroupItemIndex="filterGroupItemIndex"
                                 :filterConjunction="filterConjunction"
                                 @filtersApplied="filtersApplied">
          </contacts-filter-types>
        </div>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import { get, isEmpty, isEqual } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import Search from 'src/components/search.vue'
import ContactsFilterTypes from 'src/components/contacts/contacts-filter-types.vue'
import CompactBtn from 'components/compact-btn.vue'
import { GROUP_CONTACT_COMM_METADATA, GROUP_CONTACT_LOCATION, GROUP_CONTACT_RELEVANCE, GROUP_PRIMARY_INFO } from 'src/constants/contact-filter-groups'
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
const DEFAULT_PINNED_LIST_IDS = Object.keys(DEFAULT_PINNED_LIST).map(
  (i) => DEFAULT_PINNED_LIST[i].id
)

export default {

  mixins: [aclMixin],

  components: {
    Search,
    CompactBtn,
    ContactsFilterTypes
  },

  props: {
    noCloseButton: {
      type: Boolean,
      default: false
    },

    keepOpen: {
      type: Boolean,
      default: false
    }
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
      filterGroupItemIndex: 0,
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
      },
      maxOuterFilters: 3, // OR
      maxInnerFilters: 5 // AND
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
      if (isEmpty(this.visibleListFilters) &&
        (!this.filterSearch || !this.filterSearch.length)) {
        return this.filters
      }

      return this.filters.filter(filter =>
        filter.label.trim()
          .toLowerCase()
          .includes(this.filterSearch.trim().toLowerCase())
      )
    },

    isEmptyListFilters () {
      return isEmpty(this.visibleListFilters)
    },

    isMaxOuterFiltersReached () {
      return this.visibleListFilters.length >= this.maxOuterFilters
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
            break
        }

        const compare = function (a, b) {
          // Use toUpperCase() to ignore character casing
          const filterA = a.label.toUpperCase()
          const filterB = b.label.toUpperCase()

          return filterA > filterB
            ? 1
            : (filterA < filterB ? -1 : 0)
        }

        const filters = !groupId
          ? this.filtersFiltered.filter(list => !list.group_id || list.group_id.length < 1)
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
      return
    }

    this.visibleListFilters = this.generateListFilters()
  },

  mounted () {
    this.step = 1

    if (this.isFiltersOpen) {
      this.show = true
    }
  },

  methods: {
    isMaxInnerFiltersReached (filtersGroup) {
      return Object.keys(filtersGroup).map(filter => filtersGroup[filter].length).reduce((acc, value) => acc + value, 0) >= this.maxInnerFilters
    },

    getFilters () {
      if (this.hasPermissionTo('list filter')) {
        this.loadingFilters = true

        return talk2Api.V2.filters.get()
          .then(response => {
            this.loadingFilters = false

            const filters = response.data.filters
            // find the tags filter and sort the options alphabetically
            const tagsFilter = filters.find(filter => filter.label === 'Tags')
            const tagsFilterIndex = filters.indexOf(tagsFilter)

            if (!isEmpty(tagsFilter)) {
              filters[tagsFilterIndex].options = this.$alphabeticalSort(tagsFilter.options, 'label')
            }

            this.setFilters(filters)
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

    toAddFiltersStep (index, itemIndex, conjunction = true, skipStep = false) {
      // check if index is a number
      if (!isNaN(index / 1)) {
        this.filterGroupIndex = parseInt(index)
      }

      // assign a numeric value to filterGroupItemIndex, else null
      this.filterGroupItemIndex = !itemIndex && itemIndex !== 0 ? null : itemIndex
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

    selectFilterByKey (filter, groupIndex, itemIndex, conjunction) {
      if (typeof filter.default !== 'undefined' && filter.default === 1) {
        return
      }

      const found = this.filters.find(item => item.key === filter.key)

      if (found) {
        this.selectedFilter = found
        this.toAddFiltersStep(groupIndex, itemIndex, conjunction, true)
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
      if (DEFAULT_PINNED_LIST_IDS.includes(this.selectedList.id)) {
        this.updateContactsListFilter({
          id: this.selectedList.id,
          filters: []
        })
      }

      const filterGroups = this.$jsonClone(this.currentListFilters)

      for (const groupIndex in filterGroups) {
        // do not include any "none filter group filter (e.g. search, sort, order, etc.)"
        // in the generated/rendered filters
        if (isNaN(groupIndex / 1) || groupIndex === 'search') {
          filterGroups instanceof Array && filterGroups.splice(groupIndex, 1)
          !(filterGroups instanceof Array) && delete filterGroups[groupIndex]
          continue
        }

        if (!filterGroups[groupIndex]) {
          continue
        }

        // filter groups are in numeric indexes
        for (const filterKey in filterGroups[groupIndex].filters) {
          if (filterKey === 'search') {
            continue
          }

          // find and get the equivalent actual filter from all available filters
          let filterExists = this.filters.find(filter => filter.key === filterKey)

          if (!filterExists) {
            continue
          }

          const filterItems = filterGroups[groupIndex].filters[filterKey]
          let newFilterItems = []

          // evaluate list filter's operator against its actual respective filter's operators
          if (get(filterExists, 'operators', null)) {
            filterItems.forEach((filterItem) => {
              // try to search for the selected option
              const operatorData = filterExists.operators.find(item => item.value === filterItem.operator)
              const options = operatorData ? get(operatorData, 'options', null) : null
              const option = options ? options.find(item => item.value === filterItem.value) : null

              // set values into an array
              let trueValue = filterItem.value
              trueValue = option ? [option.label] : trueValue
              trueValue = typeof filterItem.value === 'string'
                ? filterItem.value.split(',')
                : [trueValue]

              // when 'field' is present, change values between 'field' and 'value' to make use of the current logic for the 'value' attribute
              // the content in 'field' will be concatenated at the end of the string
              let field = null

              if ('field' in filterItem) {
                field = Array.isArray(trueValue) ? trueValue[0] : trueValue

                // set values into an array (but using 'field' this time)
                trueValue = filterItem.field
                trueValue = option ? [option.label] : trueValue
                trueValue = typeof filterItem.field === 'string'
                  ? filterItem.field.split(',')
                  : [trueValue]
              }

              newFilterItems.push({
                field,
                key: filterKey,
                label: filterExists.label,
                operator: operatorData ? get(operatorData, 'label', null) : null,
                trueValue: trueValue,
                value: JSON.stringify((trueValue ? [trueValue.join(' and ')] : trueValue)),
                default: filterItem.default || 0
              })
            })

            filterGroups[groupIndex].filters[filterKey] = newFilterItems

            continue
          }

          filterItems.forEach((filterItem) => {
            newFilterItems.push({
              key: filterKey,
              label: filterExists.label,
              trueValue: filterItem.value,
              value: JSON.stringify(filterItem.value),
              default: filterItem.default || 0
            })
          })

          filterGroups[groupIndex].filters[filterKey] = newFilterItems
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
      const isSimpleType = filterFound && get(filterFound, 'type', null)
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
              .filter(option => Array.isArray(index)
                ? index.includes(option.value)
                : index === option.value)
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
      }

      return !isSimpleType ? filter.trueValue : ''
    },

    getGroupFiltersLength (filter) {
      return Object.keys(filter).length
    },

    onDeleteFilter (index, key, itemIndex) {
      this.setListContactsLoaded(false)

      let updatedFilter = this.$jsonClone(this.currentListFilters)
      const initialListFilters = this.$jsonClone(this.currentListFilters)
      updatedFilter[index].filters[key].splice(itemIndex, 1)

      // check if filter key has no items, then remove it
      if (updatedFilter?.[index]?.filters?.[key] &&
        isEmpty(updatedFilter[index].filters[key])) {
        delete updatedFilter[index].filters[key]
      }

      // check if filters is empty, remove index
      if (updatedFilter?.[index]?.filters &&
        isEmpty(updatedFilter[index].filters)) {
        delete updatedFilter[index]

        // filter group was deleted, so we decrement the index by 1
        // if current filter group index is greater than 0
        this.filterGroupIndex -= this.filterGroupIndex > 0 ? 1 : 0
      }

      updatedFilter = this.reindexFilters(updatedFilter)

      if (!isEqual(updatedFilter, initialListFilters)) {
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
      let updatedFilter = this.$jsonClone(this.currentListFilters)

      if (updatedFilter.constructor.name === 'Array') {
        updatedFilter.splice(index, 1)
      }

      if (updatedFilter.constructor.name === 'Object') {
        delete updatedFilter[index]
      }

      updatedFilter = this.reindexFilters(updatedFilter)

      if (!isEqual(this.updatedFilter, this.currentListFilters)) {
        this.$VueEvent.fire('filteredFetchContacts', { clear: true })
      }

      this.setCurrentListFilters(updatedFilter)
      this.updateContactsListFilter({
        id: this.selectedList.id,
        filters: updatedFilter
      })

      // decrement the filter group index by 1 only if
      // filter group index item is 0
      this.filterGroupIndex -= this.filterGroupIndex > 0 ? 1 : 0

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

    reindexFilters (filter) {
      let newFilter = {}
      let numericKey = 0
      let newKey = 0
      let isNumerickey = false

      for (const key in filter) {
        // check if original key is numeric
        isNumerickey = !isNaN(parseInt(key))

        // if original key is numeric, use the incremental numeric key
        // else, the original key
        newKey = isNumerickey ? numericKey : key
        newFilter[newKey] = filter[key]

        // increment the numeric key if original key is numeric
        numericKey += isNumerickey ? 1 : 0
      }

      return newFilter
    },

    isShowAndLabel (groupIndex, filterIndex, key, itemIndex) {
      const groupFilters = this.visibleListFilters[groupIndex].filters
      const groupAllFiltersSize = Object.values(groupFilters).flat().length
      const groupFiltersSize = Object.keys(groupFilters).length
      const filtersSize = groupFilters[key] ? groupFilters[key].length : 0
      const isLastItemInGroup = filterIndex === (groupFiltersSize - 1) && itemIndex === (filtersSize - 1)

      // don't show "AND" label if there's only 1 filter in the group or
      // if there are more than 1 filters in the group and the filter is the last
      if (groupAllFiltersSize === 1 ||
        (isLastItemInGroup && groupAllFiltersSize > 1)) {
        return false
      }

      return true
    },

    ...mapActions('contacts', [
      'openFilters',
      'closeFilters',
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

    currentListFilters: {
      deep: true,
      handler: function () {
        this.visibleListFilters = this.generateListFilters()

        // if there's any change in the current list's filters,
        // we need to update the filter group index value to
        // how many filters are currently active
        let keys = Object.keys(this.currentListFilters)
        keys = keys.filter(item => !isNaN(parseInt(item)))

        if (keys.length) {
          this.filterGroupIndex = keys.length
        }
      }
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
