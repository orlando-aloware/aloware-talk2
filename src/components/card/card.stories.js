import Card from './card.vue'

import { storiesOf } from '@storybook/vue'

const commonCard = () => ({
  components: { Card },
  template: '<card>test</card>'
})

const withShadowCard = () => ({
  components: { Card },
  template: '<card shadow>test</card>'
})

storiesOf('Card', module)
  .add('Common', commonCard)
  .add('Shadow', withShadowCard)
