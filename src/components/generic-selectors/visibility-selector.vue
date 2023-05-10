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
            <q-item-label v-html="scope.opt.label"/>
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
      contactAccessTypeOptions: [
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_EVERYONE,
          label: 'Everything',
          description: 'Can see all contacts.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_TEAM,
          label: 'Team Only',
          description: 'Can only see contacts owned by users in any ring groups that this user belongs to.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP,
          label: 'Ring Group Only',
          description: 'Can only see owned contacts and contacts that have interacted with the ring groups that this user belongs to.'
        },
        {
          value: ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY,
          label: 'Owned Only',
          description: 'Can only see their own contacts.'
        }
      ],
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
  mounted () {
    this.options = this.optionsArray
  },
  watch: {
    value () {
      this.model = this.value
    },

    model (val) {
      this.$emit('select', this.model)
    }
  }
}
</script>
