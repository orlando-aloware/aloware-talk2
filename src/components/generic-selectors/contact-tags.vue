<template>
  <b-card class="border-0 tags-wrapper"
          v-if="hasPermissionTo('tag contact')">
    <generic-multi-select label="Tags"
                          button-text="Modify Tags"
                          :values="tagIds"
                          :options="combinedTags"
                          :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                          :optionsIsGrouped="true"
                          @valuesUpdated="saveTags">
    </generic-multi-select>
  </b-card>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'
import GenericMultiSelect from 'src/components/generic-selectors/generic-multi-select'
import {
  TAG_CATEGORIES as TagCategories,
  TAG_CATEGORIES_VALUES as TagCategoriesValues
} from 'src/constants/tag-categories'
import { clone, isEmpty } from 'lodash'
import * as TagTypes from 'src/constants/tag-types'

export default {
  name: 'contact-tags',

  mixins: [aclMixin],

  components: {
    GenericMultiSelect
  },

  props: {
    contact: {
      required: true
    },
    exclude: {
      required: false,
      default: null
    }
  },

  data () {
    return {
      loadingTag: false,
      loadingTags: false,
      options: [],
      category: TagCategories.CAT_CONTACTS
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

    tagIds () {
      if (this.contact?.tag_ids) {
        return this.contact.tag_ids
      }

      if (this.contact?.tags) {
        return this.contact.tags.map((tag) => tag.id)
      }

      return []
    }
  },

  mounted () {
    if (this.tags) {
      this.options = this.tags
    }

    if (!this.tags) {
      this.getTags()
    }
  },

  methods: {
    getTags () {
      if (!this.hasPermissionTo('list tag')) {
        return
      }

      if (this.tagsFullyLoaded) {
        this.options = this.tags
        return
      }

      this.loadingTags = true
      const params = {
        full_load: true
      }

      return this.$axios.get('/api/v1/tag', { params }).then(res => {
        this.options = res.data
        this.loadingTags = false
        this.setTagsFullyLoaded(true)
      }).catch(err => {
        console.log(err)
        this.loadingTags = false
      })
    },

    saveTags (tags) {
      if (!this.hasPermissionTo('tag contact')) {
        return
      }

      this.loadingTag = true

      this.$axios.post('/api/v1/contact/' + this.contact.id + '/tag', {
        tags: tags
      }).then(res => {
        this.contact.tags = res.data
        this.contact.tag_ids = this.contact.tags.map((o) => o.id)
        this.loadingTag = false
        this.$generalNotification('Tags successfully updated')
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingTag = false

        if (this.contact.tags) {
          this.contact.tag_ids = this.contact.tags.map((o) => o.id)
        }
      })
    },

    ...mapActions(['setTagsFullyLoaded'])
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
