<template>
  <div class="w-full">
    <el-select v-if="contact"
               v-model="dispositionStatusId"
               :disabled="disabled || loading_dispose"
               :multiple="false"
               class="w-full"
               clearable
               filterable
               :placeholder="placeholder"
               @change="dispose">
      <el-option
        v-for="(dispositionStatus, index) in dispositionStatusesAlphabeticalOrder"
        :key="dispositionStatus.id + '-disp-' + index"
        :label="dispositionStatus.name"
        :value="dispositionStatus.id">
        <template v-if="dispositionStatus.is_external !== undefined">
          <i v-if="dispositionStatus.is_external"
             :style="{ color: dispositionStatus.color }"
             class="material-icons">lock</i>
          <i v-else
             :style="{ color: dispositionStatus.color }"
             class="material-icons">label</i>
        </template>
        <span>{{ dispositionStatus.name }}</span>
      </el-option>
    </el-select>
  </div>
</template>

<script>
import _ from 'lodash'
import auth from '../../../boot/auth'
import { mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import * as Roles from 'src/constants/roles'
export default {
  name: 'contact-disposition-selector',

  mixins: [aclMixin],

  props: {
    isContactPage: {
      required: false,
      default: false,
      type: Boolean
    },

    disabled: {
      required: false,
      default: false,
      type: Boolean
    },

    placeholder: {
      required: false,
      default: 'Select disposition code',
      type: String
    },

    contact: {
      required: false
    }
  },

  data () {
    return {
      auth: auth,
      loadingDispose: false,
      recentdispositionStatusId: null,
      Roles
    }
  },

  computed: {
    ...mapState(['currentCompany']),

    isCompanyAgent () {
      return this.hasRole(Roles.COMPANY_AGENT)
    },

    dispositionStatusesAlphabeticalOrder () {
      if (this.dispositionStatuses) {
        let dispositionStatuses = _.clone(this.dispositionStatuses)
          .sort((a, b) => {
            let textA = a.name.toUpperCase()
            let textB = b.name.toUpperCase()
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          })

        // if company == 550 (GoSite), user is an agent,
        // exclude 'uncalled' and 'skipped' in the contact dispositions.
        if (this.currentCompany.id === 550 && this.isCompanyAgent) {
          dispositionStatuses = dispositionStatuses.filter(
            dispositionStatus => ![10659, 11951].includes(dispositionStatus.id)
          )
        }

        return dispositionStatuses
      }
      return []
    },

    computedContact () {
      if (this.contact) {
        return this.contact
      }

      return {
        id: null,
        recentdispositionStatusId: null
      }
    },

    dispositionStatusId: {
      get: function () {
        return this.recentdispositionStatusId
      },

      set: function (dispositionStatusId) {
        this.recentdispositionStatusId = dispositionStatusId
      }
    },

    ...mapState(['dispositionStatuses'])
  },

  mounted () {
    this.fixDispositionStatusId()

    if (!this.isContactPage && this.contact && this.contact.disposition_status_id) {
      this.$emit('contactDisposed')
    }
  },

  methods: {
    fixDispositionStatusId () {
      // if contact disposition is hidden from agent and it's the contact disposition set in the contact,
      // retain the null value. else, use the contact disposition
      let found = this.dispositionStatusesAlphabeticalOrder.find(dispositionStatus => dispositionStatus.id === this.contact.disposition_status_id)
      if (found) {
        this.recentdispositionStatusId = this.contact.disposition_status_id
      }
    },

    dispose (dispositionStatus) {
      this.loadingDispose = true
      this.$axios.post('/api/v1/contact/' + this.contact.id + '/dispose', { dispositionStatus })
        .then((res) => {
          this.loadingDispose = false
          this.recentdispositionStatusId = res.data.disposition_status_id
          let message = 'Contact disposed'
          if (!this.dispositionStatusId) {
            message = 'Contact undisposed'
          }
          if (this.isContactPage) {
            message = 'Contact disposition status updated successfully'
          }
          this.$q.notify({
            offset: 95,
            title: 'Contact',
            message: message,
            type: 'success',
            showClose: true
          })
          if (this.isContactPage) {
            this.$emit('contactUpdated', res.data)
          } else {
            this.$emit('contactDisposed', res.data.disposition_status_id)
          }
        }).catch((err) => {
          this.loadingDispose = false
          this.$handleErrors(err.response)
        })
    }
  },

  watch: {
    'computedContact.disposition_status_id': function () {
      this.recentdispositionStatusId = this.computedContact.disposition_status_id
      if (!this.isContactPage && this.computedContact.disposition_status_id) {
        this.$emit('contactDisposed')
      }
    }
  }
}
</script>
