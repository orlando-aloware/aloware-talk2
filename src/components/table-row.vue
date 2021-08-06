<template>
  <tr class="datatable-row">
    <template v-for="column in columns">
      <td
        :key="column.name"
        class="text-center align-middle datatable-row__checkbox"
        v-if="column.name === 'checkbox'"
      >
        <input
          type="checkbox"
          class="checker"
          :value="contact.id"
          :checked="checked.find(item => item.id === contact.id)"
          @change="onCheckerClicked"
        />
      </td>

      <td
        :key="column.name"
        class="datatable-row__name"
        v-else-if="column.name === 'name'"
      >
        <div class="d-flex align-items-center">
          <div class="pr-2">
            <avatar :name="contact.name"/>
          </div>
          <div class="flex-grow-1">
            <router-link
              :to="`/contacts/${contact.id}`"
              v-slot="{ href, route, navigate }"
            >
              <a
                :href="href"
                @click="navigate"
                class="d-flex align-items-center item"
              >
                <template v-if="contact.name">
                  {{ contact.name | ucwords }}
                </template>
                <template v-if="!contact.name"> No Name</template>
              </a>
            </router-link>
          </div>
        </div>
      </td>

      <td
        :key="column.name"
        v-else-if="column.name === 'phone_number'"
        class="datatable-row__phone"
      >
        <span>
          {{ contact.phone_number | fixPhone('NATIONAL', true) }}
        </span>
      </td>

      <td :key="column.name" v-else-if="column.name === 'last_engagement_text'">
        <div>{{ contact.last_engagement_text }}</div>
        <div class="small text-muted">
          {{ moment(contact.last_engagement_at).format('LLL') }}
        </div>
      </td>

      <td
        class="tags-cell"
        :key="column.name"
        v-else-if="column.name === 'tags'"
      >
        <template v-if="!contact.tags">
          <span class="text-muted">no tags available</span>
        </template>
        <template v-if="Array.isArray(contact.tags) && contact.tags.length">
          <b-popover
            :target="'popover-tags-' + contact.id"
            triggers="hover"
            placement="left"
            boundary="window"
          >
            <template #title>
              <div class="contact-tags-title">Tags</div>
            </template>
            <span
              :id="'popover-tags-' + contact.id"
              class="d-flex align-items-center contact-tags-item"
              v-for="tag in contact.tags"
              :key="tag.id"
            >
              <span :style="`color: ${tag.color};`">
                <i class="fa fa-circle" :style="`color: ${tag.color};font-size:50%;position: relative; top: -2px;`"></i>
                {{ tag.name }}
              </span>
            </span>
          </b-popover>

          <span
            :id="'popover-tags-' + contact.id"
            class="d-flex align-items-center contact-tags-item"
          >
            <span :style="`color: ${contact.tags[0].color};`">
              <i class="fa fa-circle" :style="`color: ${contact.tags[0].color};font-size:50%;position: relative; top: -2px;`"></i>
              <span v-if="contact.tags.length > 1">
                {{ contact.tags[0].name | truncate(13) }}
              </span>
              <span v-else>
                {{ contact.tags[0].name | truncate(27) }}
              </span>
            </span>
            <span class="ml-1 text-grey-7"
                  v-if="contact.tags.length > 1">
              +{{ (contact.tags.length - 1) }} other tag{{ contact.tags.length > 2 ? 's' : ''}}
            </span>
          </span>
        </template>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'unread_count'"
      >
        <span
          class="badge badge-danger"
          v-if="contact.unread_voicemail_count > 0">
          {{ contact.unread_count }}
        </span>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'unread_missed_call_count'"
      >
        <span
          class="badge badge-danger"
          v-if="contact.unread_voicemail_count > 0">
          {{ contact.unread_missed_call_count }}
        </span>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'unread_voicemail_count'"
      >
        <span
          class="badge badge-danger"
          v-if="contact.unread_voicemail_count > 0">
          {{ contact.unread_voicemail_count }}
        </span>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'text_authorized_at'"
      >
        <span>
          {{ contact.text_authorized_at ? 'Yes' : 'No' }}
        </span>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'initial_campaign_id'"
      >
        <span>
          {{ getLineName(contact.initial_campaign_id) }}
        </span>
      </td>

      <td
        class="text-center datatable-row__actions"
        :key="column.name"
        v-else-if="column.name === 'actions'"
      >
        <div>
          <button
            class="btn btn-sm btn-link datatable-row__actions__action--call"
            @click="onCall"
          >
            <i class="fa fa-phone"></i>
          </button>
          <button
            class="btn btn-sm btn-link datatable-row__actions__action--chat"
            @click="onMessage"
          >
            <i class="fa fa-comment"></i>
          </button>
          <button
            @click="onRemove"
            class="btn btn-sm btn-link datatable-row__actions__action--trash"
          >
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>

      <td :key="column.name" v-else>
        <div class="text-center"
             v-if="contact[column.name] === null || contact[column.name] === 'NULL' || ( contact[column.name] instanceof Array && !contact[column.name].length)">
          -
        </div>
        <div class="text-center"
             v-else-if="contact[column.name] && contact[column.name] instanceof Array && contact[column.name].length">
          <b-popover
            :target="`${column.name}-${contact.id}`"
            triggers="hover"
            placement="left"
            boundary="window"
            v-if="contact[column.name].length > 0"
          >
            <template #title>
              <div class="contact-tags-title">{{ column.label }}</div>
            </template>
            <span
              class="ml-1"
              v-for="(item, index) in contact[column.name]"
              :id="`${column.name}-${contact.id}`"
              :key="`${column.name}-${index}`"
            >
              {{ item.name }}
            </span>
          </b-popover>
          <span :id="`${column.name}-${contact.id}`"
                v-if="contact[column.name].length > 0">
            {{ contact[column.name][0].name }}
          </span>
          <span v-if="contact[column.name].length === 0">
            -
          </span>
        </div>
        <div class="text-center"
             v-else-if="contact[column.name] && contact[column.name] instanceof Object">
          <span>
            {{ contact[column.name].name }}
          </span>
        </div>
        <div class="text-center"
             v-else-if="column.name.includes('_at') || column.name.includes('date')">
          {{ contact[column.name] | fixDateTime }}
        </div>
        <div class="text-center"
             v-else>
          {{ typeof contact[column.name] === 'boolean' ? (contact[column.name] ? 'Yes' : 'No') :
            (typeof contact[column.name] !== 'undefined' && contact[column.name] !== 0 ? contact[column.name].toString() :
              (contact[column.name] === 0 ? '' : contact[column.name]) ) }}
        </div>
      </td>
    </template>
  </tr>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters, mapState } from 'vuex'
import Avatar from 'components/avatar'

export default {
  components: {
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
    }
  },

  data () {
    return {
      moment
    }
  },

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState(['campaigns'])
  },

  methods: {
    ...mapActions('contacts', ['removeContactOpen', 'setBulkDelete', 'setMessageComposerMode']),
    getLineName (id) {
      const found = this.campaigns.find(campaign => campaign.id === id)
      return found ? found.name : '-'
    },
    onCheckerClicked () {
      let items = []
      let found = this.checked.find(item => item.id === this.contact.id)
      if (found) {
        items = this.checked.filter(item => item.id !== this.contact.id)
      } else {
        items = [...this.checked]
        items.push(this.contact)
      }

      this.$emit('checked', items)
    },

    onRemove () {
      this.setBulkDelete(false)
      this.removeContactOpen({
        ...this.contact,
        contactListId: this.contactListId
      })
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
        let message = 'We will call your secondary phone'
        message += ' on ' + this.profile.secondary_phone_number
        message += ` and connect you with ${this.contact.name}. Proceed?`

        return this.$confirm(message, 'Going old school?', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          customClass: 'width-500 fixed',
          type: 'warning'
        }).then(() => {
          this.makeTwoLeggedCall()
        }).catch(() => {
        })
      }

      let data = {
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
        .post('/api/v1/contact/' + this.contact.id + '/make-two-legged-call', {
          phone_number: this.contact.phone_number
        })
        .then((res) => {
          // this.$notify({
          //   offset: 95,
          //   title: 'Call Lead',
          //   message: `We are calling your phone to connect you to ${this.contact.name}`,
          //   type: 'success',
          //   showClose: true
          // })
        })
        .catch((_err) => {
          // this.$root.handleErrors(err.response)
        })
    }
  }
}
</script>
