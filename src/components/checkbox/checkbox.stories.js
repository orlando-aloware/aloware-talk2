import Checkbox from './checkbox'

import { storiesOf } from '@storybook/vue'

const primaryButton = () => ({
  components: { Checkbox },
  template: '<checkbox />'
})

storiesOf('Checkbox', module)
  .add('Common', primaryButton)
