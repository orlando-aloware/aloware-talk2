<template>
  <div class="w-full flex-grow-1">
    <multiselect class="chip__clear-blue shrink-options options__no-border options__relative b-radius__equal"
                 open-direction="bottom"
                 placeholder="Select Activity Type"
                 :selectLabel="null"
                 :deselectLabel="null"
                 :selectedLabel="null"
                 :searchable="true"
                 :options="activityTypes"
                 :multiple="false"
                 :loading="loadingActivityType"
                 :internal-search="false"
                 :clear-on-select="false"
                 :options-limit="300"
                 :limit="5"
                 :limit-text="limitText"
                 :max-height="150"
                 :show-no-results="true"
                 :class="selectClass"
                 v-model="activityType"
                 v-if="activityTypes"
                 @open="onSelectOpen"
                 @close="onSelectClose"
                 @input="changeActivityType">
      <template slot="option" slot-scope="props">
        <div class="option__desc">
          <span class="option__small ml-2">{{ props.option }}</span>
        </div>
      </template>
      <span slot="noResult">
        No activity types found.
      </span>
    </multiselect>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import Multiselect from 'vue-multiselect'
import { isNull } from 'lodash'

export default {
  mixins: [aclMixin],

  components: {
    Multiselect
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    value: {
      type: String,
      required: false,
      default: null
    }
  },

  data () {
    return {
      activityType: this.value,
      prevActivityType: this.value,
      loadingActivityType: false,
      selectClass: []
    }
  },

  computed: {
    ...mapState(['activityTypes']),

    computedCommunicationActivityType () {
      if (this.communication && this.activityTypes) {
        const found = this.activityTypes.find(activityType => activityType === this.communication.metadata?.activity_type)

        return found
      }

      return null
    }
  },

  mounted () {
    if (this.communication) {
      this.activityType = this.computedCommunicationActivityType
    }
  },

  methods: {
    onSelectOpen () {
      this.selectClass = ['border-blue']
    },

    onSelectClose () {
      this.selectClass = []
    },

    limitText (count) {
      return `and ${count} other tags`
    },

    changeActivityType () {
      if (isNull(this.activityType)) {
        this.activityType = this.prevActivityType
        return
      }
      this.prevActivityType = this.activityType
      this.loadingActivityType = true
      this.$axios.post(`/api/v1/communication/${this.communication.id}/activity-type`, {
        activity_type: this.activityType
      }).then((res) => {
        this.loadingActivityType = false
        this.$generalNotification('Activity type updated.')
        this.$emit('activityTypeChosen', res.data.metadata?.activity_type)
      }).catch((err) => {
        this.loadingActivityType = false
        this.$handleErrors(err.response)
      })
    }
  },

  watch: {
    activityTypes: {
      handler (newVal) {
        if (this.communication) {
          this.activityType = this.computedCommunicationActivityType
        }
      }
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
