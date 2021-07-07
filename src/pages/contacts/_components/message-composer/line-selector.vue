<template>
  <div>
    <q-select class="inline-select"
              use-input
              ref="lineSelector"
              input-debounce="100"
              option-value="id"
              option-label="name"
              behavior="menu"
              v-model="selected_line"
              :options="line_options"
              :loading="is_busy"
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
      <template v-if="selected_line && Object.keys(selected_line).length > 0" v-slot:selected>
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
    ...mapGetters('contacts', ['contact_phone_numbers', 'contact']),
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
      is_busy: false,
      selected_line: null,
      line_options: this.formattedLineOptions,
      incoming_number: null,
      is_focused: false
    }
  },
  methods: {
    ...mapActions('contacts', ['setSelectedLine']),
    onFocus () {
      this.is_focused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selected_line ? this.selected_line.name : 'Select line'
      this.$el.querySelector('.inline-select .selected-option-container').style.display = 'none'
    },
    onBlur () {
      this.is_focused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.$el.querySelector('.inline-select .selected-option-container').style.display = ''
    },
    onInput () {
      console.log('input')
      this.$el.querySelector('.inline-select .q-field__input').blur()
    },
    filterLineFn (val, update) {
      if (val === '') {
        update(() => {
          this.line_options = this.formattedLineOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.line_options = this.formattedLineOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getSelectedLineLabel () {
      if (!this.selected_line && Object.keys(this.selected_line).length < 1) {
        return 'Select line...'
      }
      let title = this.incoming_number ? this.$options.filters.fixPhone(this.incoming_number.phone_number) : ''
      let titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.selected_line.name}</span> ${titleText}`
    },
    getIncomingNumber () {
      this.is_busy = true
      return talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selected_line.id).then(response => {
        this.incoming_number = response.data
      }).finally(() => {
        this.is_busy = false
      })
    }
  },
  mounted () {
    this.line_options = this.formattedLineOptions
    this.selected_line = this.formattedLineOptions[1]
    this.getIncomingNumber()
  },
  watch: {
    selected_line: function () {
      this.setSelectedLine(this.selected_line)
      if (this.selected_line) {
        this.getIncomingNumber()
      }
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
    width: 300px;
  }
</style>
