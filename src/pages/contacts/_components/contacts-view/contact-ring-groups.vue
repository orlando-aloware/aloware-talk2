<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Contact Ring Groups</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute"
              size="sm"
              variant="light" id="btn-update-contact-ring-groups">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary" class="badge-tag badge-tag-primary ellipsis">Sales #1 Sales #1 Sales #1 Sales #1 Sales #1</b-badge>
      <b-badge variant="primary" class="badge-tag badge-tag-primary ellipsis">Sales #2</b-badge>
      <b-badge variant="primary" class="badge-tag badge-tag-primary ellipsis">Aloware</b-badge>
    </div>
    <update-ring-groups-popover target="btn-update-contact-ring-groups"></update-ring-groups-popover>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import contactApi from '../../contacts.api'
import UpdateRingGroupsPopover from 'pages/contacts/_components/popover/contact/update-ring-group-popover'

export default {
  name: 'contact-ring-groups',
  components: { UpdateRingGroupsPopover },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      ring_groups: []
    }
  },
  methods: {
    getContactRingGroups () {
      return contactApi.getRingGroups(this.contact.id).then(response => {
        this.ring_groups = response.data
      })
    }
  },
  watch: {
    contact: function () {

    }
  }
}
</script>

<style lang="scss" scoped>
  .card:hover {
    .btn-edit-action{
      opacity: 1;
    }
  }

  .btn-edit-action {
    right: 10px;
    top: 10px;
    opacity: 0;
  }
</style>
