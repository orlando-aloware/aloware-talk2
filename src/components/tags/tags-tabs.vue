<template>
  <div class="position-relative">
    <q-btn-toggle class="custom-toggle-button tags__tabs"
                  toggle-color="primary active"
                  color="transparent"
                  text-color="grey-90"
                  no-caps
                  dense
                  spread
                  unelevated
                  :options="options"
                  v-model="currentTab">
      <template v-slot:one>
        <div class="options"
             data-testid="tags-toggle-buttons-communication-tag">
          <span class="toggle-button-name">Communication Tags</span>
          <span class="ml-1 align-bottom badge-active-count">
            {{ categoriesCount.communications | numFormat }}
          </span>
        </div>
      </template>

      <template v-slot:two>
        <div class="options"
             data-testid="tags-toggle-buttons-contact-tag">
          <span class="toggle-button-name">Contact Tags</span>
          <span class="ml-1 align-bottom badge-active-count">
            {{ categoriesCount.contacts | numFormat }}
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
      const oldTagCategory = this.selectedTagCategory
      this.setSelectedTagCategory(value)
      this.clearAllSelectedTags()
      this.$emit('loadTags', oldTagCategory)
    }
  }
}
</script>
