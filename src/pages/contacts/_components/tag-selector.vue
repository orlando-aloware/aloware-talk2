<template>
  <q-select
    outlined
    :multiple="multiple"
    v-model="tagId"
    :options="combinedFilteredTags"
    :use-input="multiple"
    :clearable="clearable"
    stack-label
    color="secondary"
    :loading="loadingTags"
    @change="selectTag"
    @filter="filterTagFn">
    <template v-slot:option="scope">
      <q-item class="text-muted"
              :label="scope.opt.title">
        <q-item-section>{{ scope.opt.title }}</q-item-section>
      </q-item>
      <template v-for="child in scope.opt.children">
        <q-item
          :key="child.id"
          clickable
          v-ripple
          v-close-popup
          @click="tagId = child.id"
          :class="{ 'bg-light-blue-1': tagId === child.id }"
        >
          <q-item-section>
            <q-item-label v-html="child.name" class="q-ml-md" ></q-item-label>
          </q-item-section>
          <q-item-section side>
          </q-item-section>
        </q-item>
      </template>
    </template>
    <template v-slot:selected-item="scope">
      <q-chip
        removable
        dense
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        color="white"
        text-color="secondary"
        class="q-ma-none"
      >
        <q-avatar color="secondary" text-color="white" :icon="scope.opt.icon" />
        {{ scope.opt.label }}
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import * as TagTypes from 'src/constants/tag-types'
import * as TagCategory from 'src/constants/tag-categories'
export default {
  name: 'tag-selector',

  mixins: [aclMixin],

  data () {
    return {
      tagId: this.value,
      loadingTags: false,
      tags: [],
      options: [],
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

    combinedFilteredTags () {
      const companyTags = this.companyTagsAlphabeticalOrder
      const importTags = this.importTagsAlphabeticalOrder
      let tags = []
      if (companyTags && companyTags.length) {
        tags.push({
          title: 'Account Tags',
          children: this.companyTagsAlphabeticalOrder
        })
      }
      if (importTags && importTags.length) {
        tags.push({
          title: 'Import Tags',
          children: this.importTagsAlphabeticalOrder
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

  mounted () {
    if (!this.loaded) {
      this.getTags()
    }
  },

  methods: {
    selectTag (tag) {
      this.tagId = tag
      this.$emit('change', tag)
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
          this.loadingTags = false
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

    filterTagFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.tags
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.tags.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },

  watch: {
    value () {
      this.tagId = this.value
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
