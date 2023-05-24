import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { mapActions, mapState } from 'vuex'
import axios from 'axios'

export default {
  data () {
    return {
      CommunicationTags: TAG_CATEGORIES.CAT_COMMUNICATIONS,
      ContactTags: TAG_CATEGORIES.CAT_CONTACTS,
      tagCategoriesCount: {
        communications: 0,
        contacts: 0
      }
    }
  },

  computed: {
    ...mapState('tagsModule', [
      'selectedTagCategory',
      'selectedTagIds'
    ]),

    tagCategoryName () {
      return this.getTagCategoryName(this.selectedTagCategory)
    },

    isCommunicationTagsSelected () {
      return this.selectedTagCategory === this.CommunicationTags
    },

    isContactTagsSelected () {
      return this.selectedTagCategory === this.ContactTags
    },

    tagName () {
      if (!this.tag) {
        return ''
      }

      return `#${this.tag.id} - <i class="fa fa-square" style="color: ${this.tag.color}"></i> ${this.tag.name}`
    },

    hasSelectedTagIds () {
      return [...this.selectedTagIds].length > 0
    }
  },

  methods: {
    ...mapActions('tagsModule', [
      'setSelectedTagCategory',
      'setSelectedTagIds',
      'setSelectedTagsContactsCount'
    ]),

    getTagCategoryName (category) {
      switch (category) {
        case TAG_CATEGORIES.CAT_CONTACTS:
          return 'Contact'

        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          return 'Communication'
      }

      return ''
    },

    getCommunicationTagsCount () {
      axios.get('/api/v1/tags/count?filter=communication')
        .then(res => {
          this.tagCategoriesCount.communications = this.$options.filters.numFormat(res.data.count)
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    },

    getContactTagsCount () {
      axios.get('/api/v1/tags/count?filter=contact')
        .then(res => {
          this.tagCategoriesCount.contacts = this.$options.filters.numFormat(res.data.count)
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
    },

    clearAllSelectedTags () {
      this.setSelectedTagIds([])
      this.setSelectedTagsContactsCount(0)
    }
  }
}
