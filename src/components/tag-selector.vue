<template>
  <multiselect class="chip__clear-blue shrink-options options__no-border options__relative"
               v-model="tagId"
               label="name"
               track-by="id"
               placeholder="Type to search"
               selectLabel=""
               open-direction="bottom"
               :options="combinedTags"
               :multiple="multiple"
               :searchable="true"
               :loading="loadingTags"
               :internal-search="false"
               :clear-on-select="false"
               :close-on-select="false"
               :hide-selected="hideSelected"
               :limit="displayLimit"
               :limit-text="limitText"
               :max-height="maxHeight"
               :show-no-results="true"
               :class="selectorClass"
               :group-select="false"
               group-values="children"
               group-label="title"
               @open="onSelectOpen"
               @close="onSelectClose"
               @search-change="filterTagFn"
               @input="selectTag"
               @blur="onSelectBlur"
               @remove="onRemoveTag">
    <template slot="tag" slot-scope="{ option, remove }">
      <span :style="{ color: option.color }"
            class="border border-half-rounded d-inline-flex align-items-center mr-1 mb-1 tag-items">
        <q-badge class="is-dot mx-1"
                 :style="{ background: option.color }"
                 rounded>
        </q-badge>
        <span class="tag-text">{{ option.name }}</span>
        <span role="button" class="custom__remove"
              @click="remove(option, false)">
          <remove-tag-icon class="ml-1 remove-tag-icon">
          </remove-tag-icon>
        </span>
      </span>
    </template>
    <template slot="option" slot-scope="props">
      <div class="option__group_title"
           v-if="props.option.$isLabel">
        <span class="option__small">{{ props.option.$groupLabel }}</span>
      </div>
      <div class="option__desc" v-else>
        <q-badge class="is-dot mx-1"
                 :style="{ background: props.option.color }"
                 rounded>
        </q-badge>
        <span class="option__small">{{ props.option.name }}</span>
      </div>
    </template>
    <template slot="clear" slot-scope="props">
      <div class="multiselect__clear"
           v-if="tagId && tagId.length"
           @mousedown.prevent.stop="clearAll(props.search)"></div>
    </template>
    <span slot="noResult">
      No tags found.
    </span>
  </multiselect>
</template>

<script>
import Multiselect from 'vue-multiselect'
import _ from 'lodash'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import * as TagTypes from 'src/constants/tag-types'
import * as TagCategory from 'src/constants/tag-categories'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
export default {
  name: 'tag-selector',

  mixins: [aclMixin],

  components: {
    RemoveTagIcon,
    Multiselect
  },

  data () {
    return {
      tagId: this.value,
      loadingTags: false,
      tags: [],
      options: [],
      filter: '',
      selectorClass: [],
      TagTypes,
      TagCategory
    }
  },

  props: {
    value: {
      required: false
    },

    exclude: {
      required: false
    },

    multiple: {
      type: Boolean,
      required: false,
      default: false
    },

    multipleLimit: {
      type: Number,
      required: false,
      default: 0
    },
    displayLimit: {
      type: Number,
      required: false,
      default: 5
    },

    noCollapse: {
      type: Boolean,
      required: false,
      default: false
    },

    clearable: {
      type: Boolean,
      required: false,
      default: false
    },

    customTags: {
      type: Array,
      required: false,
      default: () => []
    },

    loaded: {
      type: Boolean,
      required: false,
      default: false
    },

    categoryProp: {
      required: false,
      type: Number,
      default: null
    },
    maxHeight: {
      required: false,
      type: Number,
      default: 150
    },
    hideSelected: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  computed: {
    ...mapState(['currentCompany', 'tagOptions']),

    placeholder () {
      if (this.multiple) {
        return 'Select Tags'
      }

      return 'Select Tag'
    },

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
        if (this.categoryProp) {
          tags = tags.filter(tag => tag.category === this.categoryProp)
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
      if (this.categoryProp && this.categoryProp !== TagCategory.CAT_CONTACTS) {
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

      if (this.filter) {
        companyTags = companyTags.filter(v => v.name.toLowerCase().indexOf(this.filter) > -1)
        importTags = importTags.filter(v => v.name.toLowerCase().indexOf(this.filter) > -1)
      }

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
    }
  },

  created () {
    this.$VueEvent.listen('tag_created', (tag) => {
      this.addTag(tag)
    })
    this.$VueEvent.listen('tag_updated', (tag) => {
      this.updateTag(tag)
    })
    this.$VueEvent.listen('tag_deleting', (tag) => {
      this.deleteTag(tag.id)
    })
  },

  methods: {
    onSelectOpen () {
      this.selectorClass = ['border-blue']
      this.$emit('open')
    },

    onSelectClose (e) {
      this.selectorClass = []
      this.$emit('close')
    },

    onSelectBlur () {
      this.$emit('blur')
    },

    onRemoveTag () {
      this.$emit('removeTag')
    },

    limitText (count) {
      return `and ${count} other tags`
    },

    initializeTagValues () {
      let found = null
      if (this.value instanceof Array) {
        this.tagId = []
        for (let item of this.value) {
          found = this.availableTags.find(tag => tag.id === item)
          if (found !== null) {
            this.tagId.push(found)
          }
        }
      } else {
        found = this.availableTags.find(tag => tag.id === this.value)
        if (found !== null) {
          this.tagId = found
        }
      }
    },

    selectTag (tag) {
      let tagIds = null
      if (tag instanceof Array) {
        tagIds = []
        for (let item of tag) {
          tagIds.push(item.id)
        }
      } else {
        tagIds = tag.id
      }
      this.$emit('change', tagIds)
    },

    getTags () {
      if (this.hasPermissionTo('list tag')) {
        this.loadingTags = true
        let params = {
          full_load: true
        }
        return this.$axios.get('/api/v1/tag', { params }).then(res => {
          this.tags = res.data
          this.options = res.data
          this.filteredOptions = this.combinedTags
          this.loadingTags = false
          this.initializeTagValues()
        }).catch(err => {
          console.log(err)
          this.loadingTags = false
        })
      }
    },

    resourceExists (arr, resource) {
      return !!arr.find(item => item.id === resource.id)
    },

    addTag (tag) {
      if (this.resourceExists(this.tags, tag)) {
        return
      }
      this.tags.push(tag)
    },

    updateTag (updatedTag) {
      let found = this.tags.map(o => o.id).indexOf(updatedTag.id)
      if (found !== -1) {
        this.Vue.set(this.tags, found, updatedTag)
      }
    },

    deleteTag (deletedTagId) {
      let found = this.tags.map(o => o.id).indexOf(deletedTagId)
      if (found !== -1) {
        this.tags.splice(this.tags[found], 1)
      }
    },

    filterTagFn (query) {
      this.filter = query
    },

    clearAll () {
      this.tagId = []
    }
  },

  mounted () {
    if (!this.loaded) {
      this.getTags()
    } else if (this.loaded && this.customTags.length > 0) {
      this.tags = this.customTags
      this.options = this.tags
      this.filteredOptions = this.combinedTags
      this.initializeTagValues()
    }
  },

  watch: {
    value () {
      this.initializeTagValues()
    },

    'tagOptions.isReset': function () {
      this.tagId = null
    },

    customTags () {
      this.tags = this.customTags
    }
  }
}
</script>

<style src="../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
