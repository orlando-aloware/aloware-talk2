<template>
<div>
  <delete-icon />
  <list-all-icon />
  <list-answer-lead-icon />
  <list-custom-icon />
  <list-new-lead-icon />
  <more-options-icon />
  <refresh-icon />
  <headphone-icon />
  <chevron-left />
  <chevron-right />
</div>
</template>

<script>
import DeleteIcon from 'components/icons/contacts/delete-icon'
import ListAllIcon from 'components/icons/contacts/list-all-icon'
import ListAnswerLeadIcon from 'components/icons/contacts/list-answer-lead-icon'
import ListCustomIcon from 'components/icons/contacts/list-custom-icon'
import ListNewLeadIcon from 'components/icons/contacts/list-new-lead-icon'
import MoreOptionsIcon from 'components/icons/contacts/more-options-icon'
import RefreshIcon from 'components/icons/contacts/refresh-icon'
import HeadphoneIcon from 'components/icons/contacts/headphone-icon'
import ChevronLeft from 'components/icons/contacts/chevron-left'
import ChevronRight from 'components/icons/contacts/chevron-right'
export default {
  name: 'contacts-icons-view.vue',
  components: { ChevronRight, ChevronLeft, HeadphoneIcon, RefreshIcon, MoreOptionsIcon, ListNewLeadIcon, ListCustomIcon, ListAnswerLeadIcon, ListAllIcon, DeleteIcon }
}
</script>

<style scoped>

</style>
