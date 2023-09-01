<template>
  <b-popover custom-class="inbox-views"
             boundary="viewport"
             boundary-padding="5"
             :target="target"
             :show="showViewsList"
             :placement="placement"
             :triggers="triggers"
             @hidden="onClosed">
    <div class="d-flex flex-column"
         style="max-height: 350px; max-width: 350px;">
      <search class="py-1"
              placeholder="Search Views"
              :border="false"
              :search="search"
              @search="onSearch"/>

      <div class="bordered-bottom bordered-top flex-grow-1 d-flex flex-column px-3 overflow-auto">
        <div class="d-flex p-2 align-items-center"
             :key="view.id"
             v-for="view in filteredViews">
          <span class="flex-grow-1">
            <i class="fa fa-circle text-primary text-10"
               v-if="!+view?.is_on_company">
            </i>
            {{ view.name }}
          </span>
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

      <span class="p-3 text-bold text-grey-90 cursor-pointer custom-link"
            @click="onCreateView">
        Create View
      </span>
    </div>
  </b-popover>
</template>

<script>
import Search from 'src/components/search.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { inboxMixin } from 'src/plugins/mixins'
import { CHANNEL_INBOX } from 'src/constants/inbox-channels'

export default {
  components: {
    Search
  },

  mixins: [
    inboxMixin
  ],

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
      default: 'focus'
    },

    views: {
      type: Array,
      required: false,
      default: () => ([])
    }
  },

  computed: {
    ...mapState('inbox', [
      'pinnedViews',
      'isFilterDialogShown',
      'showViewsList'
    ]),

    ...mapGetters('inbox', [
      'allInboxFilters'
    ]),

    filteredViews () {
      return this.views.filter(view => {
        if (view.type === CHANNEL_INBOX) {
          return view.name.toUpperCase().includes(this.search.toUpperCase())
        }
      })
    }
  },

  data: () => ({
    search: ''
  }),

  methods: {
    ...mapActions('inbox', [
      'setFilterDialogForView',
      'setIsEditingView',
      'toggleFilterDialog',
      'setSelectedFilter'
    ]),

    onSearch (search) {
      this.search = search
    },

    onCreateView () {
      this.$emit('closed')

      this.setIsEditingView(false)
      this.setFilterDialogForView(true)
      this.toggleFilterDialog(true)
    },

    onClosed () {
      this.$emit('closed')
    },

    editView (viewId) {
      this.$emit('closed')

      const view = this.allInboxFilters.find(view => +view.id === +viewId)
      this.setSelectedFilter(view)
      this.setIsEditingView(true)
      this.setFilterDialogForView(true)
      this.toggleFilterDialog(true)
    },

    isPinnedView (viewId) {
      return this.pinnedViews.find(view => +view.filter_id === +viewId)
    }
  },

  watch: {
    isFilterDialogShown (value) {
      if (value) {
        this.$emit('closed')
      }
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
