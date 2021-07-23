<template>
  <b-card class="border-0 contact-tags-wrapper">
    <h4>Tags</h4>
    <div v-if="!isEdit"
         class="mt-1">
      <b-badge v-for="tag in tags"
               variant="primary"
               class="badge-tag custom-badge-primary ellipsis"
               :key="tag.id" >
        <q-tooltip anchor="top middle"
                   self="center middle"
                   :offset="[20, 20]">
          {{ tag.name }}
        </q-tooltip>
         <span :style="`color: ${tag.color};`"><i class="fa fa-circle" :style="`color: ${tag.color};font-size:50%;position: relative; top: -2px;`"></i> {{ tag.name }}</span>
      </b-badge>
    </div>
    <tag-selector v-if="isEdit"
                  class="details-contact-tags"
                  ref="contactTagSelector"
                  v-model="selectedTagIds"
                  :displayLimit="100"
                  :multiple="true"
                  @change="changeTags($event)"
                  @close="onSelectBlur">
    </tag-selector>

    <b-link v-if="!isEdit && hasPermissionTo(['list tag', 'view tag'])"
            href="#"
            class="custom-link text-decoration-none"
            @click="onModifyTags">
      <pencil-o-icon></pencil-o-icon> Modify Tags
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'components/icons/pencil-o-icon'
import { aclMixin } from 'src/plugins/mixins'
import TagSelector from 'components/tag-selector'

export default {
  name: 'contact-tags',
  mixins: [aclMixin],
  components: { TagSelector, PencilOIcon },
  computed: {
    ...mapGetters('contacts', ['contact']),
    tags () {
      return this.contact.tags
    },
    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    },
    selectedTagIds () {
      return this.tags.map(tag => tag.id)
    }
  },
  data () {
    return {
      isEdit: false,
      tagsArray: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactTags']),
    changeTags (event) {
      this.tagsArray = event
    },
    onModifyTags () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.contactTagSelector.$el.focus()
      })
    },
    onSelectBlur () {
      this.isEdit = false
    },

    submitTags () {
      talk2Api.V1.contact.storeTags(this.contact.id, { tags: this.tagsArray })
        .then(response => {
          this.setContactTags(response.data)
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
