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
        <aloai-icon height="10" width="10" />
        Enroll to Bot
      </b-button>
    </div>

    <aloai-enrollment-control-modal ref="aloaiEnrollmentControlModalRef" />
  </b-card>
</template>

<script>
import AloaiIcon from 'components/icons/aloai-icon'
import AloaiEnrollmentControlModal from 'components/aloai-enrollment-control-modal.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'contact-aloai-enrollment-control',

  components: { AloaiEnrollmentControlModal, AloaiIcon },

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
.btn-aloai-enrollment-control {
  &:hover {
    svg {
      path {
        fill: #FFFFFF;
      }
    }
  }

  svg {
    margin-top: -4px;

    path {
      fill: #1976d3;
    }
  }
}
</style>
