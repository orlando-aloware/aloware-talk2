<template>
  <div class="tags position-relative h-100 d-flex"
       v-if="authenticated">
    <div class="h-100 w-100 d-flex flex-column">
      <b-row class="tags__header d-flex px-1 py-3">
        <!-- search -->
        <b-col class="d-flex align-self-center">
          <search placeholder="Search ID or name"
                  class="width-300"
                  :search="search"
                  @search="onSearch">
          </search>
        </b-col>

        <!-- category tabs -->
        <b-col class="d-flex align-self-center justify-around">
          <tags-tabs :categories-count="tagCategoriesCount"
                     @loadTags="loadTags">
          </tags-tabs>
        </b-col>

        <!-- add|help buttons -->
        <b-col class="d-flex align-self-center justify-content-end row">
          <!-- add tag -->
          <b-button class="mr-1"
                    size="sm"
                    variant="primary"
                    :title="`Add ${ tagCategoryName } Tag`"
                    @click="openTagForm">
            <i class="fa fa-plus"></i>
            <span v-show="!$q.screen.sm && !$q.screen.md"> Add {{ tagCategoryName }} Tag</span>
          </b-button>

          <!-- help -->
          <b-button id="tags-helper"
                    class="btn-light align-items-center"
                    size="sm"
                    title="Help"
                    variant="light">
            <i class="large material-icons mr-1">help_outline</i>
            <span v-show="!$q.screen.sm && !$q.screen.md"> Help</span>
          </b-button>
          <b-popover custom-class="tags__helper__popover"
                     target="tags-helper"
                     placement="bottomleft"
                     title="What are Tags?"
                     width="300"
                     triggers="click blur">
            <div>
              <p>Tags help you categorize and segment your audience in a way like Lists, but with the added benefit of having the same person in multiple places.</p>
              <p>The entire audience of a Tag can be enrolled in a sequence. Your contact imports show up as a new tag with the date of upload.</p>
            </div>
          </b-popover>
        </b-col>
      </b-row>

       <!-- loading spinner -->
      <b-overlay class="h-100 w-100 d-flex flex-column overflow-hidden"
                 rounded="sm"
                 :show="isLoading">
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px" />
        </template>

        <!-- bulk actions -->
        <div class="row mx-0 relative-position"
            v-if="hasRole('Company Admin')">
          <tags-bulk-action-menu v-if="hasSelectedTagIds && this.tags.length"
                                 @reloadTags="getTags" />
        </div>

        <!-- table -->
        <tags-table :tags="tags"
                    :is-loading="isLoading"
                    :is-loading-refresh-count="isLoadingRefreshCount"
                    :pagination="pagination"
                    @paginated="paginate"
                    @sort="sort"
                    @editTag="editTag"
                    @updateTagCount="updateTagCount" />

        <tag-form :is-show="isOpenTagForm"
                  :tag-category="selectedTagCategory"
                  :editable-tag="tag"
                  @closeTagForm="closeTagForm" />
      </b-overlay>
    </div>
  </div>
</template>

<script>
import Search from 'components/search'
import TagsTabs from 'components/tags/tags-tabs'
import axios from 'axios'
import TagsTable from 'components/tags/tags-table.vue'
import { debounce } from 'lodash'
import TagForm from 'components/tags/tag-form.vue'
import { aclMixin, tagsMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import TagsBulkActionMenu from 'components/tags-bulk-action-menu.vue'

export default {
  name: 'Tags',

  components: {
    TagsBulkActionMenu,
    TagForm,
    TagsTable,
    TagsTabs,
    Search
  },

  mixins: [
    aclMixin,
    tagsMixin
  ],

  data () {
    return {
      search: '',
      isLoading: false,
      isLoadingRefreshCount: false,
      tags: [],
      pagination: {
        currentPage: 1,
        perPage: 25,
        orderBy: 'updated_at',
        order: 'desc',
        lastPage: 1,
        page: 1,
        total: 0
      },
      isOpenTagForm: false,
      tag: null,
      listeners: {
        tagCreated: null,
        tagUpdated: null,
        tagDeleting: null,
        contactListBulkCreated: null
      },
      cancelToken: null,
      source: null,
      oldTagCategory: null
    }
  },

  created () {
    this.setSelectedTagCategory(this.ContactTags)
    this.oldTagCategory = this.selectedTagCategory
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()

    this.getTagCategoriesCount()
    this.getTags()
  },

  mounted () {
    // tag created event
    this.listeners.tagCreated = (data) => {
      this.getTagCategoriesCount(data.category)
      this.getTags()
    }

    // tag updated event
    this.listeners.tagUpdated = (data) => {
      const parsedTags = this.$jsonClone(this.tags)
      const index = parsedTags.findIndex(item => item.id === data.id)

      // update tag details on that index
      if (index > -1) {
        // get count data from table
        switch (data.category) {
          case this.CommunicationTags:
            data.communications_count = parsedTags[index].communications_count
            break

          case this.ContactTags:
            data.contacts_count = parsedTags[index].contacts_count
        }

        parsedTags[index] = data
        this.tags = parsedTags
      }
    }

    // tag delete event
    this.listeners.tagDeleting = (data) => {
      this.getTagCategoriesCount(data.category)
      this.getTags()
    }

    this.listeners.bulkTagsDeleted = (data) => {
      this.$generalNotification(data.message)
      this.getTagCategoriesCount(data.category)
      this.getTags()
    }

    // contact tags - add to pd event
    this.listeners.contactListBulkCreated = (data) => {
      if (data.user_id === this.profile.id && data.items_count > 0) {
        const verb = data.items_count > 1 ? 'tasks have' : 'task has'
        this.$generalNotification(`${data.items_count} ${verb} been added`)
      }
    }

    this.$VueEvent.listen('tag_created', this.listeners.tagCreated)
    this.$VueEvent.listen('tag_updated', this.listeners.tagUpdated)
    this.$VueEvent.listen('tag_deleting', this.listeners.tagDeleting)
    this.$VueEvent.listen('bulk_tags_deleted', this.listeners.bulkTagsDeleted)
    this.$VueEvent.listen('contact_list_bulk_created', this.listeners.contactListBulkCreated)
  },

  computed: {
    ...mapState('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('tagsModule', [
      'selectedTagCategory',
      'selectedTagIds'
    ]),

    oldCategoryName () {
      return this.getTagCategoryName(this.oldTagCategory)
    }
  },

  methods: {
    onSearch (value) {
      this.search = value.trim()
      this.getTags()
    },

    reloadData () {
      this.isLoading = true
      this.tags = []
    },

    loadTags (oldTagCategory) {
      this.oldTagCategory = oldTagCategory
      this.source.cancel(`Loading of ${this.oldCategoryName} tags operation is canceled by the user.`)
      this.source = this.cancelToken.source()

      this.reloadData()
      this.resetPaginationAndSearch()
      this.getTagCategoriesCount(this.oldTagCategory)
      this.getTags({
        cancelToken: this.source.token
      })
    },

    getTagCategoriesCount (category = null) {
      switch (category) {
        case this.CommunicationTags:
          this.getCommunicationTagsCount()
          break

        case this.ContactTags:
          this.getContactTagsCount()
          break

        default:
          this.getCommunicationTagsCount()
          this.getContactTagsCount()
      }
    },

    paginate (pagination) {
      this.pagination.page = pagination.page
      this.pagination.perPage = pagination.per_page
      this.getTags()
    },

    sort (sorts) {
      this.pagination.order = sorts.order
      this.pagination.orderBy = sorts.orderBy
      this.getTags()
    },

    getTags: debounce(function (params = {}) {
      this.isLoading = true
      this.tags = []
      const { page, perPage, orderBy, order } = this.pagination

      axios.get(`/api/v1/tag-new?category=${this.selectedTagCategory}&search_text=${this.search}&per_page=${perPage}&order_by=${orderBy}&order=${order}&page=${page}`, params)
        .then(res => {
          this.isLoading = false
          this.tags = res.data.data
          this.pagination.page = res.data.current_page
          this.pagination.currentPage = res.data.current_page
          this.pagination.lastPage = res.data.last_page
          this.pagination.perPage = res.data.per_page
          this.pagination.total = res.data.total

          // update tab count badge
          switch (this.selectedTagCategory) {
            case this.CommunicationTags:
              this.tagCategoriesCount.communications = res.data.total
              break

            case this.ContactTags:
              this.tagCategoriesCount.contacts = res.data.total
              break
          }
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    }, 500),

    resetPaginationAndSearch () {
      // reset everything except per page
      this.pagination.currentPage = 1
      this.pagination.orderBy = 'updated_at'
      this.pagination.order = 'desc'
      this.pagination.lastPage = 1
      this.pagination.page = 1
      this.pagination.total = 0
      this.search = ''
    },

    openTagForm () {
      this.isOpenTagForm = true
    },

    closeTagForm () {
      this.isOpenTagForm = false

      // Fix submit button label slight glitch upon closing
      setTimeout(() => {
        this.tag = null
      }, 200)
    },

    editTag (tag) {
      this.tag = tag
      this.openTagForm()
    },

    updateTagCount (tagId) {
      this.isLoadingRefreshCount = true

      axios.get(`/api/v1/tag/${tagId}`)
        .then(res => {
          const parsedTags = this.$jsonClone(this.tags)
          const index = parsedTags.findIndex(item => item.id === res.data.id.id)

          parsedTags[index] = res.data
          this.tags = parsedTags

          this.isLoadingRefreshCount = false
        })
        .catch(err => {
          this.$handleErrors(err.response)
          this.isLoadingRefreshCount = false
          console.log(err)
        })
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('tag_created', this.listeners.tagCreated)
    this.$VueEvent.stop('tag_updated', this.listeners.tagUpdated)
    this.$VueEvent.stop('tag_deleting', this.listeners.tagDeleting)
    this.$VueEvent.stop('bulk_tags_deleted', this.listeners.bulkTagsDeleted)
    this.$VueEvent.stop('contact_list_bulk_created', this.listeners.contactListBulkCreated)
  }
}
</script>
