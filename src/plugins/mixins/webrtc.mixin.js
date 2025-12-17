import _ from 'lodash'
import { mapGetters } from 'vuex'
import * as Carriers from '../../constants/carriers'

export default {
  computed: {
    ...mapGetters('auth', ['user']),
    supportsWebrtc () {
      const browser = window.Bowser.getParser(window.navigator.userAgent)
      if (_.get(this.user, 'profile.carrier_name') === Carriers.TWILIO) {
        return browser.satisfies({
          chrome: '>=56',
          firefox: '>=51',
          msedge: '>=38',
          safari: '>=11'
        })
      }
      return false
    }
  }
}
