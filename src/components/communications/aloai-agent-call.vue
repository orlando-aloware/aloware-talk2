<template>
  <div data-testid="aloai-agent-call-wrapper" class="aloai-agent-call-wrapper">
    <q-card class="ring-group-snapshot-card" flat bordered data-testid="aloai-agent-call-card">
      <q-card-section data-testid="aloai-agent-call-card-section">
        <div class="text-h6">AloAi Agent Call</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section data-testid="aloai-agent-call-content-section">
        <div class="row">
          <div class="col-md-6">
            <div v-if="aloAiBotCall.recording_url" class="mb-3 pb-3 border-bottom">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Recording:</q-item-label>
                </b-col>
                <b-col cols="7">
                  <span class="text-dark-greenish">
                    <span
                      class="cursor-pointer text-primary"
                      tabindex="0"
                      :id="`aloai-recording-${uniqueId}`"
                    >
                      <i class="fa fa-play"></i>
                      <span class="ml-1">Play Recording</span>
                      <b-popover
                        triggers="click blur"
                        placement="right"
                        :target="`aloai-recording-${uniqueId}`"
                      >
                        <div class="d-flex flex-column" style="width: 300px;">
                          <div class="row">
                            <div class="col-12">
                              <audio class="w-100" controls>
                                <source :src="aloAiBotCall.recording_url" type="audio/mpeg">
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </div>
                          <div class="row mt-2">
                            <div class="col-12">
                              <b-button
                                variant="primary"
                                block
                                title="Download"
                                target="_blank"
                                :href="aloAiBotCall.recording_url"
                                download
                              >
                                Download recording
                              </b-button>
                            </div>
                          </div>
                        </div>
                      </b-popover>
                    </span>
                  </span>
                </b-col>
              </b-form-row>
            </div>

            <div v-if="aloAiBotCall.started_at" class="mb-3 pb-3 border-bottom">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Started:</q-item-label>
                </b-col>
                <b-col cols="7" class="d-flex align-items-center">
                  <span>{{ aloAiBotCall.started_at | fixCommunicationDateTime }}</span>
                </b-col>
              </b-form-row>
            </div>

            <div v-if="aloAiBotCall.ended_at" class="mb-3 pb-3 border-bottom">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Ended:</q-item-label>
                </b-col>
                <b-col cols="7" class="d-flex align-items-center">
                  <span>{{ aloAiBotCall.ended_at | fixCommunicationDateTime }}</span>
                </b-col>
              </b-form-row>
            </div>

            <div v-if="aloAiBotCall.duration_in_seconds" class="mb-3 pb-3 border-bottom">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Duration:</q-item-label>
                </b-col>
                <b-col cols="7" class="d-flex align-items-center">
                  <span>{{ aloAiBotCall.duration_in_seconds | fixDuration }}</span>
                </b-col>
              </b-form-row>
            </div>
          </div>

          <div class="col-md-6" v-if="aloAiBotCall.transcript">
            <div class="form-horizontal">
              <b-form-row>
                <b-col class="col-12 mb-2 pl-0 pr-0">
                  <q-item-label>Transcript:</q-item-label>
                </b-col>
                <b-col class="col-12">
                  <div class="text-muted" style="white-space: pre-wrap;" v-html="formattedTranscript"></div>
                </b-col>
              </b-form-row>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { fixCommunicationDateTime, fixDuration } from 'src/plugins/filters/datetime.filters';

export default {
  name: 'aloai-agent-call',

  filters: {
    fixCommunicationDateTime,
    fixDuration
  },

  props: {
    aloAiBotCall: {
      type: Object,
      required: true
    },
    uniqueId: {
      type: [String, Number],
      required: true
    }
  },

  computed: {
    formattedTranscript () {
      if (!this.aloAiBotCall?.transcript) {
        return ''
      }
      return this.aloAiBotCall.transcript
        .replace(/(Agent:)/g, '<strong>$1</strong>')
        .replace(/(User:)/g, '<strong>$1</strong>')
    }
  }
}
</script>

<style scoped>
.aloai-agent-call-wrapper {
  margin-bottom: 0;
}

.text-dark-greenish {
  color: #28a745;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
