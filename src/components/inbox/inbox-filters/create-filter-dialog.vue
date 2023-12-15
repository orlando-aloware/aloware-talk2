<template>
  <b-modal id="create-filter-modal"
           size="md"
           modal-class="confirm-dialog"
           ref="create-filter-modal"
           hide-header-close
           hide-header
           hide-footer
           v-model="isOpen"
           @show="onShow"
           @shown="onShown"
           @hide="onHide"
           @hidden="onHidden">
  <b-form @submit.prevent="onSubmit">
    <b-form-row>
      <b-col sm="12"
             md="12"
             class="mb-3">
        <span class="text-bold fs-20">Create New {{ dialogTitleLabel }}</span>
      </b-col>
      <b-col sm="12"
             md="12">
        <b-form-group label="Filter Name"
                      class="form-label">
          <b-form-input ref="filterNameInput"
                        size="md"
                        type="text"
                        placeholder="Name"
                        :state="validateState('name')"
                        v-model.trim="$v.filter.name.$model" />
          <b-form-invalid-feedback v-if="!$v.filter.name.required">Enter filter name</b-form-invalid-feedback>
        </b-form-group>
      </b-col>

      <b-col sm="12"
             md="12">
        <b-form-group label="Filter Type"
                      class="form-label">
          <q-select color="primary"
                    ref="filterTypeSelect"
                    option-value="value"
                    option-label="label"
                    style="word-break: break-all;"
                    emit-value
                    map-options
                    outlined
                    dense
                    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
                    :options="scopeOptions"
                    :disable="true"
                    v-model="filter.scope"
                    @popup-show="onFilterTypeShowMenu">
          </q-select>
        </b-form-group>
      </b-col>

      <b-col sm="12"
             md="6">
        <b-button class="bg-grey-70 text-black border-0"
                  block
                  @click="onCancel">
          Cancel
        </b-button>
      </b-col>
      <b-col sm="12"
             md="6">
        <b-button type="submit"
                  variant="primary"
                  block
                  :disabled="isCreating">
          <q-spinner-bars color="white"
                          v-if="isCreating" />
          {{ isCreating ? 'Creating filter...' : 'Create' }}
        </b-button>
      </b-col>
    </b-form-row>
  </b-form>
</b-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { maxLength, required } from 'vuelidate/lib/validators'
import * as ChannelType from 'src/constants/inbox-channels'

export default {
  name: 'create-filter-dialog',

  props: {
    filterModel: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('inbox', [
      'isFilterModelFormShown',
      'isFilterDialogForView',
      'activeChannel'
    ]),

    isOpen: {
      get () {
        return this.isFilterModelFormShown
      },

      set (isOpen) {
        return isOpen
      }
    },

    dialogTitleLabel () {
      return this.isFilterDialogForView ? 'View' : 'Filter'
    }
  },

  validations () {
    return {
      filter: {
        name: {
          required,
          maxLength: maxLength(191)
        }
      }
    }
  },

  data () {
    return {
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
      isCreating: false,
      filter: {
        name: '',
        scope: 'user'
      },
      selectWidth: 0,
      ChannelType,
      isCancelled: false
    }
  },

  methods: {
    ...mapActions('inbox', [
      'toggleFilterModelForm',
      'toggleFilterDialog',
      'setIsEditingView',
      'setFilterDialogForView'
    ]),

    validateState (input) {
      const { $dirty, $error } = this.$v.filter[input]
      return $dirty ? !$error : null
    },

    onHidden () {
      this.$v.filter.$reset()
      this.filter.name = ''
      this.filter.scope = 'user'

      // toggle form state only if it's not for View
      if (!this.isFilterDialogForView) {
        this.toggleFilterModelForm()
      }
    },

    onHide () {
      this.toggleFilterModelForm()

      // after hiding the create filter dialog, show regular filter dialog form for non-View channels.
      // also show regular filter dialog form for View channel if it's cancelled
      // "Mentions" channel is excluded because it's not a regular channel with filters
      const nonViewChannel = !this.isFilterDialogForView && this.activeChannel.value !== 'mentions'
      if ((this.isFilterDialogForView && this.isCancelled) || nonViewChannel) {
        this.toggleFilterDialog(true)
        return
      }

      // after hiding the create filter dialog, show the popup wherein Views are listed
      // only if it's for View channel and saving the new filter is not cancelled
      if (this.isFilterDialogForView && !this.isCancelled) {
        this.$VueEvent.fire('openInboxViewPopup')
        this.toggleFilterDialog(false)
      }
    },

    onShow () {
      this.toggleFilterDialog()
    },

    onShown () {
      this.$refs.filterNameInput.focus()
    },

    onFilterTypeShowMenu () {
      this.selectWidth = this.$refs.filterTypeSelect.$el.offsetWidth
    },

    onSubmit () {
      this.isCancelled = false
      this.$v.$touch()

      if (this.$v.$invalid) {
        return
      }

      const filterType = this.isFilterDialogForView
        ? ChannelType.CHANNEL_INBOX
        : (this.filterModel.type === ChannelType.CHANNEL_RECORDINGS
          ? ChannelType.CHANNEL_CALLS
          : this.filterModel.type)

      this.isCreating = true
      this.filter = {
        ...this.filter,
        type: filterType,
        filter: this.filterModel.filter
      }

      return talk2Api.V2.inbox.filters.save(this.filter)
        .then(response => {
          // when saving a View filter, set the flag to true so that the filter dialog intended for View will be shown
          if (this.isFilterDialogForView && filterType === ChannelType.CHANNEL_INBOX) {
            this.setFilterDialogForView(true)
          }

          this.isCreating = false
          this.$VueEvent.fire('channel_filter_created', response.data.filter)
          this.$emit('created', response.data.filter)
          this.onHide()
        }).catch(error => {
          this.$handleErrors(error.response)
          this.isCreating = false
        })
    },

    onCancel () {
      this.isCancelled = true
      this.onHide()
    }
  },

  mounted () {
    this.toggleFilterModelForm()
  }
}
</script>
