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
import * as TagCategory from 'src/constants/tag-categories'
import _ from 'lodash'
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
    }
  },

  data () {
    return {
      loadingTag: false,
      loadingTags: false,
      options: [],
      category: TagCategory.CAT_CONTACTS
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
      if (this.availableTags) {
        let tags = _.clone(this.availableTags)
        if (this.category) {
          tags = tags.filter(tag => tag.category === this.category)
        }
        return tags.sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    companyTagsAlphabeticalOrder () {
      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_COMPANY)
      }

      return []
    },

    importTagsAlphabeticalOrder () {
      if (this.category && this.category !== TagCategory.CAT_CONTACTS) {
        return []
      }

      if (this.tagsAlphabeticalOrder.length) {
        return this.tagsAlphabeticalOrder.filter(tag => tag.type === TagTypes.TYPE_IMPORT)
      }

      return []
    },

    combinedTags () {
      let companyTags = this.companyTagsAlphabeticalOrder
      let importTags = this.importTagsAlphabeticalOrder

      let tags = []
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
      } else if (this.contact?.tags) {
        let ids = []
        this.contact.tags.forEach(tag => {
          ids.push(tag.id)
        })
        return ids
      }
      return []
    }
  },

  mounted () {
    this.getTags()
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
      let params = {
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
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingTag = false
        if (this.contact.tags) {
          this.contact.tag_ids = this.contact.tags.map((o) => o.id)
        }
      })
    },
    ...mapActions(['setTagsFullyLoaded'])
  }
}
</script>
