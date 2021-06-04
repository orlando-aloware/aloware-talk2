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
      <q-select
        ref="filterOperation"
        class="filter-operation border"
        borderless
        dense
        use-input
        use-chips
        multiple
        input-debounce="0"
        v-if="operator.value == filterOperator && hasValue"
        v-model="filterOperatorValue"
        :options="filterOptions"
        option-disable="disabled"
        @new-value="createValue"
        @input-value="showFilterOperationOptions"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'contacts-string-filter',
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
      filterOptions: [
        {
          label: 'Add a new option',
          disabled: true
        }
      ]
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
        done(value, 'add-unique')
      }
    },
    showFilterOperationOptions (event) {
      if (!event) {
        this.filterOptions[0].disabled = false
        this.filterOptions[0].label = 'Add a new option'
      }
      if (this.filterOptions[0].disabled) {
        this.filterOptions[0].disabled = false
      }
      this.filterOptions[0].label = `Create option "${event}"`
      this.$refs.filterOperation[0].showPopup()
    }
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
    }
  }
}
</script>

<style scoped>

</style>
