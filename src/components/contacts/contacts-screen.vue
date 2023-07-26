<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex flex-grow-1 overflow-hidden-y">
      <card class="flex-grow-1 w-100 border-0 pt-4">
        <div class="d-flex align-items-center mb-2 pl-3 pr-2 flex-grow-0">
          <div class="d-flex flex-grow-1 flex-column flex-lg-row align-items-start align-items-lg-center">
            <slot name="title" />
          </div>
          <slot name="options" />
        </div>
        <div class="table-header d-flex align-items-center border-bottom flex-grow-0">
          <div class="pl-3 py-lg-0 w-100">
            <div class="row mx-0 relative-position">
              <slot name="actions" />
            </div>
          </div>
        </div>
        <b-overlay class="flex-grow-1 overflow-hidden-y"
                   :show="loading"
                   rounded="sm">
          <div class="datatable-wrapper h-100 overflow-hidden-y">
            <slot name="table" />
          </div>
          <template #overlay>
            <q-spinner-bars color="primary"
                            size="40px" />
          </template>
        </b-overlay>
        <slot name="footer" />
      </card>
      <slot name="filters" />
    </div>
  </div>
</template>

<script>
import card from 'components/card.vue'

export default {
  components: {
    card
  },

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>
