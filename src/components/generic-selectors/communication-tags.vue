<template>
  <div class="w-100 tags-wrapper"
       v-if="hasPermissionTo('tag communication')">
    <tag-multi-select :values="communication.tag_ids"
                      :options="combinedTags"
                      :current="currentTags"
                      :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                      :optionsIsGrouped="true"
                      :height="height"
                      :category="category"
                      @valuesUpdated="saveTags">
      <template v-slot:button>
        <add-icon-circle height="14"
                         width="14"
                         color="#256EFF"/>
        <span class="ml-1">
          {{ buttonText }}
        </span>
      </template>
    </tag-multi-select>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'
import TagMultiSelect from 'components/generic-selectors/tag-multi-select'
import {
  TAG_CATEGORIES as TagCategories,
  TAG_CATEGORIES_VALUES as TagCategoriesValues
} from 'src/constants/tag-categories'
import { clone, isEmpty } from 'lodash'
import * as TagTypes from 'src/constants/tag-types'
import AddIconCircle from 'components/icons/add-icon-circle'

export default {
  name: 'communication-tags',

  mixins: [aclMixin],

  components: {
    AddIconCircle,
    TagMultiSelect
  },

  props: {
    communication: {
      required: true
    },

    buttonText: {
      required: false,
      type: String,
      default: 'Add Tags'
    },

    exclude: {
      required: false,
      default: null
    },

    height: {
      required: false,
      type: Number
    }
  },

  data () {
    return {
      loadingTag: false,
      loadingTags: false,
      options: [],
      category: TagCategories.CAT_COMMUNICATIONS
    }
  },

  computed: {
    ...mapState(['tagsFullyLoaded', 'tags']),
    availableTags () {
      if (this.options) {
        return this.options.filter((tag) => {
          return tag.id !== this.exclude
        })
      }

      return []
    },

    tagsAlphabeticalOrder () {
      if (isEmpty(this.availableTags)) {
        return this.availableTags
      }

      const tags = TagCategoriesValues.includes(this.category)
        ? clone(this.availableTags).filter(tag => tag.category === this.category)
        : clone(this.availableTags)

      return this.$alphabeticalSort(tags)
    },

    companyTagsAlphabeticalOrder () {
      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_COMPANY)
      }

      return []
    },

    importTagsAlphabeticalOrder () {
      if (TagCategoriesValues.includes(this.category) && this.category !== TagCategories.CAT_CONTACTS) {
        return []
      }

      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_IMPORT)
      }

      return []
    },

    combinedTags () {
      const companyTags = this.companyTagsAlphabeticalOrder
      const importTags = this.importTagsAlphabeticalOrder

      const tags = []

      if (companyTags && companyTags.length) {
        tags.push({
          title: 'Account Tags',
          children: companyTags
        })
      }

      if (importTags && importTags.length) {
        tags.push({
          title: 'Import Tags',
          children: importTags
        })
      }
      return tags
    },

    currentTags () {
      return this.communication?.tags ?? []
    }
  },

  created () {
    if (this.communication && !this.communication.tag_ids) {
      if (this.communication.tags) {
        this.communication.tag_ids = this.communication.tags.map((o) => o.id)
      }
    }
  },

  mounted () {
    if (this.tags) {
      this.options = this.tags
    }
  },

  methods: {
    ...mapActions(['setTagsFullyLoaded']),

    saveTags (tags) {
      if (!this.hasPermissionTo('tag communication')) {
        return
      }

      this.loadingTag = true
      this.$axios.post('/api/v1/communication/' + this.communication.id + '/tag', {
        tags: tags
      }).then(res => {
        this.communication.tags = res.data
        this.communication.tag_ids = this.communication.tags.map((o) => o.id)
        this.loadingTag = false
        this.$generalNotification('Tags successfully updated')
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingTag = false
        if (this.communication.tags) {
          this.communication.tag_ids = this.communication.tags.map((o) => o.id)
        }
      })
    }
  },
  watch: {
    tags: {
      deep: true,
      handler: function () {
        this.options = this.tags
      }
    }
  }
}
</script>
