<template>
  <div>
    <q-select ref="visibiltySelector"
              options-selected-class="text-primary"
              color="primary"
              option-value="value"
              option-label="label"
              input-debounce="0"
              style="word-break: break-all;"
              emit-value
              map-options
              dense
              outlined
              v-model="model"
              :options="options"
              :multiple="multiple"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ highlighted ? highlightedClass : '', customClass]"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label v-html="scope.opt.label" />
            <q-item-label caption>
              <div class="break-all">{{ scope.opt.description }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import * as ContactAccessTypes from 'src/constants/contact-access-types'
import * as CommunicationAccessTypes from 'src/constants/communication-access-types'
import { mapGetters } from 'vuex'

export default {
  name: 'visibility-selector',

  props: {
    value: {
      type: [String, Number],
      default: 0
    },
    isContactAccessType: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },
    customClass: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapGetters({
      currentCompany: 'cache/currentCompany'
    }),

    hasCompanyTeamInboxEnabled () {
      return this.currentCompany?.team_inbox_enabled === true
    },

    contactAccessTypeOptions () {
      const options = [
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY,
          label: 'Owned Only',
          description: 'Can only see self-owned contacts.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP,
          label: 'Owned & Ring Group',
          description: 'Can only see self-owned contacts and unassigned contacts in the ring groups that this user belongs to.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_EVERYONE,
          label: 'Everyone',
          description: 'Can see all contacts in the company.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP_USERS,
          label: this.hasCompanyTeamInboxEnabled ? 'Team Owned Only' : 'Ring Group Users Only',
          description: this.hasCompanyTeamInboxEnabled
            ? 'Can only see contacts owned by users in any teams that this user belongs to.'
            : 'Can only see contacts owned by users in any ring groups that this user belongs to.'
        }
      ]

      // Filter out "Ring Group Only" option for Team Inbox enabled accounts
      if (this.hasCompanyTeamInboxEnabled) {
        return options.filter(opt => opt.value !== ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP)
      }

      return options
    },

    optionsArray () {
      return this.isContactAccessType ? this.contactAccessTypeOptions : this.communicationAccessTypeOptions
    },
    placeholder () {
      switch (true) {
        case this.multiple && this.model.length < 1:
          return 'Select visibilities'
        case !this.multiple && !this.model:
          return 'Select visibility'
        case this.multiple && this.model.length > 0:
        case !this.multiple && this.model:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      model: this.value,
      communicationAccessTypeOptions: [
        {
          value: CommunicationAccessTypes.COMMUNICATIONS_ACCESS_ALL,
          label: 'Everything',
          description: 'Can see all communications from the contacts that they have access to.'
        }, {
          value: CommunicationAccessTypes.COMMUNICATIONS_OWNED_ONLY,
          label: 'Owned Only',
          description: 'Can only see their own outbound communications and all inbound communications from the contacts that they have access to.'
        }
      ],
      selectWidth: 0,
      options: []
    }
  },

  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.optionsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.optionsArray.filter(item => item.value.toLowerCase().indexOf(needle) > -1)
      })
    },
    onShowMenu () {
      this.selectWidth = this.$refs.visibiltySelector.$el.offsetWidth
    }
  },
  watch: {
    value () {
      this.model = this.value
    },

    model () {
      this.$emit('select', this.model)
    },

    optionsArray: {
      handler (newOptions) {
        this.options = newOptions
      },
      immediate: true
    }
  }
}
</script>
