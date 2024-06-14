<template>
  <div>
    <div class="phone-number-wrapper"
         data-testid="contact-phones-list-items-wrapper"
         v-for="phone in phones"
         :key="phone.id">
      <div>
        <span class="text-muted phone-number-title mr-1"
              v-if="phone.title">
          {{ phone.title }}
        </span>

        <b-badge class="badge-phone-info mr-1"
                 :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                 data-testid="contact-phones-list-items-lrn-badge"
                 v-if="(phone.lrn_type || phone.lrn_type === 0) && $options.filters.validLrnType(phone.lrn_type)">
          {{ phone.lrn_type | fixLrnType }}
        </b-badge>

        <b-badge variant="grey-80"
                 class="badge-phone-info mr-1"
                 data-testid="contact-phones-list-items-lrn-primary-badge"
                 v-if="phone.phone_number === contact.phone_number">
          Primary
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-items-has-conflict"
                 v-if="phone.conflicted_contacts.length !== 0">
          Has conflicts
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-items-invalid-number-badge"
                 v-if="phone.is_invalid">
          Invalid Number
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 data-testid="contact-phones-list-items-opt-out-badge"
                 v-if="phone.is_opted_out">
          Opt-Out
        </b-badge>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="phone-number m-0">
          {{ phone.phone_number | fixPhone }}
        </div>
        <div class="options phone-options px-3">
          <b-button class="btn-bg-transparent btn-b-0 line-height-1"
                    size="sm"
                    variant="light"
                    v-if="hasPermissionTo('update contact')"
                    data-testid="contact-phones-list-items-edit"
                    @click="onEdit(phone)">
            <pencil-o-icon width="12"
                           height="12"
                           data-testid="contact-phones-list-items-edit-icon"
                           color="#256EFF"></pencil-o-icon>
          </b-button>

          <b-dropdown variant="light"
                      class="bg-transparent b-0"
                      size="sm"
                      offset="-125"
                      data-testid="contact-phones-list-items-dropdown"
                      no-caret>
            <template slot="button-content">
              <i class="material-icons"
                 style="font-size: 12px;">more_vert</i>
            </template>
            <b-dropdown-item class="phone-actions"
                             :disabled="contact.is_dnc"
                             v-if="hasPermissionTo('update contact')"
                             data-testid="contact-phones-list-items-composer-text-item"
                             @click="onComposerMedia('sms', phone)">
              <text-icon color="#62666E"></text-icon> Text
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             :disabled="contact.is_dnc"
                             v-if="hasPermissionTo('update contact')"
                             data-testid="contact-phones-list-items-call-item"
                             @click="onCall(phone)">
              <call-icon /> Call
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             data-testid="contact-phones-list-items-fax-item"
                             @click="onComposerMedia('fax', phone)">
              <fax-icon /> Fax
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             data-testid="contact-phones-list-items-delete-item"
                             v-if="phoneCanBeDeleted(phone)"
                             @click="onDelete(phone)">
              <trash-icon color="#62666E"
                          width="13"
                          data-testid="contact-phones-list-items-delete-icon"
                          height="13">
              </trash-icon> Delete
            </b-dropdown-item>
          </b-dropdown>
        </div>
        <div class="phone-number-duplicates-icon">
          <contact-phone-number-duplicates :phone_number="phone"
                                           v-if="phone.conflicted_contacts.length !== 0" />
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
import ContactPhoneNumberDuplicates from 'components/contacts/contact-phone-number-duplicates'

export default {
  name: 'contact-phones-list-items',

  mixins: [aclMixin],

  components: {
    ContactPhoneNumberDuplicates,
    TrashIcon,
    FaxIcon,
    CallIcon,
    TextIcon,
    PencilOIcon
  },

  props: {
    phones: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    phoneCanBeDeleted (phone) {
      return this.hasPermissionTo('archive contact') &&
        phone.phone_number !== this.contact.phone_number &&
        this.currentCompany.activate_multi_entity ? phone.integration_data && phone.integration_data.length === 0 : true
    },
    onEdit (phone) {
      this.$emit('edit', phone)
    },

    onDelete (phone) {
      this.$emit('delete', phone)
    },

    onComposerMedia (type, phone) {
      this.$emit('composerMedia', type, phone)
    },

    onCall (phone) {
      this.$emit('call', phone)
    }
  }
}
</script>
