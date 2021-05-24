<template>
  <div class="move-dialog shadow-sm" ref="moveDialog">
    <div class="p-3 d-flex flex-column">
      <input type="text" class="form-control" placeholder="Move to..." />
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
import { mapActions, mapGetters } from 'vuex'

let popperInstance

export default {
  data () {
    return {
      searchValue: ''
    }
  },
  computed: {
    ...mapGetters('contacts', ['moveDialog'])
  },
  methods: {
    ...mapActions('contacts', ['closeMoveDialog']),
    createDialogInstance (state) {
      this.searchValue = ''

      const reference = document.querySelector(
        '[data-popper-target="list-' + state.id + '"]'
      )

      this.$refs.moveDialog.classList.add('d-flex')

      popperInstance = createPopper(reference, this.$refs.moveDialog, {
        placement: 'right-start'
      })

      document.body.addEventListener('click', this.handleClick)
    },
    destroyDialogInstance () {
      this.$refs.moveDialog.classList.remove('d-flex')

      if (popperInstance) {
        popperInstance.destroy()
        popperInstance = null
      }
    },
    handleClick (evt) {
      if (
        !this.$refs.moveDialog.contains(evt.target) &&
        !evt.target.classList.contains('contact-menu-item') &&
        !evt.target.classList.contains('move-item')
      ) {
        this.closeMoveDialog()
        document.body.removeEventListener('click', this.handleClick)
      }
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('click', this.handleClick)
    this.destroyDialogInstance()
  },
  watch: {
    moveDialog: function ({ open, ...state }) {
      if (open) {
        this.createDialogInstance(state)
      } else {
        this.destroyDialogInstance(state)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.move-dialog {
  width: 258px;
  height: 250px;
  max-height: 435px;
  overflow-y: auto;
  background: $white;
  border: solid 1px $grey-light;
  position: absolute;
  border-radius: 5px;
  font-size: 12px;
  display: none;
}
</style>
