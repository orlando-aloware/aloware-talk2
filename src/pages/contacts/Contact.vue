<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex align-items-center mb-2">
      <div
        class="h6 d-flex flex-grow-1 flex-column flex-lg-row align-items-start align-items-lg-center"
      >
        <div class="pr-2">
          {{ title }}
        </div>
        <span class="small text-muted">{{ totalContacts }} contacts found</span>
      </div>

      <compact-btn variant="outlined-light"
                   customClass="mr-2"
        >
        Import Contacts
      </compact-btn>

      <compact-btn variant="outlined-light"
                   customClass="mr-2"
      >
        <i class="fa fa-plus text-success mr-1"></i> Add Contact
      </compact-btn>

      <compact-btn variant="outlined-light">
        Actions <i class="fa fa-chevron-down ml-1"></i>
      </compact-btn>
    </div>
    <card class="flex-grow-1">
      <div class="table-header d-flex align-items-center border-bottom">
        <div class="px-3 py-3 py-lg-0 w-100">
          <div class="row mx-0">
            <div class="col-lg-6 px-0 mb-2 mb-lg-0">
              <contacts-table-search></contacts-table-search>
            </div>
            <div class="col-lg-6 px-0 d-flex align-items-center">
              <div class="flex-grow-1"></div>
              <compact-btn variant="primary"
                           customClass="mr-2"
              >
                <span class="mr-2">Filters</span>
                <b-badge variant="light">4</b-badge>
              </compact-btn>
              <compact-btn variant="outlined-light"
                           customClass="mr-2"
              >
                <i class="fa fa-chevron-down text-success mr-1"></i> Edit
                Columns
              </compact-btn>
              <compact-btn variant="success">
                Save
              </compact-btn>
            </div>
          </div>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import card from 'components/card/card.vue'
import compactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'

export default {
  components: {
    card,
    compactBtn,
    ContactsTableSearch
  },
  data () {
    return {
      title: 'Google Map List',
      totalContacts: 216
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.table-header {
  min-height: 58px;
}
</style>
