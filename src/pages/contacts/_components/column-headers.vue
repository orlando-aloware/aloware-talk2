<template>
  <b-modal
    v-model="isOpen"
    size="lg"
    title="Choose which columns you see"
    modal-class="column-headers-modal"
    scrollable
  >
    <b-overlay :show="loading" rounded="sm">
      <div class="column-headers-modal__inner row">
        <div class="col-md-12">
          <div class="alert alert-danger" v-if="errorMessage.length">
            {{ errorMessage }}
          </div>
        </div>

        <div class="col-lg-6 px-0">
          <div class="flex flex-column pr-2 pl-4">
            <div class="mb-2">
              <contacts-table-search @search="onSearch" :searchOnKeyup="true" />
            </div>
            <div class="column-headers-modal__checkboxes">
              <div
                class="d-flex align-items-center justify-content-center p-4 border my-3"
                v-if="!allColumns.length"
              >
                <div class="text-muted">No results found</div>
              </div>
              <div
                class="column-headers-modal__item d-flex align-items-center"
                v-for="column in allColumns"
                :key="column.id"
              >
                <div class="pl-2 checkbox">
                  <input
                    type="checkbox"
                    :checked="isChecked(column) || selected.has(column.name)"
                    :disabled="!isColumn(column.name)"
                    :value="column.id"
                    @click="onClickedColumn(column, selected.has(column.name))"
                  />
                </div>
                <div
                  class="flex-grow-1 pl-2 column-headers-modal__label"
                  @click="onClickedColumn(column, selected.has(column.name))"
                >
                  {{ column.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 px-0">
          <div class="px-3">
            <div
              class="font-weight-bold body text-uppercase column-headers-modal__selecteds"
            >
              Selected Columns
            </div>
            <div class="d-flex flex-column">
              <draggable
                v-model="columns"
                ghost-class="ghost"
                handle=".handle"
                :move="onCheckMove"
                @start="isDragging = true"
                @end="isDragging = false"
              >
                <div
                  class="column-headers-modal__item border px-2 py-1 mb-2 d-flex align-items-center"
                  :class="{ handle: column.draggable }"
                  v-for="column in columns"
                  :key="column.id"
                >
                  <i
                    class="fa fa-align-justify"
                    aria-hidden="true"
                    v-if="column.draggable && isColumn(column.name)"
                  ></i>
                  <div class="flex-grow-1 pl-2 column-headers-modal__label">
                    {{ column.label }}
                  </div>
                  <button
                    v-if="column.draggable && isColumn(column.name)"
                    @click="onClickedColumn(column, true)"
                    class="d-inline column-headers-modal__remove btn btn-sm btn-link m-0 p-0"
                  >
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </draggable>
            </div>
          </div>
        </div>
      </div>
    </b-overlay>
    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
          <b-button
            variant="success mr-2"
            class="custom-btn"
            :disabled="loading"
            @click="onApplyChanges"
            >Apply</b-button
          >
          <b-button
            variant="outline-success mr-2"
            class="custom-btn"
            :disabled="loading"
            @click="columnHeadersClose"
            >Cancel</b-button
          >
        </div>
        <div class="flex-grow-1"></div>
        <b-button
          variant="link"
          size="sm"
          :disabled="loading"
          class="font-weight-bold text-danger text-decoration-none"
          @click="onResetAllColumns"
          >Reset all columns</b-button
        >
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import ContactsTableSearch from './contacts-table-search.vue'
import allColumns from './allcolumns'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import columns from 'src/constants/columns'

const MIN_COLUMNS = 7

export default {
  components: {
    draggable,
    ContactsTableSearch
  },
  data () {
    return {
      errorMessage: '',
      searchText: '',
      columns: [],
      loading: false,
      isOpen: false
    }
  },
  methods: {
    ...mapActions('contacts', ['columnHeadersClose']),
    onSearch (searchText) {
      this.searchText = searchText
    },
    isColumn: (name) => {
      return name !== 'checkbox' && name !== 'actions'
    },
    onCheckMove (evt) {
      return evt.relatedContext.element.draggable
    },
    isChecked ({ name }) {
      return name === 'checkbox' || name === 'actions'
    },
    onClickedColumn (column, selected) {
      if (selected) {
        this.columns = this.columns.filter((c) => c.name !== column.name)
      } else {
        const lastIndex = this.columns.length - 1
        const lastItem = this.columns[lastIndex]
        const newItems = []
        for (let i = 0; i < this.columns.length; i++) {
          if (i === lastIndex) {
            newItems[lastIndex] = column
            newItems[lastIndex + 1] = lastItem
          } else {
            newItems[i] = this.columns[i]
          }
        }
        this.columns = newItems
      }
    },
    onApplyChanges () {
      this.loading = true
      window.axios
        .patch(`/api/v1/contacts-list/${this.columnHeaders.id}`, {
          ...this.columnHeaders,
          headers: this.columns,
          filters: [] // TODO: use a
        })
        .then(() => {
          this.$q.notify({
            message: 'Columns were successfully saved!',
            type: 'positive',
            textColor: 'white'
          })
          this.columnHeadersClose()
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
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
      this.loading = true
      window.axios
        .patch(`/api/v1/contacts-list/${this.columnHeaders.id}`, {
          ...this.columnHeaders,
          headers: columns,
          filters: [] // TODO: use actual values
        })
        .then(() => {
          this.$q.notify({
            message: 'Columns were successfully saved!',
            type: 'positive',
            textColor: 'white'
          })
          this.columnHeadersClose()
        })
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
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
    }
  },
  computed: {
    ...mapGetters('contacts', ['columnHeaders']),
    allColumns () {
      if (this.searchText && this.searchText.length > 1) {
        return allColumns.filter(
          (i) =>
            (i.name + i.label)
              .toLowerCase()
              .indexOf(this.searchText.toLowerCase()) !== -1
        )
      } else {
        return allColumns
      }
    },
    selected () {
      if (Array.isArray(this.columns) && this.columns.length) {
        return new Set([...this.columns.map((i) => i.name)])
      } else {
        return new Set()
      }
    }
  },
  watch: {
    columnHeaders: function (value) {
      if (value && value.headers) {
        this.columns = value.headers
        this.isOpen = true
      } else {
        this.isOpen = false
      }
    },
    columns: function (value) {
      if (value.length < MIN_COLUMNS) {
        this.errorMessage = 'You need to have atleast 4 columns enabled'
      } else {
        this.errorMessage = ''
      }
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.column-headers-modal {
  max-height: 100%;
  @include screen('lg') {
    max-height: 80%;
  }
  .ghost {
    border: dashed 1px $green !important;
  }
  &__checkboxes {
    max-height: calc(100% - 50px);
  }
  &__remove {
    width: 10px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 10px;
  }
  &__selecteds {
    font-size: 14px;
    margin-bottom: 15px;
  }
  .handle:hover {
    background-color: $light-green2;
  }
  .handle {
    cursor: move;
  }
  &__item {
    height: 35px;
    i {
      color: $grey-2;
      font-size: 10px;
    }
  }
  &__label {
    font-size: 14px;
  }
  &__inner {
    min-height: 300px;
  }
  .modal-title {
    color: $white;
  }
  .modal-header {
    background-color: $dark;
    border-radius: 0;
    padding: 15px;
    .close {
      color: $white;
    }
  }
  .modal-content {
    border-radius: 0;
    border: none;
  }
  .modal-footer {
    .custom-btn {
      min-width: 120px;
    }
  }
}
</style>
