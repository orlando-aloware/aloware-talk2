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
                multiple
                v-model="filterOperatorValue"
                :options="filter.options"
                v-if="operator.value === filterOperator && hasValue && filter.options.length > 0"
      />

      <q-input outlined
               dense
               v-model="filterOperatorValue"
               v-if="operator.value === filterOperator && hasValue && filter.options.length < 1"
      />
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
      filterOperatorValue: null
    }
  },
  computed: {
    hasValue () {
      return [1, 2].includes(this.filterOperator)
    }
  },
  methods: {
    createValue (value, done) {
      if (value && (!this.filterOperatorValue ||
        (this.filterOperatorValue && !this.filterOperatorValue.includes(value)))) {
      }
    }
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
    }
  }
}
</script>

<style>

</style>
