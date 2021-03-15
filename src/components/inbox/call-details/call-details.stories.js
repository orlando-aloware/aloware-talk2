import CallDetailsLabel from './call-details-label.vue'
import CallDetailsTag from './call-details-tag.vue'
import CallDetailsHeader from './call-details-header.vue'
import CallDetailsCard from './call-details-card.vue'

import { storiesOf } from '@storybook/vue'

export default { title: 'default' }

const labels = () => ({
  components: { CallDetailsLabel },
  template: '<call-details-label label="Phone" value="(111) 222-3333" />'
})

const tags = () => ({
  components: { CallDetailsTag },
  template: '<div><call-details-tag name="Other Tag" /> <call-details-tag name="Other Tag" /> <call-details-tag name="Other Tag" /></div>'
})

const header = () => ({
  components: { CallDetailsHeader },
  template: '<call-details-header name="Anoosh R" /> '
})

const card = () => ({
  components: { CallDetailsCard },
  template: '<call-details-card /> '
})

storiesOf('Inbox - Call Information', module)
  .add('Labels', labels)
  .add('Tags', tags)
  .add('Header', header)
  .add('Card', card)