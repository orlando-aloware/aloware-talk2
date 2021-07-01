<template>
  <div class="templates-list-wrapper">
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Agent Templates</span>
      <b-link href="#foo">New</b-link>
    </div>
    <message-templates-list @templateSelected="templateSelected" template_scope="user"></message-templates-list>
    <hr/>
    <div class="list-group-title d-flex justify-content-between p-2">
      <span>Account Templates</span>
      <b-link href="#foo">New</b-link>
    </div>
    <message-templates-list @templateSelected="templateSelected" template_scope="company"></message-templates-list>
  </div>
</template>

<script>

import MessageTemplatesList from 'pages/contacts/_components/message-composer/options/message-templates-list'
export default {
  name: 'message-templates',
  components: { MessageTemplatesList },
  methods: {
    templateSelected (template) {
      this.$emit('templateSelected', template)
    }
  }
}
</script>

<style lang="scss" scoped>
.templates-list-wrapper{
  max-height: 400px;
  overflow: auto;
  padding-right: 5px;

  .list-group-title{
    color: #62666E;
    font-size: 13px;
    font-weight: 600;
  }
}
</style>
