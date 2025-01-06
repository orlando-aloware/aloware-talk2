<template>
  <div class="lists-container flex-grow-1 d-flex flex-column">
    <div class="count  pl-3">
      <strong v-if="!isLoading">{{ listsCount }} Lists</strong>
      <q-spinner-bars class="mr-1"
                      color="primary"
                      size="14px"
                      v-else />
    </div>

    <q-table class="lists-table flex-grow-1"
             row-key="index"
             virtual-scroll
             :data="listsData"
                     :columns="fixedColumns"
             :loading="isLoadingMore || isLoading"
             :virtual-scroll-item-size="100"
             :virtual-scroll-sticky-size-start="100"
             :pagination="pagination"
             :rows-per-page-options="[0]"
             @virtual-scroll="onScroll">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props"
                :key="col.name"
                v-for="col in props.cols">
            <div v-if="col.name === 'name'">
              {{ props.row.name }}
            </div>
            <div v-else-if="col.name === 'date_created'">
              <relative-time humanized
                             :from-time="props.row[col.field]" />
            </div>
            <div v-else-if="col.name === 'no_of_contacts'">
              {{ props.row.no_of_contacts }}
            </div>
            <div v-else-if="col.name === 'type'">
              {{ getContactListType(props.row) }}
            </div>
            <div v-else-if="col.name === 'show_in_public_folder'">
              {{ props.row.show_in_public_folder }}
            </div>
            <div v-else-if="col.name === 'source'">
              <span v-if="props.row.source_name">
                {{ props.row.source_name | ucwords }}
                    </span>
                      <span v-else>-</span>
            </div>
            <div v-else-if="col.name === 'import_status'">
              <span v-if="props.row.import_status_name">
                {{ props.row.import_status_name | ucwords }}
                            </span>
              <span v-else>-</span>
                          </div>
            <div v-else-if="col.name === 'imported_at'">
              <relative-time humanized
                             :from-time="props.row[col.field]"
                             v-if="props.row[col.field]" />
              <span v-else>-</span>
                    </div>
          </q-td>
        </q-tr>
                </template>

      <template v-slot:loading>
        <div class="d-flex justify-center">
          <q-spinner-bars color="primary"
                          size="30px" />
              </div>
            </template>

      <template v-slot:no-data>
        <div class="w-100 text-center"
             v-if="!isLoadingMore && !isLoading">
          <h2> No data </h2>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import Datatable from 'src/components/datatable.vue'
import EllipseIcon from 'components/icons/ellipse-icon.vue'
import RelativeTime from 'src/components/relative-time.vue'
import { COLUMNS } from 'src/constants/lists/home-columns'
import * as ContactListTypes from 'src/constants/lists/types'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { dataTableMixin } from 'src/plugins/mixins'

export default {
  name: 'Lists',

  components: {
    Datatable,
    EllipseIcon,
    RelativeTime
  },

  mixins: [
    dataTableMixin
  ],

  data () {
    return {
      loading: false,
      listsSearchText: '',
      pagination: {
        perPage: 25,
        totalPages: 1,
        currentPage: 1
      },
      COLUMNS,
      contextMenuTargetId: null,
      contextMenuOpen: false,
      popupOpen: false,
      popupAction: '',
      popupActionList: [],
      popupLoadingAction: false,
      popupRename: ''
    }
  },

  async mounted () {
    await this.getLists()

    console.log('Fetched lists', this.lists)
  },

  computed: {
    ...mapState('listsModule', [
      'isListsLoading'
    ]),
    ...mapGetters('listsModule', {
      lists: 'getLists',
      listsCount: 'getListsCount'
    }),

    contextMenuListItems () {
      return [
        {
          name: 'rename',
          label: 'Rename',
          icon: 'context-menu-rename.svg'
        }
      ]
    },

    contextMenuTarget () {
      return this.contextMenuTargetId ? '#' + this.getContextMenuTargetElementId({ id: this.contextMenuTargetId }) : ''
    },

    contextMenuListItemsForSelectedRow () {
      if (!this.contextMenuTargetId) {
        return this.contextMenuListItems
      }

      const list = this.lists.find(item => item.id === this.contextMenuTargetId)

      if (!list) {
        return []
      }

      return this.contextMenuListItems.filter(item => this.shouldShowContextMenuItem(item, list))
    },

    columnsByViewport () {
      return {
        mobile: [
          'name',
          'actions'
        ],
        tablet: [
          'name',
          'no_of_contacts',
          'actions'
        ],
        smallDesktop: [
          'name',
          'no_of_contacts',
          'import_status',
          'type',
          'actions'
        ],
        mediumDesktop: [
          'name',
          'date_created',
          'no_of_contacts',
          'type',
          'show_in_public_folder',
          'source',
          'import_status',
          'actions'
        ],
        largeDesktop: [
          'name',
          'date_created',
          'no_of_contacts',
          'type',
          'show_in_public_folder',
          'source',
          'import_status',
          'imported_at',
          'actions'
        ],
        extraLargeDesktop: [
          'name',
          'date_created',
          'no_of_contacts',
          'type',
          'show_in_public_folder',
          'source',
          'import_status',
          'imported_at',
          'actions'
        ]
      }
    },

    isListsTableEmpty () {
      return this.lists.length === 0
    },

    fixedColumns () {
      const allColumns = this.$jsonClone(this.COLUMNS)
      return this.getResponsiveColumns(allColumns, this.columnsByViewport)
    }
  },

  methods: {
    ...mapActions('listsModule', [
      'fetchLists'
    ]),

    ...mapMutations('listsModule', [
      'SET_SEARCH'
    ]),

    getContactListType (contactList) {
      switch (contactList.type) {
        case ContactListTypes.STATIC_LIST:
          return 'Static'
        case ContactListTypes.DYNAMIC_LIST:
          return 'Dynamic'
        case ContactListTypes.DYNAMIC_REMOTE_LIST:
          return 'Integration Dynamic'
        default:
          return 'Unknown'
      }
    },

    shouldAllowContextMenuButton (item, list) {
      if (item.name === 'delete') {
        return (this.isAdmin || this.isSupervisor)
      }

      return true
    },

    shouldShowContextMenuItem (item, list) {
      return true
    },

    calculateTotalPages () {
      if (this.lists?.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.listsCount / this.pagination.perPage)
    },

    getLists () {
      return this.fetchLists({
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage
      })
    },

    onContextMenuShow (row) {
      this.contextMenuOpen = true
      this.contextMenuTargetId = row.id
    },

    onContextMenuHide () {
      this.contextMenuOpen = false

      if (!this.popupOpen) {
        this.contextMenuTargetId = null
      }
    },

    onContextMenuButtonClicked (item, list) {
      const lists = [list]
      this.popupActionList = lists

      switch (item.name) {
        case 'rename':
          this.popupRename = list.name
          this.popupOpen = true
          this.popupAction = 'rename'
          break
        case 'delete':
          this.popupOpen = true
          this.popupAction = 'delete'
          break
        // case 'activity':
        //   this.showBroadcastActivity(broadcasts)
        //   break
        // case 'play':
        //   this.popupAction = 'play'
        //   this.popupOpen = true
        //   break
        // case 'pause':
        //   this.popupAction = 'pause'
        //   this.popupOpen = true
        //   break
      }
    },

    getContextMenuTargetElementId (row) {
      return `context-menu-btn-${row.id}`
    }
  },

  watch: {
    lists () {
      this.calculateTotalPages()
    }//,

    // listsFilter (data) {
    //   this.SET_STATUS(data)
    //   this.getLists()
    // },

    // listsSearchText (search) {
    //   this.SET_SEARCH(search)
    //   this.getLists()
    // }
  }
}
</script>
