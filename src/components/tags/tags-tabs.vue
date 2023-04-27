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
        <div :class="[currentTab === CommmunicationTags ?  'active' : 'text-grey-90']">
          <span>Communication Tags</span>
          <span class="ml-1 align-middle badge"
                :class="[currentTab === CommmunicationTags ?  'badge-primary' : 'grey-light']">
            {{ tagCategoriesCount.communications }}
          </span>
        </div>
      </template>

      <template v-slot:two>
        <div :class="[currentTab === ContactTags ?  'active' : 'text-grey-90']">
          <span>Contact Tag</span>
          <span class="ml-1 align-middle badge"
                :class="[currentTab === ContactTags ?  'badge-primary' : 'grey-light']">
            {{ tagCategoriesCount.contacts }}
          </span>
        </div>
      </template>
    </q-btn-toggle>
  </div>
</template>

<script>
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
export default {
  name: 'tags-tabs',

  props: {
    selectedTagCategory: {
      type: Number,
      required: true
    },

    tagCategoriesCount: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      currentTab: this.selectedTagCategory,
      CommmunicationTags: TAG_CATEGORIES.CAT_COMMUNICATIONS,
      ContactTags: TAG_CATEGORIES.CAT_CONTACTS,
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

  computed: {
    categorySelectToggleColor () {
      return (this.$route.params.id && this.$route.params.status !== this.statusText ? 'bg-grey-80' : 'primary') + ' active'
    }
  },

  watch: {
    currentTab: function () {
      this.$emit('loadTags', this.currentTab)
    }
  }
}
</script>
