<template>
  <div class="tags position-relative">
    <div class="d-flex tags-header">
      <!-- search -->
      <div>
        <search
          class="width-260"
          limitSearchCharacters
          :search="search"
          @search="onSearch">
        </search>
      </div>

      <!-- category tabs -->
      <div>
        <tags-tabs :selectedTagCategory="tagCategory"
                   @loadTags="loadTags">
        </tags-tabs>
      </div>

      <div class="d-flex">
        <!-- add tag -->
        <b-button class="btn-blue align-items-center"
                  size="sm"
                  variant="light">
          <i class="fa fa-plus"></i> Add {{ tagCategoryName }} Tag
        </b-button>

        <!-- help -->
        <b-button id="tag-helper"
                  class="btn-light align-items-center"
                  size="sm"
                  variant="light">
          <i class="fa fa-question-circle"></i> Help
        </b-button>
        <b-popover
          target="tag-helper"
          placement="auto"
          title="What are tags?"
          triggers="hover focus">
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
                    :pagination="pagination"/>

  </div>
</template>

<script>
import Search from 'components/search'
import TagsTabs from 'components/tags/tags-tabs'
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import axios from 'axios'
import TagsTable from 'components/tags/tags-table.vue'
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
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0
      }
    }
  },

  created () {
    this.loadTags(this.tagCategory)
  },

  computed: {
    tagCategoryName () {
      switch (this.tagCategory) {
        case TAG_CATEGORIES.CAT_CONTACTS:
          return 'Contacts'

        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          return 'Communications'
      }

      return ''
    }
  },

  methods: {
    onSearch () {
      return ''
    },

    loadTags (tagCategory, page = 1, perPage = 25, orderBy = 'id', order = 'descending') {
      this.isLoading = true
      this.tags = []
      this.tagCategory = +tagCategory

      axios.get(`/api/v1/tag-new?category=${tagCategory}&search_text=${this.search}&per_page=${perPage}&order_by=${orderBy}&order=${order}&page=${page}`)
        .then(res => {
          this.tags = res.data.data
          this.pagination = {
            currentPage: res.data.current_page,
            lastPage: res.data.last_page,
            perPage: res.data.per_page,
            total: res.data.total
          }
          this.isLoading = false
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>
