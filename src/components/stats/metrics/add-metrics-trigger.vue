<template>
  <div class="col-4 col-md-3 col-lg-2 p-2 position-relative">
    <q-card v-ripple flat bordered
      @click="addMetrics()"
      class="mycard text-black full-height q-hoverable dashed">
      <span class="q-focus-helper"></span>
      <q-card-section class="full-height align-middle">
        <div class="row items-center justify-center full-height text-lead text-center text-grey lighten-3 align-middle">
          <div class="pb-1">
            <span>+</span>
            <br />
            Add Metrics
          </div>
        </div>
        <!-- <div class="text-subtitle2 pt-3"># of kemerut</div> -->
      </q-card-section>
    </q-card>
    <AddMetricsModal
      @closed="closeModal"
      :title="title"
      :is-open="modal" />
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import AddMetricsModal from './add-metrics-modal'

export default {
  name: 'AddMetrics',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  components: {
    AddMetricsModal
  },
  mounted () {},
  data () {
    return {
      modal: false
    }
  },
  methods: {
    ...mapActions('contacts', ['createListOpen']),
    addMetrics () {
      this.modal = true
    },
    closeModal () {
      this.modal = false
    }
  }
}
</script>
