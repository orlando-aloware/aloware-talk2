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
                  @click="confirmedSave = true">
          Reset all columns
        </b-button>
        <ConfirmDialog
          :is-open="confirmedSave"
          :id="resourceId"
          size="md"
          title="Reset Columns"
          @hide="confirmedSave = false">
          <div slot="content">
            <div class="text-left">
              <div class="text-dark">
                To confirm, all columns on a selected list will be set to default.
              </div>
            </div>
          </div>
          <div slot="footer" class="w-100">
            <div class="d-flex w-100">
              <div class="flex-grow-1"></div>
              <button
                class="btn btn-sm btn-outline-dark mr-2"
                @click="confirmedSave = false"
              >
                Cancel
              </button>
              <button
                class="btn btn-sm btn-success mr-2"
                @click="onConfirmSave">
                Yes
              </button>
            </div>
          </div>
        </ConfirmDialog>
      </div>
    </template>
  </b-modal>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import {
  ALL_COLUMNS,
  COLUMN_CATEGORIES,
  DEFAULT_COLUMNS,
  POWER_DIALER_DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import { ALL_RELATIONS } from 'src/constants/contacts-default-relations'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import sortBy from 'lodash/sortBy'
import draggable from 'vuedraggable'
import Search from 'src/components/search.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import ConfirmDialog from 'src/components/confirm-dialog'
const DEFAULT_PINNED_LIST_IDS = Object.keys(DEFAULT_PINNED_LIST).map(
  (i) => DEFAULT_PINNED_LIST[i].id
)

export default {
  props: {
    predefinedId: {
      default: null
    },
    previousRelations: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    draggable,
    Search,
    ConfirmDialog
  },
  data () {
    return {
      searchText: '',
      loading: false,
      isOpen: false,
      categories: COLUMN_CATEGORIES,
      currentColumns: [],
      confirmedSave: false
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
        const newItems = JSON.parse(JSON.stringify(this.currentColumns))
        const index = { data: null }
        const found = { data: null }

        // now, check if columns have order property, or
        // check if column is required then update the sortable property.
        for (index.data in newItems) {
          found.data = ALL_COLUMNS.find(col => col.name === newItems[index.data].name)

          if (newItems[index.data].name !== 'checkbox' && typeof newItems[index.data].order === 'undefined' && found.data) {
            newItems[index.data].order = found.data.order
          }
        }

        // insert the column to the nearest existing neighboring column.
        const lesserOrder = newItems.find(col => col.order < column.order)
        const lesserOrderIndex = lesserOrder ? newItems.indexOf(lesserOrder) : null
        const greaterOrder = newItems.find(col => parseInt(col.order) > column.order)
        const greaterOrderIndex = greaterOrder ? newItems.indexOf(greaterOrder) : null

        if (greaterOrderIndex !== -1 && greaterOrderIndex !== null) {
          newItems.splice(greaterOrderIndex, 0, column)
        } else {
          newItems.splice((lesserOrderIndex + 1), 0, column)
        }

        // correct the actions order, should always be at the last.
        const actions = newItems.find(column => column.label === 'Actions')
        const actionsIndex = actions ? newItems.indexOf(actions) : null

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

      // we need to reload contacts data to include relations data
      const relations = this.currentColumns.filter(item => ALL_RELATIONS.includes(item.name))

      if (relations.length && this.hasAddedRelation) {
        this.$VueEvent.fire('fetchContacts', { clear: true })
      }
    },
    closeAndReset () {
      this.columnsUpdated({
        id: this.columns.id,
        headers: this.activeColumns
      })
      this.columnsClose()
    },
    onApplyChanges () {
      const typeQuery = _.get(this.$route, 'query.type', null)

      if (DEFAULT_PINNED_LIST_IDS.includes(this.columns.id) || (typeQuery && typeQuery === 'public')) {
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
          this.closeAndReset()
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

      // this.closeAndReset()
    },
    getAllActiveColumns () {
      const columns = JSON.parse(JSON.stringify(this.activeColumns))
      const headers = _.get(this.columns, 'headers', [])

      if (_.isEmpty(headers)) {
        return columns
      }

      const newColumns = JSON.parse(JSON.stringify(headers))
      const index = { data: null }
      const found = { data: null }
      for (index.data in columns) {
        found.data = newColumns.find(item => item.name === columns[index.data].name)
        if (found.data === undefined) {
          newColumns.splice((parseInt(index.data) + 1), 0, columns[index.data])
        }
      }

      return newColumns
    },
    onModalShow () {
      this.searchText = ''
      this.currentColumns = this.getAllActiveColumns()
    },
    onConfirmSave () {
      this.confirmedSave = false
      this.onResetAllColumns()
    }
  },
  computed: {
    ...mapGetters('contacts', ['columns']),
    resourceId () {
      const columnsId = _.get(this.columns, 'id', '')
      return columnsId === 'my-queue' ? `${this.predefinedId}` : `${columnsId}`
    },
    title () {
      const title = this.columns?.name || 'My Queue'
      return `Manage ${String(title).toLowerCase()} columns`
    },
    allColumns () {
      const columns = []
      const results = { data: 0 }

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

      const item = { i: 0 }
      for (item.i = 0; item.i < COLUMN_CATEGORIES.length; item.i++) {
        if (this.endpointUrl === 'contacts-list') {
          columns[item.i] = matches.filter((c) => c.category === item.i && c.name !== 'task_status')
        } else {
          columns[item.i] = matches.filter((c) => c.category === item.i)
        }
        results.data = results.data + columns[item.i].length
      }

      return {
        items: columns,
        results: results.data
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
    },
    hasAddedRelation () {
      const currentRelations = this.currentColumns.filter(item => ALL_RELATIONS.includes(item.name))
      return currentRelations.length > this.previousRelations.length
    },
    currentRelations () {
      return this.currentColumns.filter(item => ALL_RELATIONS.includes(item.name))
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
