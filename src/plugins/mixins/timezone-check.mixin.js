import moment from 'moment'

export default {
  data () {
    return {
      isModalOpen: false
    }
  },
  methods: {
    // Checks if it's within contact daytime. If not, promps alert to user.
    checkContactTimezone (params, makeCall, onCancelCall = null) {
      // if the modal is already open, we skip the next steps
      if (this.isModalOpen) {
        return
      }

      let { timezone, name } = params
      const openTime = params.calls_notifications_settings.open_time
      const closeTime = params.calls_notifications_settings.close_time
      // check contact has timezone or not
      if (timezone) {
        const contactLocalTime = moment().tz(timezone)
        const startDay = moment.tz(
          `${contactLocalTime.format('YYYY-MM-DD')} ${openTime}`,
          'YYYY-MM-DD HH:mm',
          timezone
        )
        const endDay = moment.tz(
          `${contactLocalTime.format('YYYY-MM-DD')} ${closeTime}`,
          'YYYY-MM-DD HH:mm',
          timezone
        )

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
