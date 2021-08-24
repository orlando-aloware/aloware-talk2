<template>
  <b-modal
    id="inbox-channel-filter-modal"
    size="xl"
    modal-class="confirm-dialog"
    hide-header-close
    hide-header
    ref="inbox-channel-filter-modal">

    <div class="modal-body-wrapper d-flex">
      <div class="w-25 left-column-wrapper">
        <span class="filter-type-description">Calls & Recordings</span>

        <div class="mt-5">
          <div class="mb-4">
            <b-button size="sm" block disabled>Create New</b-button>
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
            <b-button size="sm" @click="onResetFilter">Reset</b-button>
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
        @click="hide()"
      >
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import FilterForm from 'components/inbox/inbox-filters/filter-form'

export default {
  name: 'filter-dialog',

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  components: { FilterForm },

  methods: {
    onResetFilter: function () {
      this.$emit('onResetFilter')
    }
  }
}
</script>
