<template>
  <div class="w-full"
       v-if="contactId && campaign_id && phoneNumber">
    <q-select class="p-1"
              style="max-width: 170px;"
              use-input
              clearable
              input-debounce="0"
              label="Select Template"
              option-value="id"
              option-label="name"
              :options="campaigns"
              :loading="loadingTemplates"
              v-model="message"
              @filter="filterFn">
    </q-select>
    <el-select v-model="message"
               placeholder="Select Template"
               style="max-width: 170px;"
               :loading="loading_templates"
               default-first-option
               clearable
               filterable>
      <el-option-group key="Agent Templates"
                       label="Agent Templates"
                       v-if="agentTemplates && agentTemplates.length > 0">
        <el-option
          v-for="template in agentTemplates"
          :key="template.id"
          :label="template.name"
          :value="template.body">
          <div class="media">
            <div class="media-body">
              <label>{{ template.name }}</label>
              <small class="text-xxs">{{ template.body }}</small>
            </div>
          </div>
        </el-option>
      </el-option-group>
      <el-option-group key="Account Templates"
                       label="Account Templates"
                       v-if="accountTemplates && accountTemplates.length > 0">
        <el-option
          v-for="template in accountTemplates"
          :key="template.id"
          :label="template.name"
          :value="template.body">
          <div class="media">
            <div class="media-body">
              <label>{{ template.name }}</label>
              <small class="text-xxs">{{ template.body }}</small>
            </div>
          </div>
        </el-option>
      </el-option-group>
    </el-select>
    <button class="btn btn-md dark-greenish pull-right"
            :disabled="loading_send_message || !message || message.length === 0"
            @click="sendMessage">
      <i class="material-icons loader"
         v-show="loading_send_message">
        &#xE863;
      </i>
      Send
    </button>
  </div>
</template>

<script>
export default {
  name: 'send-template',
  props: {
    contact_id: {
      required: true
    },

    campaign_id: {
      required: true
    },

    phone_number: {
      required: true
    }
  },

  data () {
    return {
      message: null,
      templates: [],
      loading_templates: false,
      loading_send_message: false
    }
  },

  computed: {
    agentTemplates () {
      return this.templates.filter((template) => template.is_on_user)
    },

    accountTemplates () {
      return this.templates.filter((template) => template.is_on_company)
    }
  },

  created () {
    this.fetchTemplates()
  },

  methods: {
    fetchTemplates () {
      this.loading_templates = true
      this.$axios.get('/api/v1/sms-template').then(res => {
        this.loading_templates = false
        this.templates = res.data
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loading_templates = false
      })
    },

    sendMessage () {
      this.loading_send_message = true
      this.$axios.post('/api/v1/campaign/send-message/' + this.campaign_id + '/' + this.contact_id, {
        message: this.message,
        phone_number: this.phone_number
      }).then(res => {
        this.message = null
        this.loading_send_message = false
        this.$generalNotification('Your message has been added to the queue. It will be sent shortly. Thank you for your patience.')
        this.$emit('messageSent')
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loading_send_message = false
      })
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.filteredCampaigns = this.campaigns
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredCampaigns = this.campaigns.filter(campaign => campaign.toLowerCase().indexOf(needle) > -1)
      })
    }
  }
}
</script>
