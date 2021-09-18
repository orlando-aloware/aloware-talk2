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
            <div class="filter-items active text-italic"><span>Create New</span></div>
          </div>
          <h5 class="text-uppercase filter-group-title">Personal Filters</h5>
          <div class="saved-filters">
            <div class="filter-items d-flex justify-content-between pr-0" v-for="index in 3" :key="index">
              <span>Saved Filter #1</span>

              <b-dropdown text="..."
                          no-caret
                          variant="light"
                          class="m-2 b-compact-dropdown-button text-bold">
                <template #button-content>
                  <i class="fa fa-ellipsis-h"></i>
                </template>
                <b-dropdown-item href="#"><pencil-icon></pencil-icon> Rename</b-dropdown-item>
                <b-dropdown-item href="#"><trash-o-icon></trash-o-icon> Delete</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <h5 class="text-uppercase filter-group-title mt-4">Company Filters</h5>
          <div class="saved-filters">
            <div class="filter-items"><span>Saved Company Filter Saved Company Filter #1</span></div>
            <div class="filter-items"><span>Saved Company Filter #2</span></div>
            <div class="filter-items"><span>Saved Company Filter #3</span></div>
          </div>
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="container d-flex justify-content-between mb-3 action-option-container">
          <div>
            <span class="filter-name">(Unsaved) Filter</span>
          </div>
          <div>
            <compact-btn variant="secondary"
                         class="bg-grey-80 mr-3"
                         :disabled="channelChangedFilterFields.length < 1"
                         @clicked="onResetFilter">Reset</compact-btn>
            <compact-btn variant="primary">Save</compact-btn>
            <compact-btn variant="primary"
                         class="ml-3"
                         v-show="false">Save as New</compact-btn>
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
import CompactBtn from 'components/compact-btn'
import PencilIcon from 'components/icons/pencil-icon'
import TrashOIcon from 'components/icons/trash-o-icon'

export default {
  name: 'filter-dialog',

  components: { TrashOIcon, PencilIcon, CompactBtn, FilterForm },

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
