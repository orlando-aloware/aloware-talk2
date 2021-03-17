import CallsHeader from './calls-header.vue'
import CallsListItem from './calls-list-item.vue'
import CallsListSection from './calls-list-section.vue'

import { storiesOf } from '@storybook/vue'

const labels = () => ({
  components: { CallsHeader },
  template: '<calls-header label="Inbound Calls"/>'
})

const section = () => ({
  components: { CallsListSection },
  template: '<calls-list-section label="Inbound Calls" count="2" />'
})

const callListItem = () => ({
  components: { CallsListItem },
  template: '<calls-list-item name="Mariah Carey" number="(222) 111-3333" />'
})

const callListItemAvatar = () => ({
  components: { CallsListItem },
  template: '<calls-list-item avatar="https://randomuser.me/api/portraits/women/44.jpg" name="Mariah Carey" number="(222) 111-3333" />'
})

storiesOf('Inbox - Calls', module)
  .add('Header', labels)
  .add('Call Item', callListItem)
  .add('Call Item with Avatar', callListItemAvatar)
  .add('Section', section)
