<template>
  <div class="d-flex justify-content-center" v-b-tooltip.hover="{ customClass: 'tooltip-dark'}" :title="tooltip">
    <div
      class="alert alert-warning border-warning p-2 mb-0"
    >
      <slot />
    </div>
  </div>
</template>

<script>

export default {
  name: 'talk-alert-banner',
  props: {
    tooltip: {
      type: String
    }
  }
}
</script>

<style scoped>
.tooltip-dark::v-deep(.tooltip-inner)
{
  font-weight: bold;
  font-size: 14px !important;
  background-color: #000 !important;
  color: #fff !important;
}
</style>
