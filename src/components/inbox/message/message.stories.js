import { storiesOf } from '@storybook/vue'

import MessageBox from './message-box'
import MessageHeader from './message-header'
import MessageChatBubble from './message-chat-bubble'
import MessageCall from './message-call'
import MessageMarker from './message-marker'

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
  template: '<message-box /> '
})

const chatbubbles = () => ({
  components: { MessageChatBubble, MessageCall },
  template: `
    <div>
      <message-chat-bubble color="green" time="10:40 PM" body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."></message-chat-bubble>
      <message-chat-bubble color="grey" time="10:40 PM"  body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
      <message-chat-bubble color="white" time="10:40 PM" body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non feugiat lectus."/>
      <message-chat-bubble color="white" time="10:40 PM">
        <message-call color="green" text="Outbound" time="0:40" />
      </message-chat-bubble>
      <message-chat-bubble color="white" time="10:40 PM">
        <message-call color="red" text="Missed Call" time="0:40" />
      </message-chat-bubble>
    </div>
  `
})

const missedcalls = () => ({
  components: { MessageCall },
  template: `
    <div>
      <message-call color="green" text="Outbound" time="0:40" />
      <message-call color="red" text="Missed Call" text-color="red"/>
    </div>
  `
})

const divider = () => ({
  components: { MessageMarker },
  template: `
    <div>
      <message-marker text="yesterday" />
      <message-marker text="today" />
    </div>
  `
})

storiesOf('Inbox - Message', module)
  .add('Header', header)
  .add('Message Box', messagebox)
  .add('Chat Bubbles', chatbubbles)
  .add('Missed Calls', missedcalls)
  .add('Divider', divider)
