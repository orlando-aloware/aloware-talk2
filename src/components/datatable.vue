<template>
  <div class="d-flex flex-column" :class="[paginated ? 'paginated' : '']">
    <div
      ref="scrollableArea"
      :class="['scrollableArea position-relative d-flex flex-column h-100 w-100 flex-grow-1', scrollAreaClass, isEmpty ? 'overflow-hidden' : '']"
      @scroll="handleScroll"
    >
      <table :class="[computedClass, 'ml-3']" ref="table">
        <thead>
          <draggable
            :list="fixedColumns"
            tag="tr"
            ghost-class="ghost"
            handle=".handle"
            @change="onOrderChanged"
            :move="onCheckMove"
          >
            <th
              v-for="(column, key) in fixedColumns"
              :key="column.name"
              :data-column-id="column.name"
              :class="{
                checkbox: column.name === 'checkbox',
                sticky: column.sticky,
                hovering: hoverKey === key ? isHovering : false
              }"
              :style="{
                maxWidth: column.maxWidth ? `${column.maxWidth}px` : (column.name === 'checkbox' ?  '40px' : ''),
                minWidth: column.minWidth ? `${column.minWidth}px` : (column.name === 'checkbox' ?  '40px' : '')
              }"
              @mouseout="onInitReorder(false, null)"
              >

              <label class="custom-checkbox-container check-all" v-if="column.name === 'checkbox'">
                <input type="checkbox"
                       class="data-table-check-all"
                       ref="dataTableCheckAll"
                       @change="onCheckboxClicked"/>
                <span class="checkmark"></span>
              </label>
              <template v-if="column.name && column.name !== 'checkbox'">
                <div
                  v-if="column.draggable"
                  @mouseover="onInitReorder(true, key)"
                  class="move-icon-drag-container"
                  style="display:inline-block;">
                  <MoveIcon
                    v-if="column.draggable"
                    class="move-icon-drag"
                    :class="{ handle: column.draggable }" />
                </div>
                <span class="handle-label">
                  {{ column.label }}
                </span>
                <a
                  href="#"
                  class="sorter"
                  :class="{
                    'sorter-asc':
                      sorts.order === 'asc' && sorts.orderBy === column.name,
                    'sorter-desc':
                      sorts.order === 'desc' && sorts.orderBy === column.name
                  }"
                  v-if="column.sortable"
                  @click.prevent="onColumnSort(column)"
                ></a>
                <div
                  class="tableResizer"
                  :data-resizer-id="column.name"
                  v-if="column.resizable"
                  @mousedown="onResizerMouseDown"
                >
                  -{{ column.label }}
                </div>
              </template>
            </th>
          </draggable>
        </thead>
        <tbody>
          <slot name="tbody" />
        </tbody>
      </table>
      <b-overlay
        class="table-more-rows-spinner"
        :show="isLoadingMore"
        rounded="sm"
        v-if="!paginated"
      >
        <template #overlay>
          <q-spinner-bars color="primary" size="20px" />
        </template>
      </b-overlay>

      <template v-if="hasEmptySlot && isEmpty">
        <slot name="empty" />
      </template>
      <div class="empty-state" v-else-if="!hasEmptySlot && isEmpty">
        <div class="h5">No contacts found based on the current filters</div>
      </div>
    </div>
    <div class="d-flex justify-content-center" v-if="paginated">
      <q-pagination
        boundary-links
        direction-links
        dense
        class="table-pagination mr-1"
        v-model="paginationPage"
        :max="lastPage"
        :max-pages="11"
        :ellipses="false"
        :boundary-numbers="false"
      ></q-pagination>

      <q-select outlined
                dense
                emit-value
                class="mt-2 q-select-pager"
                option-value="value"
                option-label="label"
                v-model="perPage"
                :options="perPageOptions"
                :display-value="`${perPage} per page`">
      </q-select>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import draggable from 'vuedraggable'
import MoveIcon from 'components/icons/move-icon-2'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'

let column
let scrollTimeout

export default {
  components: {
    draggable,
    MoveIcon
  },

  props: {
    columns: {
      type: Array
    },
    customClass: {
      type: String
    },
    customHeaders: {
      type: Array,
      default: () => []
    },
    stickyHeaders: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    scrollAreaClass: {
      type: String,
      default: ''
    },
    paginated: {
      type: Boolean,
      default: false
    },
    totalRows: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    lastPage: {
      type: Number,
      default: 1
    }
  },

  computed: {
    ...mapState(['currentCompany']),
    defaultContactDateFilter () {
      if (this.currentCompany === DefaultContactDateFilter.DEFAULT_CONTACT_DATE_FILTER_CREATED_AT) {
        return 'created_at'
      }
      return 'last_engagement_at'
    },
    computedClass () {
      return {
        datatable: true,
        [this.customClass]: !!this.customClass,
        'datatable--sticky-columns': this.stickyHeaders
      }
    },
    hasEmptySlot () {
      return !!this.$slots.empty
    },
    fixedColumns () {
      let newItems = JSON.parse(JSON.stringify(this.columns))
      // now, check if columns have order, label, maxWidth or minWidth property, or
      // check if column is required then update sortable.
      for (let index in newItems) {
        let found = ALL_COLUMNS.find(col => col.name === newItems[index].name)
        if (found && found.required) {
          newItems[index].sortable = found.sortable
        }
        if (found) {
          newItems[index].label = found.label
          newItems[index].default = found.default
          newItems[index].sortable = found.sortable
          newItems[index].maxWidth = found.maxWidth
          newItems[index].minWidth = found.minWidth
        }
      }
      return newItems
    }
  },

  data () {
    return {
      sorts: { order: 'asc' },
      tableColumns: [],
      startOffset: 0,
      loading: true,
      scrolling: false,
      isLoaderVisible: false,
      paginationPage: 1,
      perPage: 25,
      perPageOptions: [
        { value: 25, label: '25 Per Page' },
        { value: 50, label: '50 Per Page' },
        { value: 100, label: '100 Per Page' }
      ],
      isHovering: false,
      hoverKey: null
    }
  },

  methods: {
    handleScroll: function (element) {
      if ((element.srcElement.offsetHeight + element.srcElement.scrollTop) >= (element.srcElement.scrollHeight + 5)) {
        this.onVisibilityChanged(true)
      } else if (this.isLoaderVisible) {
        this.onVisibilityChanged(false)
      }
    },
    onResizeMouseMove (evt) {
      if (column) {
        for (let i = 0; i < evt.pageX; i++) {
          requestAnimationFrame(() => {
            if (column) {
              column.style.minWidth = `${this.startOffset + i}px`
              column.style.maxWidth = `${this.startOffset + i}px`
            }
          })
        }
      }
    },
    onResizerMouseUp () {
      column = null
      this.startOffset = 0
      document.body.style.cursor = ''
    },
    onResizerMouseDown (evt) {
      column = evt.target.parentNode
      this.startOffset = column.offsetWidth - evt.pageX
      document.body.style.cursor = 'col-resize'
    },
    onCheckboxClicked (evt) {
      this.$emit('checked', evt.target.checked)
    },
    onOrderChanged ({ oldIndex, newIndex }) {
      const columns = [...this.fixedColumns]

      columns[oldIndex] = this.fixedColumns[newIndex]
      columns[newIndex] = this.fixedColumns[oldIndex]

      this.$emit('reordered', [...columns])
    },
    onColumnSort (column) {
      this.$emit('sort', Object.assign({}, this.getColumnSorts(column)))
    },
    getColumnSorts (column) {
      this.sorts = {
        orderBy: column.name,
        order: this.sorts.order === 'asc' ? 'desc' : 'asc'
      }
      return this.sorts
    },
    onCheckMove (evt) {
      return evt.relatedContext.element.draggable
    },
    onVisibilityChanged (isLoaderVisible) {
      this.isLoaderVisible = isLoaderVisible
    },
    onScroll () {
      if (this.paginated) {
        return
      }

      clearTimeout(scrollTimeout)
      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.isLoaderVisible && !this.isEmpty) {
          this.$emit('more')
        }
      }, 66)
    },
    onInitReorder (value, key) {
      this.isHovering = value
      this.hoverKey = key
    }
  },

  mounted () {
    if (this.$refs.scrollableArea) {
      // this.$refs.scrollableArea.style.height = `${this.$refs.scrollableArea.parentNode.offsetHeight}px`
      this.$refs.scrollableArea.addEventListener('scroll', this.onScroll)
    }
    this.sorts.orderBy = this.defaultContactDateFilter
    this.sorts.order = 'desc'
    document.addEventListener('mouseup', this.onResizerMouseUp)
    document.addEventListener('mousemove', this.onResizeMouseMove)
  },

  beforeDestroy () {
    clearTimeout(scrollTimeout)
    this.$refs.scrollableArea.removeEventListener('scroll', this.onScroll)
    document.removeEventListener('mouseup', this.onResizerMouseUp)
    document.removeEventListener('mousemove', this.onResizeMouseMove)
  },

  watch: {
    paginationPage: function () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
    },
    perPage: function () {
      this.$emit('paginated', { page: this.paginationPage, per_page: this.perPage })
    }
  }
}
</script>
