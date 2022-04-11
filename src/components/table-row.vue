<template>
  <tr class="datatable-row">
    <template
      v-if="customRowContent">
      <slot name="custom-content" />
    </template>

    <template
      v-else
      v-for="column in fixedColumns">
      <td
        v-if="column.name === 'checkbox'"
        :key="column.name"
        class="text-left pull-left datatable-row__checkbox">

        <label
          class="custom-checkbox-container">
          <input
            type="checkbox"
            class="checker"
            :value="contact.id"
            :disabled="contact.is_dnc || contact.is_blocked"
            :checked="checked.find(item => item.id === contact.id)"
            @change="onCheckerClicked" />
          <span class="checkmark"></span>
        </label>
        <q-tooltip
          class="bg-purple text-subtitle1"
          :offset="[0, 0]"
          anchor="center right"
          self="center left"
          v-model="showing"
          v-if="!hasDefaultContent && (contact.is_dnc || contact.is_blocked)">
          Unable to add DNC or blocked contacts
        </q-tooltip>
      </td>

      <td
        v-else-if="column.name === 'name'"
        :key="column.name"
        class="datatable-row__name">
        <div class="d-flex align-items-center">
          <div class="pr-2">
            <avatar :name="contact.name"/>
          </div>
          <div class="flex-grow-1">

            <router-link
              :to="generateRoute(contact.id)"
              v-slot="{ href, route, navigate }">
              <a :href="href"
                @click="navigate"
                class="d-flex align-items-center item contact-name">
                <template v-if="contact.name">
                  <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
                    {{ contact.name | ucwords }}
                  </div>
                </template>
                <template v-if="!contact.name"> No Name</template>
              </a>
            </router-link>

            <b-badge v-if="contact.is_dnc"
              variant="danger"
              class="badge-phone-info">
              DNC
            </b-badge>
            <b-badge v-if="contact.is_blocked"
              variant="danger"
              class="badge-phone-info">
              blocked
            </b-badge>

          </div>
        </div>
      </td>

      <td
        v-else-if="column.name === 'phone_number'"
        :key="column.name"
        class="datatable-row__phone">
        <div
          v-if="contact.phone_number"
          :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
          {{ contact.phone_number | fixPhone('NATIONAL', true) }}
        </div>
        <span
          v-else
          class="ml-1 text-grey-7 text-center">
          -
        </span>
      </td>

      <td
        v-else-if="column.name === 'last_engagement_text'"
        :key="column.name">
        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
          <div>{{ contact.last_engagement_text }}</div>
          <div class="small text-muted">
            {{ moment(contact.last_engagement_at).format('LLL') }}
          </div>
        </div>
      </td>

      <td
        v-else-if="column.name === 'tags'"
        :class="`tags-cell ${column.draggable ? 'col-indented-2' : ''}`"
        :key="column.name">

        <template
          v-if="!contact.tags || (contact.tags && !contact.tags.length)">
          <span>-</span>
        </template>

        <template
          v-if="Array.isArray(contact.tags) && contact.tags.length">
          <div
            class="d-flex align-items-center contact-tags-item"
            :id="`popover-tags-${contact.id}`"
            ref="`popover-tags-${contact.id}`"
            v-if="contact.id">
            <span :style="`color: ${contact.tags[0].color};`">
              <i
                class="fa fa-circle"
                :style="`color: ${contact.tags[0].color};font-size:36%;position: relative; top: -3px;`"></i>
              <span v-if="contact.tags.length > 1">
                {{ contact.tags[0].name | truncate(17) }}
              </span>
              <span
                v-else>
                {{ contact.tags[0].name | truncate(27) }}
              </span>
            </span>
            <span
              v-if="contact.tags.length > 1"
              class="ml-1 text-grey-7">
              +{{ (contact.tags.length - 1) }} more
            </span>
          </div>
          <b-popover
            v-if="contact.id"
            triggers="hover"
            placement="topright"
            boundary="window"
            :target="`popover-tags-${contact.id}`">
            <template #title>
              <div class="contact-tags-title">Tags</div>
            </template>
            <span
              v-for="tag in contact.tags"
              :key="tag.id"
              class="d-flex align-items-center contact-tags-item">
              <span :style="`color: ${tag.color};`">
                <i class="fa fa-circle" :style="`color: ${tag.color};font-size:50%;position: relative; top: -2px;`"></i>
                {{ tag.name }}
              </span>
            </span>
          </b-popover>
        </template>
      </td>

      <td
        :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
        :key="column.name"
        v-else-if="column.name === 'unread_texts_count'"
      >
        <span
          class="badge badge-danger unread-text bg-red-80"
          v-if="contact.unread_texts_count > 0">
          {{ contact.unread_texts_count }}
        </span>
      </td>

      <td
        :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
        :key="column.name"
        v-else-if="column.name === 'unread_missed_calls_count'"
      >
        <span
          class="badge badge-danger unread-text bg-red-80"
          v-if="contact.unread_missed_calls_count > 0">
          {{ contact.unread_missed_calls_count }}
        </span>
      </td>

      <td
        :class="`text-left ${column.draggable ? 'col-indented-2' : ''}`"
        :key="column.name"
        v-else-if="column.name === 'unread_voicemails_count'"
      >
        <span
          class="badge badge-danger unread-text bg-red-80"
          v-if="contact.unread_voicemails_count > 0">
          {{ contact.unread_voicemails_count }}
        </span>
      </td>

      <td
        v-else-if="column.name === 'text_authorized_at'"
        class="text-left"
        :key="column.name">
        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
          {{ contact.text_authorized_at ? 'Yes' : 'No' }}
        </div>
      </td>

      <td
        v-else-if="column.name === 'initial_campaign_id'"
        class="text-left"
        :key="column.name">
        <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
          {{ getLineName(contact.initial_campaign_id) }}
        </div>
      </td>

      <td
        v-else-if="column.name === 'created_at'"
        class="text-left"
        :key="column.name">
        <div :class="`ellipse ${column.draggable === true ? 'col-indented' : ''}`">
          {{ contact.created_at | fixDate }}
        </div>
      </td>

      <td
        v-else-if="column.name === 'actions'"
        class="text-left datatable-row__actions"
        :key="column.name">
        <div>
          <button class="btn btn-sm btn-link datatable-row__actions__action--call pl-0"
                  @click="onCall">
            <call-o-icon color="#62666E"></call-o-icon>
          </button>
          <button class="btn btn-sm btn-link datatable-row__actions__action--chat"
                  @click="onMessage">
            <message-o-icon></message-o-icon>
          </button>
          <button v-if="hasDelete"
                  class="btn btn-sm btn-link datatable-row__actions__action--trash"
                  @click="onRemove">
            <trash-o-icon></trash-o-icon>
          </button>
        </div>
      </td>

      <td
        v-else
        :key="column.name">

        <div
          v-if="contact[column.name] === '' || contact[column.name] === null || contact[column.name] === 'NULL' || (contact[column.name] instanceof Array && !contact[column.name].length)"
          class="text-left">
          -
        </div>

        <div
          v-else-if="contact[column.name] && contact[column.name] instanceof Array && contact[column.name].length"
          class="text-left">
          <div
            v-if="contact[column.name].length > 0"
            :id="`${column.name}-${contact.id}`">
            <span
              v-if="typeof contact[column.name][0].phone_number !== 'undefined'"
              :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
              {{ contact[column.name][0].phone_number | fixPhone('NATIONAL', true) }}
            </span>
            <span
              v-else
              :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
              {{ contact[column.name][0].name }}
            </span>
            <span
              v-if="contact[column.name].length > 1"
              class="ml-1 text-grey-7">
              +{{ (contact[column.name].length - 1) }} more
            </span>
          </div>
          <b-popover
            v-if="contact[column.name].length > 0 && hasTargetArrays(column.name)"
            :target="`${column.name}-${contact.id}`"
            triggers="hover"
            placement="topright"
            boundary="window">
            <template #title>
              <div class="contact-tags-title">{{ column.label }}</div>
            </template>
            <span
              class="ml-1 d-flex align-items-center"
              v-for="(item, index) in contact[column.name]"
              :id="`${column.name}-${contact.id}`"
              :key="`${column.name}-${index}`">
              <span v-if="typeof item.phone_number !== 'undefined'">
                {{ item.phone_number | fixPhone('NATIONAL', true) }}
              </span>
              <span v-else>
                <i class="fa fa-circle" :style="`font-size:50%;position: relative; top: -2px;`"></i>
                {{ item.name }}
              </span>
            </span>
          </b-popover>
          <span
            v-if="contact[column.name].length === 0">
            -
          </span>
        </div>
        <div
          v-else-if="`${contact[column.name] && contact[column.name] instanceof Object}`"
          class="text-left">
          <div :class="`ellipse ${column.draggable ? 'col-indented' : ''}`">
            <!-- {{ contact[column.name].name }} -->
            {{ contact[column.name] }}
          </div>
        </div>
        <div
          v-else-if="column.name.includes('_at') || column.name.includes('date')"
          class="text-left ellipse">
          {{ contact[column.name] | fixFullDateTime }}
        </div>
        <div
          v-else
          class="ellipse"
          :class="`${[isCountField(column.name) ? 'text-center' : 'text-left']} ${column.draggable ? 'col-indented' : ''}`">
          {{ typeof contact[column.name] === 'boolean' ? (contact[column.name] ? 'Yes' : 'No') :
            (typeof contact[column.name] !== 'undefined' && contact[column.name] !== 0 ? contact[column.name].toString() : contact[column.name]) }}
        </div>
      </td>
    </template>
  </tr>
</template>

<script>

import moment from 'moment'
import { mapActions, mapGetters, mapState } from 'vuex'
import Avatar from 'components/avatar'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import CallOIcon from 'components/icons/call-o-icon'
import MessageOIcon from 'components/icons/message-o-icon'
import TrashOIcon from 'components/icons/trash-o-icon'

export default {
  components: {
    TrashOIcon,
    MessageOIcon,
    CallOIcon,
    Avatar
  },
  props: {
    contact: {
      type: Object,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    checked: {
      type: Array
    },
    contactListId: {
      type: [Number, String]
    },
    customRowContent: {
      type: Boolean,
      default: false
    },
    hasDelete: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      moment,
      countFields: [
        'unread_texts_count',
        'unread_missed_calls_count',
        'unread_voicemails_count',
        'inbound_calls_count',
        'inbound_texts_count',
        'inbound_communications_count',
        'outbound_calls_count',
        'outbound_texts_count',
        'outbound_communications_count',
        'communications_count'
      ],
      tooltip: false
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState(['campaigns']),
    hasTargetTags () {
      return document.getElementById(`popover-tags-${this.contact.id}`)
    },
    fixedColumns () {
      const newItems = JSON.parse(JSON.stringify(this.columns))
      // now, check if columns have order, label, maxWidth or minWidth property, or
      // check if column is required then update sortable.
      const index = { data: null }
      for (index.data in newItems) {
        const found = ALL_COLUMNS.find(col => col.name === newItems[index.data].name)
        if (found && found.required) {
          newItems[index.data].sortable = found.sortable
        }
        if (found) {
          newItems[index.data].label = found.label
          newItems[index.data].maxWidth = found.maxWidth
          newItems[index.data].minWidth = found.minWidth
        }
      }
      return newItems
    },
    hasDefaultContent () {
      return this.$route.name === 'Contacts'
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeContactOpen',
      'setBulkDelete',
      'setMessageComposerMode',
      'setShouldUpdateSelectedListContactCount'
    ]),
    isCountField (columnName) {
      return this.countFields.includes(columnName)
    },
    hasTargetArrays (name) {
      return document.getElementById(`${name}-${this.contact.id}`)
    },
    getLineName (id) {
      const found = this.campaigns.find(campaign => campaign.id === id)
      return found ? found.name : '-'
    },
    onCheckerClicked () {
      const items = { data: [] }
      const found = this.checked.find(item => item.id === this.contact.id)
      if (found) {
        items.data = this.checked.filter(item => item.id !== this.contact.id)
      } else {
        items.data = [...this.checked]
        items.data.push(this.contact)
      }

      this.$emit('checked', items.data)
    },

    onRemove () {
      this.setShouldUpdateSelectedListContactCount(false)
      this.setBulkDelete(false)
      this.removeContactOpen({
        ...this.contact,
        contactListId: this.contactListId
      })
      // this.$emit('on-action-remove', true)
    },

    onMessage () {
      this.setMessageComposerMode('sms')
      this.$router.push(`/contacts/${this.contact.id}`)
    },

    onCall () {
      // check contact has timezone or not
      if (this.contact.timezone) {
        // if have timezone check is it day time?
        const startDay = moment()
          .tz(this.contact.timezone)
          .hour(8)
          .minute(0)
          .second(0)
        const endDay = moment()
          .tz(this.contact.timezone)
          .hour(18)
          .minute(0)
          .second(0)
        const contactLocalTime = moment().tz(this.contact.timezone)
        if (!contactLocalTime.isBetween(startDay, endDay)) {
          return this.$confirm(
            `This is outside the lead's day time. Do you want to make a call? It's ${contactLocalTime.format(
              'hh:mm A'
            )} for ${this.contact.name}.`,
            'Call Lead',
            {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              customClass: 'width-500 fixed',
              type: 'warning'
            }
          ).then(() => {
            this.makeCall()
          }).catch(() => {
          })
        }
      }

      this.makeCall()
    },

    makeCall () {
      if (this.profile.enabled_two_legged_outbound) {
        const message = { data: 'We will call your secondary phone' }
        message.data += ` on ${this.profile.secondary_phone_number}`
        message.data += ` and connect you with ${this.contact.name}. Proceed?`

        return this.$confirm(message.data, 'Going old school?', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          customClass: 'width-500 fixed',
          type: 'warning'
        }).then(() => {
          this.makeTwoLeggedCall()
        }).catch(() => {
        })
      }

      const data = {
        currentNumber: this.contact.phone_number,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        contactTimezone: this.contact.timezone
      }
      this.$VueEvent.fire('callContact', data)
    },

    makeTwoLeggedCall () {
      this.$axios
        .post('/api/v1/contacts/' + this.contact.id + '/make-two-legged-call', {
          phone_number: this.contact.phone_number
        })
        .then((res) => {
          // this.$generalNotification(`We are calling your phone to connect you to ${this.contact.name}`)
        })
        .catch((_err) => {
          // this.$root.handleErrors(err.response)
        })
    },
    generateRoute (contactId) {
      const routeData = {
        path: `/contacts/${contactId}`
      }

      if (this.$route.name !== 'Power Dialer') {
        routeData.query = {
          previousPage: this.$route.name
        }
      }

      return routeData
    }
  }
}
</script>
