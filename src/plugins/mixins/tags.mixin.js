import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { mapActions, mapState } from 'vuex'

export default {
  data () {
    return {
      CommunicationTags: TAG_CATEGORIES.CAT_COMMUNICATIONS,
      ContactTags: TAG_CATEGORIES.CAT_CONTACTS
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
      switch (this.selectedTagCategory) {
        case TAG_CATEGORIES.CAT_CONTACTS:
          return 'Contact'

        case TAG_CATEGORIES.CAT_COMMUNICATIONS:
          return 'Communication'
      }

      return ''
    }
  },

  methods: {
    ...mapActions('tagsModule', [
      'setSelectedTagCategory'
    ])
  }
}
