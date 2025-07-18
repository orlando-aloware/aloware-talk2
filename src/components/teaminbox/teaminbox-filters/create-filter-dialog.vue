<template>
  <b-modal id="teaminbox-create-filter-modal"
           ref="teaminboxCreateFilterModal"
           size="md"
           modal-class="confirm-dialog"
           hide-header-close
           hide-header
           hide-footer
           data-testid="teaminbox-create-filter-dialog-modal"
           v-model="isOpen"
           @shown="onShown"
           @hidden="onHidden">
    <div class="modal-body-wrapper">
      <div class="d-flex justify-content-between mb-3">
        <h5 class="modal-title">Create New Filter</h5>
        <compact-btn class="border-0 pl-0 pr-0"
                     data-testid="teaminbox-create-filter-dialog-close-compact-btn"
                     @clicked="onHide">
          <close-icon iconColor="#000000"/>
        </compact-btn>
      </div>

      <div class="form-group">
        <label for="filter-name" class="form-label">Filter Name</label>
        <b-form-input id="filter-name"
                      ref="filterNameInput"
                      size="md"
                      type="text"
                      placeholder="Name"
                      data-testid="teaminbox-create-filter-dialog-name-input"
                      v-model.trim="filterName"
                      @keyup.enter="onSave" />
      </div>

      <div class="form-group" v-if="!disableFilterType">
        <label class="form-label">Filter Type</label>
        <q-select color="primary"
                  option-value="value"
                  option-label="label"
                  style="word-break: break-all;"
                  emit-value
                  map-options
                  outlined
                  dense
                  :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
                  :options="scopeOptions"
                  data-testid="teaminbox-create-filter-dialog-scope-options"
                  ref="filterTypeSelect"
                  v-model="scope"
                  @popup-show="onFilterTypeShowMenu" />
      </div>

      <div class="d-flex justify-content-end mt-4">
        <compact-btn class="mr-2 btn-outline-primary"
                     data-testid="teaminbox-create-filter-dialog-cancel-btn"
                     @clicked="onCancel">
          Cancel
        </compact-btn>
        <compact-btn class="btn-primary"
                     :disabled="!filterName || isSaving"
                     data-testid="teaminbox-create-filter-dialog-save-btn"
                     @clicked="onSave">
          <q-spinner-bars color="white"
                          class="mr-1"
                          v-if="isSaving"
                          data-testid="teaminbox-create-filter-dialog-spinner"/>
          Save
        </compact-btn>
      </div>
    </div>
  </b-modal>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import CloseIcon from 'components/icons/close-icon'
import talk2Api from 'src/plugins/api/api'
import * as ChannelType from 'src/constants/inbox-channels'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  name: 'teaminbox-create-filter-dialog',

  components: {
    CloseIcon,
    CompactBtn
  },

  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    disableFilterType: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isOpen: false,
      filterName: '',
      scope: 'user',
      isSaving: false,
      scopeOptions: [
        {
          value: 'user',
          label: 'Personal Filter'
        },
        {
          value: 'company',
          label: 'Company Filter'
        }
      ],
      selectWidth: 0
    }
  },

  methods: {
    hideModal () {
      this.isOpen = false
      this.$refs.teaminboxCreateFilterModal.hide()
    },
    showModal () {
      this.isOpen = true
      this.$refs.teaminboxCreateFilterModal.show()
    },
    onCancel () {
      this.resetForm()
      this.hideModal()
      this.$emit('onCancel')
    },
    onShown () {
      this.$refs.filterNameInput.focus()
    },
    onHidden () {
      this.resetForm()
    },
    onHide () {
      this.hideModal()
    },
    resetForm () {
      this.filterName = ''
      this.scope = 'user'
      this.isSaving = false
    },
    onFilterTypeShowMenu () {
      this.selectWidth = this.$refs.filterTypeSelect.$el.offsetWidth
    },
    async onSave () {
      if (!this.filterName.trim()) {
        return
      }
      this.isSaving = true
      try {
        const params = {
          name: this.filterName.trim(),
          type: ChannelType.CHANNEL_TEAMINBOX,
          filter: this.value,
          scope: this.scope
        }
        const response = await talk2Api.V2.inbox.filters.save(params)
        const newFilter = response.data.filter
        this.$VueEvent.fire('teaminbox_filter_created', newFilter)
        this.$generalNotification('Filter created successfully', 'success')
        this.hideModal()
        this.$emit('onFilterCreated', newFilter)
      } catch (error) {
        const { message } = extractErrorMessage(error)
        this.$generalNotification(message, 'error')
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style lang="scss">
.modal-body-wrapper {
  .modal-title {
    font-weight: 600;
    font-size: 18px;
    color: #333;
  }

  .form-group {
    margin-bottom: 20px;

    .form-label {
      font-weight: 500;
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      display: block;
    }
  }
}
</style>
