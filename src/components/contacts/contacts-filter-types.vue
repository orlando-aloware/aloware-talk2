<template>
  <div>
    <div class="filter-types"
         v-for="operator in filter.operators"
         :key="(filter.key + '-' + operator.value)"
    >
      <q-radio class="my-2"
               dense
               :val="operator.value"
               :label="operator.label"
               v-model="filterOperator"
      >
      </q-radio>
      <template v-if="filter.type === 'string'">
        <q-select
          ref="filterOperation"
          class="filter-operation border"
          borderless
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          v-if="operator.value === filterOperator && hasValue"
          v-model="filterOperatorValue"
          :options="filterOptions"
          option-disable="disabled"
          @new-value="createValue"
          @input="addValue"
          @input-value="showFilterOperationOptions"
        >
        </q-select>
      </template>
      <template v-if="filter.type === 'number'">
        <q-input outlined
                 dense
                 v-model="filterOperatorValue"
                 v-if="operator.value === filterOperator && hasValue"
        />
        <span v-if="operator.value === filterOperator && hasSecondaryOperator">and</span>
        <q-input outlined
                 dense
                 class="pt-2"
                 v-model="secondaryFilterOperatorValue"
                 v-if="operator.value === filterOperator && hasSecondaryOperator"
        />
      </template>
      <template v-if="filter.type === 'date'">
        <q-select dense
                  outlined
                  option-value="value"
                  emit-value
                  map-options
                  v-model="filterOperatorValue"
                  :options="operator.options"
                  v-if="operator.value === filterOperator && hasValue"
        />
        <b-form-datepicker
          label-today="Today"
          today-button
          reset-button
          :date-format-options="format"
          v-model="filterOperatorValue"
          v-if="operator.value === filterOperator && expectsDatepicker"
        ></b-form-datepicker>
        <span v-if="operator.value === filterOperator && hasSecondaryOperator">and</span>
        <b-form-datepicker
          label-today="Today"
          today-button
          reset-button
          :date-format-options="format"
          v-model="secondaryFilterOperatorValue"
          v-if="operator.value === filterOperator && hasSecondaryOperator"
        ></b-form-datepicker>
      </template>
      <template v-if="['relation', 'multi_relation'].includes(filter.type)">
        <q-select
          ref="filterOperation"
          class="filter-operation border"
          borderless
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          new-value-mode="add-unique"
          v-if="operator.value === filterOperator && hasValue"
          v-model="filterOperatorValue"
          :options="filter.options"
          option-disable="disabled"
        />
      </template>
    </div>
    <compact-btn
      class="mr-2 mt-3 p-3"
      variant="success"
      @clicked="applyFilter"
      :disabled="!validated"
    >
      Apply filter
    </compact-btn>
  </div>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'
export default {
  name: 'contacts-filter-types',
  components: { CompactBtn },
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
    filterConjunction: {
      required: false,
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      filterOperator: 1,
      filterOperatorValue: null,
      secondaryFilterOperatorValue: null,
      filterOptions: [
        {
          label: 'Add a new option',
          originalLabel: '',
          disabled: true
        }
      ],
      initialListFilters: [],
      validated: false,
      debounceDelay: 0,
      format: { 'year': 'numeric', 'month': '2-digit', 'day': 'numeric' }
    }
  },
  computed: {
    ...mapGetters('contacts', ['currentListFilters']),
    hasValue () {
      switch (this.filter.type) {
        case 'string':
        case 'relation':
        case 'multi_relation':
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
      switch (this.filter.type) {
        case 'number':
          return [7].includes(this.filterOperator)
        case 'date':
          return [5].includes(this.filterOperator)
      }
      return false
    }
  },
  created () {
    this.debounceDelay = this.filter.type === 'string' ? 10 : 500
    this.initialListFilters = JSON.parse(JSON.stringify(this.currentListFilters))
    this.filterOperator = _.get(this.initialListFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}].operator`, 1)
    this.filterOperatorValue = _.get(this.initialListFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}].value`, null)
    this.$VueEvent.listen('filters-reset', () => {
      this.resetForm()
    })
  },
  methods: {
    addValue () {
      if (this.filterOperatorValue &&
        typeof this.filterOperatorValue[this.filterOperatorValue.length - 1] === 'object' &&
        !['relation', 'multi_relation'].includes(this.filter.type)) {
        this.filterOperatorValue.pop()
        this.$refs.filterOperation[0].add(this.filterOptions[0].originalLabel, true)
        this.$refs.filterOperation[0].updateInputValue('')
      }
      let allFilters = []
      if (!_.isEmpty(this.initialListFilters)) {
        allFilters = JSON.parse(JSON.stringify(this.initialListFilters))
      }
      allFilters[this.filterGroupIndex] = {
        filters: {},
        is_conjunction: this.filterConjunction
      }
      const filterGroup = _.get(this.initialListFilters, this.filterGroupIndex, null)
      if (filterGroup) {
        allFilters[this.filterGroupIndex].filters = JSON.parse(JSON.stringify(filterGroup.filters))
      }

      let value = null
      switch (this.filter.type) {
        case 'string':
          value = this.getStringValue()
          break
        case 'relation':
        case 'multi_relation':
          value = this.getRelationTypesValue()
          break
        case 'number':
          value = this.getNumberValue()
          break
        case 'date':
          value = this.getDateValue()
          break
        default:
          value = this.filterOperatorValue
      }

      const currentFilter = _.get(allFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}]`, null)
      let toDelete = _.get(allFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}]`, null)
      if (!value && currentFilter && !this.validated && toDelete) {
        delete allFilters[this.filterGroupIndex].filters[this.filter.key]
      } else {
        allFilters[this.filterGroupIndex].filters[this.filter.key] = {
          value: JSON.parse(JSON.stringify(value)),
          operator: this.filterOperator
        }
      }

      this.setCurrentListFilters(allFilters)
      this.$VueEvent.unlisten('filters-back')
      this.$VueEvent.listen('filters-back', () => {
        this.setCurrentListFilters(this.initialListFilters)
      })
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
        (event &&
          this.filterOperatorValue &&
          this.filterOperatorValue.includes(event))) {
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
    applyFilter () {
      this.initialListFilters = JSON.parse(JSON.stringify(this.currentListFilters))
      this.$emit('filtersApplied')
    },
    getStringValue () {
      return JSON.parse(JSON.stringify(this.filterOperatorValue))
    },
    getNumberValue () {
      switch (true) {
        case this.filterOperator === 8:
          return 0
        case this.filterOperator === 7:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },
    getDateValue () {
      switch (true) {
        case this.filterOperator === 5:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },
    getRelationTypesValue () {
      let newValue = []
      if (this.filterOperatorValue instanceof Array) {
        for (let item of this.filterOperatorValue) {
          newValue.push(item.value)
        }
        return newValue
      } else {
        return JSON.parse(JSON.stringify(this.filterOperatorValue))
      }
    },
    validateValue () {
      switch (this.filter.type) {
        case 'string':
        case 'relation':
        case 'multi_relation':
          this.validated = this.filterOperator && (!this.hasValue || (this.hasValue && this.filterOperatorValue))
          break
        case 'number':
          this.validated = (this.filterOperatorValue && this.hasSecondaryOperator && this.secondaryFilterOperatorValue) ||
            (this.filterOperatorValue && !this.hasSecondaryOperator) || this.filterOperator === 8
          break
        case 'date':
          this.validated = (this.filterOperatorValue && this.hasSecondaryOperator && this.secondaryFilterOperatorValue) ||
            ((this.filterOperatorValue || this.filterOperatorValue >= 0) && !this.hasSecondaryOperator)
          break
        default:
          this.validated = false
      }
    },
    resetForm () {
      const filterOperator = _.get(this.currentListFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}].operator`, 1)
      const filterValue = _.get(this.currentListFilters, `[${this.filterGroupIndex}].filters[${this.filter.key}].value`, [])
      this.filterOperator = filterOperator
      this.$nextTick(() => {
        this.filterOperatorValue = filterValue
      })
    },
    ...mapActions('contacts', [ 'setCurrentListFilters' ])
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      this.secondaryFilterOperatorValue = null
      if (!this.hasValue) {
        const debounce = _.debounce(() => {
          this.addValue()
        }, this.debounceDelay)
        debounce()
      }
      this.validateValue()
    },
    filterOperatorValue () {
      const debounce = _.debounce(() => {
        this.addValue()
      }, this.debounceDelay)
      debounce()
      this.validateValue()
    },
    secondaryFilterOperatorValue () {
      const debounce = _.debounce(() => {
        this.addValue()
      }, this.debounceDelay)
      debounce()
      this.validateValue()
    }
  }
}
</script>

<style lang="scss">
.filter-types {
  .q-field__native.row {
    .q-field__input {
      padding-left: 0 !important;
    }
  }
  .b-calendar-inner {
    min-width: 215px !important;
    width: 215px !important;
  }
}
</style>
