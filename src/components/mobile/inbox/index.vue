<template>
  <div class="h-100 d-block d-sm-none"
       style="max-width: 992px;">
    <q-tabs v-model="tabName"
            no-caps
            inline-label
            dense
            :mobile-arrows="false"
            class="bg-white text-black border-bottom"
            content-class="flex-nowrap">
      <q-tab name="all" label="All" />
      <q-tab name="messages" label="Messages" />
      <q-tab name="calls" label="Calls" />
      <q-tab name="voicemails" label="Voicemails" />
      <q-tab name="recordings" label="Recordings" />
    </q-tabs>
    <q-tab-panels v-model="tabName"
                  animated
                  class="h-100">
      <q-tab-panel name="all">
        <mobile-inbox-all></mobile-inbox-all>
      </q-tab-panel>
      <q-tab-panel name="messages">
        <div class="text-h6">Alarms</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
      <q-tab-panel name="calls">
        <div class="text-h6">Movies</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
      <q-tab-panel name="voicemails">
        <div class="text-h6">Movies</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
      <q-tab-panel name="recordings">
        <div class="text-h6">Movies</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import MobileInboxAll from 'components/mobile/inbox/all'
export default {
  name: 'mobile-inbox',
  components: { MobileInboxAll },
  data () {
    return {
      tabName: 'all'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
