<template>
  <b-card class="border-0"
          data-testid="contact-push-to-crm-wrapper">
    <h4>Push contact to CRM</h4>
    <b-button class="btn-block mt-2"
              variant="outline-primary"
              size="sm"
              data-testid="contact-push-to-crm-button"
              :disabled="pushed || isLoading"
              @click="pushToCrm">
      <i class="el-icon-loading"
         v-if="isLoading"></i>
      {{ isLoading ? 'Please wait..' : 'Push to CRM' }}
      <q-tooltip anchor="top middle"
                 self="center middle"
                 data-testid="contact-push-to-crm-tooltip"
                 v-if="pushed">
          Contact has already been pushed to CRM.
      </q-tooltip>
    </b-button>
  </b-card>
</template>

<script>
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-push-to-crm',

  props: {
    contact: {
      required: true
    }
  },

  data () {
    return {
      pushed: false,
      isLoading: false
    }
  },

  methods: {
    pushToCrm () {
      this.isLoading = true
      talk2Api.V1.contact.pushToCrm(this.contact.id).then(response => {
        if (response.data.status === 'success') {
          this.pushed = true
          this.$generalNotification(
            response.data?.message || 'Contact has been pushed to CRM successfully',
            response.data?.status || 'success'
          )
        }
      }).catch(err => {
        this.$handleErrors(err.response)
      }).finally(() => {
        this.isLoading = false
      })
    }
  },

  watch: {
    contact () {
      if (this.contact) {
        this.pushed = false
      }
    }
  }
}
</script>
