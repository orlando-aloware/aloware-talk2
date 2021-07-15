<template>
  <div ref="templateWrapper">
    <ul class="pl-0">
      <li class="d-flex justify-content-between"
          v-for="template in templates"
          :key="template.id">
        <div class="template-title ellipsis">{{ template.name }}</div>
        <div class="d-flex justify-content-between template-actions">
          <b-link href="#"
                  class="active"
                  v-b-tooltip="`Use`"
                  v-on:click="templateSelected(template)">
            <add-icon-square></add-icon-square>
          </b-link>
          <b-link href="#"
                  :id="`template-view-${template.id}`"
                  v-b-tooltip="`View`">
            <eye-icon height="16" width="16"></eye-icon>
          </b-link>
          <b-link href="#"
                  v-b-tooltip="`Edit`" @click="onEdit(template)">
            <pencil-o-icon color="#62666E"/>
          </b-link>
          <b-link href="#" v-b-tooltip="`Delete`"
                  v-on:click="onDelete(template)">
            <trash-o-icon/>
          </b-link>

          <b-popover ref="popover"
                     placement="topright"
                     :target="`template-view-${template.id}`"
                     triggers="click blur">
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
    ...mapState(['smsTemplates']),
    ...mapGetters('contacts', ['messageComposer']),
    agentTemplates () {
      return this.smsTemplates.filter(template => template.is_on_user)
    },
    accountTemplates () {
      return this.smsTemplates.filter(template => template.is_on_company)
    },
    templates () {
      return this.template_scope === 'user' ? this.agentTemplates : this.accountTemplates
    }
  },
  data () {
    return {
      selectedTemplate: {}
    }
  },
  methods: {
    ...mapActions('contacts', ['setSmsTemplateModal']),
    templateSelected (template) {
      this.$emit('templateSelected', template)
    },

    onDelete (template) {
      this.$emit('templateDeleted', template)
    },
    onEdit (template) {
      this.setSmsTemplateModal({
        isOpen: true,
        scope: this.template_scope,
        template: template
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
