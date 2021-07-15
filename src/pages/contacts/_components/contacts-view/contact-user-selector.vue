<template>
  <div>
    <q-select class="inline-select"
              clearable
              use-input
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="field"
              :loading="is_busy"
              :options="options"
              :disable="disabled"
              @filter="filterFn">
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
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import * as AnswerTypes from '../../../../constants/answer-types'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-user-selector',
  mixins: [aclMixin],
  props: {
    ignore_focus_mode: {
      default: false,
      type: Boolean,
      required: false
    },
    value: {
      type: Number
    },
    hideExtensions: Boolean,
    disabled: {
      required: false,
      default: false,
      type: Boolean
    }
  },
  computed: {
    ...mapState({
      users: state => state.users
    }),
    availableUsers () {
      if (this.users.length > 0 && (this.auth.profile && this.auth.profile.focus_mode) && !this.ignore_focus_mode) {
        return this.users.filter(user => user.id === this.auth.profile.id)
      } else {
        return this.users
      }
    },
    filteredUsers () {
      if (this.availableUsers) {
        let filteredUsers = this.availableUsers.filter((user) =>
          !(user.role_names.length === 1 && user.read_only_access) &&
          user.answer_by !== AnswerTypes.BY_NONE
        )

        if (this.filtered_text) {
          return filteredUsers.filter((user) =>
            (user.name && user.name.toLowerCase().includes(this.filtered_text.toLowerCase())) ||
            (user.phone_number && user.phone_number.includes(this.filtered_text)) ||
            (user.email && user.email.toLowerCase().includes(this.filtered_text.toLowerCase()))
          )
        }

        return filteredUsers
      }

      return []
    },
    normalUsers () {
      return this.filteredUsers.filter((user) => !user.is_destination)
    },
    extensionUsers () {
      return this.filteredUsers.filter((user) => user.is_destination)
    },

    formattedOptions () {
      let nUsers = [...this.normalUsers]

      nUsers.unshift({
        group: 'Users',
        disable: true
      })

      let usersArray = nUsers

      if (!this.hideExtensions && this.extensionUsers && this.extensionUsers.length > 0) {
        let eUsers = [...this.extensionUsers]
        eUsers.unshift({
          group: 'Extensions',
          disable: true
        })
        usersArray = [...nUsers, ...eUsers]
      }

      return usersArray
    },
    field: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  data () {
    return {
      is_busy: false,
      filtered_text: null,
      options: this.formattedOptions
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.formattedOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.formattedOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getLabel () {

    }
  },
  watch: {
    field: function (val) {
      this.is_busy = true
      this.$emit('updateField', { val,
        callback: () => {
          this.is_busy = false
        } })
    }
  },
  mounted () {
    this.options = this.formattedOptions
  }
}
</script>

<style scoped>
  .group-label {
    font-size: 90%;
  }
</style>
