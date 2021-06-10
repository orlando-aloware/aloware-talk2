<template>
  <div>
    <div v-for="operator in filter.operators"
         :key="(filter.key + '-' + operator.value)"
    >
      <q-radio class="my-2"
               dense
               :val="operator.value"
               :label="operator.label"
               v-model="filterOperator"
      >
      </q-radio>
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
import CompactBtn from 'components/buttons/compact-btn'
import _ from 'lodash'
import { mapActions } from 'vuex'

export default {
  components: { CompactBtn },
  props: {
    filter: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      filterOperator: 1,
      filterOperatorValue: null,
      secondaryFilterOperatorValue: null,
      format: { 'year': 'numeric', 'month': '2-digit', 'day': 'numeric' }
    }
  },
  computed: {
    hasValue () {
      return [1].includes(this.filterOperator)
    },
    expectsDatepicker () {
      return [2, 3, 4, 5].includes(this.filterOperator)
    },
    hasSecondaryOperator () {
      return [5].includes(this.filterOperator)
    },
    validated () {
      return (this.filterOperatorValue && this.hasSecondaryOperator && this.secondaryFilterOperatorValue) ||
        ((this.filterOperatorValue || this.filterOperatorValue >= 0) && !this.hasSecondaryOperator)
    }
  },
  methods: {
    ...mapActions('contacts', [ 'setCurrentListFilters' ]),
    setFilters () {
      let allFilters = {}

      if (!this.validated) {
        return
      }

      if (!_.isEmpty(this.initialListFilters)) {
        allFilters = this.initialListFilters
      }

      allFilters[this.filter.key] = {
        operator: this.filterOperator,
        value: this.getValue()
      }

      this.setCurrentListFilters(allFilters)
    },
    getValue () {
      switch (true) {
        case this.filterOperator === 5:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },
    applyFilter () {
      this.$emit('filtersApplied')
    }
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      this.secondaryFilterOperatorValue = null
    },
    filterOperatorValue () {
      this.setFilters()
    },
    secondaryFilterOperatorValue () {
      this.setFilters()
    }
  }
}
</script>

<style>
  .b-calendar-inner{
    min-width: 215px !important;
    width: 215px !important;
  }
</style>
