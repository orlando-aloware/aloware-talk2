<template>
  <div class="cards">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <div class="cards__body">
      <div class="cards__body__card"
           :key="card.title"
           v-for="card in cards">
        <span class="cards__body__card__title">
          {{ card.title }}
        </span>
        <span class="cards__body__card__text">
          {{ card.text }}
        </span>
        <broadcast-warning-note :isCalculatorMessage="true"
                                v-if="card.showWarning"/>
      </div>
    </div>
  </div>
</template>

<script>
import BroadcastWarningNote from 'src/components/broadcasts/broadcast-warning-note.vue'
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'broadcast-add-cards',

  components: {
    BroadcastWarningNote
  },

  mixins: [
    simpsocialMixin
  ],

  props: {
    contactsLength: {
      type: Number,
      required: false
    },

    estimatedCost: {
      type: Number,
      required: false,
      default: 0
    },

    campaign: {
      type: Object,
      required: false
    }
  },

  computed: {
    cards () {
      return [
        {
          title: this.contactsLength,
          text: (this.contactsLength === 1 ? 'Contact' : 'Contacts'),
          enabled: true,
          showWarning: false
        },
        {
          title: this.$options.filters.toCurrency(this.$options.filters.fixRounding(this.estimatedCost)),
          text: 'Estimated Cost',
          enabled: !this.isSimpSocial,
          showWarning: true
        }
      ].filter(card => card.enabled)
    },

    isValid () {
      return true
    }
  },

  data: () => ({
    loading: false
  }),

  watch: {
    isValid (state) {
      this.$emit('input', state)
    }
  }
}
</script>
