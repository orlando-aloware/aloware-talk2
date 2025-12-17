import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  data () {
    return {
      showIncomingCallMenu: false,
      showParkedCallMenu: false,
      isRejecting: false,
      isHangingUp: false,
      isParking: false,
      isAnsweringCall: false
    }
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('contacts', ['contact']),

    contactCampaignsFromCommunications () {
      if (this.contact && this.campaigns.length) {
        return this.campaignsAlphabeticalOrder
        // .filter((cmp) => {
        //   if (this.selectedContactCampaigns.includes(cmp.id)) {
        //     return true
        //   }
        // })

        // const campaign = { data: null }
        // for (campaign.data of contactCampaigns) {
        //   campaign.data.unread_count = this.communicationsAndAudits.filter((comm) => {
        //     if (comm.type && (comm.type === CommunicationTypes.SMS || (comm.type === CommunicationTypes.CALL && [CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW].includes(comm.disposition_status2))) && comm.is_read === false && comm.campaign_id === campaign.data.id) {
        //       return true
        //     }
        //   }).length
        // }
        //
        // return contactCampaigns
      }

      return []
    },

    otherCampaignsFromCommunications () {
      if (this.campaigns && this.contactCampaignsFromCommunications) {
        return _.difference(this.campaignsAlphabeticalOrder, this.contactCampaignsFromCommunications)
      } else if (this.campaigns) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        return _.clone(this.campaigns).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  }
}
