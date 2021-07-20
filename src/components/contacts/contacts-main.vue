<template>
  <div class="d-flex flex-column h-100">
    <div class="d-flex align-items-center mb-2">
      <div class="h6 d-flex flex-grow-1 align-items-center">
        <div class="pr-2">Google Map List 1</div>
        <span class="small text-muted">216 contacts found</span>
      </div>
      <button
        class="btn btn-sm custom-button-plain custom-button custom-button-plain mr-2"
      >
        Import Contacts
      </button>
      <button class="btn btn-sm custom-button-plain custom-button mr-2">
        <i class="fa fa-plus text-success mr-1"></i> Add Contact
      </button>
      <button class="btn btn-sm custom-button-plain custom-button">
        Actions <i class="fa fa-chevron-down ml-1"></i>
      </button>
    </div>
    <card class="flex-grow-1">
      <div class="table-header d-flex align-items-center border-bottom">
        <div class="px-2 d-flex align-items-center w-100">
          <div class="flex-grow-1">
            <div class="col-md-2 pl-2">
              <input type="text" class="form-control form-control-sm" />
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-primary text-white custom-button mr-2">
              <i class="fa fa-filter mr-1"></i> Filters
            </button>
            <button class="btn btn-sm custom-button-plain custom-button mr-2">
              <i class="fa fa-chevron-down text-success mr-1"></i> Edit Columns
            </button>
            <button
              class="btn btn-sm btn-success text-white custom-button mr-2"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <table class="contacts-table">
        <thead>
          <tr>
            <th style="width: 40px;"><q-checkbox color="positive" size="mini" value="" /></th>
            <th>Name</th>
            <th>Number</th>
            <th>Status</th>
            <th>Date Added</th>
            <th>Tags</th>
            <th>Unresponded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><q-checkbox color="positive" size="mini" value=""/></td>
            <td>Name</td>
            <td>Number</td>
            <td>Status</td>
            <td>Date Added</td>
            <td>Tags</td>
            <td>Unresponded</td>
            <td>Actions</td>
          </tr>
        </tbody>
      </table>
    </card>
  </div>
</template>

<script>
import card from 'components/card.vue'
export default {
  components: {
    card
  }
}
</script>

<style lang="scss">
@import '../../css/mixins';
@import '../../css/variables';
.custom-button {
  color: #000000;
  height: 24px;
  padding: 0;
  line-height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}
.custom-button-plain {
  border-color: #e0e0e0;
}
.table-header {
  height: 58px;
}
.contacts-table {
  width: 100%;
  font-size: 12px;
  th,
  td {
    border-bottom: solid 1px #dee2e6;
  }
  th {
    height: 32px;
  }
  td {
    height: 37px;
  }
}
</style>
