import moment from 'moment'

export default {
  data () {
    return {
      isModalOpen: false
    }
  },
  methods: {
    // Checks if it's within contact daytime. If not, promps alert to user.
    checkContactTimezone (contact, makeCall, onCancelCall = null) {
      // if the modal is already open, we skip the next steps
      if (this.isModalOpen) {
        return
      }

      let { timezone, name } = contact

      // check contact has timezone or not
      if (timezone) {
        // if have timezone check is it day time?
        const startDay = moment()
          .tz(timezone)
          .hour(8)
          .minute(0)
          .second(0)
        const endDay = moment()
          .tz(timezone)
          .hour(18)
          .minute(0)
          .second(0)
        const contactLocalTime = moment().tz(contact.timezone)

        if (!contactLocalTime.isBetween(startDay, endDay)) {
          this.isModalOpen = true
          return this.$bvModal.msgBoxConfirm(
            `This is outside the contact's day time. Do you want to make a call? It's ${contactLocalTime.format(
              'hh:mm A'
            )} for ${name}.`,
            {
              buttonSize: 'sm',
              okTitle: 'OK',
              cancelTitle: 'Cancel',
              id: 'daytime-hours-confirmation',
              centered: true
            }
          ).then(confirm => {
            this.isModalOpen = false
            if (confirm) {
              makeCall()
              return
            }

            // if the user clicks on cancel and there's a callback, we call it to execute an action
            if (onCancelCall) {
              onCancelCall()
            }
          }).catch(() => {
            this.isModalOpen = false
            if (onCancelCall) {
              onCancelCall()
            }
          })
        }
      }

      makeCall()
    }
  }
}
