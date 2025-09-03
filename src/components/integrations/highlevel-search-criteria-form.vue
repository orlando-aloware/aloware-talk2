<template>
  <div class="highlevel-search-criteria-form">

    <!-- Start Loading State -->
    <div v-if="isLoading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="mt-2">Loading search options...</div>
    </div>
    <!-- End Loading State -->

    <!-- Start Summary View -->
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
                    @click="openEditDialog">
              Edit Criteria
            </button>
          </div>
        </div>
        <div v-else class="no-criteria">
          <div class="d-flex justify-content-between align-items-center">
            <span>No criteria set</span>
            <button class="btn btn-outline-primary btn-sm"
                    @click="openEditDialog">
              Add Criteria
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- End Summary View -->

    <!-- Start Edit Dialog -->
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
            <template v-for="(block, blockIndex) in (tempSearchCriteria || searchCriteria).filters">
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

                    <div class="criteria-form-row" :class="{ 'subsequent-row': filterIndex > 0 }">
                      <div class="criteria-form-field">
                        <label v-if="filterIndex === 0" class="field-label">Field</label>
                        <q-select
                          v-model="filter.field"
                          :options="filteredFieldOptions.length > 0 ? filteredFieldOptions : availableFieldsWithDisabled(blockIndex, filterIndex)"
                          @input="onFieldChange(filter)"
                          outlined
                          dense
                          emit-value
                          map-options
                          use-input
                          input-debounce="0"
                          :placeholder="filter.field ? '' : 'Select a field'"
                          class="criteria-form-input"
                          @filter="filterFieldOptions"
                        >
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey">
                                No results
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>

                    <div class="criteria-form-field">
                      <label v-if="filterIndex === 0" class="field-label">Operator</label>
                      <q-select
                        v-model="filter.operator"
                        :options="availableOperatorsForField(filter.field)"
                        outlined
                        dense
                        emit-value
                        map-options
                        placeholder="Select an operator"
                        class="criteria-form-input"
                      />
                    </div>

                    <div v-if="!['exists', 'not_exists'].includes(filter.operator)" class="criteria-form-field">
                      <label v-if="filterIndex === 0" class="field-label">Value</label>
                      <!-- Start Multi-select -->
                      <div v-if="filter.field === 'tags'" class="tags-input-container">
                        <q-input
                          v-model="filter.inputValue"
                          outlined
                          dense
                          placeholder="Press 'Enter' to add"
                          class="criteria-form-input"
                          @keyup.enter="addTag(filter)"
                        />
                        <div v-if="getTagsArray(filter.value).length > 0" class="tags-display">
                          <div v-for="(tag, index) in getTagsArray(filter.value)"
                               :key="index"
                               class="border border-half-rounded d-inline-flex align-items-stretch mr-1 mb-1 tag-items">
                            <div class="tag-text">{{ tag }}</div>
                            <div role="button"
                                 class="custom__remove d-flex align-items-center"
                                 @click="removeTag(filter, index)">
                              <i class="fa fa-times ml-1 remove-tag-icon"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Multi-select -->
                      <!-- Start Range Date Input Mask -->
                      <div v-else-if="filter.operator === 'range'" class="range-date-input-container">
                        <q-input
                          v-model="filter.rangeDisplayValue"
                          outlined
                          dense
                          placeholder="MM/DD/YYYY - MM/DD/YYYY"
                          class="criteria-form-input"
                          mask="##/##/#### - ##/##/####"
                          @input="onRangeInputChange($event, filter)"
                        />
                      </div>
                      <!-- End Range Date Input Mask -->
                      <!-- Start Boolean Select -->
                      <div v-else-if="isBooleanField(filter.field)" class="boolean-select-container">
                        <q-select
                          v-model="filter.value"
                          :options="[
                            { label: 'Yes', value: true },
                            { label: 'No', value: false }
                          ]"
                          outlined
                          dense
                          emit-value
                          map-options
                          placeholder="Select value"
                          class="criteria-form-input"
                        />
                      </div>
                      <!-- End Boolean Select -->
                      <!-- Regular input for other fields -->
                      <q-input
                        v-else
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
                        :options="filteredFieldOptions.length > 0 ? filteredFieldOptions : availableFieldsWithDisabled(blockIndex, -1)"
                        @input="onSingleFieldChange(block)"
                        outlined
                        dense
                        emit-value
                        map-options
                        use-input
                        input-debounce="0"
                        :placeholder="block.field ? '' : 'Select a field'"
                        class="criteria-form-input"
                        @filter="filterFieldOptions"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No results
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <div class="criteria-form-field">
                      <label class="field-label">Operator</label>
                      <q-select
                        v-model="block.operator"
                        :options="availableOperatorsForField(block.field)"
                        outlined
                        dense
                        emit-value
                        map-options
                        placeholder="Select an operator"
                        class="criteria-form-input"
                      />
                    </div>

                    <div v-if="!['exists', 'not_exists'].includes(block.operator)" class="criteria-form-field">
                      <label class="field-label">Value</label>
                      <!-- Start Multi-select -->
                      <div v-if="block.field === 'tags'" class="tags-input-container">
                        <q-input
                          v-model="block.inputValue"
                          outlined
                          dense
                          placeholder="Press 'Enter' to add"
                          class="criteria-form-input"
                          @keyup.enter="addSingleTag(block)"
                        />
                        <div v-if="getTagsArray(block.value).length > 0" class="tags-display">
                          <div v-for="(tag, index) in getTagsArray(block.value)"
                               :key="index"
                               class="border border-half-rounded d-inline-flex align-items-stretch mr-1 mb-1 tag-items">
                            <div class="tag-text">{{ tag }}</div>
                            <div role="button"
                                 class="custom__remove d-flex align-items-center"
                                 @click="removeSingleTag(block, index)">
                              <i class="fa fa-times ml-1 remove-tag-icon"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Multi-select -->
                      <!-- Start Range Date Input Mask -->
                      <div v-else-if="block.operator === 'range'" class="range-date-input-container">
                        <q-input
                          v-model="block.rangeDisplayValue"
                          outlined
                          dense
                          placeholder="MM/DD/YYYY - MM/DD/YYYY"
                          class="criteria-form-input"
                          mask="##/##/#### - ##/##/####"
                          @input="onRangeInputChange($event, block)"
                        />
                      </div>
                      <!-- End Range Date Input Mask -->
                      <!-- Start Boolean Select -->
                      <div v-else-if="isBooleanField(block.field)" class="boolean-select-container">
                        <q-select
                          v-model="block.value"
                          :options="[
                            { label: 'Yes', value: true },
                            { label: 'No', value: false }
                          ]"
                          outlined
                          dense
                          emit-value
                          map-options
                          placeholder="Select value"
                          class="criteria-form-input"
                        />
                      </div>
                      <!-- End Boolean Select -->
                      <!-- Regular input for other fields -->
                      <q-input
                        v-else
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
                  @click="closeEditDialog">
            Cancel
          </button>
          <button class="btn btn-block btn-primary mt-0"
                  @click="applyCriteria">
            Apply
          </button>
        </div>
      </template>
    </b-modal>
    <!-- End Edit Dialog -->
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
    this.filteredFieldOptions = this.availableFields
  },

  data () {
    return {
      showEditDialog: false,
      isLoading: false,
      availableFields: [],
      filteredFieldOptions: [],
      availableOperators: [
        { label: 'Is', value: 'eq' },
        { label: 'Is Not', value: 'not_eq' },
        { label: 'Contains', value: 'contains' },
        { label: 'Does Not Contain', value: 'not_contains' },
        { label: 'Is Empty', value: 'not_exists' },
        { label: 'Is Not Empty', value: 'exists' },
        { label: 'Range', value: 'range' }
      ],
      searchCriteria: {
        filters: [
          { field: '', operator: '', value: '' }
        ]
      },
      tempSearchCriteria: {
        filters: [
          { field: '', operator: '', value: '' }
        ]
      },
      lastEmittedValue: null
    }
  },

  computed: {
    hasCriteria () {
      // Use tempSearchCriteria when modal is open, otherwise use searchCriteria
      const criteriaToCheck = this.showEditDialog ? this.tempSearchCriteria : this.searchCriteria
      return criteriaToCheck.filters.some(block => {
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
            const fieldLabel = this.getFieldLabel(filter.field, fieldCache) || filter.field || ''
            const operatorLabel = this.getOperatorLabel(filter.operator, operatorCache) || filter.operator || ''
            const value = filter.value || ''

            // For exists/not_exists operators, don't show the value part
            if (filter.operator === 'exists' || filter.operator === 'not_exists') {
              return `${fieldLabel} ${operatorLabel.toLowerCase()}`
            }

            // For range operators, show formatted date range
            if (filter.operator === 'range' && value && typeof value === 'object' && value.from && value.to) {
              const fromDate = new Date(value.from).toLocaleDateString()
              const toDate = new Date(value.to).toLocaleDateString()
              return `${fieldLabel} ${operatorLabel.toLowerCase()} ${fromDate} to ${toDate}`
            }

            // For boolean fields, show Yes/No instead of true/false
            if (this.isBooleanField(filter.field)) {
              const booleanValue = value === true ? 'Yes' : 'No'
              return `${fieldLabel} ${operatorLabel.toLowerCase()} ${booleanValue}`
            }

            return `${fieldLabel} ${operatorLabel.toLowerCase()} "${value}"`
          })
          return {
            type: 'AND',
            criteria: filterSummaries,
            index: blockIndex
          }
        } else {
          const fieldLabel = this.getFieldLabel(block.field, fieldCache) || block.field || ''
          const operatorLabel = this.getOperatorLabel(block.operator, operatorCache) || block.operator || ''
          const value = block.value || ''

          // For exists/not_exists operators, don't show the value part
          if (block.operator === 'exists' || block.operator === 'not_exists') {
            return {
              type: 'single',
              criteria: [`${fieldLabel} ${operatorLabel.toLowerCase()}`],
              index: blockIndex
            }
          }

          // For range operators, show formatted date range
          if (block.operator === 'range' && value && typeof value === 'object' && value.from && value.to) {
            const fromDate = new Date(value.from).toLocaleDateString()
            const toDate = new Date(value.to).toLocaleDateString()
            return {
              type: 'single',
              criteria: [`${fieldLabel} ${operatorLabel.toLowerCase()} ${fromDate} to ${toDate}`],
              index: blockIndex
            }
          }

          // For boolean fields, show Yes/No instead of true/false
          if (this.isBooleanField(block.field)) {
            const booleanValue = value === true ? 'Yes' : 'No'
            return {
              type: 'single',
              criteria: [`${fieldLabel} ${operatorLabel.toLowerCase()} ${booleanValue}`],
              index: blockIndex
            }
          }

          return {
            type: 'single',
            criteria: [`${fieldLabel} ${operatorLabel.toLowerCase()} "${value}"`],
            index: blockIndex
          }
        }
      })
    },

    canAddOrBlock () {
      // Use tempSearchCriteria when modal is open, otherwise use searchCriteria
      const criteriaToCheck = this.showEditDialog ? this.tempSearchCriteria : this.searchCriteria
      return this.hasCriteria && criteriaToCheck.filters.length < 5
    },

    availableOperatorsForField () {
      return (fieldValue) => {
        if (!fieldValue) return this.availableOperators

        const field = this.availableFields.find(f => f.value === fieldValue)
        if (!field || !field.supportedOperators) return this.availableOperators

        return this.availableOperators.filter(operator =>
          field.supportedOperators.includes(operator.value)
        )
      }
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
    getHighLevelOperator (uiOperator) {
      const operatorMapping = {
        'Is': 'eq',
        'Is Not': 'not_eq',
        'Contains': 'contains',
        'Does Not Contain': 'not_contains',
        'Is Empty': 'not_exists',
        'Is Not Empty': 'exists',
        'Range': 'range'
      }
      return operatorMapping[uiOperator] || uiOperator
    },

    processValue (value, operator, field) {
      // Handle undefined/null values
      if (value === undefined || value === null) {
        return value
      }

      // Handle tags field - return as string if single tag, array if multiple
      if (field === 'tags') {
        if (Array.isArray(value)) {
          const processedTags = value.map(v => v ? v.toLowerCase() : v).filter(v => v)
          return processedTags.length === 1 ? processedTags[0] : processedTags
        }
        return []
      }

      // Handle range operator - convert to gt/lt format
      if (operator === 'range' && value && typeof value === 'object' && value.from && value.to) {
        return {
          gt: value.from,
          lt: value.to
        }
      }

      // Handle "Any Of" logic - convert comma-separated to array for ANY field
      if (operator === 'Contains' && typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(v => v.trim())
      }

      // Handle case-sensitive fields
      const caseSensitiveFields = ['firstNameLowerCase', 'lastNameLowerCase']
      if (caseSensitiveFields.includes(field)) {
        if (Array.isArray(value)) {
          return value.map(v => v ? v.toLowerCase() : v)
        }
        return typeof value === 'string' ? value.toLowerCase() : value
      }

      return value
    },

    isValidFieldOperatorCombination (fieldValue, operatorValue) {
      if (!fieldValue || !operatorValue) return true

      const field = this.availableFields.find(f => f.value === fieldValue)
      if (!field) return false

      return field.supportedOperators.includes(operatorValue)
    },

    isBooleanField (fieldValue) {
      if (!fieldValue) return false

      // Check if the field name suggests it's a boolean field
      const booleanFieldNames = ['dnd', 'isValidWhatsapp', 'validEmail', 'isValid', 'isActive', 'isVerified']
      return booleanFieldNames.includes(fieldValue)
    },

    validateFieldValue (filter) {
      const errors = []

      if (!filter.field) {
        errors.push('Please select a field')
      }

      if (!filter.operator) {
        errors.push('Please select an operator')
      }

      if (['exists', 'not_exists'].includes(filter.operator)) {
        return errors // No value needed
      }

      if (filter.operator === 'range') {
        if (!this.isRangeValueValid(filter.value)) {
          errors.push('Please enter a valid date range (MM/DD/YYYY - MM/DD/YYYY)')
        }
      } else if (filter.field === 'tags') {
        if (!Array.isArray(filter.value) || filter.value.length === 0) {
          errors.push('Please add at least one tag')
        }
      } else if (this.isBooleanField(filter.field)) {
        if (filter.value === null || filter.value === undefined) {
          errors.push('Please select Yes or No')
        }
      } else {
        if (!filter.value || filter.value.toString().trim() === '') {
          errors.push('Please enter a value')
        }
      }

      return errors
    },

    validateAllFilters () {
      const allErrors = []

      this.tempSearchCriteria.filters.forEach(block => {
        if (block.group === 'AND') {
          block.filters.forEach(filter => {
            const errors = this.validateFieldValue(filter)
            if (errors.length > 0) {
              allErrors.push(errors.join(', '))
            }
          })
        } else {
          const errors = this.validateFieldValue(block)
          if (errors.length > 0) {
            allErrors.push(errors.join(', '))
          }
        }
      })

      return allErrors
    },

    showValidationErrors (errors) {
      if (errors.length > 0) {
        const errorCount = errors.length
        const errorText = errorCount === 1 ? 'error' : 'errors'

        this.$generalNotification(
          `Please fix ${errorCount} validation ${errorText}: ${errors.join('; ')}`,
          'error',
          8000
        )
      }
    },

    initializeFieldValue (filter) {
      // Handle tags field
      if (filter.field === 'tags') {
        this.$set(filter, 'value', [])
        if (filter.inputValue === undefined) {
          this.$set(filter, 'inputValue', '')
        }
        return
      }

      // Handle range operator
      if (filter.operator === 'range') {
        this.$set(filter, 'value', null)
        if (filter.rangeDisplayValue === undefined) {
          this.$set(filter, 'rangeDisplayValue', '')
        }
        return
      }

      // Handle boolean fields
      if (this.isBooleanField(filter.field)) {
        this.$set(filter, 'value', null)
        return
      }

      // Handle regular fields
      if (filter.field && filter.value === '') {
        this.$set(filter, 'value', '')
      }
    },

    onFieldChange (filter) {
      // Reset operator if current combination is invalid
      if (filter.operator && !this.isValidFieldOperatorCombination(filter.field, filter.operator)) {
        this.$set(filter, 'operator', '')
        this.$set(filter, 'value', '')
      }

      // Initialize value type based on field
      this.initializeFieldValue(filter)
    },

    onSingleFieldChange (block) {
      // Reset operator if current combination is invalid
      if (block.operator && !this.isValidFieldOperatorCombination(block.field, block.operator)) {
        this.$set(block, 'operator', '')
        this.$set(block, 'value', '')
      }

      // Initialize value type based on field
      this.initializeFieldValue(block)
    },

    // Get tags array for display
    getTagsArray (value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value
      }
      return []
    },

    // Add tag to filter
    addTag (filter) {
      if (!filter.inputValue || filter.inputValue.trim() === '') return

      const tags = this.getTagsArray(filter.value)
      const newTag = filter.inputValue.trim().toLowerCase()

      if (!tags.includes(newTag)) {
        tags.push(newTag)
        filter.value = tags
      }

      filter.inputValue = ''
    },

    // Add tag to single block
    addSingleTag (block) {
      if (!block.inputValue || block.inputValue.trim() === '') return

      const tags = this.getTagsArray(block.value)
      const newTag = block.inputValue.trim().toLowerCase()

      if (!tags.includes(newTag)) {
        tags.push(newTag)
        block.value = tags
      }

      block.inputValue = ''
    },

    // Remove tag from filter
    removeTag (filter, index) {
      const tags = this.getTagsArray(filter.value)
      tags.splice(index, 1)
      filter.value = tags
    },

    // Remove tag from single block
    removeSingleTag (block, index) {
      const tags = this.getTagsArray(block.value)
      tags.splice(index, 1)
      block.value = tags
    },

    // Filter field options for searchable dropdown
    filterFieldOptions (val, update) {
      if (val === '') {
        update(() => {
          this.filteredFieldOptions = this.availableFields
        })
        return
      }

      update(() => {
        this.filteredFieldOptions = this.availableFields.filter(field =>
          field.label.toLowerCase().includes(val.toLowerCase()) ||
          field.value.toLowerCase().includes(val.toLowerCase())
        )
      })
    },

    // Range date picker methods
    getRangeDisplayValue (value) {
      if (!value || !value.from || !value.to) return ''
      const fromDate = new Date(value.from)
      const toDate = new Date(value.to)
      return `${fromDate.getMonth() + 1}/${fromDate.getDate()}/${fromDate.getFullYear()} - ${toDate.getMonth() + 1}/${toDate.getDate()}/${toDate.getFullYear()}`
    },

    onRangeInputChange (inputValue, filter) {
      // Update the display value
      this.$set(filter, 'rangeDisplayValue', inputValue)

      if (!inputValue) {
        this.$set(filter, 'value', null)
        return
      }

      // Parse the masked input: "MM/DD/YYYY - MM/DD/YYYY"
      const parts = inputValue.split(' - ')
      if (parts.length !== 2) {
        this.$set(filter, 'value', null)
        return
      }

      const fromPart = parts[0].trim()
      const toPart = parts[1].trim()

      // Validate date format
      const fromMatch = fromPart.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      const toMatch = toPart.match(/(\d{2})\/(\d{2})\/(\d{4})/)

      if (!fromMatch || !toMatch) {
        this.$set(filter, 'value', null)
        return
      }

      try {
        // Convert MM/DD/YYYY to Date objects
        const fromDate = new Date(fromMatch[3], fromMatch[1] - 1, fromMatch[2])
        const toDate = new Date(toMatch[3], toMatch[1] - 1, toMatch[2])

        // Validate dates
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          this.$set(filter, 'value', null)
          return
        }

        // Convert to ISO format for API - start of day for from, end of day for to
        fromDate.setHours(0, 0, 0, 0)
        toDate.setHours(23, 59, 59, 999)

        this.$set(filter, 'value', {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        })
      } catch (error) {
        this.$set(filter, 'value', null)
      }
    },

    buildHighLevelPayload () {
      // Always use searchCriteria since it's updated before emitValue is called
      const criteriaToProcess = this.searchCriteria

      // If there's only one block, don't wrap in OR
      if (criteriaToProcess.filters.length === 1) {
        const block = criteriaToProcess.filters[0]
        if (block.group === 'AND') {
          return {
            filters: [{
              group: 'AND',
              filters: block.filters.map(filter => {
                const highLevelFilter = {
                  field: filter.field,
                  operator: this.getHighLevelOperator(filter.operator)
                }
                if (!['exists', 'not_exists'].includes(highLevelFilter.operator)) {
                  highLevelFilter.value = this.processValue(filter.value, filter.operator, filter.field)
                }
                return highLevelFilter
              })
            }]
          }
        } else {
          // Single filter
          const highLevelFilter = {
            field: block.field,
            operator: this.getHighLevelOperator(block.operator)
          }
          if (!['exists', 'not_exists'].includes(highLevelFilter.operator)) {
            highLevelFilter.value = this.processValue(block.value, block.operator, block.field)
          }
          return {
            filters: [highLevelFilter]
          }
        }
      }

      // Multiple blocks - wrap everything in OR group
      const payload = {
        filters: [{
          group: 'OR',
          filters: []
        }]
      }

      criteriaToProcess.filters.forEach(block => {
        if (block.group === 'AND') {
          // Convert AND group to HighLevel format
          const highLevelFilters = block.filters.map(filter => {
            const highLevelFilter = {
              field: filter.field,
              operator: this.getHighLevelOperator(filter.operator)
            }

            // Only add value if operator needs it
            if (!['exists', 'not_exists'].includes(highLevelFilter.operator)) {
              highLevelFilter.value = this.processValue(filter.value, filter.operator, filter.field)
            }

            return highLevelFilter
          })

          // Add AND group to OR group
          payload.filters[0].filters.push({
            group: 'AND',
            filters: highLevelFilters
          })
        } else {
          // Single filter - add directly to OR group
          const highLevelFilter = {
            field: block.field,
            operator: this.getHighLevelOperator(block.operator)
          }

          // Only add value if operator needs it
          if (!['exists', 'not_exists'].includes(highLevelFilter.operator)) {
            highLevelFilter.value = this.processValue(block.value, block.operator, block.field)
          }

          payload.filters[0].filters.push(highLevelFilter)
        }
      })

      return payload
    },

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

    isRangeValueValid (value) {
      if (!value) return false
      if (typeof value !== 'object') return false
      return value.from && value.to
    },

    validateAllCombinations () {
      const errors = []

      this.tempSearchCriteria.filters.forEach((block, blockIndex) => {
        if (block.group === 'AND') {
          block.filters.forEach((filter, filterIndex) => {
            if (!this.isValidFieldOperatorCombination(filter.field, filter.operator)) {
              errors.push(`Block ${blockIndex + 1}, Filter ${filterIndex + 1}: ${filter.field} + ${filter.operator}`)
            }
          })
        } else {
          if (!this.isValidFieldOperatorCombination(block.field, block.operator)) {
            errors.push(`Block ${blockIndex + 1}: ${block.field} + ${block.operator}`)
          }
        }
      })

      return errors
    },

    isFilterValid (filter) {
      if (!filter.field || !filter.operator) return false

      // exists/not_exists operators don't need values
      if (['exists', 'not_exists'].includes(filter.operator)) return true

      // range operators need specific format
      if (filter.operator === 'range') {
        return this.isRangeValueValid(filter.value)
      }

      // For other operators, value is required
      return filter.value !== undefined && filter.value !== null && filter.value !== ''
    },

    isLastFilterValid (block) {
      if (!block.filters || block.filters.length === 0) return false
      const lastFilter = block.filters[block.filters.length - 1]
      return this.isFilterValid(lastFilter)
    },

    // Main action methods
    applyCriteria () {
      // Validate all filters first
      const validationErrors = this.validateAllFilters()
      if (validationErrors.length > 0) {
        this.showValidationErrors(validationErrors)
        return // Don't proceed if there are validation errors
      }

      const combinationErrors = this.validateAllCombinations()
      if (combinationErrors.length > 0) {
        // Show warning but don't prevent closing
        this.$generalNotification(
          `Warning: ${combinationErrors.length} invalid field-operator combination(s) detected. These will be ignored.`,
          'warning'
        )
      }

      this.searchCriteria = JSON.parse(JSON.stringify(this.tempSearchCriteria))
      this.showEditDialog = false
      this.emitValue()
    },

    emitValue () {
      const highLevelPayload = this.buildHighLevelPayload()
      this.lastEmittedValue = highLevelPayload
      console.log('HighLevel Search Criteria Payload:', JSON.stringify(highLevelPayload, null, 2))
      this.$emit('input', highLevelPayload)
    },

    openEditDialog () {
      // Deep copy but exclude inputValue properties
      this.tempSearchCriteria = JSON.parse(JSON.stringify(this.searchCriteria))

      // Clean up inputValue properties to avoid sending them to API
      const cleanFilters = (filters) => {
        filters.forEach(filter => {
          if (filter.inputValue !== undefined) {
            delete filter.inputValue
          }
          if (filter.filters) {
            cleanFilters(filter.filters)
          }
        })
      }

      cleanFilters(this.tempSearchCriteria.filters)
      this.showEditDialog = true
    },

    closeEditDialog () {
      this.showEditDialog = false
    },

    addOrCriteria () {
      const newFilter = { field: '', operator: '', value: '' }
      this.tempSearchCriteria.filters.push(newFilter)
    },

    addAndCriteria (blockIndex) {
      const currentBlock = this.tempSearchCriteria.filters[blockIndex]

      if (currentBlock.group === 'AND') {
        const newFilter = { field: '', operator: '', value: '' }
        currentBlock.filters.push(newFilter)
      } else {
        const singleFilter = { ...currentBlock }
        const newFilter = { field: '', operator: '', value: '' }

        this.$set(this.tempSearchCriteria.filters, blockIndex, {
          group: 'AND',
          filters: [singleFilter, newFilter]
        })
      }
    },

    removeCriteria (blockIndex) {
      if (this.tempSearchCriteria.filters.length > 1) {
        this.tempSearchCriteria.filters.splice(blockIndex, 1)
      }
    },

    removeFilterFromGroup (blockIndex, filterIndex) {
      const block = this.tempSearchCriteria.filters[blockIndex]
      if (block.group === 'AND' && block.filters.length > 1) {
        block.filters.splice(filterIndex, 1)

        if (block.filters.length === 1) {
          this.tempSearchCriteria.filters[blockIndex] = block.filters[0]
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
    value: {
      handler (newValue) {
        // Only update if the value is different from what we just emitted
        // This prevents the watcher from resetting our criteria when the parent
        // sends back the HighLevel-formatted payload
        if (newValue && newValue.filters && newValue !== this.lastEmittedValue) {
          this.searchCriteria = JSON.parse(JSON.stringify(newValue))
        }
      },
      immediate: true
    },
    availableFields: {
      handler (newFields) {
        this.filteredFieldOptions = newFields
      },
      immediate: true
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
  align-items: flex-start;
}

.subsequent-row {
  padding-top: 18px;
}

.criteria-form-field {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.criteria-form-input {
  width: 100%;
  height: 40px;
  align-self: flex-start;
}

.delete-button-container {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  padding-top: 24px;
}

.subsequent-row .delete-button-container {
  padding-top: 0px;
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
  margin-bottom: 2px;
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

.tags-input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tags-input-container .q-input {
  flex-shrink: 0;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
  min-height: 0;
}

.boolean-select-container {
  width: 100%;
}
</style>
