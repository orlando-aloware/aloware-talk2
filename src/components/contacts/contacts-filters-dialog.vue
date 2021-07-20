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
      rounded="sm"
      style="max-width: 324px"
    >
      <div class="filter-contents">
        <div class="p-3">
          <!-- Using slots -->
          <div class="mb-3">
            <contacts-table-search />
          </div>

          <b-list-group class="filter-list">
            <b-list-group-item class="filter-divider"
              >Most used properties</b-list-group-item
            >
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

      <template #overlay>
        <q-spinner-bars color="primary"/>
      </template>
    </b-overlay>
  </b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import contactsTableSearch from './contacts-table-search.vue'
export default {
  components: { contactsTableSearch },
  data () {
    return {
      items: Array.from(new Array(10)),
      show: true
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
    }
  },
  mounted () {
    this.$refs.modal.$on('hide', () => {
      this.closeFilters()
    })
    this.$refs.modal.$on('show', () => {
      // load filters here...
      this.getFilters()
    })
  },
  watch: {
    isFiltersOpen (isFiltersOpen) {
      // if (isFiltersOpen) {
      //   this.$bvModal.show('filters-modal')
      //   this.show = true
      // }
    }
  }
}
</script>

<style lang="scss">
@import '../../css/mixins';
@import '../../css/variables';
@import '../../css/breakpoints';
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
}
</style>
