<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex align-items-center mb-2">
      <div
        class="h6 d-flex flex-grow-1 flex-column flex-lg-row align-items-start align-items-lg-center"
      >
        <slot name="title" />
      </div>
      <slot name="options" />
    </div>
    <div class="d-inline-flex">
      <card class="flex-grow-1" style="width: auto">
        <div class="table-header d-flex align-items-center border-bottom">
          <div class="px-3 py-3 py-lg-0 w-100">
            <div class="row mx-0 relative-position">
              <slot name="actions" />
            </div>
          </div>
        </div>
        <b-overlay
          :show="loading"
          spinner-variant="success"
          spinner-type="grow"
          rounded="sm"
        >
          <div class="datatable-wrapper">
            <slot name="table" />
          </div>
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

<style lang="scss" scoped>
@import '../../css/mixins';
@import '../../css/variables';
@import '../../css/breakpoints';
.table-header {
  min-height: 58px;
}
.datatable-wrapper {
  height: calc(100vh - 198px);
}
</style>
