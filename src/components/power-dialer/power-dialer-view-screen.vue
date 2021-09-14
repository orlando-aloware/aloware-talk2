<template>
  <div class="d-flex flex-column h-100 pt-2">
    <div class="d-flex align-items-center mb-2 pl-3 pr-2">
      <div
        class="h6 d-flex flex-grow-1 flex-column flex-lg-row align-items-start align-items-lg-center">
        <slot name="title" />
      </div>
      <slot name="options" />
    </div>
    <div class="d-flex flex-grow-1">
      <Card class="flex-grow-1 w-100 border-0">
        <slot name="actions" />
        <b-overlay
          rounded="sm">
          <div class="datatable-wrapper">
            <slot name="table" />
          </div>
          <template #overlay>
            <q-spinner-bars color="primary" size="40px" />
          </template>
        </b-overlay>
        <slot name="footer" />
      </Card>
      <slot name="filters" />
    </div>
  </div>
</template>

<script>

import Card from 'components/card.vue'

export default {
  name: 'PowerDialerViewScreen',
  components: {
    Card
  }
}
</script>
