import { storiesOf } from '@storybook/vue'

import MessageBox from './message-box'
import MessageHeader from './message-header'

const header = () => ({
  components: { MessageHeader },
  methods: {
    decline () {
      console.log('decline')
    },
    answer () {
      console.log('answer1')
    },
    info () {
      console.log('info')
    }
  },
  template: '<message-header name="John Dave Decano" status="Inbound..." @answer="answer" @decline="decline" @info="info" /> '
})

const messagebox = () => ({
  components: { MessageBox },
  methods: {
    decline () {
      console.log('decline')
    },
    answer () {
      console.log('answer1')
    },
    info () {
      console.log('info')
    }
  },
  template: '<message-box /> '
})
storiesOf('Inbox - Message', module)
  .add('Header', header)
  .add('Message Box', messagebox)
