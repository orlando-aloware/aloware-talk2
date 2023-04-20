<template>
  <div>
    <div class="phone-number-wrapper"
         v-for="phone in phones"
         :key="phone.id">
      <div>
        <span class="text-muted phone-number-title mr-1"
              v-if="phone.title">
          {{ phone.title }}
        </span>

        <b-badge class="badge-phone-info mr-1"
                 :variant="$options.filters.fixLrnTypeBadge(phone.lrn_type)"
                 v-if="(phone.lrn_type || phone.lrn_type === 0) && $options.filters.validLrnType(phone.lrn_type)">
          {{ phone.lrn_type | fixLrnType }}
        </b-badge>

        <b-badge variant="grey-80"
                 class="badge-phone-info mr-1"
                 v-if="phone.phone_number === contact.phone_number">
          Primary
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 v-if="phone.is_invalid">
          Invalid Number
        </b-badge>

        <b-badge variant="danger"
                 class="badge-phone-info"
                 v-if="phone.is_opted_out">
          Opt-Out
        </b-badge>
      </div>

      <div class="d-inline-flex justify-content-between align-items-center">
        <p class="phone-number m-0">
          {{ phone.phone_number | fixPhone }}
        </p>
        <div class="options phone-options px-3">
          <b-button class="btn-bg-transparent btn-b-0 line-height-1"
                    size="sm"
                    variant="light"
                    v-if="hasPermissionTo('update contact')"
                    @click="onEdit(phone)">
            <pencil-o-icon color="#256EFF"></pencil-o-icon>
          </b-button>

          <b-dropdown variant="light"
                      class="bg-transparent b-0"
                      size="sm"
                      offset="-125"
                      no-caret>
            <template slot="button-content">
              <div class="line-height-1">
                <i class="material-icons">more_vert</i>
              </div>
            </template>
            <b-dropdown-item class="phone-actions"
                             :disabled="contact.is_dnc"
                             v-if="hasPermissionTo('update contact')"
                             @click="onComposerMedia('sms', phone)">
              <text-icon color="#62666E"></text-icon> Text
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             :disabled="contact.is_dnc"
                             v-if="hasPermissionTo('update contact')"
                             @click="onCall(phone)">
              <call-icon /> Call
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             @click="onComposerMedia('fax', phone)">
              <fax-icon /> Fax
            </b-dropdown-item>
            <b-dropdown-item class="phone-actions"
                             v-if="hasPermissionTo('archive contact') && phone.phone_number !== contact.phone_number"
                             @click="onDelete(phone)">
              <trash-icon color="#62666E"
                          width="13"
                          height="13">
              </trash-icon> Delete
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
import { mapGetters } from 'vuex'
import TextIcon from 'components/icons/text-icon'
import CallIcon from 'components/icons/call-icon'
import FaxIcon from 'components/icons/fax-icon'
import TrashIcon from 'components/icons/trash-icon'

export default {
  name: 'contact-phones-list-items',

  mixins: [aclMixin],

  components: {
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
    ...mapGetters('contacts', ['contact'])
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

    onCall (phone) {
      this.$emit('call', phone)
    }
  }
}
</script>
