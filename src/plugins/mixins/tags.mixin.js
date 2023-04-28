import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      CommunicationTags: TAG_CATEGORIES.CAT_COMMUNICATIONS,
      ContactTags: TAG_CATEGORIES.CAT_CONTACTS,
      currentTagCategory: TAG_CATEGORIES.CAT_COMMUNICATIONS
    }
  },

  mounted () {
    this.currentTagCategory = this.selectedTagCategory
  },

  computed: {
    ...mapState('tags', [
      'selectedTagCategory'
    ]),

    tagCategoryName () {
      switch (this.currentTagCategory) {
        case TAG_CATEGORIES.CAT_CONTACTS:
          return 'Contact'

        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          return 'Communication'
      }

      return ''
    }
  },

  methods: {
    ...mapActions('tags', [
      'setSelectedTagCategory'
    ])
  }
}
