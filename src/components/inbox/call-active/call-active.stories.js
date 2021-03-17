import CallActive from './call-active.vue'

import { storiesOf } from '@storybook/vue'

const active = () => ({
  components: { CallActive },
  template: '<call-active name="Walter Bowman" time="01:03" />'
})

storiesOf('Inbox - Active Call', module)
  .add('Common', active)
