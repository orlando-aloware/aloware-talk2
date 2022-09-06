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
            <q-item v-for="option in reasons.slice(1, 5)" v-bind:key="option.id" class="my-0 py-0 text-weight-medium">
              <q-radio v-model="reason"
                       :val="option.id"
                       :label="getReasonLabel(option.id)" />
            </q-item>
            <div class="ml-4"
                 v-if="reason === 5">
              <p>Please specify:</p>
              <q-input type="textarea"
                       outlined
                       v-model="explanations[0]" />
            </div>
          </div>
          <q-item v-for="option in reasons.slice(5)" v-bind:key="option.id" class="py-0 my-0 text-weight-bold">
            <q-radio v-model="reason"
                     :val="option.id"
                     :label="getReasonLabel(option.id)" />
          </q-item>
          <div class="ml-4"
               v-if="reason === 9">
            <p>Please specify:</p>
            <q-input type="textarea"
                     outlined
                     v-model="explanations[1]" />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="my-1 mr-auto"
               style="background-color: #3778FF; color: white;"
               label="Stay in Talk 🥳"
               @click="closeDialog" />
        <q-btn class="my-1"
               style="background-color: #01BE50; color: white;"
               label="Go to classic"
               :disable="reason === null"
               @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import { mapGetters } from 'vuex'

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

// 7 = Galactic Empire
// 47 = Aloware Inc.
const skipCompanies = [7, 47]

// 42 = Anoosh
const skipUsers = [42]

export default {

  mixins: [aclMixin],

  props: {
    shouldOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      reasons,
      reason: null,
      explanations: [
        '',
        ''
      ],
      skipCompanies: skipCompanies,
      skipUsers: skipUsers
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
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
    },
    isOpen () {
      return this.shouldOpen && !this.shouldSkipForm
    },
    shouldSkipForm () {
      // Admins should not see the feedback form
      // Certain companies will not see the form
      return this.isAdmin || this.skipCompanies.includes(this.profile.company_id) || this.skipUsers.includes(this.profile.id)
    }
  },
  watch: {
    shouldOpen (value) {
      /**
       * If person should skip form, then the submit is called as soon as the
       * button is clicked. Then, it takes the person to classic instantly.
       */
      if (value && this.shouldSkipForm) {
        this.$emit('submit')
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
