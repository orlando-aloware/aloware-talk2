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
    <b-button size="sm">Apply filter</b-button>
  </div>
</template>

<script>
export default {
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
    }
  },
  methods: {

  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      this.secondaryFilterOperatorValue = null
    }
  }
}
</script>

<style>
  .b-calendar-inner{
    min-width: 215px !important;
    width: 215px !important;
  }

  /*#datepicker-buttons__dialog_ {*/
  /*  left: 53px !important;*/
  /*}*/
</style>
