<template>
  <div v-if="hasPermissionTo(`tag ${entity}`)">
    <div class="w-100 tags-wrapper"
         :class="{ 'tags-wrapper--dense': dense }"
         :data-testid="`${entity}-tags-wrapper`"
         v-if="!useCard">
      <tag-multi-select :data-testid="`${entity}-tags-multi-select`"
                        :label="label"
                        :button-text="buttonText"
                        :values="tagIds"
                        :options="combinedTags"
                        :current="currentTags"
                        :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                        :options-is-grouped="true"
                        :height="height"
                        :category="category"
                        :is-filter="isFilter"
                        :dense="dense"
                        :placeholder="placeholder"
                        @values-updated="handleSaveTagsOrFilteringTags">
        <template v-slot:button
                  v-if="useAddIcon">
          <add-icon-circle height="14"
                           width="14"
                           data-testid="entity-tags-add-icon"
                           color="#256EFF"/>
          <span class="ml-1">
            {{ buttonText }}
          </span>
        </template>
      </tag-multi-select>
    </div>
    <b-card class="border-0 tags-wrapper"
            data-testid="contact-tags-wrapper"
            :class="{ 'tags-filter-wrapper': isFilter, 'tags-wrapper--dense': dense }"
            v-else>
      <tag-multi-select :data-testid="`${entity}-tags-multi-select`"
                        :label="label"
                        :button-text="buttonText"
                        :values="tagIds"
                        :options="combinedTags"
                        :current="currentTags"
                        :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                        :options-is-grouped="true"
                        :height="height"
                        :category="category"
                        :is-filter="isFilter"
                        :dense="dense"
                        :placeholder="placeholder"
                        @values-updated="handleSaveTagsOrFilteringTags">
      </tag-multi-select>
    </b-card>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import TagMultiSelect from 'components/generic-selectors/tag-multi-select'
import { TAG_CATEGORIES as TagCategories, TAG_CATEGORIES_VALUES as TagCategoriesValues } from 'src/constants/tag-categories'
import { clone, isEmpty } from 'lodash'
import * as TagTypes from 'src/constants/tag-types'
import AddIconCircle from 'components/icons/add-icon-circle'

export default {
  name: 'entity-tags',

  mixins: [aclMixin],

  components: {
    AddIconCircle,
    TagMultiSelect
  },

  props: {
    entityObject: {
      required: false,
      type: Object,
      default: null
    },

    entity: {
      required: true,
      type: String
    },

    entityType: {
      required: true,
      type: String
    },

    label: {
      required: false,
      type: String,
      default: ''
    },

    buttonText: {
      required: false,
      type: String,
      default: 'Add Tags'
    },

    useAddIcon: {
      required: false,
      type: Boolean,
      default: true
    },

    useCard: {
      required: false,
      type: Boolean,
      default: true
    },

    exclude: {
      required: false,
      default: null
    },

    height: {
      required: false,
      type: Number,
      default: 350
    },

    category: {
      required: false,
      type: Number,
      default: null
    },

    isFilter: {
      required: false,
      type: Boolean,
      default: false
    },

    filterValues: {
      required: false,
      type: Array,
      default: () => []
    },

    filterValuesObjects: {
      required: false,
      type: Array,
      default: () => []
    },

    dense: {
      required: false,
      type: Boolean,
      default: false
    },

    placeholder: {
      required: false,
      type: String,
      default: 'Type at least 3 characters'
    }
  },

  data () {
    return {
      loadingTag: false,
      loadingTags: false,
      options: [],
      selectedTagsObjects: []
    }
  },

  computed: {
    ...mapState(['tags']),

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

      let tags = clone(this.availableTags)

      if (TagCategoriesValues.includes(this.category)) {
        tags = tags.filter(tag => tag.category === this.category)
      }

      return this.$alphabeticalSort(tags)
    },

    companyTagsAlphabeticalOrder () {
      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_COMPANY)
      }

      return []
    },

    importTagsAlphabeticalOrder () {
      if (TagCategoriesValues.includes(this.category) && this.category !== TagCategories[`CAT_${this.entityType.toUpperCase()}`]) {
        return []
      }

      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_IMPORT)
      }

      return []
    },

    combinedTags () {
      const entityTags = this.companyTagsAlphabeticalOrder
      const importTags = this.importTagsAlphabeticalOrder

      const tags = []

      if (entityTags && entityTags.length) {
        tags.push({
          title: 'Account Tags',
          children: entityTags
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
      if (this.isFilter) {
        return this.filterValuesObjects ?? []
      }

      return this.entityObject?.tags ?? []
    },

    tagIds () {
      if (this.isFilter) {
        return this.filterValues
      }

      if (this.entityObject?.tag_ids) {
        return this.entityObject.tag_ids
      }

      if (this.entityObject?.tags) {
        return this.entityObject.tags.map((tag) => tag.id)
      }

      return []
    }
  },

  created () {
    if (this.entityObject && !this.entityObject.tag_ids && this.entityObject.tags) {
      this.entityObject.tag_ids = this.entityObject.tags.map((o) => o.id)
    }
  },

  mounted () {
    if (this.tags) {
      this.options = this.tags
    }
  },

  methods: {
    handleSaveTagsOrFilteringTags (tagsIds, tagsObjects) {
      if (this.isFilter) {
        return this.updateFilteringTags(tagsIds, tagsObjects)
      }

      return this.saveTags(tagsIds)
    },

    saveTags (tags) {
      if (!this.hasPermissionTo(`tag ${this.entity}`)) {
        return
      }

      this.loadingTag = true
      this.$axios.post(`/api/v1/${this.entity}/` + this.entityObject.id + '/tag', {
        tags: tags
      }).then(res => {
        this.entityObject.tags = res.data
        this.entityObject.tag_ids = this.entityObject.tags.map((o) => o.id)
        this.loadingTag = false
        this.$generalNotification('Tags successfully updated')
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingTag = false

        if (this.entityObject.tags) {
          this.entityObject.tag_ids = this.entityObject.tags.map((o) => o.id)
        }
      })
    },

    updateFilteringTags (tagsIds, tagsObjects) {
      this.selectedTagsObjects = tagsObjects
      this.$emit('filter', tagsIds, tagsObjects)
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
