<template>
  <div class="contacts-filter-sidebar" v-if="show">
    <b-overlay class="full-width"
               spinner-variant="success"
               spinner-type="grow"
               rounded="sm"
    >
      <b-card header="Primary"
              header-bg-variant="primary"
              header-text-variant="white">
        <template #header>
          <div class="d-flex justify-content-between">
            <div class="d-inline-flex">
              <b-button variant="outline-primary header-buttons"
                        size="sm"
                        @click="backToStep"
              >
                <i class="fa fa-arrow-left"></i>
              </b-button>
              <h6 class="mb-0">Filters</h6>
            </div>

            <b-button variant="outline-primary header-buttons btn-close-filter" size="sm" @click="onCloseFilter"><i class="fa fa-times"></i> </b-button>
          </div>
        </template>
        <div class="filter-contents">
          <div class="p-2">
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
                <h6 class="contact-prop-label">Contact properties</h6>
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
            </div>
          </div>
        </div>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import contactsTableSearch from './contacts-table-search.vue'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
export default {
  components: { contactsTableSearch, CompactBtn },
  props: {
    listFilters: {
      required: false,
      type: Array
    }
  },
  data () {
    return {
      items: Array.from(new Array(10)),
      show: false,
      filterSearch: '',
      step: 1,
      selectedFilter: null,
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
    },
    onCloseFilter () {
      this.show = false
      this.closeFilters()
    },
    backToStep () {
      if (this.step > 1) {
        this.step -= 1
      }
    }
  },
  mounted () {
    this.step = 1
    this.getFilters()
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      this.show = isFiltersOpen
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
  width: 300px;
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
    height: 75vh;
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
    font-size: 13px;
    .filter-label {
      font-weight: 600;
    }
    .filter-operation {
      border-radius: 0.25rem;
    }
  }
}
</style>
