import InboxList from './inbox-list.vue'
import { storiesOf } from '@storybook/vue'
import { mapState } from 'vuex'

const inboxList = () => ({
  components: { InboxList },
  computed: {
    ...mapState('auth', ['profile'])
  },
  template: '<inbox-list v-if="auth.user.profile" />'
})

storiesOf('Inbox - List', module)
  .add('Inbox List', inboxList)
