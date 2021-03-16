import Avatar from './avatar.vue'

import { storiesOf } from '@storybook/vue'

const withImage = () => ({
  components: { Avatar },
  template: '<avatar src="https://uifaces.co/our-content/donated/KtCFjlD4.jpg">JD</avatar>'
})

const withInitial = () => ({
  components: { Avatar },
  template: '<avatar>JD</avatar>'
})

const withActive = () => ({
  components: { Avatar },
  template: '<avatar src="https://uifaces.co/our-content/donated/KtCFjlD4.jpg" active>JD</avatar>'
})

const withActiveInitial = () => ({
  components: { Avatar },
  template: '<avatar active>JD</avatar>'
})

storiesOf('Avatar', module)
  .add('Image', withImage)
  .add('Initial', withInitial)
  .add('Active Avatar', withActive)
  .add('Active Initial', withActiveInitial)
