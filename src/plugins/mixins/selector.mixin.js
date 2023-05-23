import _ from 'lodash'

export default {
  props: {
    forceRemoveMissingValues: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isFocused: false,
      compareProperty: 'id',
      reference: '',
      selectWidth: 0,
      textProperty: 'name',
      emitChange: false,
      emitChangeProperty: null,
      emitEvent: 'change',
      alterFunction: null,
      isCheckEmit: false,
      element: null,
      referenceElement: null,
      fullOptionsProperty: null
    }
  },

  computed: {
    selectedObject () {
      const data = { id: this.getSelectedIdData(null) }

      if (data.id) {
        return data.id
      }

      data.id = this.getSelectedId(this.selectedId)

      if (this.compareProperty) {
        this.textProperty !== 'id' && (data[this.textProperty] = '')
        typeof this.selectedId === 'object' && (data[this.textProperty] = _.get(this.selectedId, this.textProperty, ''))
        this.compareProperty !== 'id' && (data[this.compareProperty] = data.id)
        return data
      }

      return data.id
    }
  },

  mounted () {
    this.element = this.$el ? this.$el : document

    if (this.referenceElement) {
      this.element = this.$refs[this.referenceElement].$el
    }

    if (_.isEmpty(_.omitBy(_.omitBy(this.selectedObject, _.isNil), _.isEmpty))) {
      this.toggleInputValue()
    }
  },

  methods: {
    getSelectedId (id) {
      const data = { id: (id ?? this.selectedId) }
      return (typeof data.id === 'object' ? _.get(id, this.compareProperty, '') : data.id)
    },

    getSelectedIdData (id) {
      const objectData = { found: null, id: null, options: [] }

      if (this.fullOptionsProperty) {
        objectData.options = this[this.fullOptionsProperty]
      }

      objectData.id = this.getSelectedId(id)

      if (!_.isEmpty(objectData.options) && this.compareProperty && objectData.id) {
        objectData.found = objectData.options.find(option => option[this.compareProperty] === objectData.id)
      }

      return objectData.found
    },

    removeMissingValues () {
      if (!this.forceRemoveMissingValues) {
        return
      }

      if (this.selectedId.constructor === Array) {
        const data = { id: null, found: null }
        for (data.id in this.selectedId) {
          data.found = this.getSelectedIdData(this.selectedId[data.id])

          if (!data.found) {
            this.selectedId.splice(data.id, 1)
          }
        }

        return
      }

      const found = this.getSelectedIdData(null)
      if (!found) {
        this.selectedId = null
      }
    },

    onShowMenu () {
      this.selectWidth = this.$refs[this.reference].$el.offsetWidth
    },

    onFocus () {
      if ((typeof this.useChips !== 'undefined' && this.useChips) ||
        (typeof this.multiple !== 'undefined' && this.multiple)) {
        return
      }

      this.isFocused = true

      if (this.selectedObject !== null && typeof this.selectedObject === 'object') {
        this.element.querySelector('.q-basic-selector .q-field__input').placeholder = this.alterFunction ? this.alterFunction(this.selectedObject[this.textProperty]) : this.selectedObject[this.textProperty]
      }

      if (this.selectedObject !== null && typeof this.selectedObject === 'string') {
        this.element.querySelector('.q-basic-selector .q-field__input').placeholder = this.selectedObject
      }

      if (!this.selectedObject) {
        this.element.querySelector('.q-basic-selector .q-field__input').placeholder = this.placeholder
      }

      this.element.querySelector('.q-basic-selector .q-field__input').style.display = 'block'

      if (this.selectedObject && this.element.querySelector('.q-basic-selector .q-field__native span')) {
        this.element.querySelector('.q-basic-selector .q-field__native span').style.display = 'none'
      }
    },

    onBlur () {
      if ((typeof this.useChips !== 'undefined' && this.useChips) ||
        (typeof this.multiple !== 'undefined' && this.multiple)) {
        return
      }

      this.isFocused = false
      this.element.querySelector('.q-basic-selector .q-field__input').placeholder = ''
      this.showInputPlaceholder()

      if (this.selectedObject && this.element.querySelector('.q-basic-selector .q-field__native span')) {
        this.element.querySelector('.q-basic-selector .q-field__native span').style.display = ''
      }
    },

    showInputPlaceholder () {
      if (typeof this.useChips !== 'undefined' && this.useChips) {
        return
      }

      if (!this.selectedObject || (this.selectedObject && !this.selectedObject[this.textProperty])) {
        this.element.querySelector('.q-basic-selector .q-field__input').placeholder = this.placeholder
        this.element.querySelector('.q-basic-selector .q-field__input').style.display = 'block'
        return
      }

      this.element.querySelector('.q-basic-selector .q-field__input').style.display = 'none'
    },

    onInput (val) {
      const element = this.element.querySelector('.q-basic-selector .q-field__input')
      const isGenericMultiSelect = _.get(this, 'genericMultiselect', null)

      if (!element && !isGenericMultiSelect) {
        return
      }

      if (!isGenericMultiSelect) {
        element.blur()
      }

      if (this.isCheckEmit && this.emitChange && val) {
        this.$emit(this.emitEvent, this.emitChangeProperty ? val[this.emitChangeProperty] : val)
        return
      }

      if (this.emitChange) {
        this.$emit(this.emitEvent, val)
      }
    },

    onInputNew (val) {
      const element = this.element.querySelector('.q-basic-selector .q-field__input')
      const isGenericMultiSelect = _.get(this, 'genericMultiselect', null)

      if (element && !isGenericMultiSelect) {
        element.blur()
      }

      if (this.isCheckEmit && this.emitChange && val) {
        this.$emit(this.emitEvent, this.emitChangeProperty ? val[this.emitChangeProperty] : val)
        return
      }

      if (this.emitChange) {
        this.$emit(this.emitEvent, val)
      }
    },

    toggleInputValue (toggle) {
      if ((typeof this.useChips !== 'undefined' && this.useChips) ||
        (typeof this.multiple !== 'undefined' && this.multiple)) {
        return
      }

      if (this.reference && this.$refs[this.reference]) {
        // this.selectedId = null
        const element = this.$refs[this.reference].$el.querySelector('.q-field__control-container .q-field__native span')
        if (element && typeof element !== 'undefined' && toggle) {
          element.style.display = 'block'
        }
        if (element && typeof element !== 'undefined' && !toggle) {
          element.style.display = 'none'
        }
      }
    }
  },
  watch: {
    selectedObject (value) {
      this.toggleInputValue(value[this.textProperty])
    },
    selectedId () {
      this.removeMissingValues()
    }
  }
}
