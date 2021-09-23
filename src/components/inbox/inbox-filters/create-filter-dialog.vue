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
            v-model.trim="$v.filter.name.$model"
            :state = "validateState('name')"
            size="md"
            type="text"
            placeholder="Name"
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

export default {
  name: 'create-filter-dialog',

  props: {
    filterModel: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('inbox', ['isFilterModelFormShown']),
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
      selectWidth: 0
    }
  },

  methods: {
    ...mapActions('inbox', ['toggleFilterModelForm']),
    validateState (input) {
      const { $dirty, $error } = this.$v.filter[input]
      return $dirty ? !$error : null
    },
    onHidden () {
      this.$v.filter.$reset()
      this.toggleFilterModelForm()
      // this.$root.$emit('bv::show::modal', 'inbox-channel-filter-modal')
    },
    onHide () {
      this.$refs['create-filter-modal'].hide()
    },
    onShow () {
      // this.$root.$emit('bv::hide::modal', 'inbox-channel-filter-modal')
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
      this.filter = { ...this.filter, type: this.filterModel.type, filter: this.filterModel.filter }
      return talk2Api.V2.inbox.filters.save(this.filter).then(response => {
        this.isCreating = false
        this.$emit('created', response.data.filter)
        this.$nextTick(function () {
          this.onHide()
        })
      })
    }
  },

  watch: {
    isFilterModelFormShown: function (value) {
      this.open = value
    }
  }
}
</script>
