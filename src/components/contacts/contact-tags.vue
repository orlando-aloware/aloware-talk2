<template>
  <b-card class="border-0 contact-tags-wrapper">
    <h4 v-if="!no_title">Tags</h4>
    <tag-selector v-if="tags.length > 0"
                  ref="contactTagSelector"
                  v-model="selectedTagIds"
                  :class="`details-contact-tags mt-2 ${displayClass}`"
                  :max-height="500"
                  :displayLimit="100"
                  :multiple="true"
                  :loaded="true"
                  :custom-tags="tags"
                  @change="changeTags($event)"
                  @open="onSelectOpen"
                  @close="onSelectClose"
    >
    </tag-selector>

    <b-link v-if="!isEdit && hasPermissionTo(['list tag', 'view tag'])"
            href="#"
            class="custom-link text-decoration-none btn-tag-edit"
            @click="onModifyTags">
      <pencil-o-icon></pencil-o-icon> Modify Tags
    </b-link>
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'components/icons/pencil-o-icon'
import { aclMixin } from 'src/plugins/mixins'
import TagSelector from 'components/tag-selector'

export default {
  name: 'contact-tags',

  mixins: [aclMixin],

  components: { TagSelector, PencilOIcon },

  props: {
    contact: {
      required: true
    },

    no_title: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      isEdit: false,
      tagsArray: [],
      tags: []
    }
  },

  computed: {
    contactTags () {
      return this.contact.tags
    },

    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    },

    selectedTagIds () {
      return this.contactTags ? this.contactTags.map(tag => tag.id) : []
    },

    displayClass () {
      return !this.isEdit ? 'show-raw-value' : ''
    }
  },

  mounted () {
    this.getTags()
  },

  methods: {
    changeTags (event) {
      this.tagsArray = event
    },

    onModifyTags () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.contactTagSelector.$el.focus()
      })
    },

    onSelectClose () {
      this.isEdit = false
    },

    onSelectOpen () {
      this.isEdit = true
    },

    onRemoveTag () {
      this.isEdit = true
    },

    getTags () {
      return talk2Api.V1.tags.get({
        params: { full_load: true }
      }).then(res => {
        this.tags = res.data
      }).catch(err => {
        console.log(err)
      })
    },

    submitTags () {
      talk2Api.V1.contact.storeTags(this.contact.id, { tags: this.tagsArray })
        .then(response => {
          this.$emit('update', response.data)
        }).catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  },

  watch: {
    'tagsArray': function () {
      this.submitTags()
    }
  }
}
</script>
