<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex flex-grow-1">
      <card class="flex-grow-1 w-100 border-0 pt-2">
        <div class="d-flex align-items-center mb-2 pl-3 pr-2">
          <div class="d-flex flex-grow-1 flex-column flex-lg-row align-items-start align-items-lg-center">
            <slot name="title" />
          </div>
          <slot name="options" />
        </div>
        <div class="table-header d-flex align-items-center">
          <div class="pl-3 py-lg-0 w-100">
            <div class="row mx-0 relative-position w-100">
              <slot name="actions" />
            </div>
          </div>
        </div>
        <b-overlay rounded="sm"
                   :show="loading">
          <div class="datatable-wrapper">
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
import card from 'components/card'

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
