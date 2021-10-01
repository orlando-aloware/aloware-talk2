<template>
  <div class="metric-loader p-0 d-inline-block m-2">
    <q-card flat
      class="metric-box text-black p-3">
      <div>
        <q-skeleton
          height="40px"
          class="bg-lightgrey mt-2" />
      </div>
      <div>
        <q-skeleton
          height="20px"
          class="bg-lightgrey mt-4 mb-0 " />
      </div>
    </q-card>
  </div>
</template>

<script>

export default {
  name: 'MetricLoader'
}
</script>
