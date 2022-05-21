<template>
  <div class="d-block d-sm-none"
       style="max-width: 992px;">
    <q-tabs v-model="tabName"
            no-caps
            inline-label
            dense
            class="bg-white text-black border-bottom"
            content-class="flex-nowrap">
      <q-tab name="all" label="All" />
      <q-tab name="messages" label="Messages" />
      <q-tab name="calls" label="Calls" />
      <q-tab name="voicemails" label="Voicemails" />
      <q-tab name="recordings" label="Recordings" />
    </q-tabs>
  </div>
</template>

<script>
export default {
  name: 'mobile-inbox',
  data () {
    return {
      tabName: 'all'
    }
  }
}
</script>

<style scoped>

</style>
