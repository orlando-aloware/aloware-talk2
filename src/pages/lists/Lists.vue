<template>
  <div class="h-100">
    <div class="lists__home position-relative d-flex flex-column h-100">
      <div class="lists__home__table flex-grow-1">
        <div class="lists__home__table flex-grow-1">
          <datatable class="h-100"
                     ref="listsTable"
                     use-empty-slot
                     :sticky-headers="true"
                     :columns="fixedColumns"
                     :is-empty="isListsTableEmpty"
                     :show-select-all="false"
                     :paginated="true"
                     :show-pagination="true"
                     :last-page="pagination.totalPages"
                     :current-page="pagination.currentPage"
                     :total-rows="listsCount"
                     :loading="loading">
            <template slot="tbody">
              <tr :key="rowIndex"
                  v-for="(row, rowIndex) in lists">
                <template v-for="(col, colIndex) in fixedColumns">
                  <td :key="`c-${colIndex}`"
                      v-if="col.name === 'name'">
                    <span>
                      {{ row['name'] }}
                      <q-tooltip anchor="top middle"
                                 self="top end"
                                 :offset="[0, 40]"
                                 v-if="row['name'].length > 54">
                        {{ row['name'] }}
                      </q-tooltip>
                    </span>
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'date_created'">
                    <relative-time humanized
                                   :from-time="row[col.field]" />
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'no_of_contacts'">
                    {{ row[col.field] }}
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'type'">
                    {{ getContactListType(row) }}
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'show_in_public_folder'">
                    {{ row[col.field] }}
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'source'">
                    {{ row[col.field] }}
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'import_status'">
                    {{ row[col.field] }}
                  </td>

                  <td :key="`c-${colIndex}`"
                      v-else-if="col.name === 'imported_at'">
                      <relative-time humanized
                                     :from-time="row[col.field]"
                                     v-if="row[col.field]" />
                      <span v-else>-</span>
                  </td>

                  <td :key="`c-${colIndex}`"
                    :class="col.stickyRight ? 'sticky-right' : ''"
                    v-else-if="col.field === 'actions'">
                    <div class="context-menu keep-visible">
                      <b-dropdown class="position-absolute"
                                  size="sm"
                                  container="body"
                                  right
                                  :style="{ 'margin-top': '-0.9rem', right: '0.5rem' }"
                                  :id="getContextMenuTargetElementId(row)"
                                  @show="onContextMenuShow(row)"
                                  @hide="onContextMenuHide(row)">
                        <template #button-content>
                          <ellipse-icon/>
                        </template>
                        <b-dropdown-item dense
                                        clickable
                                        :key="id"
                                        :disabled="!shouldAllowContextMenuButton(item, row)"
                                        v-for="(item, id) in contextMenuListItemsForSelectedRow"
                                        @click="onContextMenuButtonClicked(item, row)">
                          <div class="d-flex align-items-center">
                            <template v-if="item.name === 'delete'">
                              <delete-red-icon class="mr-2" />
                            </template>
                            <template v-else>
                              <img class="mr-2"
                                  :src="`app-icons/menu/${item.icon}`" />
                            </template>
                            <span :class="[item.name === 'delete' ? 'text-danger' : '']">
                              {{ item.label }}
                            </span>
                          </div>
                        </b-dropdown-item>
                      </b-dropdown>
                    </div>
                  </td>
                </template>
              </tr>
            </template>
            <template #empty>
              <div class="lists__home__table--empty"
                  v-if="isListsTableEmpty && !loading">
                <div class="h5 px-2 text-center">No data</div>
              </div>
            </template>
          </datatable>
        </div>
      </div>
    </div>
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
