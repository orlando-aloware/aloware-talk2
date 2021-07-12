<template>
  <div class="w-100"
       v-if="hasPermissionTo('tag communication')">
    <tag-selector v-model="communication.tag_ids"
                  :categoryProp="category"
                  :multiple="true"
                  @change="changeTags($event, communication)">
    </tag-selector>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import TagSelector from './tag-selector'
import * as TagCategory from 'src/constants/tag-categories'
export default {
  name: 'communication-tags',

  mixins: [aclMixin],

  components: {
    TagSelector
  },

  props: {
    communication: {
      required: true
    },

    small: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      loadingTag: false,
      hideAdd: false,
      isOpen: false,
      category: TagCategory.CAT_COMMUNICATIONS
    }
  },

  computed: {
    ...mapState(['currentCompany'])
  },

  created () {
    if (this.communication && !this.communication.tag_ids) {
      if (this.communication.tags) {
        this.communication.tag_ids = this.communication.tags.map((o) => o.id)
      }
    }
  },

  methods: {
    showAdd () {
      this.hideAdd = false
    },

    hide () {
      this.hideAdd = true
    },

    saveTags () {
      this.loadingTag = true
      this.$axios.post('/api/v1/communication/' + this.communication.id + '/tag', {
        tags: this.communication.tag_ids
      }).then(res => {
        this.communication.tags = res.data
        this.communication.tag_ids = this.communication.tags.map((o) => o.id)
        this.loadingTag = false
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingTag = false
        if (this.communication.tags) {
          this.communication.tag_ids = this.communication.tags.map((o) => o.id)
        }
      })
    },

    addTagToCommunication (tag) {
      if (this.hasPermissionTo('tag communication')) {
        this.communication.tags.push(tag)
        this.communication.tag_ids = this.communication.tags.map((o) => o.id)
        this.saveTags()
      }
    },

    changeTags (event, model) {
      if (this.hasPermissionTo('tag communication')) {
        model.tag_ids = event
        this.saveTags()
      }
    }
  }
}
</script>
