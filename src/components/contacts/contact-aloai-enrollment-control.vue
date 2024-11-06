<template>
  <b-card class="border-0 position-relative contact-about-wrapper" v-if="this.profile.company.aloai_enabled">
    <h4>AloAi Text Bot Enrollment</h4>

    <b-card-text class="fs-14 mt-2">
      Enroll this contact to any of your Sales Bots and let them do the work for you!
    </b-card-text>

    <div id="engage-control-popover">
      <b-button
        variant="outline-primary"
        size="sm"
        class="btn-aloai-enrollment-control"
        block
        data-testid="aloai-enrollment-control-button"
        @click="openEnrollmententControlModal"
      >
        <add-user-icon data-testid="add-user-icon" height="12" width="12" />
        Enroll to Bot
      </b-button>
    </div>

    <aloai-enrollment-control-modal ref="aloaiEnrollmentControlModalRef" />
  </b-card>
</template>

<script>
import AddUserIcon from 'components/icons/add-user-icon-2'
import AloaiEnrollmentControlModal from 'components/aloai-enrollment-control-modal.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'contact-aloai-enrollment-control',

  components: { AloaiEnrollmentControlModal, AddUserIcon },

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('auth', ['profile'])
  },

  methods: {
    openEnrollmententControlModal () {
      if (this.$refs.aloaiEnrollmentControlModalRef) {
        this.$refs.aloaiEnrollmentControlModalRef.isOpen = true
      }
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/variables.scss';

.btn-aloai-enrollment-control {
  &:hover {
    svg {
      path {
        fill: $white;
      }
    }
  }

  svg {
    margin-top: -4px;

    path {
      fill: $primary;
    }
  }
}
</style>
