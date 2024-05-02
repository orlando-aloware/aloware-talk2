<template>
  <div v-if="hasPermissionTo(`tag ${entity}`)">
    <div class="w-100 tags-wrapper"
         :data-testid="`${entity}-tags-wrapper`"
         v-if="!useCard">
      <tag-multi-select :data-testid="`${entity}-tags-multi-select`"
                        :label="label"
                        :button-text="buttonText"
                        :values="tagIds"
                        :options="combinedTags"
                        :current="currentTags"
                        :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                        :optionsIsGrouped="true"
                        :height="height"
                        :category="category"
                        @valuesUpdated="saveTags">
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
            v-else>
      <tag-multi-select :data-testid="`${entity}-tags-multi-select`"
                        :label="label"
                        :button-text="buttonText"
                        :values="tagIds"
                        :options="combinedTags"
                        :current="currentTags"
                        :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                        :optionsIsGrouped="true"
                        :height="height"
                        :category="category"
                        @valuesUpdated="saveTags">
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
      required: true
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
      type: Number
    },

    category: {
      required: false,
      type: Number,
      default: null
    }
  },

  data () {
    return {
      loadingTag: false,
      loadingTags: false,
      options: []
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
      return this.entityObject?.tags ?? []
    },

    tagIds () {
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
    if (this.entityObject && !this.entityObject.tag_ids) {
      if (this.entityObject.tags) {
        this.entityObject.tag_ids = this.entityObject.tags.map((o) => o.id)
      }
    }
  },

  mounted () {
    if (this.tags) {
      this.options = this.tags
    }
  },

  methods: {
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
