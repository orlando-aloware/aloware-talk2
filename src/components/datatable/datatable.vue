<template>
  <div ref="scrollableArea" class="scrollableArea position-relative">
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
              type="checkbox"
              v-if="column.name === 'checkbox'"
              @click="onCheckboxClicked"
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
                  'sorter-asc': sorts.order === 'asc' && sorts.orderBy === column.name,
                  'sorter-desc': sorts.order === 'desc' && sorts.orderBy === column.name
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
        <slot />
      </tbody>
    </table>
    <div class="relative py-4" v-b-visible.100="onVisibilityChanged">
      <b-overlay
        :show="isLoadingMore"
        spinner-variant="success"
        spinner-type="grow"
        rounded="sm"
      >
      </b-overlay>
    </div>
    <div class="empty-state" v-if="isEmpty">
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
      this.$refs.scrollableArea.style.height = `${this.$refs.scrollableArea.parentNode.offsetHeight}px`
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
  },
  watch: {
    'columns': function (id) {
      console.log(id)
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.empty-state {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scrollableArea {
  position: relative;
  margin: auto;
  overflow: auto;
  min-height: 600px;
}

div.tableResizer {
  position: absolute;
  user-select: none;
  width: 5px;
  bottom: 0;
  right: 0;
  height: 100%;
  color: transparent;
  cursor: col-resize;
  z-index: 10;
  background-color: transparent;
  &.resizing {
    background-color: $light-green3;
  }
}

table.datatable {
  border-collapse: separate;
  border-spacing: 0;
  border: none;
  box-sizing: border-box;
  position: relative;
  table-layout: fixed;
  min-width: 100%;
  word-break: break-all;

  &--sticky-columns {
    thead {
      tr {
        th {
          position: sticky;
          top: 0;
          z-index: 4;
        }
      }
    }

    tbody {
      tr {
        td {
          z-index: 1;
        }
      }
    }
  }

  thead {
    tr {
      th.checkbox {
        width: 40px;
        vertical-align: middle;
        text-align: center;
        cursor: pointer;
        padding: 0;
        input[type='checkbox'] {
          padding: 0;
          display: block;
          height: 19px;
          margin: auto;
        }
      }

      .handle {
        cursor: move;
      }

      th {
        background-color: $white;
        border-right: solid 1px $grey-light4;
        border-bottom: solid 1px $grey-light4;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-left: 8px;
        padding-right: 30px;
        padding-bottom: 10px;
        padding-top: 10px;
        text-align: left;
        z-index: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        user-select: none;

        &.ghost {
          background-color: $light-green2;
        }

        &:last-child {
          border-right: none;
        }

        &:hover {
          background-color: $grey-light8;
        }

        a.sorter {
          position: absolute;
          height: 30px;
          width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          right: 3px;
          top: 9%;
        }

        a.sorter:before,
        a.sorter:after {
          border: 4px solid transparent;
          content: '';
          display: block;
          height: 0;
          width: 0;
        }

        a.sorter:before {
          border-bottom-color: $grey-dark;
          margin-top: -10px;
        }

        a.sorter:after {
          border-top-color: $grey-dark;
          margin-top: 10px;
          margin-left: -8px;
        }

        a.sorter.sorter-desc:before {
          border-bottom-color: $green;
        }

        a.sorter.sorter-asc:after {
          border-top-color: $green;
        }
      }
    }
  }

  tbody {
    tr {
      &:hover {
        background-color: $grey-light8;
      }
      &:hover td {
        background-color: $light-green2;
      }
      td.checkbox {
        min-width: 40px;
        max-width: 40px;
        vertical-align: middle;
        text-align: center;
        cursor: pointer;
        input[type='checkbox'] {
          padding: 0;
          display: block;
          height: 19px;
          margin: auto;
        }
      }
      td {
        background-color: $white;
        padding: 8px;
        border-bottom: solid 1px $grey-light4;
        font-size: 12px;
        z-index: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 0;
        min-width: 50px;
        &:read-write:focus {
          outline: 1px solid $light-green3;
          background: white;
        }
      }
      &:last-child td {
        border-bottom: none;
      }
    }
  }
}
</style>
