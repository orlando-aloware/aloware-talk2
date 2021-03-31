<template>
  <div id="q-app">
    <router-view />
    <portal-target name="app" multiple></portal-target>
  </div>
</template>
<script>
export default {
  name: 'App'
}
</script>
