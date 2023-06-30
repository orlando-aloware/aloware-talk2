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
          <span class="mr-1">{{ view.open_count || 0 }}</span>
          <span class="cursor-pointer px-1">
            <q-btn icon="push_pin"
                   size="xs"
                   flat>
              <q-tooltip>
                <span>Pin List</span>
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
import { mapActions } from 'vuex'

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
