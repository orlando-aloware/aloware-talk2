<template>
  <div>

    <date-selector
      data-testid="attr-type-date-picker-selector"
      v-model="defaultDate"
      :format="momentDateFormat"
      :formatted="momentDateFormat"
      @dateSelected="saveDateValue"
    />

  </div>
</template>

<script>
import moment from 'moment'
import DateSelector from 'components/date-selector'
import { ContactAttributeTypeEnum } from 'components/contacts/contact-attributes/enums/contact-attribute-type-enum'

export default {
  name: 'attribute-type-date-picker',

  components: {
    DateSelector
  },

  props: {
    attribute: {
      required: true,
      type: Object
    },
    disabled: {
      required: true,
      type: Boolean
    },
    timezone: {
      required: true,
      type: String
    },
    momentDateFormat: {
      required: false,
      default: 'MM/DD/YYYY',
      type: String
    }
  },

  data () {
    return {
      defaultDate: this.attribute.value
        ? moment(parseInt(this.attribute.value)).utc().format(this.momentDateFormat)
        : null,
      ContactAttributetTypeEnum: ContactAttributeTypeEnum
    }
  },

  methods: {
    saveDateValue (date) {
      this.attribute.value = date !== null
        ? moment(date, this.momentDateFormat).utc().startOf('day').format('x') // timestamp
        : null

      this.$emit('updateField', this.attribute.value)
    }
  }

}
</script>
