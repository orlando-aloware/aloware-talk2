<template>
  <div id="q-app">
    <router-view />
    <portal-target name="app" multiple></portal-target>
    <action-notification id="system"/>
    <action-notification id="sms"/>
    <action-notification id="call"/>
    <action-notification id="voicemail"/>
    <action-notification id="mention"/>
    <action-notification id="incomingCall" position="b-toaster-top-center"/>
  </div>
</template>
<script>
import ActionNotification from 'components/action-notification'
export default {
  name: 'App',
  components: { ActionNotification }
}
</script>
