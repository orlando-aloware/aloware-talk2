import { storiesOf } from '@storybook/vue'

import TaskAvatar from './task-avatar'

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

storiesOf('Inbox - Task', module)
  .add('Avatar - Initial', taskAvatarInitial)
  .add('Avatar - Image', taskAvatarSrc)
  .add('Avatar - Animated', taskAvatarAnimated)
