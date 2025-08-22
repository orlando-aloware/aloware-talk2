<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2">
              {{ SettingsMap.contact_customization.title }}
            </h1>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.contact_customization.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Contact Fields</h5>
            <p class="form-helper-text">{{ SettingsMap.contact_customization.description }}</p>
          </div>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import SettingsMap from 'components/settings/settings-map'

export default {
  name: 'contact-customization',

  computed: {
    SettingsMap () {
      return SettingsMap
    }
  }
}
</script>

<style>

</style>
