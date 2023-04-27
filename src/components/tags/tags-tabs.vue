<template>
  <div class='position-relative'>
    <q-btn-toggle v-model="currentTab"
                  :options="options"
                  class="custom-toggle-button"
                  no-caps
                  spread
                  dense
                  :toggle-color="statusToggleColor"
                  unelevatedolor="statusToggleColor"
                  color="transparent"
                  text-color="primary">
      <template v-slot:one>
        <div class="d-flex justify-content-center w-100 options"
             :class="[currentTab === CommmunicationTags ?  'active' : 'text-grey-90']">
          <span class="text-left tag-cat-name">
            Communication Tags
          </span>
        </div>
      </template>

      <template v-slot:two>
        <div class="d-flex justify-content-center w-100 options"
             :class="[currentTab === ContactTags ?  'active' : 'text-grey-90']">
          <span class="text-left tag-cat-name">
            Contact Tags
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
    statusToggleColor () {
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
