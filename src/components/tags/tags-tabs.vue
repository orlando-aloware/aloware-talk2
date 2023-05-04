<template>
  <div class="position-relative">
    <q-btn-toggle v-model="currentTab"
                  :options="options"
                  class="custom-toggle-button tags__tabs"
                  no-caps
                  dense
                  spread
                  unelevated
                  :toggle-color="categorySelectToggleColor"
                  color="transparent"
                  text-color="primary">
      <template v-slot:one>
        <div :class="[currentTab === CommunicationTags ?  'active' : 'text-grey-90']">
          <span>Communication Tags</span>
          <span class="ml-1 align-middle badge"
                :class="[currentTab === CommunicationTags ?  'badge-primary' : 'grey-light']">
            {{ categoriesCount.communications }}
          </span>
        </div>
      </template>

      <template v-slot:two>
        <div :class="[currentTab === ContactTags ?  'active' : 'text-grey-90']">
          <span>Contact Tag</span>
          <span class="ml-1 align-middle badge"
                :class="[currentTab === ContactTags ?  'badge-primary' : 'grey-light']">
            {{ categoriesCount.contacts }}
          </span>
        </div>
      </template>
    </q-btn-toggle>
  </div>
</template>

<script>
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { tagsMixin } from 'src/plugins/mixins'

export default {
  name: 'tags-tabs',

  mixins: [
    tagsMixin
  ],

  props: {
    categoriesCount: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      currentTab: null,
      options: [
        {
          value: TAG_CATEGORIES.CAT_COMMUNICATIONS,
          slot: 'one'
        },
        {
          value: TAG_CATEGORIES.CAT_CONTACTS,
          slot: 'two'
        }
      ]
    }
  },

  mounted () {
    this.currentTab = this.selectedTagCategory
  },

  computed: {
    categorySelectToggleColor () {
      return (this.$route.params.id && this.$route.params.status !== this.statusText
        ? 'bg-grey-80'
        : 'primary') + ' active'
    }
  },

  watch: {
    currentTab: function () {
      this.setSelectedTagCategory(this.currentTab)
      this.$emit('loadTags')
    }
  }
}
</script>
