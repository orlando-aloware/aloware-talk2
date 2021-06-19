<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Contact Ring Groups</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute" size="sm"
              variant="light">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary badge-tag badge-tag-primary">Sales #1</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Sales #2</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Aloware</b-badge>
    </div>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import contactApi from '../../contacts.api'

export default {
  name: 'contact-ring-groups',
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

<style scoped>
.btn-edit-action {
  right: 10px;
  top: 10px;
}
</style>
