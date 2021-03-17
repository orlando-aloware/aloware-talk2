import DialerSearch from './dialer-search.vue'
import DialerHeader from './dialer-header.vue'
import DialerSelect from './dialer-select.vue'

import { storiesOf } from '@storybook/vue'

const search = () => ({
  components: { DialerSearch },
  methods: {
    log (value) {
      console.log(value)
    }
  },
  template: '<dialer-search @search="log" />'
})

const header = () => ({
  components: { DialerHeader },
  template: '<dialer-header />'
})

const select = () => ({
  components: { DialerSelect },
  template: '<dialer-select />'
})

storiesOf('Inbox - Dialer', module)
  .add('Search', search)
  .add('Header', header)
  .add('Select', select)
