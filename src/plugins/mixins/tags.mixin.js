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

  created () {
    this.setSelectedTagCategory(this.CommunicationTags)
  },

  computed: {
    ...mapState('tagsModule', [
      'selectedTagCategory'
    ]),

    tagCategoryName () {
      return this.getTagCategoryName(this.selectedTagCategory)
    }
  },

  methods: {
    ...mapActions('tagsModule', [
      'setSelectedTagCategory'
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
        })
    },

    getContactTagsCount () {
      axios.get('/api/v1/tags/count?filter=contact')
        .then(res => {
          this.tagCategoriesCount.contacts = this.$options.filters.numFormat(res.data.count)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
