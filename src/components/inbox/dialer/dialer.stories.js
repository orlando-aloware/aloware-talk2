import DialerSearch from './dialer-search.vue'

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

storiesOf('Inbox - Dialer', module)
  .add('Search', search)
