<template>
  <div>
    <div class="page-navigation d-block d-sm-none"
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
  </div>
</template>

<script>
export default {
  name: 'Inbox',
  data () {
    return {
      tabName: 'all'
    }
  }
}
</script>
