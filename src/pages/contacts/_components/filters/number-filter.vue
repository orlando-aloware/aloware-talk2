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
import { mapActions, mapState } from 'vuex'
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
      filterOperatorValue: null,
      secondaryFilterOperatorValue: null,
      initialListFilters: null
    }
  },
  computed: {
    ...mapState('contacts', ['currentListFilters']),
    hasValue () {
      return [1, 2, 3, 4, 5, 6, 7].includes(this.filterOperator)
    },
    hasSecondaryOperator () {
      return [7].includes(this.filterOperator)
    },
    validated () {
      return (this.filterOperatorValue && this.hasSecondaryOperator && this.secondaryFilterOperatorValue) ||
        (this.filterOperatorValue && !this.hasSecondaryOperator) || this.filterOperator === 8
    }
  },

  methods: {
    ...mapActions('contacts', [ 'setCurrentListFilters' ]),
    getValue () {
      switch (true) {
        case this.filterOperator === 8:
          return 0
        case this.filterOperator === 7:
          return [this.filterOperatorValue, this.secondaryFilterOperatorValue]
        default:
          return this.filterOperatorValue
      }
    },
    setFilter () {
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
    applyFilter () {
      this.$emit('filtersApplied')
    }
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      this.secondaryFilterOperatorValue = null

      // is zero, then send request
      if (this.filterOperator === 8) {
        this.setFilter()
      }
    },
    filterOperatorValue () {
      this.setFilter()
    },
    secondaryFilterOperatorValue () {
      this.setFilter()
    }
  },
  created () {
    this.initialListFilters = JSON.parse(JSON.stringify(this.currentListFilters))
  }
}
</script>

<style>

</style>
