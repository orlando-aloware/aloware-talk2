<template>
  <div class="alw-contact-info-badges">
    <b-badge v-if="showLrnBadge"
             :href="lrnInfoUrl"
             :variant="lrnBadgeVariant"
             class="badge-phone-info"
             data-testid="contact-info-lrn-type-badge">
      <q-tooltip v-if="!isMobile && phone.lrn_type === LRN_NOT_PERFORMED">
        This contact exceeds the 1000-contact limit included in trial.
      </q-tooltip>
      {{ lrnBadgeText }}
    </b-badge>

    <b-badge v-if="showInvalidBadge"
             class="badge-phone-info"
             data-testid="contact-info-invalid-number-badge"
             variant="danger">
      Invalid Number
    </b-badge>

    <b-badge v-if="contact.is_dnc"
             class="badge-phone-info"
             data-testid="contact-info-dnc-badge"
             variant="danger">
      DNC
    </b-badge>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { LRN_NOT_PERFORMED } from 'src/constants/lrn-types'

export default {
  name: 'contact-info-badges',
  props: {
    contact: {
      type: Object,
      required: true
    },
    phone: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      LRN_NOT_PERFORMED
    }
  },
  computed: {
    ...mapState(['isMobile']),

    showLrnBadge () {
      return this.phone && this.$options.filters.validLrnType(this.phone.lrn_type)
    },

    lrnBadgeVariant () {
      return this.$options.filters.fixLrnTypeBadge(this.phone?.lrn_type)
    },

    lrnBadgeText () {
      return this.$options.filters.fixLrnType(this.phone?.lrn_type)
    },

    lrnInfoUrl () {
      return this.$options.filters.getUrlToLrnInfo(this.phone?.lrn_type)
    },

    showInvalidBadge () {
      return this.phone && this.phone.is_invalid
    }
  }
}
</script>

<style lang="scss" scoped>
.alw-contact-info-badges {
  display: flex;
  gap: 4px;
  align-items: center;

  // Ensure badges align properly
  .badge-phone-info {
    margin: 0; // Remove any default margins
    line-height: 1; // Normalize line-height
  }
}
</style>
