import RelativeTime from './relative-time.vue'

import { storiesOf } from '@storybook/vue'

const relativeTime = () => ({
  components: { RelativeTime },
  template: '<relative-time fromTime="2020-03-16 00:00:00" :humanized="true"></relative-time>'
})

storiesOf('Commons', module)
  .add('RelativeTime', relativeTime)
