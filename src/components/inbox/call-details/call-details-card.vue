<template>
  <card>
    <div class="d-flex flex-column h-100">
      <card-header name="Walter Bowman" />
      <div class="card-container">
        <div class="card-content">
          <div class="spacer">
            <card-label label="Company" value="Aloware LLC" />
          </div>
          <div class="spacer">
            <card-label label="Role" value="CEO" />
          </div>
          <div class="spacer">
            <card-label label="Number" value="(111) 222-3333" />
          </div>
          <div class="spacer">
            <card-label label="Email" value="dave@aloware.com" />
          </div>
          <card-label label="Address" value="Aneheim St, Bay Area CA" />
        </div>
        <div class="card-divider"></div>
        <div class="card-content">
          <div class="d-flex spacer">
            <div class="w-50">
              <card-label label="Total Calls" value="89" />
            </div>
            <div class="w-50">
              <card-label label="Total Message" value="150" />
            </div>
          </div>
          <div class="d-flex">
            <div class="w-50">
              <card-label label="Ave Call Time" value="01:30" />
            </div>
            <div class="w-50">
              <card-label label="Ave Wait Time" value="00:08" />
            </div>
          </div>
        </div>
        <div class="card-divider"></div>
        <div class="card-content">
          <card-notes label="Notes" value="Lorem ipsum dolor" />
        </div>
        <div class="card-divider"></div>
        <div class="card-content">
          <call-tag name="Other Tag" /> <call-tag name="Other Tag" />
        </div>
      </div>
      <div class="card-divider"></div>
      <div class="card-content">
        <call-edit />
      </div>
    </div>
  </card>
</template>

<script>
import card from 'components/card/card.vue'
import cardHeader from './call-details-header.vue'
import cardLabel from './call-details-label.vue'
import cardNotes from './call-details-notes.vue'
import callTag from './call-details-tag.vue'
import callEdit from './call-details-edit.vue'

export default {
  components: {
    card,
    cardHeader,
    cardLabel,
    cardNotes,
    callTag,
    callEdit
  },
  props: {}
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.card-content {
  padding: 20px;
}
.card-container {
  flex-grow: 1;
  overflow: auto;
}
.card-divider {
  border-bottom: solid 1px #e4e4e4;
}
.spacer {
  padding-bottom: 20px;
}
</style>
