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
                        v-if="step !== 1"
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
                 v-if="step === 1">
              <compact-btn
                v-if="!Object.keys(visibleListFilters).length"
                variant="primary"
                customClass="px-4 add-filters"
                :onClick="toAddFiltersStep"
              >
                <i class="material-icons mr-1 add-icon">add</i> Add a Filter
              </compact-btn>
              <div class="textual-filter"
                   v-else>
                <template v-for="filter in visibleListFilters">
                  <b-card :key="filter.key">
                    <span class="filter-name">{{ filter.label }}</span>
                    <span class="text-lowercase"> {{ filter.operator }}</span>
                    <span v-if="filter.value.length > 1">
                      <template v-for="(value, key) in filter.value.splice(-1,1)">
                        <span class="font-weight-bold"
                              :key="`filter-value-${key}`">
                          {{ value }}
                        </span>,
                      </template>
                      or
                      <span class="font-weight-bold">
                        {{ filter.value[filter.value.length - 1] }}
                      </span>
                    </span>
                    <span v-else>
                      <span class="font-weight-bold">
                        {{ filter.value[0] }}
                      </span>
                    </span>
                  </b-card>
                </template>
              </div>
            </div>
            <div v-else-if="step === 2">
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
                 v-else-if="step === 3">
              <span class="filter-label">{{ selectedFilter.label }}</span>
              <contacts-string-filter v-if="selectedFilter.type == 'string'"
                                      :filter="selectedFilter"
                                      @filtersApplied="filtersApplied"
              >
              </contacts-string-filter>
              <number-filter v-if="selectedFilter.type === 'number'"
                             :filter="selectedFilter"/>
              <date-filter v-if="selectedFilter.type === 'date'"
                           :filter="selectedFilter"/>
              <multi-relation-filter v-if="selectedFilter.type === 'multi_relation'"
                           :filter="selectedFilter"/>
              <relation-filter v-if="selectedFilter.type === 'relation'"
                               :filter="selectedFilter"/>
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
import contactsStringFilter from './contacts-string-filter.vue'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import NumberFilter from 'pages/contacts/_components/filters/number-filter'
import DateFilter from 'pages/contacts/_components/filters/date-filter'
import MultiRelationFilter from 'pages/contacts/_components/filters/multi-relation-filter'
import RelationFilter from 'pages/contacts/_components/filters/relation-filter'
export default {
  components: { RelationFilter, MultiRelationFilter, DateFilter, NumberFilter, contactsTableSearch, CompactBtn, contactsStringFilter },
  data () {
    return {
      items: Array.from(new Array(10)),
      show: false,
      filterSearch: '',
      step: 1,
      selectedFilter: null
    }
  },
  computed: {
    ...mapState('contacts', ['isFiltersOpen', 'filters', 'currentListFilters']),
    filtersFiltered () {
      if (!this.filterSearch || this.filterSearch.length < 1) {
        return this.filters
      }
      return this.filters.filter(filter => filter.label.trim().toLowerCase().includes(this.filterSearch.trim().toLowerCase()))
    },
    visibleListFilters () {
      let filters = { ...this.currentListFilters }
      if (typeof filters.contact_list_id !== 'undefined') {
        delete filters.contact_list_id
      }
      for (let index in filters) {
        const found = this.filters.find(filter => filter.key === index)
        if (found) {
          const operator = found.operators.find(operator => operator.value === filters[index].operator)
          filters[index] = {
            key: index,
            label: found.label,
            operator: operator.label,
            value: filters[index].value
          }
        }
      }
      return filters
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
    onCloseFilter () {
      this.show = false
      this.closeFilters()
    },
    backToStep () {
      if (this.step > 1) {
        this.step -= 1
        // make all filters visible
        if (this.step === 2) { this.filterSearch = '' }
      }
    },
    filtersApplied () {
      this.step = 1
    }
  },
  mounted () {
    this.step = 1
    this.getFilters()
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      this.show = isFiltersOpen
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
    height: calc(100vh - 232px);
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
  .filter-name {
    color: #0090AF;
    font-weight: bold
  }
}
</style>
