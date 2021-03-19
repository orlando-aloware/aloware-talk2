<template>
<card>
  <div class="contact-list">
    <contacts-list-header />
    <div class="contact-list__body">
      <contact-list-items />
    </div>
  </div>
</card>
</template>

<script>
import Card from 'components/card/card'
import ContactsListHeader from './contact-list-header'
import ContactListItems from './contact-list-items'
export default {
  name: 'contact-list.vue',
  components: { ContactsListHeader, Card, ContactListItems }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.contact-list {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
