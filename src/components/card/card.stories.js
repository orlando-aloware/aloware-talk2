import Card from './card.vue'

import { storiesOf } from '@storybook/vue'

export default { title: 'default' }

const commonCard = () => ({
  components: { Card },
  template: '<card>test</card>'
})

const withShadowCard = () => ({
  components: { Card },
  template: '<card shadow>test</card>'
})

storiesOf('Cards', module)
  .add('common', commonCard)
  .add('shadow', withShadowCard)
