<template>
  <div class="tags position-relative">
    <div class="tags__header d-flex justify-between p-3">
      <!-- search -->
      <div>
        <search placeholder="Search ID or name"
                class="width-260"
                :search="search"
                @search="onSearch">
        </search>
      </div>

      <!-- category tabs -->
      <div>
        <tags-tabs :categories-count="tagCategoriesCount"
                   @loadTags="loadTags">
        </tags-tabs>
      </div>

      <div class="d-flex">
        <!-- add tag -->
        <b-button class="mr-1"
                  size="sm"
                  variant="primary"
                  @click="openTagForm">
          <i class="fa fa-plus"></i> Add {{ tagCategoryName }} Tag
        </b-button>

        <!-- help -->
        <b-button id="tags-helper"
                  class="btn-light align-items-center"
                  size="sm"
                  variant="light">
          <i class="large material-icons mr-1">help_outline</i> Help
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
      </div>
    </div>

    <!-- loading spinner -->
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="isLoading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <!-- table -->
    <tags-table :tags="tags"
                :is-loading="isLoading"
                :is-loading-refresh-count="isLoadingRefreshCount"
                :pagination="pagination"
                @paginated="paginate"
                @sort="sort"
                @editTag="editTag"
                @updateTagCount="updateTagCount"/>

    <tag-form :is-show="isOpenTagForm"
              :tag-category="selectedTagCategory"
              :editable-tag="tag"
              @closeTagForm="closeTagForm"/>

    <!--<delete-tag-dialog :is-show="isOpenDeleteTagDialog"-->
    <!--                   :tag="toDeleteTag"-->
    <!--                   @closeDeleteTagDialog="closeDeleteTagDialog"-->
    <!--                   @deleteTagFinal="deleteTag"/>-->
  </div>
</template>

<script>
import Search from 'components/search'
import TagsTabs from 'components/tags/tags-tabs'
import axios from 'axios'
import TagsTable from 'components/tags/tags-table.vue'
import { debounce } from 'lodash'
import TagForm from 'components/tags/tag-form.vue'
import { tagsMixin } from 'src/plugins/mixins'

export default {
  name: 'Tags',

  components: {
    TagForm,
    TagsTable,
    TagsTabs,
    Search
  },

  mixins: [
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
      tag: null
    }
  },

  created () {
    this.getTagCategoriesCount()
    this.getTags()
  },

  mounted () {
    this.$VueEvent.listen('tag_created', (data) => {
      this.getTagCategoriesCount(data.category)
      this.getTags()
    })

    this.$VueEvent.listen('tag_updated', (data) => {
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
    })

    this.$VueEvent.listen('tag_deleting', () => {
      this.getTags()
    })

    this.$VueEvent.listen('contact_list_bulk_created', (data) => {
      if (data.items_count > 0) {
        const verb = data.items_count > 1 ? 'tasks have' : 'task has'
        this.$generalNotification(`${data.items_count} ${verb} been added`)
      }
    })
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

    loadTags () {
      this.reloadData()
      this.resetPaginationAndSearch()
      this.getTags()
    },

    getTagCategoriesCount (category = null) {
      switch (category) {
        case this.CommunicationTags:
          this.tagCategoriesCount.communications = this.getCommunicationTagsCount() ?? 0
          break

        case this.ContactTags:
          this.tagCategoriesCount.contacts = this.getContactTagsCount() ?? 0
          break

        default:
          console.log(this.getCommunicationTagsCount())
          this.tagCategoriesCount.communications = this.getCommunicationTagsCount() ?? 0
          this.tagCategoriesCount.contacts = this.getContactTagsCount() ?? 0
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

    getTags: debounce(function () {
      this.isLoading = true
      this.tags = []
      const { page, perPage, orderBy, order } = this.pagination

      axios.get(`/api/v1/tag-new?category=${this.selectedTagCategory}&search_text=${this.search}&per_page=${perPage}&order_by=${orderBy}&order=${order}&page=${page}`)
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
      axios.get(`/api/v1/tag/${tagId}`).then(res => {
        const parsedTags = this.$jsonClone(this.tags)
        const index = parsedTags.findIndex(item => item.id === res.data.id.id)
        parsedTags[index] = res.data
        this.tags = parsedTags

        this.isLoadingRefreshCount = false
      }).catch(err => {
        console.log(err)
        this.$root.handleErrors(err.response)
        this.isLoadingRefreshCount = false
      })
    }
  }
}
</script>
