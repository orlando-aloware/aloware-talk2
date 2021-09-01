<template>
  <div class="q-pa-md q-gutter-sm px-0 py-0">
    <q-btn
      @click="alert = true"
      unelevated
      no-caps
      class="px-4 py-1"
      color="primary">
      <div class="row items-center no-wrap">
        <div class="text-center">
          + Add Report Group
        </div>
      </div>
    </q-btn>
    <q-dialog
      persistent
      v-model="alert"
      transition-show="jump-down">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Report Group</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" class="px-4" v-close-popup />
          <q-btn flat label="OK" color="primary" class="px-4" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddReportGroup',
  data () {
    return {
      alert: false
    }
  }
}
</script>
