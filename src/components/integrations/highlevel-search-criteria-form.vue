<template>
  <div class="highlevel-search-criteria-form">
    <div v-if="isLoading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="mt-2">Loading search options...</div>
    </div>

    <div v-else class="form-group mb-3">
      <label class="form-label">Search Criteria</label>
      <div class="search-criteria-row">
        <div class="row">
          <div class="col-4">
            <q-select
              v-model="searchCriteria.field"
              :options="availableFields"
              label="Field"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-3">
            <q-select
              v-model="searchCriteria.operator"
              :options="availableOperators"
              label="Operator"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-4">
            <q-input
              v-model="searchCriteria.value"
              label="Value"
              outlined
              dense
              placeholder="Enter value"
            />
          </div>
          <div class="col-1 d-flex align-items-center">
            <q-btn
              icon="add"
              color="primary"
              flat
              dense
              @click="addCriteria"
              title="Add another criteria"
            />
          </div>
        </div>
      </div>

      <!-- Placeholder for additional criteria -->
      <div v-if="criteriaList.length > 1" class="mt-2">
        <div class="text-muted">
          <small>Additional criteria will be added here (OR/AND logic)</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HighlevelSearchCriteriaForm',

  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },

  mounted () {
    this.fetchSearchOptions()
  },

  data () {
    return {
      searchCriteria: {
        field: '',
        operator: '',
        value: ''
      },
      criteriaList: [{}],
      availableFields: [],
      availableOperators: [],
      isLoading: false
    }
  },

  methods: {
    async fetchSearchOptions () {
      this.isLoading = true
      try {
        const response = await this.$axios.get('/api/v2/contacts-list/highlevel-search-options')
        const data = response.data.data

        if (data.fields) {
          this.availableFields = Object.entries(data.fields).map(([value, label]) => ({
            label,
            value
          }))
        }

        if (data.operators) {
          this.availableOperators = Object.entries(data.operators).map(([value, label]) => ({
            label,
            value
          }))
        }

        console.log('HighLevel search options loaded:', { fields: this.availableFields, operators: this.availableOperators })
      } catch (error) {
        console.error('Failed to fetch HighLevel search options:', error)
        this.$generalNotification('Failed to load HighLevel search options. Please try again.', 'error')
      } finally {
        this.isLoading = false
      }
    },

    addCriteria () {
      this.criteriaList.push({})
    },

    emitValue () {
      this.$emit('input', this.searchCriteria)
    }
  },

  watch: {
    searchCriteria: {
      handler () {
        this.emitValue()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.highlevel-search-criteria-form {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.search-criteria-row {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}
</style>
