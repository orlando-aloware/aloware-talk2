<template>
  <b-modal modal-class="confirm-dialog"
           ref="modal"
           centered
           :id="id"
           :size="size"
           :title="title"
           :hide-header="hideHeader"
           :hide-footer="hideFooter"
           v-model="modelValue"
           @close="onClose"
           @shown="onShown"
           @hide="onHide">
    <slot name="content" />
    <template slot="modal-footer">
      <slot name="footer" />
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    id: {
      type: [String, Number],
      required: true
    },

    title: {
      type: String,
      default: 'Confirmation'
    },

    isOpen: {
      type: Boolean,
      default: false
    },

    size: {
      type: String,
      default: 'md'
    },

    hideHeader: {
      type: Boolean,
      default: false
    },

    hideFooter: {
      type: Boolean,
      default: false
    },

    isBusy: {
      type: Boolean,
      default: false
    }
  },

  mounted () {
    this.$refs.modal.$on('hidden', () => {
      this.$emit('close')
    })
  },

  computed: {
    modelValue: {
      get () {
        return this.isOpen
      },
      set (val) {}
    }
  },

  methods: {
    onHide () {
      this.$emit('hide')
    },

    onShown () {
      this.$emit('shown')
    },

    onClose (e) {
      if (this.isBusy) {
        e.preventDefault()
      }
    }
  }
}
</script>
