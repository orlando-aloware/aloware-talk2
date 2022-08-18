<template>
  <q-dialog id="talk-feedback-form"
            v-model="isOpen">
    <q-card>
      <q-card-section class="bg-blue-80">
        <h2 class="text-grey-1">Sad to see you go! 😢</h2>
      </q-card-section>
      <q-card-section>
        <div>
          <h2>
            Please select a reason as to why you are choosing to switch back to Aloware Classic:
          </h2>
        </div>
        <div class="q-gutter-sm">
          <q-item class="py-0 mb-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="1"
                     :label="getReasonLabel(1)" />
          </q-item>
          <div class="my-2 py-0 text-weight-bold">
            <span class="ml-3 mr-2">-</span>
            <span>I don't understand how to use Talk</span>
          </div>
          <div class="pl-2 pt-0 mt-0">
            <q-item class="my-0 py-0 text-weight-medium">
              <q-radio v-model="reason"
                       :val="2"
                       :label="getReasonLabel(2)" />
            </q-item>
            <q-item class="my-0 py-0 text-weight-medium">
              <q-radio v-model="reason"
                       :val="3"
                       :label="getReasonLabel(3)" />
            </q-item>
            <q-item class="my-0 py-0 text-weight-medium">
              <q-radio v-model="reason"
                       :val="4"
                       :label="getReasonLabel(4)" />
            </q-item>
            <q-item class="my-0 py-0 text-weight-medium">
              <q-radio v-model="reason"
                       :val="5"
                       :label="getReasonLabel(5)" />
            </q-item>
            <div class="ml-4"
                 v-if="reason == 5">
              <p>Please specify:</p>
              <q-input type="textarea"
                       outlined
                       v-model="explanations[0]" />
            </div>
          </div>
          <q-item class="py-0 my-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="6"
                     :label="getReasonLabel(6)" />
          </q-item>
          <q-item class="py-0 my-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="7"
                     :label="getReasonLabel(7)" />
          </q-item>
          <q-item class="py-0 my-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="8"
                     :label="getReasonLabel(8)" />
          </q-item>
          <q-item class="pb-0 my-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="9"
                     :label="getReasonLabel(9)" />
          </q-item>
          <div class="ml-4"
               v-if="reason == 9">
            <p>Please specify:</p>
            <q-input type="textarea"
                     outlined
                     v-model="explanations[1]" />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="my-1 mr-auto"
               color="secondary"
               label="Stay in Talk 🥳"
               @click="closeDialog" />
        <q-btn class="my-1"
               color="primary"
               label="Go to classic"
               @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
const reasons = [
  {
    id: 1,
    label: 'I am just playing around 🕹️'
  },
  {
    id: 2,
    label: 'How to communicate with my contacts 💬'
  },
  {
    id: 3,
    label: 'How to use the Power Dialer 📱'
  },
  {
    id: 4,
    label: 'How to find my contacts 👤'
  },
  {
    id: 5,
    label: 'Other ...'
  },
  {
    id: 6,
    label: 'I am experiencing glitches/bugs in Talk 💻'
  },
  {
    id: 7,
    label: 'Talk2 is slower than Aloware Classic 🐢'
  },
  {
    id: 8,
    label: 'I don\'t like Talk 💔'
  },
  {
    id: 9,
    label: 'Other ...'
  }
]
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      reasons,
      reason: 1,
      explanations: [
        '',
        ''
      ]
    }
  },
  computed: {
    feedback_params () {
      let explanation = ''

      if (this.reason === 5) {
        explanation += this.explanations[0]
      } else if (this.reason === 9) {
        explanation += this.explanations[1]
      }

      let reasonLabel = this.getReasonLabel(this.reason)

      if (this.reason >= 2 && this.reason <= 5) {
        reasonLabel = 'I don\'t understand how to use Talk - ' + reasonLabel
      }

      return {
        reason: reasonLabel,
        explanation
      }
    }
  },
  methods: {
    async onSubmit () {
      if (this.reason === 1) {
        this.$emit('submit')
        return
      }

      try {
        await this.$axios.post('/api/v2/feedback', this.feedback_params).catch(() => {})
      } catch (exception) {
        console.log('It wasn\'t possible to send feedback.', { exception })
      }
      this.$emit('submit')
    },
    closeDialog () {
      this.reason = 1
      this.explanations = ['', '']
      this.$emit('toggle')
    },
    getReasonLabel (id) {
      return this.reasons.filter((reason) => reason.id === id)[0].label
    }
  }
}
</script>

<style>
#talk-feedback-form .q-btn__content .block {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
