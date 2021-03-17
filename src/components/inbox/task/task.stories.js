import { storiesOf } from '@storybook/vue'

import TaskAvatar from './task-avatar'
import TaskDeclineBtn from './task-decline-btn'
import TaskMessageBtn from './task-message-btn'
import TaskAcceptBtn from './task-accept-btn'
import TaskInfoBtn from './task-info-btn'
import TaskContact from './task-contact'
import TaskViewBtn from './task-view-btn'

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

const taskInfoBtn = () => ({
  components: { TaskInfoBtn },
  template: '<task-info-btn />'
})

const taskContact = () => ({
  components: { TaskContact },
  template: '<task-contact name="Walter Bowman" number="(111) 222-3333" />'
})

const taskViewBtn = () => ({
  components: { TaskViewBtn },
  template: '<task-view-btn />'
})

storiesOf('Inbox - Task', module)
  .add('Avatar - Initial', taskAvatarInitial)
  .add('Avatar - Image', taskAvatarSrc)
  .add('Avatar - Animated', taskAvatarAnimated)
  .add('Action - Decline', taskDeclineBtn)
  .add('Action - Message', taskMessageBtn)
  .add('Action - Accept', taskAcceptBtn)
  .add('Action - Info', taskInfoBtn)
  .add('Action - Conversation', taskViewBtn)
  .add('Contact Label', taskContact)
