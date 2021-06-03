<template>
  <div class="contacts-filter-sidebar" v-if="show">
    <b-overlay
      spinner-variant="success"
      spinner-type="grow"
      rounded="sm"
      style="width: 100%"
    >
      <b-card header="Primary"
              header-bg-variant="primary"
              header-text-variant="white">
        <template #header >
          <div class="d-flex justify-content-between">
            <div class="d-inline-flex">
              <b-button variant="outline-primary header-buttons" size="sm"><i class="fa fa-arrow-left"></i> </b-button>
              <h6 class="mb-0">Filters</h6>
            </div>

            <b-button variant="outline-primary header-buttons btn-close-filter" size="sm" @click="onCloseFilter"><i class="fa fa-times"></i> </b-button>
          </div>
        </template>
        <!-- Using slots -->
        <div class="mb-3">
          <h6 class="contact-prop-label">Contact properties</h6>
          <contacts-table-search placeholder="Search" />
        </div>
        <div class="filter-contents">
          <div>
            <b-list-group class="filter-list">
              <b-list-group-item class="filter-divider">
                Most used properties
              </b-list-group-item>
              <b-list-group-item
                class="filter-list-item"
                v-for="filter in filters"
                :key="filter.key"
              >
                {{ filter.label }}
              </b-list-group-item
              >
            </b-list-group>
          </div>
        </div>
      </b-card>
    </b-overlay>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import contactsTableSearch from './contacts-table-search.vue'
export default {
  components: { contactsTableSearch },
  data () {
    return {
      show: false
    }
  },
  computed: {
    ...mapState('contacts', ['isFiltersOpen', 'filters'])
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
    onCloseFilter () {
      this.show = false
      this.closeFilters()
    }
  },
  mounted () {
    this.getFilters()
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      if (isFiltersOpen) {
        this.show = true
      }
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
}
</style>
