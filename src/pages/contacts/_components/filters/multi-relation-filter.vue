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
        v-if="operator.value === filterOperator && hasValue"
        v-model="filterOperatorValue"
        :options="filter.options"
        option-disable="disabled"
      />
    </div>
    <compact-btn
      :onClick="applyFilter"
      :disabled="!validated"
      variant="success"
      class="mr-2 mt-3 p-3"
    >
      Apply filter
    </compact-btn>
  </div>
</template>

<script>
import CompactBtn from 'components/buttons/compact-btn'
import { mapActions } from 'vuex'
import _ from 'lodash'

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
      filterOperatorValue: null
    }
  },
  computed: {
    hasValue () {
      return [1, 2].includes(this.filterOperator)
    },
    validated () {
      return this.filterOperatorValue || this.filterOperator === 3 || this.filterOperator === 4
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

      if ([3, 4].includes(this.filterOperator)) {
        this.setFilters()
      }
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
