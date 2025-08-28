<template>
  <div class="mt-4 ml-n1">
    <div class="fields-container row q-col-gutter-md">
      <!-- Available Fields -->
      <div class="col-12 col-sm-6">
        <div class="text-subtitle2 q-mb-sm">
          Available Fields ({{ unselectedFields.length }})
        </div>
        <div class="fields-list available">
          <template v-if="hasAvailableFields">
            <div class="available-field-item"
                 :key="field.key"
                 v-for="field in unselectedFields"
                 @click="addField(field.key)">
              <div class="field-name">{{ field.label }}</div>
              <q-icon name="add"
                      size="sm"
                      class="cursor-pointer" />
            </div>
          </template>
          <div v-else
               class="no-fields-available">
            <q-icon name="check_circle"
                    size="sm"
                    color="positive"
                    class="q-mr-sm" />
            All fields are selected
          </div>
        </div>
        <b-button variant="light"
                  class="mt-2"
                  size="sm"
                  :disabled="unselectedFields.length === 0"
                  @click="selectAllFields"
        >
          <i class="fa fa-check"></i>
          Select All
        </b-button>
      </div>

      <!-- Selected Fields -->
      <div class="col-12 col-sm-6">
        <div class="text-subtitle2 q-mb-sm">
          Selected Fields ({{ selectedFields.length }})
        </div>
        <div class="fields-list">
          <div class="selected-field-item"
               draggable="true"
               :class="{
                 'dragging': isDragging && draggedItem?.key === field.key,
                 'drag-over-top': dragOverItem?.key === field.key && dragPosition === 'top',
                 'drag-over-bottom': dragOverItem?.key === field.key && dragPosition === 'bottom'
               }"
               :key="field.key"
               v-for="field in selectedFieldsData"
               @dragstart="onDragStart($event, field)"
               @dragend="onDragEnd"
               @dragover="onDragOver($event, field)"
               @dragleave="onDragLeave"
               @drop="onDrop($event, field)">
            <div class="drag-icon">
              <q-icon size="sm"
                      name="drag_indicator"
                      class="cursor-move" />
            </div>
            <div class="field-name">{{ field.label }}</div>
            <div class="remove-icon">
              <q-icon name="close"
                      size="sm"
                      class="cursor-pointer"
                      @click="removeField(field.key)" />
            </div>
          </div>
        </div>
        <b-button variant="light"
                  size="sm"
                  class="mt-2"
                  :disabled="selectedFields.length === 0"
                  @click="deselectAllFields"
        >
          <i class="fa fa-times"></i>
          Deselect All
        </b-button>
      </div>

      <div class="col-12">
        <b-button variant="light"
                  class="mt-2"
                  size="sm"
                  @click="resetToDefault"
        >
          <i class="fa fa-undo"></i>
          Reset to Default
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ContactFieldsHelper, DEFAULT_FIELD_ORDER } from 'src/constants/contact-fields-definitions'
import { mapState } from 'vuex'

export default {
  name: 'contact-fields-selector',

  props: {
    selectedFields: {
      type: Array,
      default: () => [...DEFAULT_FIELD_ORDER]
    }
  },

  data () {
    return {
      draggedItem: null,
      isDragging: false,
      dragOverItem: null,
      dragPosition: null
    }
  },

  computed: {
    ...mapState(['attributeDictionaries']),

    /**
     * Default field order including custom attributes dynamically
     */
    defaultFieldOrderWithCustomAttributes () {
      const customAttributeFields = this.attributeDictionaries.map(attr => `custom_attribute_${attr.id}`)

      // Insert custom attributes after custom_field_2 (this was the default order in the ui)
      const baseOrder = [...DEFAULT_FIELD_ORDER]
      const custom2Index = baseOrder.indexOf('custom_field_2')

      if (custom2Index !== -1) {
        // Insert custom attributes after custom_field_2
        baseOrder.splice(custom2Index + 1, 0, ...customAttributeFields)
      } else {
        // Fallback: add at the end before display-only fields
        const displayOnlyStart = baseOrder.indexOf('tcpa_approved')
        if (displayOnlyStart !== -1) {
          baseOrder.splice(displayOnlyStart, 0, ...customAttributeFields)
        } else {
          baseOrder.push(...customAttributeFields)
        }
      }

      return baseOrder
    },

    /**
     * All available field keys including custom attributes
     */
    allAvailableFieldKeys () {
      const staticFields = ContactFieldsHelper.getAllFieldKeys()
      const customAttributeFields = this.attributeDictionaries.map(attr => `custom_attribute_${attr.id}`)
      return [...staticFields, ...customAttributeFields]
    },

    /**
     * All available fields with their metadata
     */
    availableFields () {
      const fields = []

      // Add static fields
      ContactFieldsHelper.getAllFieldKeys().forEach(key => {
        const definition = ContactFieldsHelper.getFieldDefinition(key)
        fields.push({
          key: definition.key,
          label: definition.label,
          type: definition.type
        })
      })

      // Add custom attribute fields
      this.attributeDictionaries.forEach(attribute => {
        fields.push({
          key: `custom_attribute_${attribute.id}`,
          label: attribute.name,
          type: 'custom_attribute'
        })
      })

      return fields
    },

    /**
     * Fields that are not currently selected (available to add)
     */
    unselectedFields () {
      return this.availableFields.filter(field => !this.selectedFields.includes(field.key))
    },

    /**
     * Check if there are available fields to select
     */
    hasAvailableFields () {
      return this.unselectedFields.length > 0
    },

    /**
     * Selected fields with their metadata, ordered according to selectedFields order
     */
    selectedFieldsData () {
      return this.selectedFields
        .map(key => this.getFieldByKey(key))
        .filter(Boolean)
    },

    /**
     * Currently selected field order (same as selectedFields)
     */
    selectedFieldOrder () {
      return this.selectedFields
    }
  },

  methods: {
    /**
     * Get field by key (returns field object with metadata)
     */
    getFieldByKey (fieldKey) {
      return this.availableFields.find(field => field.key === fieldKey)
    },

    /**
     * Add field to selection
     */
    addField (fieldKey) {
      if (!this.selectedFields.includes(fieldKey)) {
        const selectedFields = [...this.selectedFields, fieldKey]
        this.$emit('change', selectedFields)
      }
    },

    /**
     * Remove field from selection
     */
    removeField (fieldKey) {
      const selectedIndex = this.selectedFields.indexOf(fieldKey)
      if (selectedIndex > -1) {
        const selectedFields = [...this.selectedFields]
        selectedFields.splice(selectedIndex, 1)
        this.$emit('change', selectedFields)
      }
    },

    /**
     * Drag and Drop Methods
     */
    onDragStart (event, field) {
      this.isDragging = true
      this.draggedItem = field
      event.dataTransfer.effectAllowed = 'move'
      event.target.classList.add('dragging')
    },

    onDragEnd () {
      this.isDragging = false
      this.draggedItem = null
      this.dragOverItem = null
      this.dragPosition = null
    },

    onDragOver (event, field) {
      event.preventDefault()

      const rect = event.target.closest('.selected-field-item').getBoundingClientRect()
      const mouseY = event.clientY
      const threshold = rect.top + rect.height / 2

      this.dragOverItem = field
      this.dragPosition = mouseY < threshold ? 'top' : 'bottom'
    },

    onDragLeave () {
      this.dragOverItem = null
      this.dragPosition = null
    },

    onDrop (event, field) {
      event.preventDefault()

      const fromIndex = this.selectedFields.indexOf(this.draggedItem.key)
      let toIndex = this.selectedFields.indexOf(field.key)

      if (this.dragPosition === 'bottom') {
        toIndex += 1
      }

      const selectedFields = [...this.selectedFields]
      selectedFields.splice(fromIndex, 1)
      selectedFields.splice(toIndex, 0, this.draggedItem.key)

      this.$emit('change', selectedFields)
      this.onDragEnd()
    },

    resetToDefault () {
      // Reset to default field order with custom attributes
      this.$emit('change', [...this.defaultFieldOrderWithCustomAttributes])
    },

    selectAllFields () {
      // Keep current selected fields in their order, then add unselected fields
      const unselectedFieldKeys = this.unselectedFields.map(field => field.key)
      this.$emit('change', [...this.selectedFields, ...unselectedFieldKeys])
    },

    deselectAllFields () {
      // Remove all fields
      this.$emit('change', [])
    },

    initializeDefaults () {
      const defaultOrder = this.defaultFieldOrderWithCustomAttributes

      // Only emit if current state is still using static defaults
      const isUsingStaticDefaults = JSON.stringify(this.selectedFields) === JSON.stringify(DEFAULT_FIELD_ORDER)

      if (isUsingStaticDefaults && this.attributeDictionaries.length > 0) {
        this.$emit('change', [...defaultOrder])
      }
    }
  },

  watch: {
    // Watch for when custom attributes are loaded
    attributeDictionaries: {
      handler (newAttributes, oldAttributes) {
        // Only initialize if we went from no attributes to having some
        if (oldAttributes.length === 0 && newAttributes.length > 0) {
          this.$nextTick(() => {
            this.initializeDefaults()
          })
        }
      },
      immediate: false
    }
  },

  mounted () {
    // Initialize with custom attributes if using default state
    this.$nextTick(() => {
      this.initializeDefaults()
    })
  }
}
</script>

<style scoped>
.fields-container {
  min-height: 400px;
}

.fields-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  min-height: 350px;
  padding: 8px;
  overflow-y: auto;
  height: 600px;
}

.fields-list.available {
  background: #f5f5f5;
}

/* Available Field Items */
.available-field-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.available-field-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.available-field-item:last-child {
  margin-bottom: 0;
}

/* Selected Field Items */
.selected-field-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
}

.selected-field-item:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.selected-field-item:last-child {
  margin-bottom: 0;
}

/* Field Content */
.field-name {
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

.drag-icon {
  display: flex;
  align-items: center;
  color: #666;
}

.remove-icon {
  display: flex;
  align-items: center;
  color: #999;
  margin-left: 8px;
}

.remove-icon:hover {
  color: #f44336;
}

/* Drag States */
.selected-field-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.selected-field-item.drag-over-top {
  border-top: 3px solid #2196f3;
  margin-top: 2px;
}

.selected-field-item.drag-over-bottom {
  border-bottom: 3px solid #2196f3;
  margin-bottom: 2px;
}

/* No Fields Available */
.no-fields-available {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

/* Responsive */
@media (max-width: 600px) {
  .fields-container {
    flex-direction: column;
  }

  .fields-list {
    min-height: 200px;
    margin-bottom: 16px;
  }
}

/* Cursor states */
.cursor-move {
  cursor: move !important;
}

.cursor-pointer {
  cursor: pointer !important;
}

/* Focus states for accessibility */
.available-field-item:focus,
.selected-field-item:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

/* Animation for adding/removing items */
.available-field-item,
.selected-field-item {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
