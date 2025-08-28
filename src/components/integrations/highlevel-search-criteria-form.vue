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

      <!-- Compact Summary View -->
      <div class="search-criteria-summary">
        <div v-if="hasCriteria" class="criteria-display">
          <div class="criteria-item">
            <span class="criteria-text">
              {{ getCriteriaSummary }}
            </span>
            <button class="btn btn-link small text-muted"
                    @click="openEditDialog">
              <i class="fa fa-edit"/>
            </button>
          </div>
        </div>

        <div v-else class="no-criteria">
          <span class="text-muted">No search criteria defined</span>
          <button class="btn btn-link small text-muted ml-2"
                  @click="openEditDialog">
            <i class="fa fa-plus"/>
          </button>
        </div>
      </div>

      <!-- Detailed Edit Dialog -->
      <b-modal
        id="highlevel-criteria-modal"
        title="Edit Search Criteria"
        size="lg"
        centered
        :hide-footer="false"
        v-model="showEditDialog"
        @hidden="showEditDialog = false"
      >
        <div class="criteria-editor">
          <!-- Single Criteria Row -->
          <div class="criteria-form-row">
            <div class="criteria-form-field">
              <label class="field-label">Field</label>
              <q-select
                v-model="searchCriteria.field"
                :options="availableFields"
                outlined
                dense
                emit-value
                map-options
                placeholder="Select a field"
                class="criteria-form-input"
              />
            </div>

            <div class="criteria-form-field">
              <label class="field-label">Operator</label>
              <q-select
                v-model="searchCriteria.operator"
                :options="filteredOperators"
                outlined
                dense
                emit-value
                map-options
                placeholder="Select an operator"
                class="criteria-form-input"
              />
            </div>

            <div class="criteria-form-field">
              <label class="field-label">Value</label>
              <q-input
                v-model="searchCriteria.value"
                outlined
                dense
                placeholder="Enter value"
                class="criteria-form-input"
              />
            </div>
          </div>

          <!-- Placeholder for future multi-criteria support -->
          <div class="mt-3 text-center">
            <small class="text-muted">
              Additional criteria with OR/AND logic will be added here in future updates
            </small>
          </div>
        </div>

        <template #modal-footer>
          <div class="d-flex align-items-center">
            <button class="btn btn-block btn-light mt-0 mr-2"
                    @click="showEditDialog = false">
              Cancel
            </button>
            <button class="btn btn-block btn-primary mt-0"
                    @click="applyCriteria"
                    :disabled="!isCriteriaValid">
              Apply
            </button>
          </div>
        </template>
      </b-modal>
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
      availableFields: [],
      availableOperators: [],
      isLoading: false,
      showEditDialog: false
    }
  },

  computed: {
    hasCriteria () {
      return this.searchCriteria.field && this.searchCriteria.operator && this.searchCriteria.value
    },

    isCriteriaValid () {
      return this.searchCriteria.field && this.searchCriteria.operator && this.searchCriteria.value
    },

    getCriteriaSummary () {
      if (!this.hasCriteria) return ''

      const fieldLabel = this.availableFields.find(f => f.value === this.searchCriteria.field)?.label || this.searchCriteria.field
      const operatorLabel = this.availableOperators.find(o => o.value === this.searchCriteria.operator)?.label || this.searchCriteria.operator

      return `${fieldLabel} ${operatorLabel.toLowerCase()} "${this.searchCriteria.value}"`
    },

    filteredOperators () {
      if (!this.searchCriteria.field) {
        return this.availableOperators
      }

      const field = this.availableFields.find(f => f.value === this.searchCriteria.field)
      if (!field || !field.supportedOperators) {
        return this.availableOperators
      }

      return this.availableOperators.filter(op => field.supportedOperators.includes(op.value))
    }
  },

  methods: {
    async fetchSearchOptions () {
      this.isLoading = true
      try {
        const response = await this.$axios.get('/api/v2/contacts-list/highlevel-search-options')
        const data = response.data.data

        if (data.fields) {
          // Transform fields to include label and supported operators
          this.availableFields = Object.entries(data.fields).map(([value, fieldData]) => ({
            label: fieldData.label,
            value: value,
            supportedOperators: fieldData.supported_operators
          }))
        }

        if (data.operators) {
          // Transform operators to include label
          this.availableOperators = Object.entries(data.operators).map(([value, label]) => ({
            label: label,
            value: value
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

    openEditDialog () {
      this.showEditDialog = true
    },

    applyCriteria () {
      if (this.isCriteriaValid) {
        this.emitValue()
        this.showEditDialog = false
      }
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
    },

    'searchCriteria.field' (newField) {
      // Reset operator when field changes to ensure compatibility
      if (newField && this.searchCriteria.operator) {
        const field = this.availableFields.find(f => f.value === newField)
        if (field && field.supportedOperators && !field.supportedOperators.includes(this.searchCriteria.operator)) {
          this.searchCriteria.operator = ''
        }
      }
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

.search-criteria-summary {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  min-height: 60px;
  display: flex;
  align-items: center;
}

.criteria-display {
  width: 100%;
}

.criteria-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.criteria-text {
  font-size: 14px;
  color: #495057;
  flex-grow: 1;
}

.no-criteria {
  display: flex;
  align-items: center;
  width: 100%;
  color: #6c757d;
  font-style: italic;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.field-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  font-size: 14px;
}

.criteria-editor {
  padding: 16px 0;
}

/* Form layout classes */
.criteria-form-row {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
}

.criteria-form-field {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
}

.criteria-form-input {
  width: 100%;
  height: 40px;
}
</style>
