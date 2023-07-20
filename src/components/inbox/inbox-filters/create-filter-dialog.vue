<template>
  <b-modal
    id="create-filter-modal"
    size="md"
    modal-class="confirm-dialog"
    hide-header-close
    hide-header
    hide-footer
    ref="create-filter-modal"
    v-model="isOpen"
    @show="onShow"
    @shown="onShown"
    @hide="onHide"
    @hidden="onHidden">
  <b-form @submit.prevent="onSubmit">
    <b-form-row>
      <b-col sm="12" md="12" class="mb-3">
        <span class="text-bold fs-20">Create New Filter</span>
      </b-col>
      <b-col sm="12" md="12">
        <b-form-group
          label="Filter Name"
          class="form-label"
        >
          <b-form-input
            ref="filterNameInput"
            size="md"
            type="text"
            placeholder="Name"
            v-model.trim="$v.filter.name.$model"
            :state = "validateState('name')"
          ></b-form-input>
          <b-form-invalid-feedback v-if="!$v.filter.name.required">Enter filter name</b-form-invalid-feedback>
        </b-form-group>
      </b-col>

      <b-col sm="12" md="12">
        <b-form-group
          label="Filter Type"
          class="form-label"
        >
          <q-select color="primary"
                    ref="filterTypeSelect"
                    option-value="value"
                    option-label="label"
                    style="word-break: break-all;"
                    emit-value
                    map-options
                    outlined
                    dense
                    v-model="filter.scope"
                    :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
                    :options="scopeOptions"
                    :disable="true"
                    @popup-show="onFilterTypeShowMenu">
          </q-select>
        </b-form-group>
      </b-col>

      <b-col sm="12" md="6">
        <b-button block class="bg-grey-70 text-black border-0"
                  @click="onHide">
          Cancel
        </b-button>
      </b-col>
      <b-col sm="12" md="6">
        <b-button block
                  type="submit"
                  variant="primary"
                  :disabled="isCreating">
          <q-spinner-bars v-if="isCreating" color="white" />
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
      'isEditingView'
    ]),

    isOpen: {
      get () {
        return this.isFilterModelFormShown
      },

      set (isOpen) {
        return isOpen
      }
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
      ChannelType
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
      this.toggleFilterModelForm()
    },

    onHide () {
      this.toggleFilterModelForm()

      if (this.isFilterDialogForView) {
        this.setIsEditingView(false)
        this.setFilterDialogForView(false)
        this.toggleFilterDialog(false)
        this.$VueEvent.fire('openInboxViewPopup')
        return
      }

      this.toggleFilterDialog(true)
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
      this.$v.$touch()

      if (this.$v.$invalid) {
        return
      }

      this.isCreating = true
      this.filter = {
        ...this.filter,
        type: this.filterModel.type === ChannelType.CHANNEL_RECORDINGS ? ChannelType.CHANNEL_CALLS : this.filterModel.type,
        filter: this.filterModel.filter }

      return talk2Api.V2.inbox.filters.save(this.filter)
        .then(response => {
          this.isCreating = false
          this.$VueEvent.fire('channel_filter_created', response.data.filter)
          this.$emit('created', response.data.filter)
          this.$nextTick(function () {
            this.onHide()
          })
        }).catch(error => {
          const errors = error.response.data.errors
          const keys = Object.keys(errors)

          if (keys && keys.length > 0) {
            this.$generalNotification(errors[keys[0]], 'error')
          }

          this.isCreating = false
        })
    }
  },

  mounted () {
    this.toggleFilterModelForm()
  },

  watch: {
    isFilterModelFormShown: function (value) {
      this.open = value
    }
  }
}
</script>
