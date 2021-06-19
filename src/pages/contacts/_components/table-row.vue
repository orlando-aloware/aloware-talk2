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
          :checked="checked.includes(contact.id)"
          @click="onCheckerClicked"
        />
      </td>

      <td
        :key="column.name"
        class="datatable-row__name"
        v-else-if="column.name === 'name'"
      >
        <div class="d-flex align-items-center">
          <div class="pr-2">
            <avatar :name="contact.name" />
          </div>
          <div class="flex-grow-1">
            <router-link
              :to="`/contact/${contact.id}`"
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
                <template v-if="!contact.name"> No Name </template>
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
          {{ contact.phone_number | fixPhone }}
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
              <span class="text-primary mr-1">●</span>
              {{ tag.name }}
            </span>
          </b-popover>

          <span
            :id="'popover-tags-' + contact.id"
            class="d-flex align-items-center contact-tags-item"
          >
            <span class="text-primary mr-1">●</span>
            {{ contact.tags[0].name }}
          </span>
        </template>
      </td>

      <td
        class="text-center"
        :key="column.name"
        v-else-if="column.name === 'unread_count'"
      >
        <span class="badge badge-danger">
          {{ contact.unread_count }}
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
        <div>{{ contact[column.name] }}</div>
      </td>
    </template>
  </tr>
</template>

<script>
import moment from 'moment'

import Avatar from 'src/components/avatar/avatar.vue'

import { mapActions, mapGetters } from 'vuex'

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
  methods: {
    ...mapActions('contacts', ['removeContactOpen', 'setBulkDelete']),
    onCheckerClicked () {
      const checked = new Set([...this.checked])

      if (this.checked.includes(this.contact.id)) {
        checked.delete(this.contact.id)
      } else {
        checked.add(this.contact.id)
      }

      this.$emit('checked', [...checked])
    },
    onRemove () {
      this.setBulkDelete(false)
      this.removeContactOpen({
        ...this.contact,
        contactListId: this.contactListId
      })
    },
    onMessage () {
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
          )
            .then(() => {
              this.makeCall()
            })
            .catch(() => {})
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
        })
          .then(() => {
            this.makeTwoLeggedCall()
          })
          .catch(() => {})
      }
      window.VueEvent.fire('make_new_call', {
        phone_number: this.contact.phone_number
      })
    },
    makeTwoLeggedCall () {
      window.axios
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
  },
  data () {
    return {
      moment
    }
  },
  computed: {
    ...mapGetters('auth', ['profile'])
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.datatable-row {
  font-size: 12px;
  &__checkbox {
    max-width: 40px;
    input {
      margin-top: 5px;
    }
  }
  &__phone {
    min-width: 50px;
  }
  &__name {
    min-width: 150px;
  }
  &__actions {
    min-width: 40px;
    max-width: 40px;
    &__action {
      &--call:hover {
        color: $green;
      }
      &--chat:hover {
        color: $blue;
      }
      &--trash:hover {
        color: $red;
      }
    }
    button {
      color: $grey-mid;
    }
  }
}

.contact-tags-title {
  font-size: 12px;
}

.contact-tags-item {
  font-size: 12px;
}
</style>
