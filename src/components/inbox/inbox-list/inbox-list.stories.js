import InboxList from './inbox-list.vue'

import { storiesOf } from '@storybook/vue'

import auth from 'boot/auth'

const inboxList = () => ({
  components: { InboxList },
  data () {
    return {
      auth: auth
    }
  },
  template: '<inbox-list v-if="auth.user.profile" />'
})

storiesOf('Inbox - List', module)
  .add('Inbox List', inboxList)
