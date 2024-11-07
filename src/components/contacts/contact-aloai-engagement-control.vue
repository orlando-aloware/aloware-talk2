<template>
  <b-card class="border-0 position-relative contact-about-wrapper" v-if="profile?.company?.aloai_enabled">
    <h4>AloAi Text Bot Engagement</h4>

    <b-card-text class="fs-14 mt-2">
      Control which bots this contact is allowed to interact with.
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
        <settings-mobile-icon
          width="16"
          height="16"
        />
        Manage
      </b-button>
    </div>

    <aloai-engagement-control-modal ref="aloaiEngagementControlModalRef" />
  </b-card>
</template>

<script>
import SettingsMobileIcon from 'components/icons/mobile-menu/settings-mobile-icon'
import AloaiEngagementControlModal from 'components/aloai-engagement-control-modal.vue'
import { mapGetters } from 'vuex'
import BlockTooltip from 'components/kyc/block-tooltip'

export default {
  name: 'contact-aloai-engagement-control',

  components: { AloaiEngagementControlModal, SettingsMobileIcon, BlockTooltip },

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
    openEngagementControlModal () {
      if (this.$refs.aloaiEngagementControlModalRef) {
        this.$refs.aloaiEngagementControlModalRef.isOpen = true
      }
    }
  }
}
</script>

<style lang="scss">
.btn-aloai-engagement-control {
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
      stroke: #1976d3;
    }
  }
}
</style>
