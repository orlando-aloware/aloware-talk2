import { Userpilot } from 'userpilot'

export default {
  /**
   * Userpilot user identification
   *
   * @param {object} profile
   * @return void
   */
  auth: (profile) => {
    if (!process.env.USERPILOT_APPTOKEN) {
      return
    }

    Userpilot.identify(
      profile.id,
      {
        name: profile.name,
        email: profile.email,
        created_at: profile.created_at,
        company:
        {
          id: profile.company.id,
          name: profile.company.name,
          created_at: profile.company.created_at
        }
      }
    )
  }
}
