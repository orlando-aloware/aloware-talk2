<template>
  <div class="t-menu1">
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold p-3 flex-grow-1">
        <SearchList
          placeholder="Search" class="text-capitalize" />
      </div>
    </div>
    <div class="t-scroll-y">
    <div v-for="(group, key) in groups"
      :key="`session-expanded-${key}`">

      <q-expansion-item
        :label="group.label"
        :default-opened="key === 0 ? true : false"
        class="t-expansion-panels px-0"
        header-class="text-black">

        <template v-slot:header>
          <q-item-section class="px-3 inline gt-sm text-uppercase text-grey-90 text-weight-medium">
            <div class="text-13">
              {{ group.label }}
              <q-chip size="xs" square class="p-0">
                {{ chipped(group.children) }}
              </q-chip> </div>
          </q-item-section>
        </template>

        <q-card class="t-cards">
          <q-list class="px-2 pb-2">
            <template
              v-for="(item, i) in group.children">
              <q-item
                :key="`acc-item-${i}`"
                :class="{ active: item.id === activeSession.id }"
                class="px-2">
                <div class="py-2">
                  <q-avatar size="30px" color="grey">J</q-avatar>
                </div>

                <q-item-section class="pl-2">
                  <q-item-label>{{ item.first_name }} {{ item.last_name }}</q-item-label>
                  <q-item-label caption lines="2">{{ item.contact_number }}</q-item-label>
                  <q-item-label caption lines="2">{{ item.company }}</q-item-label>
                </q-item-section>

                <q-item-section
                  v-if=" item.id === activeSession.id"
                  class="t-item-icon"
                  side top>
                  <q-avatar color="red" size="md">
                    <PhoneIcon color="white" />
                  </q-avatar>
                  <!-- <q-item-label class="text-red" color="red" caption>...</q-item-label> -->
                  <!-- <q-icon name="dots" color="yellow" /> -->
                </q-item-section>

              </q-item>
              <!-- <q-separator :key="`acc-item-line-${i}`" spaced inset /> -->
            </template>
          </q-list>
        </q-card>
        <q-separator />

      </q-expansion-item>

      <q-separator />
    </div>
    </div>
  </div>
</template>

<script>

import SearchList from 'src/components/search'
import PhoneIcon from 'components/icons/call-drop-icon'

export default {
  name: 'SessionGroups',
  components: {
    SearchList,
    PhoneIcon
  },
  methods: {
    chipped (data) {
      return data.length || 0
    }
  },
  data () {
    return {
      activeSession: {
        id: 1,
        label: 'In Progress'
      },
      groups: [
        {
          id: 1,
          label: 'In Progress',
          children: [
            {
              id: 1,
              first_name: 'John',
              last_name: 'Nicholson',
              contact_number: '(782) 636 3465',
              position: 'Sales Manager',
              company: '123 Labs'
            },
            {
              id: 11,
              first_name: 'Tracy',
              last_name: 'McGrady',
              contact_number: '(782) 122 3455',
              position: 'IT Manager',
              company: 'NBA Labs'
            }
          ]
        },
        {
          id: 2323,
          label: 'In Queue',
          children: [
            {
              id: 55,
              first_name: 'Mary',
              last_name: 'Urdotah',
              contact_number: '(782) 636 3465',
              position: 'Sales Manager',
              company: '123 Labs'
            }
          ]
        },
        {
          id: 2,
          label: 'Called',
          children: [
            {
              id: 2,
              first_name: 'Steve',
              last_name: 'Welsch',
              contact_number: '(782) 636 3465',
              position: 'Sales Manager',
              company: 'Orange Inc'
            },
            {
              id: 3,
              first_name: 'Jane',
              last_name: 'Doe',
              contact_number: '(782) 636 3465',
              position: 'Sales Manager',
              company: 'Cisco Labs'
            }
          ]
        },
        {
          id: 3,
          label: 'Failed',
          children: [
            {
              id: 5,
              first_name: 'Mike',
              last_name: 'Johnson',
              contact_number: '(782) 636 3465',
              position: 'Marketing Manager',
              company: 'Banana Co'
            }
          ]
        },
        {
          id: 4,
          label: 'Scheduled',
          children: [
            {
              id: 6,
              first_name: 'John',
              last_name: 'Nicholson',
              contact_number: '(782) 636 3465',
              position: 'CEO',
              company: 'Project Donut'
            }
          ]
        }
      ]
    }
  }
}
</script>
