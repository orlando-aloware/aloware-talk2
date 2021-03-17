import { storiesOf } from '@storybook/vue'

import TaskAvatar from './task-avatar'
import TaskDeclineBtn from './task-decline-btn'
import TaskMessageBtn from './task-message-btn'
import TaskAcceptBtn from './task-accept-btn'
import TaskContact from './task-contact'

const taskAvatarInitial = () => ({
  components: { TaskAvatar },
  template: '<task-avatar>WB</task-avatar> '
})

const taskAvatarSrc = () => ({
  components: { TaskAvatar },
  template: '<task-avatar src="https://randomuser.me/api/portraits/women/95.jpg">WB</task-avatar> '
})

const taskAvatarAnimated = () => ({
  components: { TaskAvatar },
  template: '<task-avatar animated>WB</task-avatar> '
})

const taskDeclineBtn = () => ({
  components: { TaskDeclineBtn },
  template: '<task-decline-btn />'
})

const taskMessageBtn = () => ({
  components: { TaskMessageBtn },
  template: '<task-message-btn />'
})

const taskAcceptBtn = () => ({
  components: { TaskAcceptBtn },
  template: '<task-accept-btn />'
})

const taskContact = () => ({
  components: { TaskContact },
  template: '<task-contact name="Walter Bowman" number="(111) 222-3333" />'
})

storiesOf('Inbox - Task', module)
  .add('Avatar - Initial', taskAvatarInitial)
  .add('Avatar - Image', taskAvatarSrc)
  .add('Avatar - Animated', taskAvatarAnimated)
  .add('Action - Decline', taskDeclineBtn)
  .add('Action - Message', taskMessageBtn)
  .add('Action - Accept', taskAcceptBtn)
  .add('Contact Label', taskContact)
