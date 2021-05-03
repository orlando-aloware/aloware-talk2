<template>
  <card class="position-relative flex-column">
    <contacts-header class="contacts-header position-absolute" />
    <contact-table-actions class="contacts-table-actions px-3 py-2" />
    <q-table class="contacts-table border-0 border-radius-inherit"
             :columns="columns"
             :data="data"
             :pagination.sync="table_pagination"
             table-header-class="contacts-table-header"
             row-key="id"
             selection="multiple"
             :selected.sync="selected"
             virtual-scroll
             flat>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-checkbox v-model="props.selected"
                        color="positive" />
          </q-td>
          <q-td key="name"
                :props="props"
                class="contact-name d-flex align-items-center">
            <avatar class="mr-2">
              {{ props.row.name | initials }}
            </avatar>
            {{ props.row.name }}
          </q-td>
          <q-td key="phone_number"
                :props="props">
            {{ props.row.phone_number }}
          </q-td>
          <q-td key="company_name"
                :props="props">
            {{ props.row.company_name }}
          </q-td>
          <q-td key="tags"
                :props="props">
            <call-details-tag v-for="(tag, index) in props.row.tags"
                              :key="tag + '-' + index"
                              :name="tag" />
          </q-td>
          <q-td key="unreads"
                :props="props">
            <inbox-nav-badge v-if="props.row.unreads"
                             :value="props.row.unreads"
                             color="danger" />
          </q-td>
          <q-td key="action"
                :props="props">
            <div class="d-flex align-items-center">
              <button class="action-buttons p-0">
                <phone-icon height="20"
                            width="20"
                            iconColor="grey-2" />
              </button>
              <button class="action-buttons p-0">
                <message-icon height="20"
                              width="20"
                              iconColor="grey-2" />
              </button>
              <button class="action-buttons p-0">
                <delete-icon height="20"
                             width="20"
                             iconColor="grey-2" />
              </button>
            </div>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom></template>
    </q-table>
  </card>
</template>

<script>
import Card from 'components/card/card'
import ContactTableActions from './contact-table-actions'
import ContactsHeader from 'components/contacts/header/contacts-header'
import CallDetailsTag from 'components/inbox/call-details/call-details-tag'
import Avatar from 'components/avatar/avatar'
import InboxNavBadge from 'components/inbox/inbox-nav/inbox-nav-badge'
import DeleteIcon from 'components/icons/contacts/delete-icon'
import PhoneIcon from 'components/icons/phone-icon'
import MessageIcon from 'components/icons/message-icon'
export default {
  name: 'contact-table.vue',
  components: {
    MessageIcon,
    PhoneIcon,
    DeleteIcon,
    InboxNavBadge,
    Avatar,
    CallDetailsTag,
    ContactsHeader,
    Card,
    ContactTableActions
  },

  props: {
    data: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    },
    columns: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    },
    pagination: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    }
  },

  data () {
    return {
      table_pagination: {},
      selected: []
    }
  },

  created () {
    this.table_pagination = { ...this.pagination }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contacts {
  &-header {
    transform: translate(-35%, -150%);
    z-index: 1030;
  }

  &-table-actions {
    border-bottom: solid 1px $grey-light3;
    height: 52px;
  }

  &-table {
    font-family: Roboto;
    color: $black;
    height: calc(100% - 52px);

    & .contacts-table-header {
      background-color: $grey-light6;
      height: 40px;

      & th {
        height: 40px;
        font-size: 10px;
        font-weight: bold;
        letter-spacing: 0.25px;
        text-transform: uppercase;
        color: $grey-dark !important;
        position: sticky !important;
        z-index: 1;
        padding-top: 0;
        padding-bottom: 0;
        top: 0;
      }

      & th:last-child {
        min-width: 150px;
      }
    }

    & tbody {
      tr, td {
        height: 60px;
      }

      td:before, td:after {
        background: transparent;
      }

      tr:hover {
        background: $orange-light;
        td {
          font-weight: 500;
        }

        td:nth-child(2) {
          font-weight: 900;
        }
      }

      .action-buttons {
        background-color: $white;
        border: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 100ms ease-in;
        height: 30px;
        width: 30px;
        border-radius: 100%;

        &:hover {
          background-color: darken($white, 7%);
        }
      }
    }

    & .contact-name {
      font-size: 13px;
      letter-spacing: 0.33px;
      line-height: 18px;
    }

    & .q-table__bottom {
      display: none;
    }
  }
}

</style>
