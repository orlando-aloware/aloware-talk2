import moment from 'moment'

export default {
  methods: {
    // Checks if it's within contact daytime. If not, promps alert to user.
    checkContactTimezone (contact, makeCall) {
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
          return this.$bvModal.msgBoxConfirm(
            `This is outside the lead's day time. Do you want to make a call? It's ${contactLocalTime.format(
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
            if (confirm) {
              makeCall()
            }
          })
        }
      }

      makeCall()
    }
  }
}
