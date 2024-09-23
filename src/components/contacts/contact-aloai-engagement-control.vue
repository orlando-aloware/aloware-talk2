<template>
  <b-card class="border-0 position-relative contact-about-wrapper" v-if="this.profile.company.aloai_enabled">
    <h4>AloAi</h4>

    <b-card-text class="fs-14 mt-2">
      This contact is engaged with one or more bots.
    </b-card-text>

    <block-tooltip
      placement="left"
      triggers="hover"
      target="aloai-engagement-control-popover"
      task="sequences.enroll"
      data-testid="aloai-engagement-control-tooltip"
    />

    <div id="engage-control-popover">
      <b-button
        variant="outline-primary"
        size="sm"
        class="btn-aloai-engagement-control"
        block
        data-testid="aloai-engagement-control-button"
        @click="openEngagementControlModal"
      >
        <add-user-icon data-testid="add-user-icon" height="12" width="12" />
        Engagement Control
      </b-button>
    </div>

    <aloai-engagement-control-modal ref="aloaiEngagementControlModalRef" />
  </b-card>
</template>

<script>
import AddUserIcon from 'components/icons/add-user-icon-2'
import AloaiEngagementControlModal from 'components/aloai-engagement-control-modal.vue'
import { mapGetters, mapState } from 'vuex'
import BlockTooltip from 'components/kyc/block-tooltip'

export default {
  name: 'contact-aloai-engagement-control',

  components: { AloaiEngagementControlModal, AddUserIcon, BlockTooltip },

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts')
  },

  methods: {
    openEngagementControlModal () {
      if (this.$refs.aloaiEngagementControlModalRef) {
        this.$refs.aloaiEngagementControlModalRef.isOpen = true
      }
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/variables.scss';

.btn-aloai-engagement-control {
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
