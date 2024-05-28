<template>
  <div>
    <b-modal hide-footer
             size='lg'
             header-class='border-bottom-0 font-weight-bold center-modal-header pb-0'
             header-close-variant='primary'
             modal-class='contact-phone-number-duplicates-modal'
             data-testid='contact-phone-number-duplicates-modal'
             title-tag='div'
             :title='getTitle'
             v-model="dialogTableVisible"
    >
      <b-table class='mb-0'
               fixed
               thead-class='conflicted-contact-thead-class'
               :fields="mainFields"
               :items="[phone_number.contact]">
        <template #cell(main)="data">
          <router-link :to="{ name: 'Contact', params: { id: data.item.id }}" >{{ data.item.id }}</router-link>
        </template>
      </b-table>
      <b-table class='mb-0'
               fixed
               thead-class='conflicted-contact-thead-class'
               :fields="conflictedFields"
               :items="phone_number.conflicted_contacts">
        <template #cell(conflicted)="data">
          <router-link :to="{ name: 'Contact', params: { id: data.item.id }}" >{{ data.item.id }}</router-link>
        </template>
      </b-table>
    </b-modal>
    <b-button class="btn-tiny"
              variant='outline-danger'
              data-testid='phone-number-duplicates-button'
              title='Show conflicted contacts'
              @click="dialogTableVisible = !dialogTableVisible">
      <b-icon aria-hidden='true'
              icon='exclamation-lg'
              data-testid='phone-number-duplicates-icon' />
    </b-button>
  </div>
</template>
<script>
export default {
  props: {
    phone_number: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      mainFields: [
        { key: 'main', label: 'Main Contacts' }, 'first_name', 'last_name'
      ],
      conflictedFields: [
        { key: 'conflicted', label: 'Conflicted Contacts' }, 'first_name', 'last_name'
      ],
      dialogTableVisible: false
    }
  },
  computed: {
    getTitle () {
      return `Contacts conflicted by the same phone number ${this.phone_number.phone_number}`
    }
  }
}
</script>
