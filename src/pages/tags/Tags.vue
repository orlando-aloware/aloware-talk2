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
        <tags-tabs :selectedTagCategory="tagCategory"
                   :tagCategoriesCount="tagCategoriesCount"
                   @loadTags="loadTags">
        </tags-tabs>
      </div>

      <div class="d-flex">
        <!-- add tag -->
        <b-button class="mr-1"
                  size="sm"
                  variant="primary">
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
    <tags-table :category="tagCategory"
                :tags="tags"
                :isLoading="isLoading"
                :pagination="pagination"
                @paginated="paginate"
                @sort="sort" />

  </div>
</template>

<script>
import Search from 'components/search'
import TagsTabs from 'components/tags/tags-tabs'
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import axios from 'axios'
import TagsTable from 'components/tags/tags-table.vue'
import { debounce } from 'lodash'
export default {
  name: 'Tags',

  components: {
    TagsTable,
    TagsTabs,
    Search
  },

  data () {
    return {
      search: '',
      isLoading: false,
      tags: [],
      tagCategory: TAG_CATEGORIES.CAT_COMMUNICATIONS,
      tagCategoriesCount: {
        communications: 0,
        contacts: 0
      },
      pagination: {
        currentPage: 1,
        perPage: 25,
        orderBy: 'id',
        order: 'desc',
        lastPage: 1,
        page: 1,
        total: 0
      }
    }
  },

  created () {
    this.getTagCategoriesCount()
    this.getTags()
  },

  computed: {
    tagCategoryName () {
      switch (this.tagCategory) {
        case TAG_CATEGORIES.CAT_CONTACTS:
          return 'Contact'

        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          return 'Communication'
      }

      return ''
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

    loadTags (tagCategory) {
      this.reloadData()
      this.resetPaginationAndSearch()
      this.tagCategory = +tagCategory
      this.getTags()
    },

    getTagCategoriesCount () {
      this.tagCategoriesCount.communications = 809
      this.tagCategoriesCount.contacts = 30
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

      axios.get(`/api/v1/tag-new?category=${this.tagCategory}&search_text=${this.search}&per_page=${perPage}&order_by=${orderBy}&order=${order}&page=${page}`)
        .then(res => {
          this.isLoading = false
          this.tags = res.data.data
          this.pagination.page = res.data.current_page
          this.pagination.currentPage = res.data.current_page
          this.pagination.lastPage = res.data.last_page
          this.pagination.perPage = res.data.per_page
          this.pagination.total = res.data.total
        })
        .catch(err => {
          console.log(err)
        })
    }, 500),

    resetPaginationAndSearch () {
      // reset everything except per page
      this.pagination.currentPage = 1
      this.pagination.orderBy = 'id'
      this.pagination.order = 'desc'
      this.pagination.lastPage = 1
      this.pagination.page = 1
      this.pagination.total = 0
      this.search = ''
    }
  }
}
</script>
