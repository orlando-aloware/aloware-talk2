import IconButton from './icon-button.vue'
import PhoneIcon from 'components/icons/phone-icon.vue'

import { storiesOf } from '@storybook/vue'

const primaryButton = () => ({
  components: { IconButton, PhoneIcon },
  template: '<icon-button>' +
    '<template slot="icon"><phone-icon iconColor="#ffffff" width="16px" height="16px" /></template> ' +
    '<template slot="text">Add Contact</template> ' +
    '</icon-button>'
})

const dangerButton = () => ({
  components: { IconButton, PhoneIcon },
  template: '<icon-button variant="danger" no-icon>' +
    '<template slot="text">Danger</template> ' +
    '</icon-button>'
})

const outlineButton = () => ({
  components: { IconButton, PhoneIcon },
  template: '<icon-button outline>' +
    '<template slot="icon"><phone-icon iconColor="#00bf4a" width="16px" height="16px" /></template> ' +
    '<template slot="text">Add Contact</template> ' +
    '</icon-button>'
})

storiesOf('IconButton', module)
  .add('Primary', primaryButton)
  .add('Danger - No Icon', dangerButton)
  .add('Outline', outlineButton)
