<template>
  <div class="position-relative">
    <q-btn-toggle v-model="currentTab"
                  :options="options"
                  class="custom-toggle-button tags__tabs"
                  no-caps
                  dense
                  spread
                  unelevated
                  toggle-color="primary active"
                  color="transparent"
                  text-color="primary">
      <template v-slot:one>
        <div class="options"
             :class="[currentTab === CommunicationTags ?  'active' : 'text-grey-90']">
          <span class="toggle-button-name">Communication Tags</span>
          <span class="ml-1 align-middle badge-active-count"
                :class="[currentTab === CommunicationTags ?  '' : 'grey-light']">
            {{ categoriesCount.communications }}
          </span>
        </div>
      </template>

      <template v-slot:two>
        <div class="options"
             :class="[currentTab === ContactTags ?  'active' : 'text-grey-90']">
          <span class="toggle-button-name">Contact Tag</span>
          <span class="ml-1 align-middle badge-active-count"
                :class="[currentTab === ContactTags ?  '' : 'grey-light']">
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

  watch: {
    currentTab: function (value) {
      this.setSelectedTagCategory(value)
      this.clearAllSelectedTags()
      this.$emit('loadTags')
    }
  }
}
</script>
