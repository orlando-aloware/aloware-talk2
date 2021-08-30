<template>
  <div
    class="col-4 col-md-3 col-lg-2 p-0 position-relative"
    @mouseover="hovered = true"
    @mouseleave="hovered = false">
    <b-badge
      v-if="hovered"
      @click="removeSelectedMetric"
      class="bg-white p-0 m-0 contact-unread-badge d-flex justify-center align-items-center position-absolute"
      style="z-index:10; border:1px grey solid;"
      pill>
      <q-icon
        name="fa fa-times"
        class="text-grey"
        style="font-size: 14px;padding:1px;" />
    </b-badge>
    <q-card flat bordered
      class="mycard text-black m-2">
      <q-card-section>
        <div class="text-h4 text-weight-medium text-blue">
          X{{ metric.name }}
        </div>
        <!-- <div class="text-subtitle2 pt-3"># of kemerut</div> -->
      </q-card-section>

      <q-card-section class="q-pt-none text-lowercase">
      Lorem Ipsum
      </q-card-section>
    </q-card>
    <ConfirmDialog
      @close="test"
      title="Are you sure?"
      id="remove-metric-dialog"
      :is-open="isOpen">
      <div slot="content">
        <div class="text-left">
          <div class="text-dark">ass
          <div v-html="`message here...`"></div>
          </div>
        </div>
      </div>
      <div slot="footer" class="w-100">
        <div class="d-flex w-100">
          <div class="flex-grow-1"></div>
          <button
            class="btn btn-sm btn-outline-success mr-2"
            @click="test">
            Lorem ipsum dolor
          </button>
          <button
            class="btn btn-sm btn-danger mr-2"
            @click="test">
            Remove Metric
          </button>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog'

export default {
  name: 'MetricsBox',
  props: {
    metric: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    ConfirmDialog
  },
  data () {
    return {
      hovered: false,
      isOpen: false
    }
  },
  methods: {
    removeSelectedMetric () {
      console.log('Metric should be removed', this.isOpen)
      this.isOpen = true
    },
    test () {
      console.log('hahahaha')
    }
  }
}
</script>
