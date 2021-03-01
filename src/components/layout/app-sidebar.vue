<template>
  <div></div>
</template>

<script>
import auth from '../../boot/auth'
export default {
  name: 'Inbox',
  data () {
    return {
      auth: auth
    }
  },
  methods: {
    logout () {
      let deviceInfo = null
      const isMobile = this.$q.platform.is.cordova
      if (isMobile) {
        deviceInfo = {
          registration_id: localStorage.getItem('registrationId'),
          registration_type: localStorage.getItem('registrationType'),
          model: window.device.model,
          platform: window.device.platform,
          is_virtual: window.device.isVirtual,
          uuid: window.device.uuid,
          version: window.device.version,
          manufacturer: window.device.manufacturer,
          serial: window.device.serial,
          app_version: localStorage.getItem('version')
        }
      }
      this.auth.logout(deviceInfo).then(res => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
