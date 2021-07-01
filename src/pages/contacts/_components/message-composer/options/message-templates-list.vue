<template>
  <div>
    <ul class="pl-0">
      <li class="d-flex justify-content-between"
          v-for="template in templates"
          :key="template.id">
        <div class="template-title ellipsis">{{ template.name }}</div>
        <div class="d-flex justify-content-between template-actions">
          <b-link href="#" class="active" v-on:click="templateSelected(template)"><add-icon-square></add-icon-square></b-link>
          <b-link href="#" :id="`template-view-${template.id}`"><eye-icon></eye-icon></b-link>
          <b-link href="#"><pencil-o-icon/></b-link>
          <b-link href="#" v-on:click="deleteTemplate(template)"><trash-o-icon/></b-link>

          <b-popover ref="popover"
                     placement="topright"
                     :target="`template-view-${template.id}`"
                     triggers="focus">
            {{ template.body }}
          </b-popover>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PencilOIcon from 'components/icons/pencil-o-icon'
import AddIconSquare from 'components/icons/add-icon-square'
import EyeIcon from 'components/icons/eye-icon'
import TrashOIcon from 'components/icons/trash-o-icon'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'sms-templates-list',
  components: { TrashOIcon, EyeIcon, AddIconSquare, PencilOIcon },
  props: {
    template_scope: {
      default: 'user',
      validator: function (value) {
        return ['user', 'company'].indexOf(value) !== -1
      }
    }
  },
  computed: {
    ...mapState(['sms_templates']),
    ...mapGetters('contacts', ['message_composer']),
    agentTemplates () {
      return this.sms_templates.filter(template => template.is_on_user)
    },
    accountTemplates () {
      return this.sms_templates.filter(template => template.is_on_company)
    },
    templates () {
      return this.template_scope === 'user' ? this.agentTemplates : this.accountTemplates
    }
  },
  data () {
    return {
      selectedTemplate: {},
      is_deleting: false
    }
  },
  methods: {
    ...mapActions(['deleteSmsTemplate']),
    templateSelected (template) {
      this.$emit('templateSelected', template)
    },
    deleteTemplate (template) {
      this.selectedTemplate = template
      this.is_deleting = true
      talk2Api.V1.sms_template.delete(template.id)
        .then(response => {
          if (response.status === 204) {
            this.deleteSmsTemplate(template)
          }
        }).finally(() => {
          this.is_deleting = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  li{
    font-size: 14px;
    color: #62666E;
    font-weight: normal;
    line-height: 16px;
    padding: 10px;
    cursor: pointer;
  }

  li:hover{
    background: #F4F4F6;
    border-radius: 8px;
  }

  li .template-title {
    max-width: 300px;
    padding-right: 20px;
  }

  li a:not(:last-child) {
    padding-right: 10px;
  }
}

</style>
