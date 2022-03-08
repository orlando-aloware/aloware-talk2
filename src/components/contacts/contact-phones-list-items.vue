<template>
  <div>
    <div class="phone-number-wrapper"
      v-for="phone in phones"
      :key="phone.id">

      <div>
        <span
          v-if="phone.title"
          class="text-muted phone-number-title mr-1">
          {{ phone.title }}
        </span>

        <b-badge
          v-if="(phone.lrn_type || phone.lrn_type === 0) && $options.filters.validLrnType(phone.lrn_type)"
          :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
          class="badge-phone-info">
          {{ phone.lrn_type | fixLrnType }}
        </b-badge>

        <b-badge
          v-if="phone.phone_number === contact.phone_number"
          variant="grey-80"
          class="badge-phone-info ml-1">
          Primary
        </b-badge>
      </div>

      <div class="d-flex justify-content-between">
        <p class="phone-number m-0">
          {{ phone.phone_number | fixPhone }}
        </p>
        <div class="options phone-options p-0">
          <b-button v-if="hasPermissionTo('update contact')"
                    class="btn-bg-transparent btn-b-0"
                    size="sm"
                    variant="light" @click="onEdit(phone)">
            <pencil-o-icon color="#256EFF"></pencil-o-icon>
          </b-button>

          <b-dropdown no-caret
                      variant="light"
                      class="m-md-2 bg-transparent b-0"
                      size="sm"
                      offset="-125">
            <template slot="button-content">
              <i class="material-icons">more_vert</i>
            </template>
            <b-dropdown-item v-if="hasPermissionTo('update contact')"
                            class="phone-actions"
                            :disabled="contact.is_dnc"
                            @click="onComposerMedia('sms', phone)">
              <text-icon color="#62666E"></text-icon> Text
            </b-dropdown-item>
            <b-dropdown-item  v-if="hasPermissionTo('update contact')"
                              class="phone-actions"
                              :disabled="contact.is_dnc"
                              @click="call">
              <call-icon></call-icon> Call
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions" @click="onComposerMedia('fax', phone)">
              <fax-icon></fax-icon> Fax
            </b-dropdown-item>
            <b-dropdown-item v-if="hasPermissionTo('archive contact') && phone.phone_number !== contact.phone_number"
                            class="phone-actions"
                            @click="onDelete(phone)">
              <trash-icon color="#62666E" width="13" height="13"></trash-icon> Delete
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PencilOIcon from 'components/icons/pencil-o-icon'
import { aclMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'
import TextIcon from 'components/icons/text-icon'
import CallIcon from 'components/icons/call-icon'
import FaxIcon from 'components/icons/fax-icon'
import TrashIcon from 'components/icons/trash-icon'
export default {
  name: 'contact-phones-list-items',
  mixins: [aclMixin],
  components: { TrashIcon, FaxIcon, CallIcon, TextIcon, PencilOIcon },
  props: {
    phones: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState(['isMobile'])
  },
  methods: {
    onEdit (phone) {
      this.$emit('edit', phone)
    },
    onDelete (phone) {
      this.$emit('delete', phone)
    },
    onComposerMedia (type, phone) {
      this.$emit('composerMedia', type, phone)
    },
    call () {
      const data = {
        currentNumber: this.contact.phone_number,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        contactTimezone: this.contact.timezone
      }

      if (this.isMobile) {
        this.setShowPhone(true)
        setTimeout(() => {
          this.$VueEvent.fire('changePhoneNumber', data)
        }, 100)
        return
      }

      this.$VueEvent.fire('callContact', data)
    }
  }
}
</script>
