<template>
  <div class="d-flex flex-column h-100">
    <card class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="h5 text-muted text-center">
        <div class="mb-3">
          List does not exists
        </div>
        <a href="/contacts" class="btn btn-outline-primary">Go back</a>
      </div>
    </card>
  </div>
</template>

<script>
import card from 'components/card.vue'

export default {
  components: {
    card
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.table-header {
  min-height: 58px;
}
</style>
