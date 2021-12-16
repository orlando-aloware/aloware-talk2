<template>
  <div>
    <q-btn-dropdown
      split
      class="q-shared-login-menu-dropdown "
      color="primary"
      label=""
      padding="0px 10px"
      :menu-offset="[4, 16]"
      @click="onMainClick"
    >

      <template slot="label">
        <i class="fas fa-arrow-right"></i>  <span>Aloware (Classic)</span>
      </template>

      <q-list class="q-shared-login-menu-dropdown-list pl-4 pr-4">
        <q-item>
          <q-item-section>
            <q-item-label class="text-grey-90">Open on Login:</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <b-form-radio inline
                          value="0"
                          v-model="defaultLogin">
              Aloware Talk
            </b-form-radio>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <b-form-radio inline
                          value="1"
                          v-model="defaultLogin">
              Aloware (Classic)
            </b-form-radio>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>

import electron from 'electron'

export default {
  name: 'shared-login-menu',
  data () {
    return {
      defaultLogin: 0
    }
  },
  methods: {
    onMainClick () {
      let userAgent = navigator.userAgent.toLowerCase()
      if (userAgent.indexOf(' electron/') > -1) {
        electron.shell.openExternal(process.env.API_URL)
      } else {
        window.location.href = process.env.API_URL
      }
    },
    onItemClick () {}
  }
}
</script>
