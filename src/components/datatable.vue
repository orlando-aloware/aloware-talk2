<template>
  <div class="d-flex flex-column"
       :class="[paginated ? 'paginated' : '']"
       @mousemove="$emit('onMouseMove', $event)"
       @mouseleave="$emit('onMouseLeave', $event)">

    <div ref="scrollableArea"
         :class="scrollableAreaClasses"
         @scroll="handleScroll">

      <table ref="table"
             :class="[computedClass, 'pl-3']">

        <thead>
          <draggable class="dragable-header"
                     tag="tr"
                     ghost-class="ghost"
                     handle=".handle"
                     :list="fixedColumns"
                     :move="onCheckMove"
                     @change="onOrderChanged">

            <th :key="column.name"
                :data-column-id="column.name"
                :class="{
                  checkbox: column.name === 'checkbox',
                  sticky: column.sticky,
                  hovering: hoverKey === key ? isHovering : false
                }"
                :id="`cols-${column.name}`"
                :style="{
                  maxWidth: column.maxWidth ? `${column.maxWidth}px` : (column.name === 'checkbox' ?  '40px' : ''),
                  minWidth: column.minWidth ? `${column.minWidth}px` : (column.name === 'checkbox' ?  '40px' : '')
                }"
                v-for="(column, key) in fixedColumns"
                @mouseout="onInitReorder(false, null)">

              <label class="custom-checkbox-container check-all"
                     v-if="column.name === 'checkbox'">
                <input type="checkbox"
                       class="data-table-check-all"
                       ref="dataTableCheckAll"
                       :checked="isSelectedAll"
                       @change="onCheckboxClicked" />
                <span class="checkmark"></span>
              </label>
              <template v-if="column.name && column.name !== 'checkbox'">
                <div class="move-icon-drag-container"
                     style="display:inline-block;"
                     v-if="column.draggable"
                     @mouseover="onInitReorder(true, key)">
                  <MoveIcon class="move-icon-drag"
                            :color="moveColor"
                            :class="{ handle: column.draggable }"
                            v-if="column.draggable"/>
                </div>
                <span class="handle-label"
                      :class="{ 'pl-2': column.label === 'Actions' }">
                  {{ column.label }}
                </span>
                <div class="sorter-container"
                     :class="{ 'has-sorting': sorts.orderBy === column.name }">
                <a href="#"
                   class="sorter"
                   :class="{
                    'sorter-asc':
                      sorts.order === 'asc' && sorts.orderBy === column.name,
                    'sorter-desc':
                      sorts.order === 'desc' && sorts.orderBy === column.name
                    }"
                   v-if="column.sortable"
                   @click.prevent="onColumnSort(column)">
                </a>
                </div>
                <div class="tableResizer"
                     :data-resizer-id="column.name"
                     v-if="column.resizable"
                     @mousedown="onResizerMouseDown">
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

      <b-overlay class="table-more-rows-spinner"
                 rounded="sm"
                 :show="isLoadingMore"
                 v-if="!paginated">
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="20px" />
        </template>
      </b-overlay>

      <template v-if="hasEmptySlot">
        <slot name="empty" />
      </template>

      <div class="empty-state"
           v-else-if="!hasEmptySlot && isEmpty &&  !isLoading">
        <div class="h5">{{ defaultPlaceholderMessage }}</div>
      </div>
    </div>

    <div v-if="paginated"
         class="d-flex justify-content-center bordered-top">
      <q-pagination class="table-pagination"
                    padding="0 15px"
                    boundary-links
                    direction-links
                    dense
                    :max="lastPage"
                    :max-pages="maxPaginationPages"
                    :ellipses="false"
                    :boundary-numbers="false"
                    v-model="paginationPage">
      </q-pagination>

      <q-select class="mt-2 q-select-pager"
                outlined
                dense
                emit-value
                option-value="value"
                option-label="label"
                :options="perPageOptions"
                :display-value="`${perPage} per page`"
                v-model="perPage" />

    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import draggable from 'vuedraggable'
import MoveIcon from 'components/icons/move-icon-2'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'

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

    isScrollable: {
      type: Boolean,
      default: true
    },

    paginated: {
      type: Boolean,
      default: false
    },

    showPagination: {
      type: Boolean,
      default: true
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
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    useEmptySlot: {
      type: Boolean,
      default: false
    },

    startOrder: {
      type: Object,
      required: false
    },

    isSelectedAll: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState(['isMobile']),

    defaultContactDateFilter () {
      if (this.currentCompany.default_contact_date_filter === DefaultContactDateFilter.DEFAULT_CONTACT_DATE_FILTER_CREATED_AT) {
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
      return this.useEmptySlot
    },

    fixedColumns () {
      const newItems = JSON.parse(JSON.stringify(this.columns))

      // does not need to reference contacts
      if (!['Contacts', 'Power Dialer'].includes(this.$route.name)) {
        return newItems
      }

      // now, check if columns have order, label, maxWidth or minWidth property, or
      // check if column is required then update sortable.
      for (const index in newItems) {
        const found = ALL_COLUMNS.find(col => col.name === newItems[index].name)
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
    },

    maxPaginationPages () {
      if (this.$q.screen.xl) {
        return 11
      }

      if (this.$q.screen.lg) {
        return 7
      }

      return 3
    },

    scrollableAreaClasses () {
      let isDefault = this.$route.name === 'Contacts' || this.$route.name === 'Contact'
      let optScroll = `scrollableArea ${isDefault ? '' : 'scroll-type-1'} position-relative `

      return [
        `${this.isScrollable ? optScroll : ' '}d-flex flex-column h-100 w-100 flex-grow-1`,
        this.scrollAreaClass,
        `${this.isMobile ? 'mobile-scrollableArea' : ''}`
      ]
    },

    customSortOptions () {
      return this.$route.meta.title === 'Power Dialer'
    },

    defaultPlaceholderMessage () {
      if (this.$route.name === 'Contacts' || this.$route.name === 'Contact') {
        return 'No contacts found based on the current filters'
      }

      return 'No contacts found on the current list'
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
      hoverKey: null,
      moveColor: '#4F4F4F',
      column: null,
      scrollTimeout: null,
      lastScrollTop: 0
    }
  },

  methods: {
    ...mapActions(['setDefaultDateFilter']),

    resetScroll () {
      this.$refs.scrollableArea.scrollTop = 0
      this.lastScrollTop = this.$refs.scrollableArea.scrollTop
    },

    handleScroll (element) {
      // detect scroll direction; don't trigger api call if scroll direction is up
      if (element.srcElement.scrollTop < this.lastScrollTop) {
        this.onVisibilityChanged(false)
        return
      }

      if ((element.srcElement.clientHeight + element.srcElement.scrollTop) >= element.srcElement.offsetHeight) {
        this.lastScrollTop = element.srcElement.scrollTop
        this.onVisibilityChanged(true)
        return
      }

      if (this.isLoaderVisible) {
        this.onVisibilityChanged(false)
      }
    },

    onResizeMouseMove (evt) {
      if (this.column) {
        const index = { i: 0 }
        for (index.i = 0; index.i < evt.pageX; index.i++) {
          requestAnimationFrame(() => {
            if (this.column) {
              this.column.style.minWidth = `${this.startOffset + index.i}px`
              this.column.style.maxWidth = `${this.startOffset + index.i}px`
            }
          })
        }
      }
    },

    onResizerMouseUp () {
      this.column = null
      this.startOffset = 0
      document.body.style.cursor = ''
    },

    onResizerMouseDown (evt) {
      this.column = evt.target.parentNode
      this.startOffset = this.column.offsetWidth - evt.pageX
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
      let sorts = Object.assign({}, this.getColumnSorts(column))
      setTimeout(() => {
        this.$emit('sort', sorts)
      }, 100)
    },

    getColumnSorts (column) {
      this.setDefaultDateFilter(column.name)
      let order = this.sorts.order === 'asc' ? 'desc' : 'asc'

      if (this.customSortOptions) {
        switch (this.sorts.order) {
          case 'asc':
            order = 'desc'
            break
          case 'desc':
            order = ''
            break
          default:
            order = 'asc'
            break
        }
      }

      // if there's a change in the selected column to be sorted,
      // default order should be ascending
      if (column.name !== this.sorts.orderBy) {
        order = 'asc'
      }

      this.sorts = {
        orderBy: column.name,
        order: order
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

      // detect scroll direction; don't trigger api call if scroll direction is up
      if (this.$refs.scrollableArea.scrollTop < this.lastScrollTop) {
        return
      }

      clearTimeout(this.scrollTimeout)
      // Set a timeout to run after scrolling ends
      this.scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.isLoaderVisible && !this.isEmpty) {
          this.$emit('more')
        }
      }, 66)
    },

    onInitReorder (value, key) {
      this.moveColor = value ? '#256eff' : '#4F4F4F'
      this.isHovering = value
      this.hoverKey = key
    }
  },

  mounted () {
    if (this.$refs.scrollableArea) {
      this.lastScrollTop = this.$refs.scrollableArea.scrollTop
      this.$refs.scrollableArea.addEventListener('scroll', this.onScroll)
    }

    // apply a custom starting order if defined
    if (this.startOrder) {
      this.sorts = this.startOrder
    } else {
      this.sorts.orderBy = this.defaultContactDateFilter
      this.sorts.order = this.customSortOptions ? '' : 'desc'
    }
    document.addEventListener('mouseup', this.onResizerMouseUp)
    document.addEventListener('mousemove', this.onResizeMouseMove)
  },

  beforeDestroy () {
    clearTimeout(this.scrollTimeout)
    this.resetScroll()
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
    },

    sorts (newVal, oldVal) {
      if (newVal.orderBy !== oldVal.orderBy) {
        this.sorts.order = 'asc'
      }
    },

    isLoading: function () {
      if (this.isLoading) {
        this.resetScroll()
      }
    }
  }
}
</script>
