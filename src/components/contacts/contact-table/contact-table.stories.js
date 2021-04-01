import ContactTableHeader from './contact-table-header'

import { storiesOf } from '@storybook/vue'

const header = () => ({
  components: {
    ContactTableHeader
  },
  template: '<contact-table-header />'
})

storiesOf('Contact - Table', module)
  .add('Header', header)
