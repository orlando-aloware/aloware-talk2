<template>
  <div class="contacts-filter-sidebar" v-if="show">
    <b-overlay
      spinner-variant="success"
      spinner-type="grow"
      rounded="sm"
      style="width: 100%"
    >
      <div class="filter-contents">
        <div class="p-4">
          <!-- Using slots -->
          <div class="pt-2"
               v-if="step == 1">
            <compact-btn
              variant="primary"
              customClass="px-4 add-filters"
              :onClick="toAddFiltersStep"
            >
              <i class="material-icons mr-1 add-icon">add</i> Add a Filter
            </compact-btn>
          </div>
          <div v-else-if="step == 2">
            <div class="mb-3">
              <contacts-table-search placeholder="Search"
                                     searchOnKeyup
                                     @search="searchFilter"/>
            </div>
            <b-list-group class="filter-list">
              <b-list-group-item class="filter-divider">
                All properties
              </b-list-group-item>
              <b-list-group-item
                class="filter-list-item"
                v-for="filter in filtersFiltered"
                :key="filter.key"
                @click="selectFilter(filter)"
                >
                {{ filter.label }}
              </b-list-group-item>
            </b-list-group>
          </div>
          <div class="step-3"
               v-else-if="step == 3">
            <span class="filter-label">{{ selectedFilter.label }}</span>
            <div v-if="selectedFilter.type == 'string'">
              <div v-for="operator in selectedFilter.operators"
                      :key="(selectedFilter.key + '-' + operator.value)"
              >
                <q-radio class="m-0"
                         :val="operator.value"
                         :label="operator.label"
                         v-model="filterOperator"
                >
                </q-radio>
                <q-select
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
                  @new-value="createValue"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import contactsTableSearch from './contacts-table-search.vue'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
export default {
  components: { contactsTableSearch, CompactBtn },
  data () {
    return {
      items: Array.from(new Array(10)),
      show: true,
      filterSearch: '',
      step: 1,
      selectedFilter: null,
      filterOperator: 1,
      filterOperatorValue: null,
      filterOptions: []
    }
  },
  computed: {
    ...mapState('contacts', ['isFiltersOpen', 'filters']),
    filtersFiltered () {
      if (!this.filterSearch) {
        return this.filters
      }

      return this.filters.filter(filter => filter.label.trim().toLowerCase().includes(this.filterSearch.trim().toLowerCase()))
    },
    hasValue () {
      return [1, 2].includes(this.filterOperator)
    }
  },
  methods: {
    ...mapActions('contacts', ['openFilters', 'closeFilters', 'setFilters']),
    getFilters: function () {
      window.axios
        .get('/api/v2/contacts/filters')
        .then((response) => response.data.filters)
        .then(this.setFilters)
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            message: 'Unable to load filters please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    },
    searchFilter (filterName) {
      this.filterSearch = filterName
    },
    toAddFiltersStep () {
      this.step = 2
    },
    selectFilter (filter) {
      this.selectedFilter = filter
      this.step = 3
    },
    createValue (value, done) {
      console.log('aww')
      if (value && (!this.filterOperatorValue ||
        (this.filterOperatorValue && !this.filterOperatorValue.includes(value)))) {
        console.log('aww3')
        done(value, 'add-unique')
      }
    },
    onCloseFilter () {
      this.show = false
      this.closeFilters()
    }
  },
  mounted () {
    this.step = 1
    this.getFilters()
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      if (isFiltersOpen) {
        this.show = true
      }
    },
    filterOperator () {
      this.filterOperatorValue = null
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.contacts-filter-sidebar {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-left: 10px;

  .card {
    -webkit-border-radius: 10px;

    .card-header {
      border-top-right-radius: 10px;
      border-top-left-radius: 10px;

      .header-buttons {
        color: #fff;
        margin-top: -6px;
      }
    }
  }

  .filter-list {
    border: none;
    padding: 0;
    margin: 0;
  }

  .filter-divider {
    border: none;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin: 0 0 5px 0;
    padding: 0 5px;
    font-weight: bold;
  }

  .filter-divider:not(:first-child) {
    margin-top: 15px;
  }

  .filter-list-item {
    border: none;
    padding: 0 5px;
    font-size: 13px;
    line-height: 30px;
    cursor: pointer;
    transition: background-color 100ms ease-in-out;
    &:hover {
      background-color: $light-green2;
    }
  }

  .filter-search-icon {
    background-color: transparent;
    border-radius: 0;
  }

  .filter-search-input {
    border-radius: 0;
  }

  .filter-contents {
    width: 100%;
    height: calc(100vh - 200px);
    overflow: auto;
  }

  .contact-prop-label {
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  .add-filters {
    font-size: 13px;
    .add-icon {
      font-size: 16px;
    }
  }
  .step-3 {
    .filter-label {
      font-weight: 600;
    }
    .filter-operation {
      border-radius: 0.25rem;
    }
  }
}
</style>
