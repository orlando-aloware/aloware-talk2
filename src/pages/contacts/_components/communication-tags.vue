<template>
  <div :class="!showTags ? 'h-full' : ''">
    <div class="row"
         :class="!showTags ? 'h-full' : ''"
         v-if="hasPermissionTo('tag communication')">
      <div class="col-12">
        <slot name="trigger">
          <q-btn id="tags-btn"
                 type="text text-dark-greenish text-sm p-0">
            <q-icon name="add_circle_outline"
                    class="text-dark-greenish">
            </q-icon>
            Add Tags
          </q-btn>
        </slot>
        <b-popover ref="popover_tags"
                   target="tags-btn"
                   title="Tags:"
                   :placement="small ? 'top' : 'left'"
                   :width="small ? 265 : 400"
                   v-model="isOpen"
                   trigger="click blur">
          <tag-creator ref="addTag"
                       :categorypProp="category"
                       @success="addTagToCommunication"
                       @show="showAdd"
                       @hide="hide">
          </tag-creator>
          <div class="row"
               v-if="hasPermissionTo(['list tag', 'view tag']) && isOpen"
               v-show="!hide_add">
            <div class="col-12">
              <tag-selector v-model="communication.tag_ids"
                            :categoryProp="category"
                            :multiple="true"
                            @change="changeTags($event, communication)">
              </tag-selector>
            </div>
          </div>
        </b-popover>
      </div>
    </div>
    <div class="row"
         v-if="communication.tags && communication.tags.length > 0 && showTags"
         v-loading="loadingTag">
      <div class="col-12">
        <div class="width-300"
             :key="tag.id"
             v-for="tag in communication.tags">
          <i class="material-icons"
             :style="{ color: tag.color }">
            label
          </i>
          <span class="ml-1 text-grey-900">{{ tag.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import auth from 'boot/auth'
import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import TagCreator from './tag-creator'
import TagSelector from './tag-selector'
import * as TagCategory from 'src/constants/tag-categories'
export default {
  name: 'communication-tags',

  mixins: [aclMixin],

  components: {
    TagCreator,
    TagSelector
  },

  props: {
    communication: {
      required: true
    },

    showTags: {
      default: true,
      type: Boolean,
      required: false
    },

    small: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      auth: auth,
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
