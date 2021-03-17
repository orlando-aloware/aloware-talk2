import DialerSearch from './dialer-search.vue'
import DialerHeader from './dialer-header.vue'
import DialerSelect from './dialer-select.vue'
import DialerItem from './dialer-item.vue'

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

const items = () => ({
  components: { DialerItem },
  template: `
    <div class="d-flex flex-column">
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
      <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim" number="(000) 111-2222" />
    </div>
  `
})

storiesOf('Inbox - Dialer', module)
  .add('Search', search)
  .add('Header', header)
  .add('Select', select)
  .add('items', items)
