<template>
  <q-dialog :value="isOpen"
            @hide="closeDialog">
    <q-card class="column-headers-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Table Settings</div>
        <q-space />
        <q-btn flat
               round
               dense
               icon="close"
               v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="columns-container row q-col-gutter-md">
          <!-- Available Columns -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-sm">Available Columns</div>
            <div class="columns-list available">
              <template v-if="hasAvailableColumns">
                <div class="available-column-item"
                     :key="field.name"
                     v-for="field in unselectedFields"
                     @click="!isFixedColumn(field.name) && addColumn(field.name)">
                  <div class="column-name">{{ field.label }}</div>
                  <q-icon name="add"
                          size="sm"
                          class="cursor-pointer"
                          v-if="!isFixedColumn(field.name)"
                  />
                </div>
              </template>
              <div v-else
                   class="no-columns-available">
                <q-icon name="check_circle"
                        size="sm"
                        color="positive"
                        class="q-mr-sm" />
                All columns are selected
              </div>
            </div>
          </div>

          <!-- Selected Columns -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-sm">Selected Columns ({{ selectedColumns.length }})</div>
            <div class="columns-list">
              <div class="selected-column-item"
                   draggable="true"
                   :class="{
                     'fixed-column': isFixedColumn(field.name),
                     'dragging': isDragging && draggedItem?.name === field.name,
                     'drag-over-top': dragOverItem?.name === field.name && dragPosition === 'top',
                     'drag-over-bottom': dragOverItem?.name === field.name && dragPosition === 'bottom'
                   }"
                   :key="field.name"
                   v-for="field in selectedFields"
                   @dragstart="!isFixedColumn(field.name) && onDragStart($event, field)"
                   @dragend="onDragEnd"
                   @dragover="!isFixedColumn(field.name) && onDragOver($event, field)"
                   @dragleave="onDragLeave"
                   @drop="!isFixedColumn(field.name) && onDrop($event, field)">
                <div class="drag-icon">
                  <q-icon size="sm"
                          :name="isFixedColumn(field.name) ? 'lock' : 'drag_indicator'"
                          :class="{
                            'cursor-move': !isFixedColumn(field.name),
                            'cursor-not-allowed': isFixedColumn(field.name)
                          }"
                  />
                </div>
                <div class="column-name">{{ field.label }}</div>
                <div class="remove-icon"
                     v-if="!isFixedColumn(field.name)">
                  <q-icon name="close"
                          size="sm"
                          class="cursor-pointer"
                          @click="removeColumn(field.name)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right"
                      class="q-mt-md">
        <q-btn label="Cancel"
               color="primary"
               flat
               v-close-popup />
        <q-btn label="Apply"
               color="primary"
               flat
               @click="applyChanges" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { communicationsMixin } from 'src/plugins/mixins'

export default {
  name: 'communication-table-settings',

  mixins: [
    communicationsMixin
  ],

  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    availableFields: {
      type: Array,
      required: true
    },
    currentColumns: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      selectedColumns: [],
      columnsOrder: [],
      draggedItem: null,
      isDragging: false,
      dragOverItem: null,
      dragPosition: null
    }
  },

  computed: {
    selectedFields () {
      const regularColumns = this.selectedColumns
        .filter(name => name !== 'operations')
        .map(name => this.availableFields.find(field => field.label && field.name === name))
        .filter(Boolean)

      regularColumns.sort((a, b) => {
        return this.columnsOrder.indexOf(a.name) - this.columnsOrder.indexOf(b.name)
      })

      const operationsColumn = this.selectedColumns.includes('operations')
        ? this.availableFields.find(field => field.name === 'operations')
        : null

      return operationsColumn
        ? [...regularColumns, operationsColumn]
        : regularColumns
    },

    unselectedFields () {
      return this.availableFields.filter(field => !this.selectedColumns.includes(field.name))
    },

    hasAvailableColumns () {
      return this.unselectedFields.length > 0
    }
  },

  methods: {
    isFixedColumn (name) {
      return this.fixedColumns.includes(name)
    },

    applyChanges () {
      const operationsColumn = this.fixedColumns
        .filter(name => name === 'operations')
        .map(name => {
          const field = this.availableFields.find(f => f.name === name)
          if (field) {
            return {
              label: field.label,
              name: field.name,
              field: field.name,
              align: field.align,
              headerStyle: field.headerStyle,
              columnStyle: field.columnStyle
            }
          }
          return null
        })
        .filter(Boolean)[0]

      const fixedColumnsData = this.fixedColumns
        .filter(name => name !== 'operations')
        .map(name => {
          const field = this.availableFields.find(f => f.name === name)
          if (field) {
            return {
              label: field.label,
              name: field.name,
              field: field.name,
              align: field.align,
              headerStyle: field.headerStyle,
              columnStyle: field.columnStyle
            }
          }
          return null
        })
        .filter(Boolean)

      const customColumns = this.columnsOrder
        .filter(name => !this.fixedColumns.includes(name))
        .filter(name => this.selectedColumns.includes(name))
        .map(name => {
          const field = this.availableFields.find(f => f.name === name)
          if (field) {
            return {
              label: field.label,
              name: field.name,
              field: field.name,
              align: field.align,
              headerStyle: field.headerStyle,
              columnStyle: field.columnStyle,
              resizable: field.resizable,
              draggable: field.draggable
            }
          }
          return null
        })
        .filter(Boolean)

      const newColumns = [
        ...fixedColumnsData,
        ...customColumns
      ]

      if (operationsColumn) {
        newColumns.push(operationsColumn)
      }

      this.$emit('update:columns', newColumns)
      this.$emit('update:is-open', false)
    },

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
      if (this.isFixedColumn(field.name) || this.isFixedColumn(this.draggedItem?.name)) {
        return
      }

      event.preventDefault()

      const rect = event.target.closest('.selected-column-item').getBoundingClientRect()
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

      if (this.isFixedColumn(field.name) || this.isFixedColumn(this.draggedItem?.name)) {
        return
      }

      const fromIndex = this.columnsOrder.indexOf(this.draggedItem.name)
      let toIndex = this.columnsOrder.indexOf(field.name)

      if (this.dragPosition === 'bottom') {
        toIndex += 1
      }

      const columns = [...this.columnsOrder]
      columns.splice(fromIndex, 1)
      columns.splice(toIndex, 0, this.draggedItem.name)

      this.columnsOrder = columns
      this.onDragEnd()
    },

    removeColumn (name) {
      const indexSelected = this.selectedColumns.indexOf(name)
      if (indexSelected > -1) {
        this.selectedColumns.splice(indexSelected, 1)
      }

      const indexOrder = this.columnsOrder.indexOf(name)
      if (indexOrder > -1) {
        this.columnsOrder.splice(indexOrder, 1)
      }
    },

    addColumn (name) {
      if (!this.selectedColumns.includes(name)) {
        this.selectedColumns.push(name)
        if (!this.columnsOrder.includes(name)) {
          this.columnsOrder.push(name)
        }
      }
    },

    closeDialog () {
      this.$emit('update:is-open', false)
    }
  },

  watch: {
    isOpen: {
      immediate: true,
      handler (val) {
        if (val) {
          this.selectedColumns = this.currentColumns.map(col => col.name)

          const fixedColumns = this.fixedColumns.filter(name =>
            this.selectedColumns.includes(name)
          )

          const customColumns = this.selectedColumns.filter(name =>
            !this.fixedColumns.includes(name)
          )

          const orderedColumns = [
            ...fixedColumns.filter(name => name !== 'operations'),
            ...customColumns
          ]

          if (this.selectedColumns.includes('operations')) {
            orderedColumns.push('operations')
          }

          this.columnsOrder = orderedColumns
        }
      }
    },

    selectedColumns: {
      handler (newVal, oldVal) {
        const newlySelected = newVal.filter(item => !oldVal.includes(item))

        newlySelected.forEach(item => {
          if (!this.columnsOrder.includes(item)) {
            this.columnsOrder.push(item)
          }
        })

        this.columnsOrder = this.columnsOrder.filter(item => newVal.includes(item))
      },
      deep: true
    }
  }
}
</script>
