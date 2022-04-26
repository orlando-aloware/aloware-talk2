import _ from 'lodash'

export default {
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
      element: null
    }
  },

  computed: {
    selectedObject () {
      const id = typeof this.selectedId === 'object' ? _.get(this.selectedId, this.compareProperty, '') : this.selectedId

      if (!_.isEmpty(this.options) && this.compareProperty && id) {
        return this.options.find(option => option[this.compareProperty] === id)
      }

      if (this.compareProperty) {
        let data = {}
        data[this.textProperty] = id
        return data
      }

      return id
    }
  },

  mounted () {
    this.element = this.$el ? this.$el : document
  },

  methods: {
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
      if (typeof this.useChips !== 'undefined' && this.useChips) {
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
      this.element.querySelector('.q-basic-selector .q-field__input').blur()

      if (this.isCheckEmit && this.emitChange && val) {
        this.$emit(this.emitEvent, this.emitChangeProperty ? val[this.emitChangeProperty] : val)
        return
      }

      if (this.emitChange) {
        this.$emit(this.emitEvent, val)
      }
    }
  },
  watch: {
    selectedObject (value) {
      if (!value) {
        this.selectedId = null
      }
    }
  }
}
