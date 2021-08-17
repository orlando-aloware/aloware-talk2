<template>
  <b-card class="border-0 tags-wrapper">
    <generic-multi-select label="Tags"
                          buttonText="Tags"
                          :values="selectedTagIds"
                          :options="tags"
                          :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                          @valuesUpdated="submitTags">
    </generic-multi-select>
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'contact-tags',

  mixins: [aclMixin],

  components: { GenericMultiSelect },

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
    ...mapState(['tagsFullyLoaded']),
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
      if (!this.hasPermissionTo('list tag') || this.tagsFullyLoaded) {
        return
      }

      return talk2Api.V1.tags.get({
        params: { full_load: true }
      }).then(res => {
        this.tags = res.data
        this.setTagsFullyLoaded(true)
      }).catch(err => {
        console.log(err)
      })
    },

    submitTags (tagsArray) {
      if (this.hasPermissionTo('tag contact')) {
        talk2Api.V1.contact.storeTags(this.contact.id, { tags: tagsArray })
          .then(response => {
            this.$emit('update', response.data)
          }).catch(err => {
            console.log(err)
            this.$root.handleErrors(err.response)
          })
      }
    },
    ...mapActions(['setTagsFullyLoaded'])
  }
}
</script>
