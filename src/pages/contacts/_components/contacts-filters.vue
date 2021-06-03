<template>
  <b-modal
    ref="modal"
    title="Manage Filters"
    modal-class="filters-modal"
    id="filters-modal"
    hide-footer
  >
    <b-overlay
      :show="show"
      spinner-variant="success"
      spinner-type="grow"
      rounded="sm"
      style="max-width: 324px"
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
  </b-modal>
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
        .finally(() => {
          this.show = false
        })
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
    }
  },
  mounted () {
    this.$refs.modal.$on('hide', () => {
      this.closeFilters()
    })
    this.$refs.modal.$on('show', () => {
      // load filters here...
      this.step = 1
      this.getFilters()
    })
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      if (isFiltersOpen) {
        this.$bvModal.show('filters-modal')
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
.filters-modal {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-end;

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
    margin: 0;
    padding: 0;
    font-weight: bold;
    padding-left: 5px;
    padding-right: 5px;
    margin-bottom: 5px;
  }

  .filter-divider:not(:first-child) {
    margin-top: 15px;
  }

  .filter-list-item {
    border: none;
    padding: 0;
    font-size: 13px;
    line-height: 30px;
    padding-left: 5px;
    padding-right: 5px;
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

  .modal-title {
    font-size: 16px;
    color: $white;
  }
  .modal-header {
    background-color: $dark;
    border-radius: 0;
    padding: 15px;
    .close {
      color: $white;
    }
  }
  .modal-dialog {
    margin: 0;
    height: 100vh;
    min-width: 100vw;
    max-width: 100vw;
    display: flex;
    justify-content: flex-end;
  }

  .modal-body {
    padding: 0px;
    margin: 0;
  }

  .modal-content {
    border-radius: 0;
    border: none;
    height: 100%;
    overflow: hidden;

    @include screen('lg') {
      max-width: 324px;
    }
  }
  .filter-contents {
    width: 100%;
    height: calc(100vh - 61px);
    overflow: auto;
  }
  .modal-footer {
    .custom-btn {
      min-width: 120px;
    }
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
