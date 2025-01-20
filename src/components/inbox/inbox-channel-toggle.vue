<template>
  <div class="channel-toggle-wrapper d-flex align-items-center w-100 p-0 m-0">
    <q-btn-toggle
      v-model="selectedChannel"
      class="channel-toggle w-100"
      no-caps
      rounded
      unelevated
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      spread
      :options="[
        {label: 'Calls', value: 'calls'},
        {label: 'Messages', value: 'messages'}
      ]"
    />
  </div>
</template>

<script>
export default {
  name: 'inbox-channel-toggle',

  data () {
    return {
      selectedChannel: 'calls'
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 8px 16px;

  .channel-toggle {
    .q-btn {
      min-height: 28px;
      padding: 2px 24px;
      font-size: 14px;
      font-weight: 500;
    }

    .q-btn--active {
      font-weight: 600;
    }
  }
}
</style>
