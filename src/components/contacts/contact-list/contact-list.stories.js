import ContactListHeader from './contact-list-header'
import ContactListItem from './contact-list-item'
import ContactListItems from './contact-list-items'
import ContactList from './contact-list'

import { storiesOf } from '@storybook/vue'

const header = () => ({
  components: { ContactListHeader },
  template: '<contact-list-header />'
})

const itemActive = () => ({
  components: { ContactListItem },
  template: '<contact-list-item icon="list-all" name="all" label="All" is-active count="23" color="orange" />'
})

const item = () => ({
  components: { ContactListItem },
  template: '<contact-list-item icon="list-all" name="all" label="All" count="23" color="red" />'
})

const items = () => ({
  components: { ContactListItems },
  template: '<contact-list-items />'
})

const itemsMain = () => ({
  components: { ContactList },
  template: '<contact-list />'
})

storiesOf('Contact - List', module)
  .add('Header', header)
  .add('Item - Default', item)
  .add('Item - Active', itemActive)
  .add('Items', items)
  .add('Main', itemsMain)
