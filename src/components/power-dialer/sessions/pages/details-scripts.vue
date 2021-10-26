<template>
  <q-card flat class="p-0">
    <q-card-section class="px-0" style="overflow:auto;">

      <q-select
        v-model="resources.leads"
        :options="resources.options"
        outlined
        class="px-3" />
      <div
        v-html="resources.message"
        class="t-scroll-y2 py-3 px-3"
        style="overflow:auto;"></div>

    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'DetailsLeads',
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
