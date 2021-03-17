import { configure } from '@storybook/vue'
import { setConsoleOptions } from '@storybook/addon-console'

import Vue from 'vue'

import Quasar from 'quasar'

import 'bootstrap/scss/bootstrap.scss'
// import 'bootstrap-vue/src/index.scss';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import 'quasar/dist/quasar.min.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'

import './../src/css/breakpoints.scss'
import './../src/css/quasar.variables.scss'
import './../src/css/mixins.scss'
import './../src/css/fonts.scss'
import './../src/css/variables.scss'

Vue.use(Quasar)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

configure(require.context('../src', true, /\.stories\.js$/), module)

setConsoleOptions({
  panelExclude: [],
})
