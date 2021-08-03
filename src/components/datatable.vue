<template>
  <div
    ref="scrollableArea"
    class="scrollableArea position-relative d-flex flex-column h-100"
    :class="{ 'overflow-hidden': isEmpty }"
  >
    <table :class="computedClass" ref="table">
      <thead>
        <draggable
          :list="columns"
          tag="tr"
          ghost-class="ghost"
          handle=".handle"
          @change="onOrderChanged"
          :move="onCheckMove"
        >
          <th
            v-for="column in columns"
            :key="column.name"
            :data-column-id="column.name"
            :class="{
              checkbox: column.name === 'checkbox',
              sticky: column.sticky
            }"
            :style="{
              maxWidth: column.maxWidth ? `${column.maxWidth}px` : '',
              minWidth: column.minWidth ? `${column.minWidth}px` : ''
            }"
          >
            <input
              class="data-table-check-all"
              ref="dataTableCheckAll"
              type="checkbox"
              v-if="column.name === 'checkbox'"
              @change="onCheckboxClicked"
            />
            <template v-if="column.name && column.name !== 'checkbox'">
              <span :class="{ handle: column.draggable }"
                ><i
                  class="fa fa-bars mr-2 text-muted"
                  v-if="column.draggable"
                ></i>
                {{ column.label }}</span
              >
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
                {{ column.label }}
              </div>
            </template>
          </th>
        </draggable>
      </thead>
      <tbody>
        <slot name="tbody" />
      </tbody>
    </table>
    <div class="relative py-5 flex-1" v-b-visible.100="onVisibilityChanged">
      <b-overlay
        :show="isLoadingMore"
        rounded="sm"
      >
        <template #overlay>
          <q-spinner-bars color="primary" size="20px" />
        </template>
      </b-overlay>
    </div>

    <template v-if="hasEmptySlot && isEmpty">
      <slot name="empty" />
    </template>
    <div class="empty-state" v-else-if="!hasEmptySlot && isEmpty">
      <div class="h5">No contacts found based on the current filters</div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

let column
let scrollTimeout

const dragOffset = 100

export default {
  components: {
    draggable
  },
  methods: {
    onResizeMouseMove (evt) {
      if (column) {
        for (let i = 0; i < evt.pageX; i++) {
          requestAnimationFrame(() => {
            column.style.minWidth = `${this.startOffset + i}px`
            column.style.maxWidth = `${this.startOffset + i}px`
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
      this.startOffset = column.offsetWidth - evt.pageX - dragOffset
      document.body.style.cursor = 'col-resize'
    },
    onCheckboxClicked (evt) {
      this.$emit('checked', evt.target.checked)
    },
    onOrderChanged ({ oldIndex, newIndex }) {
      const columns = [...this.columns]

      columns[oldIndex] = this.columns[newIndex]
      columns[newIndex] = this.columns[oldIndex]

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
      clearTimeout(scrollTimeout)
      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.isLoaderVisible && !this.isEmpty) {
          this.$emit('more')
        }
      }, 66)
    }
  },
  data () {
    return {
      sorts: { order: 'asc' },
      tableColumns: [],
      startOffset: 0,
      loading: true,
      scrolling: false,
      isLoaderVisible: false
    }
  },
  computed: {
    computedClass () {
      return {
        datatable: true,
        [this.customClass]: !!this.customClass,
        'datatable--sticky-columns': this.stickyHeaders
      }
    },
    hasEmptySlot () {
      return !!this.$slots.empty
    }
  },
  props: {
    columns: {
      type: Array
    },
    customClass: {
      type: String
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
    }
  },
  mounted () {
    if (this.$refs.scrollableArea) {
      // this.$refs.scrollableArea.style.height = `${this.$refs.scrollableArea.parentNode.offsetHeight}px`
      this.$refs.scrollableArea.addEventListener('scroll', this.onScroll)
    }
    document.addEventListener('mouseup', this.onResizerMouseUp)
    document.addEventListener('mousemove', this.onResizeMouseMove)
  },
  beforeDestroy () {
    clearTimeout(scrollTimeout)
    this.$refs.scrollableArea.removeEventListener('scroll', this.onScroll)
    document.removeEventListener('mouseup', this.onResizerMouseUp)
    document.removeEventListener('mousemove', this.onResizeMouseMove)
  }
}
</script>
