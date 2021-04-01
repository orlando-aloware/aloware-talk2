<template>
  <div class="d-flex">
    <contact-list class="col-3 px-0 mr-2"></contact-list>
    <div class="col-9 pl-0 ml-1 pr-4 h-100">
      <contact-table class="h-100"
      :columns="columns"
      :data="contacts"
      :pagination="pagination" />
    </div>
  </div>
</template>

<script>
import ContactList from '../components/contacts/contact-list/contact-list'
import ContactTable from '../components/contacts/contact-table/contact-table'
export default {
  name: 'Contacts',
  components: {
    ContactTable,
    ContactList
  },
  data () {
    return {
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10
      },
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        {
          name: 'phone_number',
          required: true,
          label: 'Phone Number',
          align: 'left',
          field: row => row.phone_number,
          sortable: true
        },
        {
          name: 'company_name',
          required: true,
          label: 'Company',
          align: 'left',
          field: row => row.company_name,
          sortable: true
        },
        {
          name: 'tags',
          required: true,
          label: 'Tags',
          align: 'left',
          field: row => row.tags,
          sortable: true
        },
        {
          name: 'unreads',
          required: true,
          label: 'Unread(s)',
          align: 'left',
          field: row => row.unreads,
          sortable: true
        },
        {
          name: 'action',
          required: true,
          label: 'Action',
          align: 'left',
          field: row => row.action,
          sortable: true,
          style: 'width: 150px'
        }
      ],
      contacts: [
        {
          id: 1,
          name: 'Susan Daniel',
          phone_number: '(111) 222-3333',
          company_name: 'Company X',
          tags: [
            'Test tag'
          ],
          unreads: 1
        },
        {
          id: 2,
          name: 'Walter Bowman',
          phone_number: '(111) 222-3333',
          company_name: 'Company XCX',
          tags: [
            'Test tag'
          ],
          unreads: 1
        },
        {
          id: 3,
          name: 'Terry McGuire',
          phone_number: '(111) 222-3333',
          company_name: '-',
          tags: [
            'Test tag'
          ],
          unreads: 9
        },
        {
          id: 4,
          name: 'Dora Mann',
          phone_number: '(111) 222-3333',
          company_name: 'Night Horse',
          tags: [
            'Test tag'
          ],
          unreads: null
        },
        {
          id: 5,
          name: 'Mitchell Haynes',
          phone_number: '(111) 222-3333',
          company_name: 'B-Comp',
          tags: [
            'Test tag'
          ],
          unreads: null
        },
        {
          id: 6,
          name: 'Christine Phelps',
          phone_number: '(111) 222-3333',
          company_name: 'Company X',
          tags: [],
          unreads: null
        },
        {
          id: 7,
          name: 'Lula Duncan',
          phone_number: '(111) 222-3333',
          company_name: '-',
          tags: [
            'Test tag',
            'Other Tag'
          ],
          unreads: null
        },
        {
          id: 8,
          name: 'Joel Stanley',
          phone_number: '(111) 222-3333',
          company_name: '-',
          tags: [
            'Test tag'
          ],
          unreads: null
        },
        {
          id: 9,
          name: 'Jeanette Soto',
          phone_number: '(111) 222-3333',
          company_name: 'AB Company',
          tags: [],
          unreads: null
        },
        {
          id: 10,
          name: 'Eugenia Lewis',
          phone_number: '(111) 222-3333',
          company_name: 'XZY Corp',
          tags: [],
          unreads: null
        }
      ]
    }
  }
}
</script>
