<template>
  <b-popover custom-class="inbox-views"
             boundary="body"
             :target="target"
             :show="show"
             :placement="placement"
             :triggers="triggers"
             @hidden="onClosed">
    <div class="d-flex flex-column"
         style="height: 350px; width: 350px;">
      <search class="py-1"
              placeholder="Search Views"
              :border="false"
              :search="search"
              @search="onSearch"/>

      <div class="bordered-bottom bordered-top flex-grow-1 d-flex flex-column px-3 overflow-auto">
        <div class="d-flex p-2 align-items-center"
             :key="view.id"
             v-for="view in filteredViews">
          <span class="flex-grow-1">{{ view.name }}</span>
          <span class="mr-2">{{ view.open_count || 0 }}</span>
          <span class="cursor-pointer px-1">
            <q-btn class="mr-2"
                   icon="edit"
                   size="xs"
                   flat
                   @click="editView(view.id)">
              <q-tooltip>
                <span>Edit View</span>
              </q-tooltip>
            </q-btn>
            <q-btn size="xs"
                   flat
                   v-if="!isPinnedView(view.id)"
                   @click="pinView(view.id)">
              <q-icon name="o_push_pin"></q-icon>
              <q-tooltip>
                <span>Pin View</span>
              </q-tooltip>
            </q-btn>
            <q-btn icon="push_pin"
                   size="xs"
                   class="primary"
                   flat
                   v-if="isPinnedView(view.id)"
                   @click="unpinView(view.id)">
              <q-tooltip>
                <span>Unpin View</span>
              </q-tooltip>
            </q-btn>
          </span>
        </div>
      </div>

      <span class="p-3 text-bold text-grey-90 cursor-pointer"
            @click="onCreateViewClicked">
        Create View
      </span>
    </div>
  </b-popover>
</template>

<script>
import Search from 'src/components/search.vue'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    Search
  },

  props: {
    target: {
      type: [String, HTMLElement, SVGElement, Function, Object],
      required: true
    },

    placement: {
      type: String,
      default: 'rightbottom'
    },

    triggers: {
      type: String,
      default: 'click'
    },

    show: {
      type: Boolean,
      default: false
    },

    views: {
      type: Array,
      required: false,
      default: () => ([])
    }
  },

  computed: {
    ...mapState('inbox', [
      'pinnedViews'
    ]),

    filteredViews () {
      return this.views.filter(view => view.name.toUpperCase().includes(this.search.toUpperCase()))
    }
  },

  data: () => ({
    search: ''
  }),

  methods: {
    ...mapActions('inbox', [
      'setFilterDialogForView',
      'toggleFilterDialog'
    ]),

    onSearch (search) {
      this.search = search
    },

    onCreateViewClicked () {
      this.$emit('closed')

      this.setFilterDialogForView(true)
      this.toggleFilterDialog(true)
    },

    onClosed () {
      this.$emit('closed')
    },

    editView (viewId) {
      console.log('Edit view id: ' + viewId)
    },

    pinView (viewId) {
      this.$axios
        .post(`/api/v2/filters/${viewId}/pin`)
        .then(res => {
          console.log(res)
          this.$VueEvent.fire('viewPinned')
        })
        .catch(err => {
          console.log(err)
        })
    },

    unpinView (viewId) {
      this.$axios
        .delete(`/api/v2/filters/${viewId}/unpin`)
        .then(res => {
          console.log(res)
          this.$VueEvent.fire('viewUnpinned')
        })
        .catch(err => {
          console.log(err)
        })
    },

    isPinnedView (viewId) {
      return this.pinnedViews.find(view => +view.filter_id === +viewId)
    }
  }
}
</script>

<style>
.inbox-views {
  max-width: 1000px;

  .popover-body {
    padding: 0px;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: -0.0025em;
  }
}
</style>
