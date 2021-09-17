<template>
  <b-modal
    id="inbox-channel-filter-modal"
    size="lg"
    modal-class="confirm-dialog"
    hide-header-close
    hide-header
    hide-footer
    ref="inbox-channel-filter-modal">

    <div class="modal-body-wrapper d-flex">
      <div class="w-50 left-column-wrapper">
        <span class="filter-type-description">{{ channelFilterName }}</span>

        <div class="mt-5">
          <div class="mb-4">
            <div class="filter-items active">Create New</div>
          </div>
          <h5 class="text-uppercase filter-group-title">Personal Filters</h5>
          <div class="saved-filters">
            <div class="filter-items"><span>Saved Filter #1</span></div>
            <div class="filter-items"><span>Saved Filter #2</span></div>
            <div class="filter-items"><span>Saved Filter #3</span></div>
          </div>
          <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
          <div class="saved-filters">
            <div class="filter-items"><span>Saved Company Filter #1</span></div>
            <div class="filter-items"><span>Saved Company Filter #2</span></div>
            <div class="filter-items"><span>Saved Company Filter #3</span></div>
          </div>
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="container d-flex justify-content-between mb-3">
          <div>
            <span class="filter-name">(Unsaved) Filter</span>
          </div>
          <div>
            <b-button size="sm"
                      :disabled="channelChangedFilterFields.length < 1"
                      @click="onResetFilter">Reset</b-button>

            <b-button size="sm"
                      class="ml-2 mr-2"
                      variant="primary">Save</b-button>

            <b-button size="sm"
                      variant="primary">Save as New</b-button>
          </div>
        </div>
        <filter-form :filter="filter"></filter-form>
      </div>
    </div>
    <template #modal-footer="{ hide }">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        @click="hide()">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import FilterForm from 'components/inbox/inbox-filters/filter-form'
import { mapState } from 'vuex'

export default {
  name: 'filter-dialog',

  components: { FilterForm },

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('inbox', ['channelChangedFilterFields']),
    channelFilterName () {
      switch (true) {
        case ['messages'].includes(this.$route.params.channel):
          return 'Messages'
        case ['voicemails'].includes(this.$route.params.channel):
          return 'Voicemails'
        case ['mentions'].includes(this.$route.params.channel):
          return 'Mentions'
        case ['calls', 'recordings'].includes(this.$route.params.channel):
        default:
          return 'Calls & Recordings'
      }
    }
  },

  methods: {
    hideModal () {
      this.$refs['inbox-channel-filter-modal'].hide()
    },

    onResetFilter: function () {
      this.$emit('onResetFilter')
    }
  }
}
</script>
