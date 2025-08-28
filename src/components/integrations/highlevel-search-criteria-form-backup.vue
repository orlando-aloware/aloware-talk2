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

      <!-- Start Compact Summary View -->
      <div class="search-criteria-summary">
        <div v-if="hasCriteria" class="criteria-display">
          <div class="criteria-item">
            <div class="criteria-content">
              <span class="criteria-text">
                {{ getCriteriaSummary }}
              </span>
              <div class="criteria-actions">
                <button class="btn btn-link small text-muted"
                        @click="openEditDialog">
                  <i class="fa fa-edit"/>
                </button>
                <button class="btn btn-link small text-muted"
                        @click="removeCriteria">
                  <i class="fa fa-trash"/>
                </button>
              </div>
            </div>
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
      <!-- End Compact Summary View -->

      <!-- Start Detailed Edit Dialog -->
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
          <!-- Start Search Criteria Box -->
          <div class="search-criteria-box">
            <!-- Start Criteria List -->
            <div class="criteria-list">
              <!-- Start Criteria blocks -->
              <div v-for="(block, blockIndex) in searchCriteria.filters"
                   :key="`block-${blockIndex}-${JSON.stringify(block)}`"
                   class="criteria-block">

                <!-- Start AND Group -->
                <div v-if="block.group === 'AND'" class="and-group">
                  <div v-for="(filter, filterIndex) in block.filters"
                       :key="filterIndex"
                       class="criteria-row">

                    <div class="criteria-form-row">
                      <div class="criteria-form-field">
                        <label class="field-label">Field</label>
                        <q-select
                          v-model="filter.field"
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
                          v-model="filter.operator"
                          :options="getFilteredOperatorsForField(filter.field)"
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
                          v-model="filter.value"
                          outlined
                          dense
                          placeholder="Enter value"
                          class="criteria-form-input"
                        />
                      </div>

                      <!-- Start Delete button for group filters -->
                      <div class="criteria-actions">
                        <button class="btn btn-outline-danger btn-sm custom__remove"
                                @click="removeFilterFromGroup(blockIndex, filterIndex)"
                                :disabled="block.filters.length === 1">
                          <i class="fa fa-trash"/>
                        </button>
                      </div>
                      <!-- End Delete button for group filters -->
                    </div>
                  </div>

                  <!-- Start AND button at bottom of group -->
                  <div class="group-and-button">
                    <compact-btn
                      variant="primary"
                      :disabled="!(block.filters[block.filters.length - 1].field && block.filters[block.filters.length - 1].operator)"
                      @clicked="addAndCriteria(blockIndex)"
                    >
                      <i class="fa fa-plus mr-2"/>
                      AND
                    </compact-btn>
                  </div>
                  <!-- End AND button at bottom of group -->
                </div>
                <!-- End AND Group -->

                <!-- Start Single Filter (not in group) -->
                <div v-else class="single-filter">
                  <div class="criteria-form-row">
                    <div class="criteria-form-field">
                      <label class="field-label">Field</label>
                      <q-select
                        v-model="block.field"
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
                        v-model="block.operator"
                        :options="getFilteredOperatorsForField(block.field)"
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

                    <!-- Start Delete button for single filter -->
                    <div class="criteria-actions">
                      <button class="btn btn-outline-danger btn-sm custom__remove"
                              @click="removeCriteria(blockIndex)"
                              :disabled="searchCriteria.filters.length === 1">
                        <i class="fa fa-trash"/>
                      </button>
                    </div>
                    <!-- End Delete button for single filter -->
                  </div>

                  <!-- Start AND button below single filter -->
                  <div class="single-filter-and-button">
                    <compact-btn
                      variant="primary"
                      :disabled="!(block.field && block.operator)"
                      @clicked="addAndCriteria(blockIndex)"
                    >
                      <i class="fa fa-plus mr-2"/>
                      AND
                    </compact-btn>
                  </div>
                  <!-- End AND button below single filter -->
                </div>
                <!-- End Single Filter (not in group) -->
              </div>
              <!-- End Criteria blocks -->

              <!-- Start OR Separators between blocks -->
              <div v-for="(block, blockIndex) in searchCriteria.filters.slice(1)"
                   :key="`or-${blockIndex}`"
                   class="or-separator">
                <span class="or-text">OR</span>
              </div>
              <!-- End OR Separators between blocks -->
            </div>
            <!-- End Criteria List -->

            <!-- Start Add OR Button -->
            <div class="add-or-section mt-3 text-center">
              <compact-btn
                variant="primary"
                :disabled="!(searchCriteria.filters.length > 0 && searchCriteria.filters.some(block => block.group === 'AND' ? block.filters.some(filter => filter.field && filter.operator) : (block.field && block.operator)))"
                @clicked="addOrCriteria"
              >
                <i class="fa fa-plus mr-2"/>
                OR
              </compact-btn>
            </div>
            <!-- End Add OR Button -->
          </div>
          <!-- End Search Criteria Box -->

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
      searchCriteria: {
        filters: [
          { field: '', operator: '', value: '' }
        ]
      },
      availableFields: [],
      availableOperators: [],
      isLoading: false,
      showEditDialog: false,
      emitTimeout: null
    }
  },

  computed: {
    // TEMPORARILY DISABLED ALL COMPUTED PROPERTIES TO TEST INPUT FOCUS
    hasCriteria () {
      return true // TEMP: Always return true
    },

    isCriteriaValid () {
      return true // TEMP: Always return true
    },

    getCriteriaSummary () {
      return 'Test Summary' // TEMP: Return static value
    }
  },

  methods: {
    getFilterSummary (filter) {
      const fieldLabel = this.availableFields.find(f => f.value === filter.field)?.label || filter.field
      const operatorLabel = this.availableOperators.find(o => o.value === filter.operator)?.label || filter.operator

      if (filter.operator === 'range') {
        return `${fieldLabel} ${operatorLabel.toLowerCase()} ${filter.value.from} to ${filter.value.to}`
      }

      if (filter.field === 'tags' && Array.isArray(filter.value)) {
        return `${fieldLabel} ${operatorLabel.toLowerCase()} [${filter.value.join(', ')}]`
      }

      return `${fieldLabel} ${operatorLabel.toLowerCase()} "${filter.value}"`
    },

    getFilteredOperatorsForField (field) {
      if (!field) return this.availableOperators

      const fieldData = this.availableFields.find(f => f.value === field)
      if (!fieldData || !fieldData.supportedOperators) {
        return this.availableOperators
      }

      return this.availableOperators.filter(op => fieldData.supportedOperators.includes(op.value))
    },

    // Start Validation methods
    isBlockValid (block) {
      if (block.group === 'AND') {
        return block.filters.length >= 2 &&
               block.filters.every(filter => this.isFilterValid(filter))
      } else {
        return this.isFilterValid(block)
      }
    },

    isFilterValid (filter) {
      // API rule: Only field and operator are required
      // exists/not_exists operators don't need values
      if (!filter.field || !filter.operator) return false

      // For exists/not_exists, no value needed
      if (['exists', 'not_exists'].includes(filter.operator)) return true

      // For all other operators, value is required
      return filter.value !== undefined && filter.value !== null && filter.value !== ''
    },

    canAddAnd (blockIndex) {
      // Start Check if we can add AND logic to this block
      const currentBlock = this.searchCriteria.filters[blockIndex]
      if (!currentBlock) return false

      if (currentBlock.group === 'AND') {
        // For AND groups, check if the last filter in the group is valid
        const lastFilter = currentBlock.filters[currentBlock.filters.length - 1]
        return this.isFilterValid(lastFilter)
      } else {
        // Can convert to group if single filter is valid
        return this.isFilterValid(currentBlock)
      }
      // End Check if we can add AND logic to this block
    },

    canAddOr () {
      // Start Check if we can add OR logic
      // Need at least one valid criteria block
      return this.searchCriteria.filters.length > 0 &&
             this.searchCriteria.filters.some(block => this.isBlockValid(block))
      // End Check if we can add OR logic
    },
    // End Validation methods
    async fetchSearchOptions () {
      this.isLoading = true
      try {
        const response = await this.$axios.get('/api/v2/contacts-list/highlevel-search-options')
        const data = response.data.data

        if (data.fields) {
          // Start Transform fields to include label and supported operators
          this.availableFields = Object.entries(data.fields).map(([value, fieldData]) => ({
            label: fieldData.label,
            value: value,
            supportedOperators: fieldData.supported_operators
          }))
          // End Transform fields to include label and supported operators
        }

        if (data.operators) {
          // Start Transform operators to include label
          this.availableOperators = Object.entries(data.operators).map(([value, label]) => ({
            label: label,
            value: value
          }))
          // End Transform operators to include label
        }

        // Start Log HighLevel search options loaded
        console.log('HighLevel search options loaded:', { fields: this.availableFields, operators: this.availableOperators })
        // End Log HighLevel search options loaded
      } catch (error) {
        // Start Log error and show notification
        console.error('Failed to fetch HighLevel search options:', error)
        this.$generalNotification('Failed to load HighLevel search options. Please try again.', 'error')
        // End Log error and show notification
      } finally {
        this.isLoading = false
      }
    },

    openEditDialog () {
      this.showEditDialog = true
    },

    applyCriteria () {
      // Start Apply criteria with payload cleaning
      console.log('applyCriteria called')
      console.log('Original filters:', this.searchCriteria.filters)

      if (this.isCriteriaValid) {
        // Clean the payload before emitting
        const cleanPayload = this.cleanPayload(this.searchCriteria)
        console.log('Clean payload:', cleanPayload)

        this.emitValue()
        this.showEditDialog = false
      } else {
        console.log('Criteria not valid, cannot apply')
      }
      // End Apply criteria with payload cleaning
    },

    cleanPayload (payload) {
      // Start Clean payload according to API rules
      console.log('cleanPayload called with:', payload)

      if (payload.filters) {
        // Remove empty filters and convert single-filter groups back to single filters
        payload.filters = payload.filters.filter(block => {
          if (block.group === 'AND') {
            // Remove empty filters from groups
            block.filters = block.filters.filter(filter =>
              filter.field && filter.operator &&
              (filter.operator === 'exists' || filter.operator === 'not_exists' || filter.value)
            )
            // Keep group only if it has 2+ valid filters
            return block.filters.length >= 2
          } else {
            // Keep individual filter only if field and operator are filled
            return block.field && block.operator
          }
        })
      }

      console.log('Cleaned payload:', payload)
      return payload
      // End Clean payload according to API rules
    },

    // Start Action methods
    addAndCriteria (blockIndex) {
      // Start Add AND logic to convert single filter to group or add to existing group
      console.log('addAndCriteria called, blockIndex:', blockIndex)
      console.log('Current filters:', this.searchCriteria.filters)

      const currentBlock = this.searchCriteria.filters[blockIndex]
      console.log('Current block:', currentBlock)

      if (currentBlock.group === 'AND') {
        // Add to existing AND group
        console.log('Adding to existing AND group')
        currentBlock.filters.push({ field: '', operator: '', value: '' })
      } else {
        // Convert single filter to AND group
        console.log('Converting single filter to AND group')
        const singleFilter = { ...currentBlock }
        this.searchCriteria.filters[blockIndex] = {
          group: 'AND',
          filters: [singleFilter, { field: '', operator: '', value: '' }]
        }
      }

      console.log('After addAndCriteria, filters:', this.searchCriteria.filters)
      // End Add AND logic to convert single filter to group or add to existing group
    },

    addOrCriteria () {
      // Start Add OR logic to create new criteria block
      console.log('addOrCriteria called')
      console.log('Current filters before:', this.searchCriteria.filters)

      this.searchCriteria.filters.push({ field: '', operator: '', value: '' })

      console.log('Current filters after:', this.searchCriteria.filters)
      // End Add OR logic to create new criteria block
    },

    removeCriteria (blockIndex) {
      // Start Remove entire criteria block
      console.log('removeCriteria called, blockIndex:', blockIndex)
      console.log('Current filters before:', this.searchCriteria.filters)

      if (this.searchCriteria.filters.length > 1) {
        this.searchCriteria.filters.splice(blockIndex, 1)
        console.log('Filters after removal:', this.searchCriteria.filters)
      } else {
        console.log('Cannot remove last criteria block')
      }
      // End Remove entire criteria block
    },

    removeFilterFromGroup (blockIndex, filterIndex) {
      // Start Remove filter from AND group
      console.log('removeFilterFromGroup called, blockIndex:', blockIndex, 'filterIndex:', filterIndex)

      const block = this.searchCriteria.filters[blockIndex]
      if (block.group === 'AND' && block.filters.length > 1) {
        block.filters.splice(filterIndex, 1)

        // If group now has only 1 filter, convert back to single filter
        if (block.filters.length === 1) {
          console.log('Converting single-filter group back to single filter')
          this.searchCriteria.filters[blockIndex] = block.filters[0]
        }

        console.log('Filters after removal:', this.searchCriteria.filters)
      } else {
        console.log('Cannot remove filter from group or group is not AND type')
      }
      // End Remove filter from AND group
    },

    clearCriteria () {
      // Start Clear all criteria
      console.log('clearCriteria called')
      this.searchCriteria.filters = [{ field: '', operator: '', value: '' }]
      console.log('Criteria cleared, filters:', this.searchCriteria.filters)
      // End Clear all criteria
    },

    emitValue () {
      this.$emit('input', this.searchCriteria)
    }
  },

  beforeDestroy () {
    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout)
    }
            }
    },

    // TEMPORARILY DISABLED ALL WATCHERS TO TEST INPUT FOCUS
    // watch: {
    //   searchCriteria: {
    //   handler () {
    //     // Temporarily disabled to test input focus issue
    //     // clearTimeout(this.emitTimeout)
    //     // this.emitTimeout = setTimeout(() => {
    //     //   this.emitValue()
    //     // }, 300) // Wait 300ms after user stops typing
    //   },
    //   deep: true
    // }
    // }
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

.search-criteria-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
  margin-bottom: 16px;
}

/* Start Form layout classes */
.criteria-form-row {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  align-items: flex-end;
}
/* End Form layout classes */

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

.criteria-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
  height: 40px;
  flex-shrink: 0;
}

.criteria-list {
  margin-bottom: 20px;
}

.criteria-block {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.and-group {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  background-color: white;
}

.single-filter {
  padding: 16px;
  background-color: white;
  border-radius: 6px;
}

.criteria-row {
  margin-bottom: 16px;
}

.or-separator {
  text-align: center;
  margin: 16px 0;
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
  padding: 0 12px;
  color: #6c757d;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.group-and-button {
  text-align: center;
  margin-top: 16px;
}

.single-filter-and-button {
  text-align: center;
  margin-top: 16px;
}

.add-or-section {
  text-align: center;
}

.custom__remove {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* End Form layout classes */
</style>
