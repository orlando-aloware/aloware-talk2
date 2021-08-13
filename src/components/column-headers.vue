<template>
  <b-modal v-model="isOpen"
           size="lg"
           :title="title"
           modal-class="column-headers-modal"
           scrollable
           @show="onModalShow">
    <b-overlay class="h-100"
               :show="loading"
               rounded="sm"
               variant="white">
      <div class="w-100 column-headers-modal__inner d-flex position-relative px-2 h-100">
        <div class="d-flex flex-column flex-grow-1 pr-3">
          <div class="mb-2">
            <search class="w-100"
                    placeholder="Search available columns..."
                    @search="onSearch">
            </search>
          </div>
          <div class="column-headers-modal__checkboxes">
            <div class="d-flex align-items-center justify-content-center p-4 border my-3"
                 v-if="!allColumns.results">
              <div class="text-muted">No results found</div>
            </div>
            <div v-for="(items, index) in allColumns.items"
                 :key="index">
              <div class="category-name">
                {{ categories[index] }}
              </div>
              <div class="column-headers-modal__item d-flex align-items-center no-select"
                   v-for="column in items"
                   :key="column.name"
                   :class="{
                  'column-headers-modal__item--hidden': isHidden(column)
                }">
                <div class="pl-2 checkbox d-flex align-items-center cursor-pointer w-100"
                     @click="onClickedColumn(column, selected.has(column.name))">
                  <input class="cursor-pointer mt-1"
                         type="checkbox"
                         :checked="selected.has(column.name)"
                         :disabled="column.required"
                         :value="column.name"/>
                  <div class="flex-grow-1 pl-2 column-headers-modal__label">
                    {{ column.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-50">
          <div class="font-weight-bold body text-uppercase column-headers-modal__selected">
            Selected Columns ({{ currentColumns.length - 2 }})
          </div>
          <div class="d-flex flex-column draggable-columns">
            <draggable class="h-100 overflow-y-scroll"
                       v-model="currentColumns"
                       ghost-class="ghost"
                       handle=".handle"
                       :move="onCheckMove"
                       @start="isDragging = true"
                       @end="isDragging = false">
              <div class="column-headers-modal__item border px-2 py-1 mb-2 d-flex align-items-center"
                   :class="{
                  handle: column.draggable,
                  'column-headers-modal__item--hidden': isHidden(column)
                }"
                   v-for="column in currentColumns"
                   :key="column.name">
                <i class="fa fa-align-justify"
                   aria-hidden="true"
                   v-if="column.draggable && !column.required">
                </i>

                <i class="fa fa-chevron-right"
                   aria-hidden="true"
                   v-if="column.required">
                </i>

                <div class="flex-grow-1 pl-2 column-headers-modal__label">
                  {{ column.label }}
                </div>
                <button v-if="column.draggable && !column.required"
                        @click="onClickedColumn(column, true)"
                        class="d-inline column-headers-modal__remove btn btn-sm btn-link m-0 p-0">
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </b-overlay>
    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
          <b-button variant="success mr-2"
                    class="custom-btn"
                    :disabled="loading"
                    @click="onApplyChanges">
            Apply
          </b-button>
          <b-button variant="outline-success mr-2"
                    class="custom-btn"
                    :disabled="loading"
                    @click="columnsClose">
            Cancel
          </b-button>
        </div>
        <div class="flex-grow-1"></div>
        <b-button variant="link"
                  size="sm"
                  :disabled="loading"
                  class="font-weight-bold text-danger text-decoration-none"
                  @click="onResetAllColumns">
          Reset all columns
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ALL_COLUMNS, COLUMN_CATEGORIES, DEFAULT_COLUMNS, DEFAULT_CONTACT_LIST } from 'src/constants/contacts-list-types'
import sortBy from 'lodash/sortBy'
import draggable from 'vuedraggable'
import Search from 'src/components/search.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

const DEFAULT_CONTACT_LIST_IDS = Object.keys(DEFAULT_CONTACT_LIST).map(
  (i) => DEFAULT_CONTACT_LIST[i].id
)

export default {
  components: {
    draggable,
    Search
  },
  data () {
    return {
      searchText: '',
      loading: false,
      isOpen: false,
      categories: COLUMN_CATEGORIES,
      currentColumns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
    }
  },
  methods: {
    ...mapActions('contacts', ['columnsClose', 'columnsUpdated']),
    onSearch (searchText) {
      this.searchText = searchText
    },
    onCheckMove (evt) {
      return evt.relatedContext.element.draggable
    },
    isHidden ({ name }) {
      return name === 'checkbox' || name === 'actions'
    },
    onClickedColumn (column, selected) {
      if (column.required) {
        return
      }
      if (selected) {
        this.currentColumns = this.currentColumns.filter(
          (c) => c.name !== column.name
        )
      } else {
        let newItems = JSON.parse(JSON.stringify(this.currentColumns))

        // now, check if columns have order property, or
        // check if column is required then update the sortable property.
        for (let index in newItems) {
          let found = ALL_COLUMNS.find(col => col.name === newItems[index].name)
          if (newItems[index].name !== 'checkbox' && typeof newItems[index].order === 'undefined' && found) {
            newItems[index].order = found.order
          }
        }
        console.log('column.order: ', column.order)
        console.log('newItems: ', newItems)

        // insert the column to the nearest existing neighboring column.
        let lesserOrder = newItems.find(col => col.order < column.order)
        let lesserOrderIndex = lesserOrder ? newItems.indexOf(lesserOrder) : null
        let greaterOrder = newItems.find(col => parseInt(col.order) > column.order)
        let greaterOrderIndex = greaterOrder ? newItems.indexOf(greaterOrder) : null
        console.log('greaterOrderIndex: ', greaterOrderIndex)
        console.log('lesserOrderIndex: ', lesserOrderIndex)
        if (greaterOrderIndex !== -1 && greaterOrderIndex !== null) {
          newItems.splice(greaterOrderIndex, 0, column)
        } else {
          newItems.splice((lesserOrderIndex + 1), 0, column)
        }

        // correct the actions order, should always be at the last.
        let actions = newItems.find(column => column.label === 'Actions')
        let actionsIndex = actions ? newItems.indexOf(actions) : null
        if (actionsIndex !== -1 && actionsIndex !== null && actionsIndex < (newItems.length - 1)) {
          newItems.splice(actionsIndex, 1)
          newItems.splice(actions.order, 0, actions)
        }
        this.currentColumns = newItems
      }
    },
    closeAndMutate () {
      this.columnsUpdated({
        id: this.columns.id,
        headers: this.currentColumns
      })
      this.columnsClose()
    },
    closeAndReset () {
      this.columnsUpdated({
        id: this.columns.id,
        headers: DEFAULT_COLUMNS
      })
      this.columnsClose()
    },
    onApplyChanges () {
      if (DEFAULT_CONTACT_LIST_IDS.includes(this.columns.id)) {
        this.closeAndMutate()
        return
      }
      this.loading = true
      this.$axios
        .patch(`/api/v2/contacts-list/${this.columns.id}`, {
          ...this.columns,
          headers: this.currentColumns,
          filters: [] // TODO: use a
        })
        .then(() => {
          this.$q.notify({
            message: 'Columns were successfully saved!',
            type: 'positive',
            textColor: 'white'
          })
          this.closeAndMutate()
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    onResetAllColumns () {
      if (DEFAULT_CONTACT_LIST_IDS.includes(this.columns.id)) {
        this.closeAndReset()
        return
      }

      this.loading = true
      this.$axios
        .patch(`/api/v2/contacts-list/${this.columns.id}`, {
          ...this.columns,
          headers: DEFAULT_COLUMNS,
          filters: [] // TODO: use actual values
        })
        .then(() => {
          this.$q.notify({
            message: 'Columns were successfully saved!',
            type: 'positive',
            textColor: 'white'
          })
          this.columnsClose()
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
        .finally(() => {
          this.loading = false
        })

      this.closeAndReset()
    },
    onModalShow () {
      this.searchText = ''
    }
  },
  computed: {
    ...mapGetters('contacts', ['columns']),
    title () {
      return `Manage ${String(this.columns?.name).toLowerCase()} columns`
    },
    allColumns () {
      const columns = []
      let results = 0

      const matches = sortBy(ALL_COLUMNS, ['name']).filter((item) => {
        if (this.searchText && this.searchText.trim().length > 1) {
          return (
            (item.name + item.label)
              .toLowerCase()
              .indexOf(this.searchText.toLowerCase()) !== -1
          )
        } else {
          return true
        }
      })

      for (let i = 0; i < COLUMN_CATEGORIES.length; i++) {
        columns[i] = matches.filter((c) => c.category === i)
        results = results + columns[i].length
      }

      return {
        items: columns,
        results
      }
    },
    selected () {
      if (Array.isArray(this.currentColumns) && this.currentColumns.length) {
        return new Set([...this.currentColumns.map((i) => i.name)])
      } else {
        return new Set()
      }
    }
  },
  watch: {
    columns: function (value) {
      if (value && value.headers) {
        this.currentColumns = value.headers
        this.isOpen = true
      } else {
        this.isOpen = false
        this.currentColumns = []
      }
    }
  }
}
</script>
