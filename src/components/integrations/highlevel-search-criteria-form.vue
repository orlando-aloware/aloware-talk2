<template>
  <div class="highlevel-search-criteria-form">
    <div v-if="isLoading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="mt-2">Loading search options...</div>
    </div>

    <div v-else class="search-criteria-summary">
      <div class="criteria-display">
        <div v-if="hasCriteria" class="criteria-list">
          <div v-for="(block, blockIndex) in getCriteriaSummaryList"
               :key="`summary-block-${blockIndex}`"
               class="criteria-block-summary">
            <div v-if="blockIndex > 0" class="or-separator-summary">OR</div>
            <div v-if="block.type === 'AND'" class="and-group-summary">
              <div v-for="(criterion, criterionIndex) in block.criteria"
                   :key="`criterion-${blockIndex}-${criterionIndex}`"
                   class="criterion-item">
                <span class="criterion-text">{{ criterion }}</span>
                <span v-if="criterionIndex < block.criteria.length - 1" class="and-separator">AND</span>
              </div>
            </div>
            <div v-else class="single-criterion">
              <span class="criterion-text">{{ block.criteria[0] }}</span>
            </div>
          </div>
          <div class="text-center mt-3">
            <button class="btn btn-outline-primary btn-sm"
                    @click="showEditDialog = true">
              Edit Criteria
            </button>
          </div>
        </div>
        <div v-else class="no-criteria">
          <div class="d-flex justify-content-between align-items-center">
            <span>No criteria set</span>
            <button class="btn btn-outline-primary btn-sm"
                    @click="showEditDialog = true">
              Add Criteria
            </button>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      v-model="showEditDialog"
      title="Edit Search Criteria"
      size="lg"
      centered
      :hide-footer="false"
    >
      <div class="criteria-editor">
        <div class="search-criteria-box">
          <div class="criteria-list">
            <template v-for="(block, blockIndex) in searchCriteria.filters">
              <!-- OR separator for all blocks except the first -->
              <div v-if="blockIndex > 0" :key="`or-separator-${blockIndex}`" class="or-separator">
                <span class="or-text">OR</span>
              </div>

              <!-- Criteria block -->
              <div :key="`block-${blockIndex}`" class="criteria-block">
                <!-- AND Group -->
                <div v-if="block.group === 'AND'" class="and-group">
                  <div v-for="(filter, filterIndex) in block.filters"
                       :key="`filter-${blockIndex}-${filterIndex}`"
                       class="criteria-row">

                    <div class="criteria-form-row">
                      <div class="criteria-form-field">
                        <label v-if="filterIndex === 0" class="field-label">Field</label>
                        <q-select
                          v-model="filter.field"
                          :options="availableFieldsWithDisabled(blockIndex, filterIndex)"
                          outlined
                          dense
                          emit-value
                          map-options
                          placeholder="Select a field"
                          class="criteria-form-input"
                        />
                      </div>

                    <div class="criteria-form-field">
                      <label v-if="filterIndex === 0" class="field-label">Operator</label>
                      <q-select
                        v-model="filter.operator"
                        :options="availableOperators"
                        outlined
                        dense
                        emit-value
                        map-options
                        placeholder="Select an operator"
                        class="criteria-form-input"
                      />
                    </div>

                    <div class="criteria-form-field">
                      <label v-if="filterIndex === 0" class="field-label">Value</label>
                      <q-input
                        v-model="filter.value"
                        outlined
                        dense
                        placeholder="Enter value"
                        class="criteria-form-input"
                      />
                    </div>

                      <div class="delete-button-container">
                        <button class="btn btn-outline-danger btn-sm delete-button"
                                @click="removeFilterFromGroup(blockIndex, filterIndex)"
                                :disabled="block.filters.length === 1">
                          <i class="fa fa-trash"/>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="group-and-button">
                    <compact-btn
                      variant="primary"
                      :disabled="!isLastFilterValid(block)"
                      @clicked="addAndCriteria(blockIndex)"
                    >
                      <i class="fa fa-plus mr-2"/>
                      AND
                    </compact-btn>
                  </div>
                </div>

                <!-- Single Filter -->
                <div v-else class="single-filter">
                  <div class="criteria-form-row">
                    <div class="criteria-form-field">
                      <label class="field-label">Field</label>
                      <q-select
                        v-model="block.field"
                        :options="availableFieldsWithDisabled(blockIndex, -1)"
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
                        v-model="block.operator"
                        :options="availableOperators"
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
                        v-model="block.value"
                        outlined
                        dense
                        placeholder="Enter value"
                        class="criteria-form-input"
                      />
                    </div>

                    <div class="delete-button-container">
                      <button class="btn btn-outline-danger btn-sm delete-button"
                              @click="removeCriteria(blockIndex)"
                              :disabled="searchCriteria.filters.length === 1">
                        <i class="fa fa-trash"/>
                      </button>
                    </div>
                  </div>

                  <div class="single-filter-and-button">
                    <compact-btn
                      variant="primary"
                      :disabled="!isFilterValid(block)"
                      @clicked="addAndCriteria(blockIndex)"
                    >
                      <i class="fa fa-plus mr-2"/>
                      AND
                    </compact-btn>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="add-or-section">
          <compact-btn
            variant="primary"
            :disabled="!canAddOrBlock"
            @clicked="addOrCriteria"
          >
            <i class="fa fa-plus-circle mr-2"/>
            OR
          </compact-btn>
        </div>
      </div>

      <template #modal-footer>
        <div class="d-flex align-items-center">
          <button class="btn btn-block btn-light mt-0 mr-2"
                  @click="showEditDialog = false">
            Cancel
          </button>
          <button class="btn btn-block btn-primary mt-0"
                  @click="applyCriteria">
            Apply
          </button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'HighlevelSearchCriteriaForm',

  components: {
    CompactBtn: () => import('../../components/compact-btn.vue')
  },

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
      showEditDialog: false,
      isLoading: false,
      availableFields: [],
      availableOperators: [],
      searchCriteria: {
        filters: [
          { field: '', operator: '', value: '' }
        ]
      }
    }
  },

  computed: {
    hasCriteria () {
      return this.searchCriteria.filters.some(block => {
        if (block.group === 'AND') {
          return block.filters.some(filter => filter.field && filter.operator)
        }
        return block.field && block.operator
      })
    },

    getCriteriaSummary () {
      if (!this.hasCriteria) return 'No criteria set'

      const fieldCache = {}
      const operatorCache = {}

      const summaries = this.searchCriteria.filters.map(block => {
        if (block.group === 'AND') {
          const filterSummaries = block.filters.map(filter => {
            const fieldLabel = this.getFieldLabel(filter.field, fieldCache)
            const operatorLabel = this.getOperatorLabel(filter.operator, operatorCache)
            return `${fieldLabel} ${operatorLabel.toLowerCase()} "${filter.value}"`
          })
          return filterSummaries.join(' AND ')
        } else {
          const fieldLabel = this.getFieldLabel(block.field, fieldCache)
          const operatorLabel = this.getOperatorLabel(block.operator, operatorCache)
          return `${fieldLabel} ${operatorLabel.toLowerCase()} "${block.value}"`
        }
      })

      return summaries.join(' OR ')
    },

    getCriteriaSummaryList () {
      if (!this.hasCriteria) return []

      const fieldCache = {}
      const operatorCache = {}

      return this.searchCriteria.filters.map((block, blockIndex) => {
        if (block.group === 'AND') {
          const filterSummaries = block.filters.map(filter => {
            const fieldLabel = this.getFieldLabel(filter.field, fieldCache)
            const operatorLabel = this.getOperatorLabel(filter.operator, operatorCache)
            return `${fieldLabel} ${operatorLabel.toLowerCase()} "${filter.value}"`
          })
          return {
            type: 'AND',
            criteria: filterSummaries,
            index: blockIndex
          }
        } else {
          const fieldLabel = this.getFieldLabel(block.field, fieldCache)
          const operatorLabel = this.getOperatorLabel(block.operator, operatorCache)
          return {
            type: 'single',
            criteria: [`${fieldLabel} ${operatorLabel.toLowerCase()} "${block.value}"`],
            index: blockIndex
          }
        }
      })
    },

    canAddOrBlock () {
      return this.hasCriteria && this.searchCriteria.filters.length < 5
    },

    availableFieldsWithDisabled () {
      return (currentBlockIndex, currentFilterIndex) => {
        const selectedFields = new Set()

        // Collect all selected fields
        this.searchCriteria.filters.forEach((block, blockIndex) => {
          if (block.group === 'AND') {
            block.filters.forEach((filter, filterIndex) => {
              if (filter.field &&
                  (blockIndex !== currentBlockIndex || filterIndex !== currentFilterIndex)) {
                selectedFields.add(filter.field)
              }
            })
          } else {
            if (block.field && blockIndex !== currentBlockIndex) {
              selectedFields.add(block.field)
            }
          }
        })

        // Return all fields with disabled property for already selected ones
        return this.availableFields.map(field => ({
          ...field,
          disable: selectedFields.has(field.value)
        }))
      }
    }
  },

  methods: {
    // Helper methods
    getFieldLabel (fieldValue, cache) {
      if (!cache[fieldValue]) {
        cache[fieldValue] = this.availableFields.find(f => f.value === fieldValue)?.label || fieldValue
      }
      return cache[fieldValue]
    },

    getOperatorLabel (operatorValue, cache) {
      if (!cache[operatorValue]) {
        cache[operatorValue] = this.availableOperators.find(o => o.value === operatorValue)?.label || operatorValue
      }
      return cache[operatorValue]
    },

    isFilterValid (filter) {
      if (!filter.field || !filter.operator) return false
      if (['exists', 'not_exists'].includes(filter.operator)) return true
      return filter.value !== undefined && filter.value !== null && filter.value !== ''
    },

    isLastFilterValid (block) {
      if (!block.filters || block.filters.length === 0) return false
      const lastFilter = block.filters[block.filters.length - 1]
      return this.isFilterValid(lastFilter)
    },

    // Main action methods
    applyCriteria () {
      this.showEditDialog = false
      this.emitValue()
    },

    emitValue () {
      console.log('HighLevel Search Criteria Payload:', JSON.stringify(this.searchCriteria, null, 2))
      this.$emit('input', this.searchCriteria)
    },

    addOrCriteria () {
      const newFilter = { field: '', operator: '', value: '' }
      this.searchCriteria.filters.push(newFilter)
    },

    addAndCriteria (blockIndex) {
      const currentBlock = this.searchCriteria.filters[blockIndex]

      if (currentBlock.group === 'AND') {
        const newFilter = { field: '', operator: '', value: '' }
        currentBlock.filters.push(newFilter)
      } else {
        const singleFilter = { ...currentBlock }
        const newFilter = { field: '', operator: '', value: '' }

        this.$set(this.searchCriteria.filters, blockIndex, {
          group: 'AND',
          filters: [singleFilter, newFilter]
        })
      }
    },

    removeCriteria (blockIndex) {
      if (this.searchCriteria.filters.length > 1) {
        this.searchCriteria.filters.splice(blockIndex, 1)
      }
    },

    removeFilterFromGroup (blockIndex, filterIndex) {
      const block = this.searchCriteria.filters[blockIndex]
      if (block.group === 'AND' && block.filters.length > 1) {
        block.filters.splice(filterIndex, 1)

        if (block.filters.length === 1) {
          this.searchCriteria.filters[blockIndex] = block.filters[0]
        }
      }
    },

    async fetchSearchOptions () {
      this.isLoading = true
      try {
        const response = await this.$axios.get('/api/v2/contacts-list/highlevel-search-options')
        const data = response.data.data

        if (data.fields) {
          this.availableFields = Object.entries(data.fields).map(([value, fieldData]) => ({
            label: fieldData.label,
            value: value,
            supportedOperators: fieldData.supported_operators
          }))
        }

        if (data.operators) {
          this.availableOperators = Object.entries(data.operators).map(([value, label]) => ({
            label: label,
            value: value
          }))
        }
      } catch (error) {
        console.error('Failed to fetch HighLevel search options:', error)
        this.$generalNotification('Failed to load HighLevel search options. Please try again.', 'error')
      } finally {
        this.isLoading = false
      }
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
  flex-direction: column;
  width: 100%;
  gap: 12px;
}

.criteria-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.criteria-text {
  font-size: 14px;
  color: #495057;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.criteria-block-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.or-separator-summary {
  font-weight: 600;
  color: #6c757d;
  font-size: 12px;
  margin: 2px 0;
  padding: 2px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.and-group-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #256eff;
}

.single-criterion {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #256eff;
}

.criterion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.criterion-text {
  font-size: 13px;
  color: #495057;
  font-weight: 500;
}

.and-separator {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
}

.no-criteria {
  font-style: italic;
  color: #6c757d;
}

.criteria-actions {
  display: flex;
  align-items: center;
}

.field-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
  font-size: 14px;
}

.criteria-editor {
  padding: 12px 0;
}

.search-criteria-box {
  margin-bottom: 12px;
}

.criteria-form-row {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  align-items: flex-end;
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

.delete-button-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.delete-button {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background-color: white;
  color: #dc3545;
  transition: all 0.2s ease;
  transform: translateY(-8px);
}

.delete-button:hover {
  background-color: #dc3545;
  color: white;
}

.single-filter-and-button,
.group-and-button {
  text-align: center;
  margin-top: 12px;
}

.add-or-section {
  text-align: center;
  margin-top: 16px;
}

.criteria-block {
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  background-color: #fafbfc;
}

.and-group,
.single-filter {
  padding: 12px;
  background-color: #fafbfc;
}

.single-filter {
  border-radius: 6px;
}

.criteria-row {
  margin-bottom: 6px;
}

.criteria-row:last-child {
  margin-bottom: 0;
}

.or-separator {
  text-align: center;
  margin: 4px 0 8px 0;
  position: relative;
}

.or-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #dee2e6;
  z-index: 1;
}

.or-text {
  background-color: white;
  padding: 0 16px;
  color: #6c757d;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 2;
}
</style>
