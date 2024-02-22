<template>
  <div class="w-full flex-grow-1">
    <multiselect class="chip__clear-blue shrink-options options__no-border options__relative b-radius__equal"
                 v-model="activity_type"
                 placeholder="Select Activity Type"
                 :selectLabel="null"
                 :deselectLabel="null"
                 :selectedLabel="null"
                 open-direction="bottom"
                 :searchable="true"
                 :options="activityTypes"
                 :multiple="false"
                 :loading="loading_activity_type"
                 :internal-search="false"
                 :clear-on-select="false"
                 :options-limit="300"
                 :limit="5"
                 :limit-text="limitText"
                 :max-height="150"
                 :show-no-results="true"
                 :class="selectClass"
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
      required: true
    },

    value: {
      required: false,
      default: null
    }
  },

  data () {
    return {
      activity_type: this.value,
      prev_activity_type: this.value,
      loading_activity_type: false,
      selectClass: []
    }
  },

  computed: {
    ...mapState({
      activityTypes: state => state.activityTypes
    })
  },

  mounted () {
    if (this.communication) {
      this.activity_type = this.communication.activity_type
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
      if (isNull(this.activity_type)) {
        this.activity_type = this.prev_activity_type
        return
      }
      this.prev_activity_type = this.activity_type
      this.loading_activity_type = true
      this.$axios.post(`/api/v1/communication/${this.communication.id}/activity-type`, {
        activity_type: this.activity_type
      }).then((res) => {
        this.loading_activity_type = false
        this.$generalNotification('Activity type updated.')
        this.$emit('activityTypeChosen', res.data.activity_type)
      }).catch((err) => {
        this.loading_activity_type = false
        this.$handleErrors(err.response)
      })
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
