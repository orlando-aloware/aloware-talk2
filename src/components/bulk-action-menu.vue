<template>
  <div class="bulk-action-menu d-flex flex-column border-bottom w-100"
       :class="bulkActionMenuClass">
    <div class="menu-actions d-flex flex-row w-100 align-items-center ml-1">
      <template v-if="checkedCount > 0">
        <div class="items">
          <span>{{ checkedCount | numFormat }} selected</span>
        </div>
        <template v-if="isPowerDialer && !isAddView">
          <div class="items">
            <div :class="optionsDisabledClass"
                 @click="onMoveToTop">
              <i class="fa fa-chevron-up"/>
              Move to Top
            </div>
          </div>
          <div class="items">
            <div :class="optionsDisabledClass"
                 @click="onMoveToBottom">
              <i class="fa fa-chevron-down"/>
              Move to Bottom
            </div>
          </div>
        </template>
        <template v-if="isContacts && !isAddView">
          <div class="items"
               v-if="false">
            <a href="#" disabled>
              <i class="fa fa-layer-group"></i>
              Enroll in Sequence
            </a>
          </div>
          <div class="items"
               v-if="false">
            <a href="#" disabled>
              <i class="fa fa-crosshairs"></i>
              Power Dialer
            </a>
          </div>
          <div class="items">
            <a href=""
               @click="onAddToStaticList">
              <i class="fa fa-user-plus"></i>
              Add to Static List
            </a>
          </div>
          <div class="items">
            <a href=""
               @click="onCreateStaticList">
              <i class="fa fa-plus"></i>
              Create Static List
            </a>
          </div>
        </template>
        <div class="items"
             v-if="!isAddView">
          <a href=""
             :disabled="disabledDelete"
             v-if="hasDeletePermission"
             @click="onDelete">
            <i class="fa fa-trash text-primary"/>
            Delete
          </a>
        </div>
      </template>
    </div>
    <div class="height-52 d-flex justify-content-center align-items-center my-2 bg-grey-60 mr-2"
         v-if="isCheckboxAllChecked">
      {{ checkedCount | numFormat }} contacts on this page selected.&nbsp;
      <a href=""
         v-if="!isAllSelected && checkedCount < totalRows && !isDatatableCountLoading"
         @click.prevent="onClickAll">
          Select all {{ totalRows | numFormat }} contacts.
      </a>
      <a href=""
         v-if="isAllSelected && checkedCount === totalRows && !isDatatableCountLoading"
         @click.prevent="onClearAll">
        Clear selection
      </a>
      <q-skeleton class="bg-blue-5 w-100"
                  type="text"
                  style="max-width: 120px;"
                  v-if="isDatatableCountLoading"/>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters, mapState } from 'vuex'
import { MOVE_CONTACTS_DIRECTION } from 'src/constants/power-dialer/power-dialer'
import { aclMixin } from 'src/plugins/mixins'
import { FROM_BULK_MENU } from 'src/constants/contacts-list-create-mode'

export default {
  name: 'bulk-action-menu',

  mixins: [aclMixin],

  props: {
    id: {
      type: [Number, String],
      required: true
    },

    disabledDelete: {
      type: Boolean,
      default: false
    },

    totalRows: {
      type: Number,
      default: 0
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    isLoadingMore: {
      type: Boolean,
      default: false
    },

    checkedCount: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'selectedContacts',
      'selectedList'
    ]),

    ...mapGetters('powerDialer', ['myQueue']),

    ...mapState('contacts', [
      'isAllContactsSelected'
    ]),

    ...mapState(['isDatatableCountLoading']),

    selectedContactIds () {
      return this.selectedContacts[this.id].map(contact => contact.contact_list_item_id)
    },

    isMyQueue () {
      return this.$route.meta.id === 'power-dialer' ||
        this.$route.meta.id === 'power-dialer-queue-filter'
    },

    isDisabledBulkActions () {
      return this.isAllSelected || this.checkedCount === this.totalRows
    },

    optionsDisabledClass () {
      const isCheckedAllClass = this.isDisabledBulkActions ? 'cursor-blocked pe-none disabled' : 'cursor-pointer'

      return [
        isCheckedAllClass
      ]
    },

    isAddView () {
      return this.isContactsAdd || this.isPowerDialerAdd
    },

    bulkActionMenuClass () {
      const hiddenClass = !this.checkedCount ? 'height-0' : ''
      const isPDBulkClass = this.isPowerDialer && !this.isPowerDialerAdd ? 'bulk-action-menu__power-dialer' : ''

      return [
        hiddenClass,
        isPDBulkClass
      ]
    },

    isContacts () {
      return this.$route.name === 'Contacts'
    },

    isContactsAdd () {
      return this.$route.name === 'Contacts' && this.$route.path.includes('/add')
    },

    isPowerDialer () {
      return this.$route.name === 'Power Dialer'
    },

    isPowerDialerAdd () {
      return this.$route?.meta?.id?.includes('power-dialer-add')
    },

    hasDeletePermission () {
      return this.isContacts && this.hasPermissionTo('archive contact')
    }
  },

  data: () => {
    return {
      isCheckboxAllChecked: false,
      isAllSelected: false,
      selectedContactsCount: 0
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setBulkDelete',
      'setListSelectedContacts',
      'setAllContactsSelected',
      'removeContactOpen',
      'createListOpen',
      'selectListOpen',
      'setSelectedStaticList'
    ]),

    ...mapActions('powerDialer', [
      'moveContactItems'
    ]),

    ...mapActions(['setIsDatatableSelectedAll']),

    onDelete (e) {
      if (this.disabledDelete) {
        e.preventDefault()
        return
      }

      this.setBulkDelete(true)
      this.$bvModal.show('remove-contact-dialog')
      this.$emit('on-delete')
      e.preventDefault()
    },

    onMoveToTop () {
      if (this.isDisabledBulkActions) {
        return
      }

      this.$bvModal.msgBoxConfirm(`Are you sure you want to move ${this.checkedCount} contacts to top?`, {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.onMoveContacts(MOVE_CONTACTS_DIRECTION.top)
        }
      })
    },

    onMoveToBottom () {
      if (this.isDisabledBulkActions) {
        return
      }

      this.$bvModal.msgBoxConfirm(`Are you sure you want to move ${this.checkedCount} contacts to bottom?`, {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.onMoveContacts(MOVE_CONTACTS_DIRECTION.bottom)
        }
      })
    },

    async onMoveContacts (direction = MOVE_CONTACTS_DIRECTION.top) {
      const res = await this.moveContactItems({
        id: this.isMyQueue ? this.myQueue.id : this.id,
        params: {
          contact_list_item_ids: this.selectedContactIds,
          direction: direction
        }
      })

      this.setListSelectedContacts({ id: this.id, contacts: [] })

      if (res.data?.message) {
        this.$VueEvent.fire('clearContacts')
        this.$emit('moved-contacts', true)
      }

      this.$generalNotification(
        res?.data?.message || 'Error in moving contact list items.',
        res?.data ? 'success' : 'error'
      )
    },

    onClickAll () {
      this.isAllSelected = true
      this.selectedContactsCount = this.totalRows
    },

    onClearAll () {
      this.isAllSelected = false
      this.selectedContactsCount = this.checkedCount
    },

    resetCheckbox () {
      this.isCheckboxAllChecked = false
      this.isAllSelected = false
    },

    onCreateStaticList (e) {
      this.createListOpen({
        type: 1,
        mode: FROM_BULK_MENU,
        contact_folder_id: null
      })
      e.preventDefault()
    },

    onAddToStaticList (e) {
      this.selectListOpen({
        contact_folder_id: null
      })
      this.setSelectedStaticList({ id: null, name: '', type: null })
      e.preventDefault()
    }
  },

  watch: {
    isAllContactsSelected (value) {
      this.isCheckboxAllChecked = value
      this.isAllSelected = false
    },

    isAllSelected (value) {
      this.selectedContactsCount = this.totalRows
      this.setIsDatatableSelectedAll(value)
      this.$emit('onSelectedAll', value)
    },

    checkedCount (value) {
      if (!this.isCheckboxAllChecked) {
        this.selectedContactsCount = value
      }
    },

    selectedContactsCount (value) {
      if (!this.isCheckboxAllChecked && value !== this.totalRows) {
        this.resetCheckbox()
      }
    }
  }
}
</script>
