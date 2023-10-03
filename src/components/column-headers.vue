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
                     @click="onClickedColumn(column, selectedColumns.has(column.name))">
                  <input class="cursor-pointer mt-1"
                         type="checkbox"
                         :checked="selectedColumns.has(column.name)"
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
import { ALL_COLUMNS_WITH_RELATION } from 'src/constants/contacts-default-relations'
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

    onClickedColumn (column, isInSelectedColumns) {
      if (column.required) {
        return
      }

      if (isInSelectedColumns) {
        // remove item from the selected columns list
        this.currentColumns = this.currentColumns.filter(
          (c) => c.name !== column.name
        )

        return
      }

      // add item to the selected columns list
      const refreshedItems = [...this.$jsonClone(this.currentColumns), column]

      // sort items by order
      // note: "checkbox" item has undefined 'order' property which should always be first
      refreshedItems.sort((a, b) => ((a.order > b.order) || typeof b.order === 'undefined') ? 1 : -1)

      // correct the "actions" item order, should always be at the last.
      const actions = refreshedItems.find(column => column.label === 'Actions')
      const actionsIndex = actions ? refreshedItems.indexOf(actions) : null

      if (actionsIndex !== -1 && actionsIndex !== null && actionsIndex < (refreshedItems.length - 1)) {
        refreshedItems.splice(actionsIndex, 1)
        refreshedItems.splice(actions.order, 0, actions)
      }

      this.currentColumns = refreshedItems
    },

    closeAndMutate () {
      this.columnsUpdated({
        id: this.columns.id,
        headers: this.currentColumns
      })
      this.columnsClose()

      // we need to reload contacts data to include newly added relations data, if there's any
      if (this.currentRelations.length && this.hasAddedRelation) {
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

      if (DEFAULT_PINNED_LIST_IDS.includes(this.columns.id) ||
        (typeQuery && typeQuery === 'public') ||
        this.resourceId === 'unsaved') {
        this.closeAndMutate()
        return
      }

      this.loading = true
      this.$axios
        .patch(`/api/v2/${this.endpointUrl}/${this.resourceId}`, {
          id: this.resourceId,
          headers: this.currentColumns
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
      if (DEFAULT_PINNED_LIST_IDS.includes(this.columns.id) ||
        this.resourceId === 'unsaved') {
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

      return headers
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
          columns[item.i] = matches.filter((c) => {
            return c.category === item.i && c.name !== 'task_status'
          })
        } else {
          columns[item.i] = matches.filter((c) => {
            let field = this.powerDialerDefaultColumns.find(f => f.name === c.name)
            if (c.category === item.i) {
              if (field !== undefined) {
                return field
              } else {
                const item = c
                item.required = false
                return item
              }
            }
          })
        }
        results.data = results.data + columns[item.i].length
      }

      return {
        items: columns,
        results: results.data
      }
    },

    selectedColumns () {
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
      return this.currentRelations.length > this.previousRelations.length
    },

    currentRelations () {
      return this.currentColumns.filter(item => ALL_COLUMNS_WITH_RELATION.includes(item.name))
    },

    defaultColumns () {
      return DEFAULT_COLUMNS
    },

    powerDialerDefaultColumns () {
      return POWER_DIALER_DEFAULT_COLUMNS
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
