<template>
  <div>
    <div class="filter-types"
         :key="`${filter.key}-${operator.value}`"
         data-testid="contacts-filter-types"
         v-for="operator in filter.operators">
      <q-radio class="my-2 flex-nowrap"
               dense
               :val="operator.value"
               :label="operator.label"
               data-testid="contacts-filter-types-radio"
               v-model="filterOperator">
      </q-radio>
      <template v-if="filter.type === 'string'">
        <q-select ref="filterOperation"
                  class="filter-operation border"
                  input-debounce="0"
                  option-value="originalLabel"
                  option-label="label"
                  option-disable="disabled"
                  borderless
                  dense
                  use-input
                  use-chips
                  multiple
                  data-testid="contacts-filter-types-string-select"
                  :emit-value="isSpecialStringTypeFilterKey"
                  :options="filterOptions"
                  v-model="filterOperatorValue"
                  v-if="operator.value === filterOperator && hasValue"
                  v-on="specialStringTypeEvents">
        </q-select>
      </template>
      <template v-if="filter.type === 'number'">
        <q-input outlined
                 dense
                 v-model="filterOperatorValue"
                 data-testid="contacts-filter-operator-value-input"
                 v-if="operator.value === filterOperator && hasValue" />
        <span v-if="operator.value === filterOperator && hasSecondaryOperator">and</span>
        <q-input outlined
                 dense
                 class="pt-2"
                 v-model="secondaryFilterOperatorValue"
                 data-testid="contacts-filter-secondary-operator-value-input"
                 v-if="operator.value === filterOperator && hasSecondaryOperator" />
      </template>
      <template v-if="filter.type === 'date'">
        <q-select option-value="value"
                  dense
                  outlined
                  emit-value
                  map-options
                  :options="operator.options"
                  data-testid="contacts-filter-operator-value-date-select"
                  v-model="filterOperatorValue"
                  v-if="operator.value === filterOperator && hasValue" />
        <b-form-datepicker label-today="Today"
                           today-button
                           reset-button
                           :date-format-options="format"
                           v-model="filterOperatorValue"
                           data-testid="contacts-filter-operator-value-datepicker"
                           v-if="operator.value === filterOperator && expectsDatepicker">
        </b-form-datepicker>
        <span v-if="operator.value === filterOperator && hasSecondaryOperator">and</span>
        <b-form-datepicker label-today="Today"
                           today-button
                           reset-button
                           :date-format-options="format"
                           data-testid="contacts-filter-secondary-operator-value-datepicker"
                           v-model="secondaryFilterOperatorValue"
                           v-if="operator.value === filterOperator && hasSecondaryOperator">
        </b-form-datepicker>
      </template>
      <template v-if="isRelationFilterType(filter.type, filter.key) ">
        <q-select ref="filterOperation"
                  class="filter-operation border"
                  input-debounce="0"
                  option-disable="disabled"
                  borderless
                  dense
                  use-chips
                  multiple
                  map-options
                  emit-value
                  use-input
                  :options="options"
                  v-model="filterOperatorValue"
                  data-testid="contacts-filter-operator-value-relation-select"
                  v-if="operator.value === filterOperator && hasValue"
                  @input="onInput"
                  @filter="filterFn"/>
        <label v-if="operator.value === filterOperator && hasSecondaryOperator">
          Content:
        </label>
        <q-select ref="secondaryFilterOperation"
                  class="filter-operation border"
                  input-debounce="0"
                  option-value="originalLabel"
                  option-label="label"
                  option-disable="disabled"
                  borderless
                  dense
                  use-input
                  use-chips
                  multiple
                  :options="filterOptions"
                  data-testid="contacts-filter-secondary-operator-value-relation-select"
                  v-model="secondaryFilterOperatorValue"
                  v-if="operator.value === filterOperator && hasSecondaryOperator"
                  @input-value="showSecondaryFilterOperationOptions"
                  @input="addSecondaryValue"/>
      </template>
      <template v-if="isTagsFilterType(filter.type, filter.key)">
        <entity-tags data-testid="contact-details-tags"
                     entity="contact"
                     entity-type="contacts"
                     :category="TagCategories.CAT_CONTACTS"
                     :is-filter="true"
                     :filter-values="filterOperatorValue"
                     :filter-values-objects="appliedTags"
                     v-if="operator.value === filterOperator && hasValue"
                     @filter="filterTagFn"/>
        <label v-if="operator.value === filterOperator && hasSecondaryOperator">
          Content:
        </label>
        <q-select ref="secondaryFilterOperation"
                  class="filter-operation border"
                  hint="Type at least 3 characters"
                  input-debounce="0"
                  option-value="originalLabel"
                  option-label="label"
                  option-disable="disabled"
                  borderless
                  dense
                  use-input
                  use-chips
                  multiple
                  :options="filterOptions"
                  v-model="secondaryFilterOperatorValue"
                  data-testid="contacts-filter-secondary-operator-value-tags-select"
                  v-if="operator.value === filterOperator && hasSecondaryOperator"
                  @input-value="showSecondaryFilterOperationOptions"
                  @input="addSecondaryValue"/>
      </template>
      <template v-if="filter.type === 'boolean'">
        <q-btn-toggle class="w-100"
                      toggle-color="primary"
                      :options="options"
                      v-show="operator.value === filterOperator"
                      data-testid="contacts-filter-operator-value-toggle"
                      v-model="filterOperatorValue">
        </q-btn-toggle>
      </template>
      <template v-if="filter.type === 'selection'">
        <q-select class="filter-operation border"
                  ref="filterOperation"
                  option-disable="disabled"
                  input-debounce="0"
                  borderless
                  dense
                  map-options
                  emit-value
                  :options="options"
                  v-model="filterOperatorValue"
                  data-testid="contacts-filter-operator-value-select"
                  v-if="operator.value === filterOperator && hasValue"
                  @input="onInput"
                  @filter="filterFn" />
      </template>
    </div>
    <compact-btn class="mr-2 mt-3 p-3"
                 variant="success"
                 :disabled="!isValidated || appliedFiltersInProgress"
                 data-testid="contacts-filter-types-apply-btn"
                 @clicked="applyFilter">
      {{ applyFilterText }}
    </compact-btn>
  </div>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  get,
  isEmpty,
  isEqual,
  debounce,
  uniqBy
} from 'lodash'
import * as Countries from 'src/constants/countries'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
import { State } from 'country-state-city'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import talk2Api from 'src/plugins/api/api'
import EntityTags from 'components/generic-selectors/entity-tags'

export default {
  name: 'contacts-filter-types',

  components: {
    CompactBtn,
    EntityTags
  },

  props: {
    filter: {
      required: true,
      type: Object
    },

    filterGroupIndex: {
      required: false,
      type: Number,
      default: 0
    },

    filterGroupItemIndex: {
      required: false,
      default: null
    },

    filterConjunction: {
      required: false,
      type: Boolean,
      default: true
    },

    threshold: {
      type: Number,
      default: 3
    }
  },

  data () {
    return {
      filterOperator: OPERATORS.IS_ANY_OF,
      filterOperatorValue: null,
      secondaryFilterOperatorValue: null,
      filterOptions: [
        {
          label: 'Add a new option',
          originalLabel: '',
          disabled: true
        }
      ],
      filterOptionsCopy: [],
      initialListFilters: [],
      isValidated: false,
      debounceDelay: 0,
      format: { 'year': 'numeric', 'month': '2-digit', 'day': 'numeric' },
      allFilters: [],
      options: [],
      filterOperatorDebounceInProgress: false,
      filterOperatorValueDebounceInProgress: false,
      secondaryFilterOperatorValueDebounceInProgress: false,
      appliedFiltersInProgress: false,
      appliedTags: [],
      TagCategories
    }
  },

  computed: {
    ...mapState('contacts', [
      'previousListId'
    ]),

    ...mapState('cache', [
      'timezones'
    ]),

    ...mapGetters('contacts', [
      'currentListFilters',
      'selectedList'
    ]),

    hasValue () {
      switch (this.filter.type) {
        case 'string':
        case 'relation':
        case 'multi_relation':
        case 'boolean':
          return [1, 2].includes(this.filterOperator)

        case 'number':
          return [1, 2, 3, 4, 5, 6, 7].includes(this.filterOperator)

        case 'date':
          return [1].includes(this.filterOperator)

        default:
          return true
      }
    },

    expectsDatepicker () {
      return [2, 3, 4, 5].includes(this.filterOperator)
    },

    hasSecondaryOperator () {
      switch (true) {
        case this.filter.type === 'number':
          return [7].includes(this.filterOperator)

        case this.filter.type === 'date':
          return [5].includes(this.filterOperator)

        case this.filter.key === 'custom_attribute':
          return true

        default:
          return false
      }
    },

    isSpecialStringTypeFilterKey () {
      const filterKeys = ['cnam_country', 'cnam_state', 'timezone']
      return filterKeys.includes(this.filter.key)
    },

    specialStringTypeEvents () {
      // determines if user input should search or create a custom option
      return this.isSpecialStringTypeFilterKey ? {
        'filter': this.filterOptionsFn
      } : {
        'new-value': this.createValue,
        'input': this.addValue,
        'input-value': this.showFilterOperationOptions
      }
    },

    groupItemIndex () {
      const keyFilters = get(this.initialListFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}]`, null)

      if (this.filterGroupItemIndex === null && !isEmpty(keyFilters)) {
        return keyFilters.length
      }

      if (this.filterGroupItemIndex !== null) {
        return this.filterGroupItemIndex
      }

      return 0
    },

    applyFilterText () {
      return this.appliedFiltersInProgress
        ? 'Applying filter...'
        : 'Apply filter'
    },

    isDebounceInProgress () {
      return this.filterOperatorDebounceInProgress ||
        this.filterOperatorValueDebounceInProgress ||
        this.secondaryFilterOperatorValueDebounceInProgress
    }
  },

  created () {
    this.options = this.filter.options

    // special string type filters are filters with preloaded list of options
    if (this.isSpecialStringTypeFilterKey) {
      switch (this.filter.key) {
        case 'cnam_country':
          Countries.COUNTRIES.forEach(country => {
            this.filterOptions.push({
              label: country.name,
              originalLabel: country.code
            })
          })
          break

        case 'cnam_state':
          State.getAllStates().forEach(st => {
            const code = isNaN(+st.isoCode) && ['US', 'CA'].includes(st.countryCode) ? st.isoCode : `${st.countryCode}-${st.isoCode}`

            this.filterOptions.push({
              label: st.name,
              originalLabel: code
            })
          })
          break

        case 'timezone':
          this.timezones.forEach(tz => {
            this.filterOptions.push({
              label: tz,
              originalLabel: tz
            })
          })
          break
      }

      // copy original filter options for filter search suggestion
      this.filterOptions.splice(0, 1)
      this.filterOptionsCopy = this.filterOptions
    }
  },

  mounted () {
    if (this.filter.key === 'tags') {
      // Prevent duplicated options when loading tags previously added
      const optionsSet = new Set(this.filter.options)
      this.filter.options = [...optionsSet]
      this.appliedTags = [...new Set([...this.appliedTags, ...this.filter.options])]
      this.getTags('', true, () => {})
    }
    this.debounceDelay = ['string', 'boolean', 'number', 'date', 'relation'].includes(this.filter.type) ? 10 : 500
    this.initialListFilters = this.$jsonClone(this.currentListFilters)
    const path = `[${this.filterGroupIndex}].filters[${this.filter.key}][${this.groupItemIndex}].operator`
    this.filterOperator = get(this.initialListFilters, path, 1)

    // timeout to make sure "filterOperatorValue" is set after "filterOperator" watch ran
    setTimeout(() => {
      this.setValue()
    }, 10)

    this.$VueEvent.listen('filters-reset', () => {
      this.resetForm()
    })
  },

  methods: {
    setValue () {
      const path = `[${this.filterGroupIndex}].filters[${this.filter.key}][${this.groupItemIndex}]`
      const filter = get(this.initialListFilters, path, null)
      const value = get(filter, 'value', null)

      switch (this.filter.type) {
        case 'number':
          this.setNumberValue(value)
          break

        case 'date':
          this.setDateValue(value)
          break

        case 'relation':
          this.setRelationValue(filter)
          break

        default:
          this.filterOperatorValue = value
      }
    },

    addValue () {
      if (this.filterOperatorValue &&
        typeof this.filterOperatorValue[this.filterOperatorValue.length - 1] === 'object' &&
        !['relation', 'multi_relation'].includes(this.filter.type)) {
        this.filterOperatorValue.pop()
        this.$refs.filterOperation[0].add(this.filterOptions[0].originalLabel, true)
        this.$refs.filterOperation[0].updateInputValue('')
      }

      this.allFilters = []

      if (!isEmpty(this.initialListFilters)) {
        this.allFilters = this.$jsonClone(this.initialListFilters)
      }

      this.allFilters[this.filterGroupIndex] = {
        filters: {},
        is_conjunction: this.filterConjunction
      }

      const filterGroup = get(this.initialListFilters, this.filterGroupIndex, null)

      if (filterGroup) {
        this.allFilters[this.filterGroupIndex].filters = this.$jsonClone(filterGroup.filters)
      }

      let value = { data: null }

      switch (this.filter.type) {
        case 'string':
          value.data = this.getStringValue()
          break

        case 'relation':
        case 'multi_relation':
          // write in value object directly because 'data' and 'field' might be assigned
          value = this.getRelationTypesValue()
          break

        case 'number':
          value.data = this.getNumberValue()
          break

        case 'date':
          value.data = this.getDateValue()
          break

        default:
          value.data = this.filterOperatorValue
      }

      let currentFilter = this.$jsonClone(this.allFilters[this.filterGroupIndex].filters[this.filter.key])
      let currentFilterItem = null

      if (currentFilter) {
        currentFilterItem = currentFilter[this.groupItemIndex]
      }

      // remove an invalid filter
      if (!value.data &&
        !isEmpty(currentFilterItem) &&
        !this.isValidated) {
        delete currentFilter[this.groupItemIndex]
      } else { // add the valid filter
        const data = {
          value: this.$jsonClone(value.data),
          operator: this.filterOperator
        }

        // only add field in request if 'value' is present
        if (value.field) {
          data.field = this.$jsonClone(value.field)
        }

        // initialize the certain key's filters if it doesn't exists
        if (!currentFilter) {
          currentFilter = []
        }

        // we assign the filter data
        if (!isEmpty(currentFilter[this.groupItemIndex])) {
          currentFilter[this.groupItemIndex] = data
        } else {
          currentFilter.push(data)
        }
      }

      this.allFilters[this.filterGroupIndex].filters[this.filter.key] = currentFilter

      this.$VueEvent.stop('filters-back')
      this.$VueEvent.listen('filters-back', () => {
        this.setCurrentListFilters(this.initialListFilters)
      })
    },

    addSecondaryValue () {
      if (this.secondaryFilterOperatorValue &&
        typeof this.secondaryFilterOperatorValue[this.secondaryFilterOperatorValue.length - 1] === 'object') {
        this.secondaryFilterOperatorValue.pop()
        this.$refs.secondaryFilterOperation[0].add(this.filterOptions[0].originalLabel, true)
        this.$refs.secondaryFilterOperation[0].updateInputValue('')
      }
    },

    createValue (value, done) {
      if (value && (!this.filterOperatorValue ||
        (this.filterOperatorValue && !this.filterOperatorValue.includes(value)))) {
        done(value, 'add-unique')
      }

      this.$nextTick(() => {
        this.$refs.filterOperation[0].showPopup()
      })
    },

    showFilterOperationOptions (event) {
      if (!event ||
          (event && this.filterOperatorValue && this.filterOperatorValue.includes(event))) {
        this.filterOptions[0].disabled = true
        this.filterOptions[0].label = 'Add a new option'
        return
      }

      if (this.filterOptions[0].disabled) {
        this.filterOptions[0].disabled = false
      }

      this.$set(this.filterOptions[0], 'label', `Create option "${event}"`)
      this.filterOptions[0].originalLabel = event
      this.$refs.filterOperation[0].hidePopup()
      this.$refs.filterOperation[0].showPopup()
      this.$refs.filterOperation[0].focus()
    },

    showSecondaryFilterOperationOptions (event) {
      const exists = event && this.secondaryFilterOperatorValue && this.secondaryFilterOperatorValue.includes(event)

      // Dont allow addition if event is invalid or option already exists
      if (!event || exists) {
        this.filterOptions[0].disabled = true
        this.filterOptions[0].label = 'Add a new option'
        return
      }

      if (this.filterOptions[0].disabled) {
        this.filterOptions[0].disabled = false
      }

      this.$set(this.filterOptions[0], 'label', `Create option "${event}"`)
      this.filterOptions[0].originalLabel = event
      this.$refs.secondaryFilterOperation[0].hidePopup()
      this.$refs.secondaryFilterOperation[0].showPopup()
      this.$refs.secondaryFilterOperation[0].focus()
    },

    filterOptionsFn (val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.filterOptionsCopy
          return
        }

        const needle = val.toLowerCase()
        this.filterOptions = this.filterOptionsCopy
          .filter(option => (
            option.label.toLowerCase().indexOf(needle) > -1 ||
            option.originalLabel.toLowerCase().indexOf(needle) > -1)
          )
      })
    },

    processFilters () {
      this.setListContactsLoaded(false)

      const currentListFilters = this.$jsonClone(this.currentListFilters)
      let allFilters = this.$jsonClone(this.allFilters)
      let filters = allFilters[this.filterGroupIndex].filters[this.filter.key]

      // remove duplicate filter(s)
      filters = uniqBy(filters, (item) => {
        return JSON.stringify(item)
      })

      allFilters[this.filterGroupIndex].filters[this.filter.key] = filters

      this.setCurrentListFilters(allFilters)

      const previousFilters = this.$jsonClone(this.initialListFilters)
      // update initial list filters with new set of currently selected filters
      this.initialListFilters = this.$jsonClone(this.currentListFilters)

      this.$emit('filtersApplied', this.filter)

      // update the results with new query
      if (!isEqual(this.initialListFilters, currentListFilters)) {
        this.setShowMyContacts(false)
        this.$VueEvent.fire('filteredFetchContacts', {
          clear: true,
          // added the previous filter so that if the fetch fails,
          // we revert the filters to its previous state
          previousFilters: this.$jsonClone(previousFilters)
        })
      }
    },

    applyFilter () {
      this.appliedFiltersInProgress = true
      let debounceDelay = this.isDebounceInProgress
        ? this.debounceDelay
        : 0
      let applyFilterInterval = null

      applyFilterInterval = setInterval(() => {
        if (!this.isDebounceInProgress) {
          if (this.filter.key === 'tags' && this.filterOperatorValue) {
            this.filter.options = this.appliedTags
          }

          this.processFilters()
          this.appliedFiltersInProgress = false
          clearInterval(applyFilterInterval)
        }
      }, debounceDelay)
    },

    getStringValue () {
      return this.$jsonClone(this.filterOperatorValue)
    },

    getNumberValue () {
      switch (true) {
        // in between operator
        case this.filterOperator === 7:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },

    setNumberValue (value) {
      switch (this.filterOperator) {
        // in between operator
        case 7:
          this.filterOperatorValue = value[0]
          this.secondaryFilterOperatorValue = value[1]
          break
        default:
          this.filterOperatorValue = value
      }
    },

    getDateValue () {
      switch (true) {
        // in between operator
        case this.filterOperator === 5:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },

    setDateValue (value) {
      switch (this.filterOperator) {
        // in between operator
        case 5:
          this.filterOperatorValue = value[0]
          this.secondaryFilterOperatorValue = value[1]
          break
        default:
          this.filterOperatorValue = value
      }
    },

    getRelationTypesValue () {
      let attribute = 'data'
      const data = { data: null }

      /*
      The condition below makes use of the 'field' attribute
      - this.filterOperatorValue is converted to 'field' (default is 'value')
      - this.secondaryFilterOperatorValue is converted to 'value'
      */
      if (['custom_attribute'].includes(this.filter.key)) {
        attribute = 'field'

        data.data = this.secondaryFilterOperatorValue instanceof Array
          ? this.secondaryFilterOperatorValue
          : this.$jsonClone(this.secondaryFilterOperatorValue)
      }

      data[attribute] = this.filterOperatorValue instanceof Array
        ? this.filterOperatorValue
        : this.$jsonClone(this.filterOperatorValue)

      return data
    },

    setRelationValue (filter) {
      switch (this.filter.key) {
        case 'custom_attribute':
          this.filterOperatorValue = get(filter, 'field', null)
          this.secondaryFilterOperatorValue = get(filter, 'value', null)
          break
        default:
          this.filterOperatorValue = get(filter, 'value', null)
          break
      }
    },

    validateValue () {
      switch (this.filter.type) {
        case 'string':
        case 'relation':
        case 'multi_relation':
          const isValidFilterOperator = (!this.hasValue || (this.hasValue && !isEmpty(this.filterOperatorValue)))
          const filterOperator = this.filterOperator && isValidFilterOperator
          const secondaryFilterOperator = this.hasSecondaryOperator ? !isEmpty(this.secondaryFilterOperatorValue) : true

          this.isValidated = filterOperator && secondaryFilterOperator
          break

        case 'number':
          // only numbers regex
          const isValueValid = /^\d*$/.test(this.filterOperatorValue)

          this.isValidated = (isValueValid && this.hasSecondaryOperator && this.secondaryFilterOperatorValue) ||
            (isValueValid && !this.hasSecondaryOperator) || (this.filterOperator === 8 || this.filterOperator === 9)
          break

        case 'date':
          // if there are two operators in a date filter, check if both operator values
          // are not empty
          const isSecondOperatorValidValue = this.filterOperatorValue &&
            this.hasSecondaryOperator &&
            this.secondaryFilterOperatorValue
          // if there's only 1 operator in a date filter, check if
          // numeric operator value is greater than or equal to 0
          const isOperatorValidNumericValue = typeof this.filterOperatorValue === 'number' &&
            this.filterOperatorValue >= 0
          // if there's only 1 operator in a date filter, check if
          // non numeric operator value is not empty
          const isOperatorValidNonNumericValue = typeof this.filterOperatorValue !== 'number' &&
            !isEmpty(this.filterOperatorValue)
          // if non or numeric filter operator value has a value,
          // then it is valid for single operator
          const isOperatorValidValue = (isOperatorValidNumericValue ||
              isOperatorValidNonNumericValue) &&
            !this.hasSecondaryOperator
          // we should only allow a date filter to be added if
          // its operator(s) has/have value(s)
          this.isValidated = isOperatorValidValue || isSecondOperatorValidValue
          break

        case 'selection':
        case 'boolean':
          this.isValidated = this.filterOperator && this.filterOperatorValue !== null
          break
        default:
          this.isValidated = false
      }
    },

    resetForm () {
      const filterPath = `[${this.filterGroupIndex}].filters[${this.filter.key}][${this.groupItemIndex}]`
      const operatorPath = `${filterPath}.operator`
      const valuePath = `${filterPath}.value`
      this.filterOperator = get(this.currentListFilters, operatorPath, 1)
      this.$nextTick(() => {
        this.filterOperatorValue = get(this.currentListFilters, valuePath, [])
      })
    },

    updateIsValidated (value) {
      this.isValidated = value
      this.filterOperatorValue = 1
    },

    filterTagFn (val) {
      this.filterOperatorValue = val
    },

    getTags (search = '', force, updateFn, abortFn) {
      if (search.length < 3 && !force) {
        updateFn()
        return
      }

      if (search.length >= this.threshold || force) {
        let params = {
          page: 1,
          per_page: 50,
          search: search
        }

        if (force && this.filterOperatorValue?.length) {
          params.tag_ids = this.filterOperatorValue
        }

        return talk2Api.V1.tags.get({
          params: params
        }).then(res => {
          this.options = res.data.data
          updateFn()
        }).catch(err => {
          console.log(err)
        })
      }
    },

    filterFn (val, update) {
      if (this.filterOperatorValue && val === this.filterOperatorValue) {
        update(() => {
          this.options = this.filter.options.filter(option => option.value === this.filterOperatorValue)
        })
        return
      }

      if (val === '') {
        update(() => {
          this.options = this.filter.options
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.filter.options.filter(option => option.label.toLowerCase().indexOf(needle) > -1)
      })
    },

    onInput () {
      this.$refs.filterOperation[0].updateInputValue('')
    },

    ...mapActions('contacts', [
      'setCurrentListFilters',
      'setShowMyContacts',
      'setListContactsLoaded'
    ]),

    isRelationFilterType (type, key) {
      return ['relation', 'multi_relation'].includes(type) && key !== 'tags'
    },

    isTagsFilterType (type, key) {
      return ['multi_relation'].includes(type) && key === 'tags'
    }
  },

  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      this.secondaryFilterOperatorValue = null

      if (!this.hasValue) {
        this.filterOperatorDebounceInProgress = true
        const debounceFunction = debounce(() => {
          this.addValue()
          this.filterOperatorDebounceInProgress = false
        }, this.debounceDelay)
        debounceFunction()
      }

      this.validateValue()
    },

    filterOperatorValue () {
      this.filterOperatorValueDebounceInProgress = true
      const debounceFunction = debounce(() => {
        this.addValue()
        this.filterOperatorValueDebounceInProgress = false
      }, this.debounceDelay)
      debounceFunction()
      this.validateValue()
    },

    secondaryFilterOperatorValue () {
      this.secondaryFilterOperatorValueDebounceInProgress = true
      const debounceFunction = debounce(() => {
        this.addValue()
        this.secondaryFilterOperatorValueDebounceInProgress = false
      }, this.debounceDelay)
      debounceFunction()
      this.validateValue()
    },

    'filter.options': function (value) {
      this.options = this.filter.options
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('filters-reset')
    this.$VueEvent.stop('filters-back')
  }
}
</script>
