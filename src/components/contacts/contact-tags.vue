<template>
  <b-card class="border-0 contact-tags-wrapper">
    <h4>Tags</h4>
    <div v-if="!isEdit"
         class="mt-1">
      <b-badge v-for="tag in contactTags"
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
    <tag-selector v-if="isEdit && tags.length > 0"
                  class="details-contact-tags mt-2"
                  ref="contactTagSelector"
                  v-model="selectedTagIds"
                  :displayLimit="100"
                  :multiple="true"
                  :loaded="true"
                  :custom-tags="tags"
                  @change="changeTags($event)"
                  @blur="onSelectBlur">
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
    contactTags () {
      return this.contact.tags
    },
    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    },
    selectedTagIds () {
      return this.contactTags.map(tag => tag.id)
    }
  },
  data () {
    return {
      isEdit: false,
      tagsArray: [],
      tags: []
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
    onSelectClose () {
      this.isEdit = false
    },
    onSelectBlur () {
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
  },
  mounted () {
    this.getTags()
    let _this = this
    document.addEventListener('click', function (evt) {
      let targetElement = evt.target
      _this.isEdit = targetElement.classList.contains('details-contact-tags') || targetElement.classList.contains('btn-tag-edit') || targetElement.classList.contains('remove-tag-icon')
      evt.stopImmediatePropagation()
    })
  }
}
</script>
