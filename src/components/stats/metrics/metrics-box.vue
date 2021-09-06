<template>
  <div
    class="p-0 position-relative"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
    transtion-show="fade"
    transtion-hide="fade">
    <b-badge
      v-if="hovered"
      @click="confirmDeletion"
      class="bg-white p-0 m-0 contact-unread-badge d-flex justify-center align-items-center position-absolute"
      style="z-index:10; border:1px grey solid;"
      pill>
      <q-icon
        name="fa fa-times"
        class="text-grey cursor-pointer"
        style="font-size: 14px;padding:1px;" />
    </b-badge>
    <q-card flat
      class="metric-box text-black m-2">
      <q-card-section>
        <div :class="`metric-box-label text-weight-medium text-${color}`">
          {{ metric.value }}
        </div>
        <!-- <div class="text-subtitle2 pt-3"># of kemerut</div> -->
      </q-card-section>

      <q-card-section class="metric-box-desc q-pt-none text-lowercase">
        {{ metric.name }}
      </q-card-section>
    </q-card>
    <ConfirmDialog
      @close="closeModal"
      title="Remove Metric"
      :id="dialogName"
      :is-open="isOpen"
      :hide-header="true"
      :hide-footer="true"
      size="sm">
      <div slot="content">
        <div class="text-center text-h6 pb-4">
          <TrashIcon height="20" width="20" />
          Remove Metric?
        </div>
        <div class="text-center py-3">
          <div class="text-dark">
            <div v-html="`Do you want to remove this metric?`"></div>
          </div>
        </div>
        <div class="row text-center pt-3 pb-0">
          <div class="col-6 p-1">
            <b-button
              variant="dark-grey"
              class="f-btn--cancel"
              size="sm"
              block
              @click="closeModal">
              Cancel
            </b-button>
          </div>
          <div class="col-6 p-1">
            <b-button
              variant="danger"
              size="sm"
              block
              @click="removeSelectedMetric">
              Remove
            </b-button>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ConfirmDialog from 'components/confirm-dialog'
import TrashIcon from 'components/icons/trash-icon'
import {
  METRIC_OPTIONS_COLORS
} from 'src/constants/stats'

const colorOptions = { METRIC_OPTIONS_COLORS }

export default {
  name: 'MetricsBox',
  props: {
    metric: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    ConfirmDialog,
    TrashIcon
  },
  computed: {
    dialogName () {
      return `remove-metric-dialog-${this.metric.id}`
    },
    color () {
      let col = colorOptions.METRIC_OPTIONS_COLORS.find(c => {
        return c.value === this.metric.color
      })
      if (col) {
        return col.color
      } else {
        return 'black'
      }
    }
  },
  data () {
    return {
      hovered: false,
      isOpen: false
    }
  },
  watch: {
    isOpen (val) {
      if (val) {
        this.$bvModal.show(this.dialogName)
      } else {
        this.$bvModal.hide(this.dialogName)
      }
    }
  },
  methods: {
    ...mapActions('stats', [
      'deleteMetrics'
    ]),
    confirmDeletion () {
      this.isOpen = true
    },
    closeModal () {
      this.isOpen = false
    },
    async removeSelectedMetric () {
      await this.deleteMetrics(this.metric.id)
      this.closeModal()
    }
  }
}
</script>
