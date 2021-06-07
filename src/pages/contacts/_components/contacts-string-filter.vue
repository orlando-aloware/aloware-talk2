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
        @input="addValue"
        @input-value="showFilterOperationOptions"
      />
    </div>
    <compact-btn
      :onClick="applyFilter"
      :disabled="validated"
      variant="success"
      class="mr-2 mt-3 p-3"
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
  name: 'contacts-string-filter',
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
      filterOptions: [
        {
          label: 'Add a new option',
          originalLabel: '',
          disabled: true
        }
      ],
      validated: false,
      initialListFilters: null
    }
  },
  computed: {
    ...mapState('contacts', ['currentListFilters']),
    hasValue () {
      return [1, 2].includes(this.filterOperator)
    }
  },
  created () {
    this.initialListFilters = JSON.parse(JSON.stringify(this.currentListFilters))
    this.$VueEvent.listen('filters-back', () => {
      this.setCurrentListFilters(this.initialListFilters)
    })
  },
  methods: {
    addValue () {
      if (this.filterOperatorValue &&
        typeof this.filterOperatorValue[this.filterOperatorValue.length - 1] === 'object') {
        this.filterOperatorValue.pop()
        this.$refs.filterOperation[0].add(this.filterOptions[0].originalLabel, true)
        this.$refs.filterOperation[0].updateInputValue('')
      }
      let allFilters = {}
      if (!_.isEmpty(this.initialListFilters)) {
        allFilters = this.initialListFilters
      }
      allFilters[this.filter.key] = {
        operator: this.filterOperator,
        value: this.filterOperatorValue
      }
      this.setCurrentListFilters(allFilters)
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
      this.$emit('filtersApplied')
    },
    ...mapActions('contacts', [ 'setCurrentListFilters' ])
  },
  watch: {
    filterOperator () {
      this.filterOperatorValue = null
      if (this.hasValue && this.filterOperatorValue) {
        this.validated = true
      }
    },
    filterOperatorValue () {
      this.addValue()
    }
  }
}
</script>

<style scoped>

</style>
