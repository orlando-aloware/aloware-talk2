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
      secondaryFilterOperatorValue: null
    }
  },
  computed: {
    hasValue () {
      return [1, 2, 3, 4, 5, 6, 7].includes(this.filterOperator)
    },
    hasSecondaryOperator () {
      return [7].includes(this.filterOperator)
    }
  },
  methods: {
    createValue (value, done) {
      if (value && (!this.filterOperatorValue ||
        (this.filterOperatorValue && !this.filterOperatorValue.includes(value)))) {
        done(value, 'add-unique')
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
