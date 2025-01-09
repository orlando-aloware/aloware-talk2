<template>
  <div class="lists-container flex-grow-1 d-flex flex-column">
    <h3 class="title pl-3">
      {{ title }}
    </h3>
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
            <div v-else-if="col.name === 'actions'">
              <div class="d-flex justify-content-center context-menu">
                <b-dropdown no-caret
                            size="sm"
                            center>
                  <template #button-content>
                    <ellipse-icon />
                  </template>
                  <b-dropdown-item dense
                                   clickable
                                   @click="onRenameList(props.row)">
                    <span class=""><edit-pen-icon /> Rename</span>
                  </b-dropdown-item>
                  <b-dropdown-item dense
                                   clickable
                                   @click="onDeleteList(props.row)">
                    <span class="text-danger"><delete-red-icon /> Delete</span>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
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

    <lists-rename-form :is-show="isOpenListForm"
                       :editable-list="list"
                       data-testid="lists-form"
                       @closeListForm="closeListForm"
                       @listUpdated="listUpdated"/>
  </div>
</template>

<script>
import RelativeTime from 'src/components/relative-time.vue'
import { COLUMNS } from 'src/constants/lists/home-columns'
import EllipseIcon from 'components/icons/ellipse-icon'
import EditPenIcon from 'components/icons/edit-pen-icon.vue'
import DeleteRedIcon from 'components/icons/delete-red-icon.vue'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import ListsRenameForm from 'src/components/lists/lists-rename-form'
import { dataTableMixin } from 'src/plugins/mixins'

export default {
  name: 'ListsTable',

  props: {
    title: {
      type: String,
      default: 'Lists'
    }
  },

  mixins: [
    dataTableMixin
  ],

  components: {
    RelativeTime,
    EllipseIcon,
    ListsRenameForm,
    EditPenIcon,
    DeleteRedIcon
  },

  data () {
    return {
      loading: false,
      COLUMNS,
      isLoadingMore: false,
      isLoading: false,
      pagination: {
        rowsPerPage: 0,
        rowsNumber: this.listsCount,

        perPage: 30,
        totalPages: 1,
        currentPage: 1
      },
      listsData: [],

      isOpenListForm: false,
      list: null
    }
  },

  async mounted () {
    await this.getLists()
    this.calculateTotalPages()
    this.listsData = this.lists
  },

  computed: {
    ...mapState('listsModule', [
      'isListsLoading'
    ]),
    ...mapGetters('listsModule', {
      lists: 'getLists',
      listsCount: 'getListsCount'
    }),

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

    fixedColumns () {
      const allColumns = this.$jsonClone(this.COLUMNS)
      return this.getResponsiveColumns(allColumns, this.columnsByViewport)
    }
  },

  methods: {
    ...mapActions('listsModule', [
      'fetchLists',
      'deleteList'
    ]),

    ...mapMutations('listsModule', [
      'SET_SEARCH',
      'SET_LISTS_COUNT'
    ]),

    openListForm () {
      this.isOpenListForm = true
    },

    closeListForm () {
      this.isOpenListForm = false

      // Fix submit button label slight glitch upon closing
      setTimeout(() => {
        this.list = null
      }, 200)
    },

    getContactListType (contactList) {
      switch (contactList.type) {
        case ContactListTypes.STATIC:
          return 'Static'
        case ContactListTypes.DYNAMIC:
          return 'Dynamic'
        case ContactListTypes.DYNAMIC_REMOTE_LIST:
          return 'Integration Dynamic'
        default:
          return 'Unknown'
      }
    },

    calculateTotalPages () {
      if (this.lists?.length === 0) {
        this.pagination.totalPages = 1
        return
      }

      this.pagination.totalPages = Math.ceil(this.listsCount / this.pagination.perPage)
    },

    getLists (isLoadMore = false) {
      if (this.isLoading) {
        return
      }

      if (!isLoadMore) {
        this.isLoading = true
        this.pagination.currentPage = 1
        this.listsData = []
      } else {
        this.isLoadingMore = true
      }

      return this.fetchLists({
        page: this.pagination.currentPage,
        perPage: this.pagination.perPage
      })
        .finally(() => {
          this.isLoading = false
          this.isLoadingMore = false
        })
    },

    removeList (list) {
      this.deleteList(list.id)
        .then(() => {
          this.SET_LISTS_COUNT(this.listsCount - 1)
          this.listsData = this.listsData.filter(item => item.id !== list.id)

          this.$generalNotification(`${list.name} list has been successfully deleted.`)
        })
        .catch((err) => {
          console.log(err)
          this.$generalNotification('Something went wrong while deleting list.', 'error')
        })
    },

    async onScroll ({ to, ref }) {
      const lastIndex = this.listsData.length - 1
      if (!this.isLoadingMore && this.pagination.currentPage < this.pagination.totalPages && to === lastIndex) {
        await this.loadMoreLists()
        ref.refresh()
      }
    },

    async loadMoreLists (done) {
      if (!this.isLoadingMore && this.pagination.currentPage < this.pagination.totalPages) {
        this.pagination.currentPage += 1
        await this.getLists(true)
        this.listsData.push(...this.lists)

        if (typeof done === 'function') {
          done()
        }
      } else {
        if (typeof done === 'function') {
          done()
        }
      }
    },

    onDeleteList (list) {
      this.$bvModal.msgBoxConfirm('Are you sure you want to delete this contact list? This action is irreversible.', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'No',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.removeList(list)
        }
      })
    },

    onRenameList (list) {
      this.list = list
      this.openListForm()
    },

    listUpdated (list) {
      const { id, name } = list

      this.listsData = this.listsData.map(item => {
        if (item.id === id) {
          item.name = name
        }

        return item
      })
    }
  }
}
</script>
