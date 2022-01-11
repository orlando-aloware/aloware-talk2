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
                   v-for="(column, key) in items"
                   :key="`${column.name}-${key}`"
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
import {
  ALL_COLUMNS,
  COLUMN_CATEGORIES,
  DEFAULT_COLUMNS,
  POWER_DIALER_DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import sortBy from 'lodash/sortBy'
import draggable from 'vuedraggable'
import Search from 'src/components/search.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

const DEFAULT_PINNED_LIST_IDS = Object.keys(DEFAULT_PINNED_LIST).map(
  (i) => DEFAULT_PINNED_LIST[i].id
)

export default {
  props: {
    predefinedId: {
      default: null
    }
  },
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
      currentColumns: JSON.parse(JSON.stringify(this.activeColumns || DEFAULT_COLUMNS))
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

        // insert the column to the nearest existing neighboring column.
        let lesserOrder = newItems.find(col => col.order < column.order)
        let lesserOrderIndex = lesserOrder ? newItems.indexOf(lesserOrder) : null
        let greaterOrder = newItems.find(col => parseInt(col.order) > column.order)
        let greaterOrderIndex = greaterOrder ? newItems.indexOf(greaterOrder) : null

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
        headers: this.currentColumns
      })
      this.columnsClose()
    },
    onApplyChanges () {
      console.log('On apply changes...')
      if (DEFAULT_PINNED_LIST_IDS.includes(this.columns.id)) {
        this.closeAndMutate()
        return
      }
      this.loading = true
      this.$axios
        .patch(`/api/v2/${this.endpointUrl}/${this.resourceId}`, {
          id: this.resourceId,
          headers: this.currentColumns,
          filters: [] // TODO: use a
        })
        .then(() => {
          this.$generalNotification('Columns were successfully saved!')
          this.closeAndMutate()
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
        .finally(() => {
          this.loading = false
        })
    },
    onResetAllColumns () {
      console.log('On reset all columns...')
      if (DEFAULT_PINNED_LIST_IDS.includes(this.columns.id)) {
        this.closeAndReset()
        return
      }

      this.loading = true
      this.$axios
        .patch(`/api/v2/${this.endpointUrl}/${this.resourceId}`, {
          id: this.resourceId,
          headers: this.activeColumns,
          filters: [] // TODO: use actual values
        })
        .then((res) => {
          this.$generalNotification('Columns were successfully saved!')
          this.columnsUpdated({
            id: res.data.data.id,
            headers: res.data.data.headers
          })
          this.columnsClose()
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
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
    resourceId () {
      return this.columns.id === 'my-queue' ? this.predefinedId : this.columns.id
    },
    title () {
      let title = this.columns?.name || 'My Queue'
      return `Manage ${String(title).toLowerCase()} columns`
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
    },
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    endpointUrl () {
      if (this.isContactsRoute) {
        return 'contacts-list'
      }
      return 'power-dialer-lists'
    },
    activeColumns () {
      return this.isContactsRoute ? DEFAULT_COLUMNS : POWER_DIALER_DEFAULT_COLUMNS
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
