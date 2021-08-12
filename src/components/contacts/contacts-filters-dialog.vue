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
            <search />
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
import Search from 'src/components/search.vue'
export default {
  components: { Search },
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
    ...mapActions('contacts', ['openFilters', 'closeFilters', 'setFilters'])
  },
  mounted () {
    this.$refs.modal.$on('hide', () => {
      this.closeFilters()
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
