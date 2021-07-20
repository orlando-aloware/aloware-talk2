<template>
  <div>
    <q-select class="inline-select show-caret__always caret__grey-90"
              use-input
              ref="lineSelector"
              input-debounce="100"
              option-value="id"
              option-label="name"
              behavior="menu"
              v-model="selectedLine"
              :options="lineOptions"
              :loading="isBusy"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterLineFn">
      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
        >
          <q-item-section>
            <q-item-label v-html="scope.opt.name" ></q-item-label>
            <q-item-label caption>{{ scope.opt.email }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
        >
          <q-item-label header class="group-label">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>
      <template v-if="selectedLine && Object.keys(selectedLine).length > 0" v-slot:selected>
        <div class="selected-option-container"
             v-html="getSelectedLineLabel()">
        </div>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import contactMixin from 'src/plugins/mixins/contact.mixin'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'line-selector',
  mixins: [contactMixin],
  computed: {
    ...mapGetters('contacts', ['contact']),
    formattedLineOptions () {
      let contactLines = []
      if (this.contactCampaignsFromCommunications.length > 0) {
        contactLines = [...this.contactCampaignsFromCommunications]

        contactLines.unshift({
          group: 'Contact Lines',
          disable: true
        })
      }

      let linesArray = contactLines

      if (this.otherCampaignsFromCommunications && this.otherCampaignsFromCommunications.length > 0) {
        let otherLines = [...this.otherCampaignsFromCommunications]
        otherLines.unshift({
          group: 'Other Lines',
          disable: true
        })
        linesArray = [...contactLines, ...otherLines]
      }

      return linesArray
    }
  },
  data () {
    return {
      isBusy: false,
      selectedLine: null,
      lineOptions: this.formattedLineOptions,
      incomingNumber: null,
      isFocused: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setSelectedLine']),
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedLine ? this.selectedLine.name : 'Select line'
      this.$el.querySelector('.inline-select .q-field__input').style.display = 'block'
      if (this.selectedLine) {
        this.$el.querySelector('.inline-select .selected-option-container').style.display = 'none'
      }
    },
    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.showPlaceholder()
      if (this.selectedLine) {
        this.$el.querySelector('.inline-select .selected-option-container').style.display = ''
      }
    },
    showPlaceholder () {
      if (!this.selectedLine) {
        this.$el.querySelector('.inline-select .q-field__input').placeholder = 'Select line'
        this.$el.querySelector('.inline-select .q-field__input').style.display = 'block'
      } else {
        this.$el.querySelector('.inline-select .q-field__input').style.display = 'none'
      }
    },
    onInput () {
      this.$el.querySelector('.inline-select .q-field__input').blur()
    },
    filterLineFn (val, update) {
      if (val === '') {
        update(() => {
          this.lineOptions = this.formattedLineOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.lineOptions = this.formattedLineOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getSelectedLineLabel () {
      if (!this.selectedLine && Object.keys(this.selectedLine).length < 1) {
        return 'Select line...'
      }
      let title = this.incomingNumber ? this.$options.filters.fixPhone(this.incomingNumber.phone_number) : ''
      let titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.selectedLine.name}</span> ${titleText}`
    },
    getIncomingNumber () {
      this.isBusy = true
      return talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selectedLine.id).then(response => {
        this.incomingNumber = response.data
      }).finally(() => {
        this.isBusy = false
      })
    }
  },
  mounted () {
    this.lineOptions = this.formattedLineOptions
    this.showPlaceholder()
  },
  watch: {
    selectedLine: function (value) {
      this.setSelectedLine(value)
      if (value) {
        this.getIncomingNumber()
      }
    },
    'contact': function (value) {
      let campaign = (value.initial_campaign_id) ? this.lineOptions.find(line => line.id === value.initial_campaign_id) : null
      this.setSelectedLine(campaign)
      this.selectedLine = campaign
      this.showPlaceholder()
    }
  }
}
</script>

<style lang="scss" scoped>
  .inline-select.q-select--without-input {
    padding-top: 9px;
    width: 300px;
  }

  .inline-select.q-select--with-input {
    padding-top: 10px;
    //width: 300px;
    min-width: 245px;

    .q-field__input {
      display: none;
    }
  }
</style>
