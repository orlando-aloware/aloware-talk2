<template>
  <div class="t-session-settings">
    <b-dropdown
      text="..."
      no-caret
      right size="sm"
      variant="white"
      class="mr-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
      <template #button-content>
        <i class="fa fa-ellipsis-h"></i>
      </template>
      <b-dropdown-item
        @click="{}"
        href="#">
        <i class="fa fa-bars mr-1"></i>
        Option 1
      </b-dropdown-item>
      <b-dropdown-item
        @click="{}"
        href="#">
        <i class="fa fa-bars mr-1"></i>
        Option 2
      </b-dropdown-item>
    </b-dropdown>
    <q-btn
      class="start-dial-button p-0"
      color="success"
      no-caps
      unelevated
      :disabled="disabledTrigger"
      @click="dialPreparation">
      <PhoneIcon
        class="mr-2"
        color="white"
        height="12"
        width="12" />
      <div class="button-label">
        Start Dialing
        <q-tooltip v-if="disabledTrigger">
          To start dialing, a minimum of 1 (one) contact item in the list is required
        </q-tooltip>
      </div>
    </q-btn>
    <q-dialog
      v-model="dialog"
      transition-show="jump-down">
      <q-card
        flat
        style="width: 800px; max-width: 90vw; min-height: 500px;"
        class="my-card py-2 px-2">
        <q-card-section
          class="p-0"
          horizontal>
          <q-card-section
            style="width: 26% !important"
            class="p-0 pt-2 pr-2 border-right">

            <p class="text-weight-bold px-2">Session Settings</p>

            <q-list
              dense
              bordered
              padding
              style="display:contents;"
              class="mt-3">
              <q-item
                :class="`px-2 border-radius-1 ${selectedItemName === 'Untitled' || selectedItemName === null ? 'bg-grey-70' : ''}`"
                :disable="loading"
                clickable>
                <q-item-section
                  @click="loadSettings('Untitled')">
                  <div class="text-bold">New <span class="text-weight-regular text-grey-80">(Untitled)</span></div>
                </q-item-section>
                <q-item-section side>
                  <CheckIcon v-if="selectedItemName === 'Untitled'" />
                </q-item-section>
              </q-item>
            </q-list>

            <q-list
              dense
              bordered
              padding
              style="display:contents;"
              class="mt-3">
              <template
                v-for="t in groupedSettings">
                <q-item
                  :key="t.value">
                  <q-item-section class="p-0">
                    <div class="text-grey px-2 pt-3 text-uppercase text-caption">
                      {{ t.label }}
                    </div>
                  </q-item-section>
                </q-item>
                <template
                  v-if="fetchedGroupSettings(t.name).length > 0">
                  <q-item
                    v-for="(f, fk) in fetchedGroupSettings(t.name)"
                    :key="`${t.name}-${fk}`"
                    @click.native.prevent="loadSettings(f)"
                    @mouseenter="hovered = f.id"
                    @mouseleave="toggleSelected"
                    clickable
                    v-ripple
                    :class="`px-2 py-0 border-radius-1 ${isSessionValid(f) ? 'bg-grey-70' : ''}`"
                    :disable="loading">
                    <q-item-section class="mr-2">
                      {{ f.name }}
                    </q-item-section>
                    <q-item-section
                      v-if="hovered !== f.id || t.name === 'company'"
                      side>
                      <CheckIcon
                        v-if="isSessionValid(f)"
                        class="mr-2" />
                    </q-item-section>
                    <q-item-section
                      @click.native.stop="{}"
                      v-if="hovered === f.id && t.name !== 'company'"
                      side>
                      <q-btn
                        size="md"
                        class="m-0"
                        round flat outline dense
                        color="grey"
                        @click="hoveredMenu = f.id">
                        <i class="fa fa-ellipsis-h"></i>
                      </q-btn>
                      <q-menu
                        anchor="top right"
                        self="top left">
                        <q-list style="min-width: 100px">
                          <q-item
                            @click="onRename(f)"
                            dense
                            clickable
                            v-close-popup>
                            <q-item-section class="px-3">
                              <div>
                                <i class="fa fa-pencil-alt mr-2"></i>
                                Rename
                              </div>
                            </q-item-section>
                          </q-item>
                          <q-item
                            @click="onDeleteRequest(f.id)"
                            dense
                            clickable
                            v-close-popup>
                            <q-item-section class="px-3">
                              <div class="text-red">
                                <i class="fa fa-trash-alt mr-2"></i>
                                Delete
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-item-section>
                  </q-item>
                </template>
                <div v-else :key="t.name">
                  <span
                    class="px-2 text-grey text-caption text-italic">
                    No saved settings
                  </span>
                </div>
              </template>
            </q-list>
          </q-card-section>

          <!-- <q-separator vertical /> -->

          <q-card-section
            class="px-0 py-0"
            style="width: 74% !important"
            :disabled="loading">
            <q-card flat>
              <div class="row">
                <div class="col-12">
                  <q-card flat class="p-0">
                    <q-card-actions class="px-0">
                      <div>{{ selectedItemName }}</div>
                      <q-space />
                      <q-btn
                        @click="resetDefaults"
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="grey-5">Reset</q-btn>
                      <q-btn
                        v-if="!hasSelectedTemporarySetting"
                        @click="updateSelectedSetting"
                        unelevated
                        no-caps
                        :disabled="disabled"
                        size="sm"
                        class="px-3 py-0"
                        color="primary">Save</q-btn>
                      <q-btn
                        v-if="hasSelectedTemporarySetting"
                        @click="newSetting = true"
                        unelevated
                        no-caps
                        :disabled="disabled"
                        size="sm"
                        class="px-3 py-0"
                        color="primary">Save As New</q-btn>
                      <q-btn
                        @click="beginDial"
                        unelevated
                        no-caps
                        :disabled="disabled"
                        size="sm"
                        class="px-3 py-0"
                        color="success">Begin Dialing</q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>

              <SessionsForm
                v-model="selectedItem"
                @valid-form="disabled = false"
                @invalid-form="disabled = true" />

            </q-card>
          </q-card-section>
        </q-card-section>

      </q-card>
    </q-dialog>

    <!-- DIALOG used for confirmation -->
    <q-dialog
      v-model="newSetting"
      persistent>
      <q-card style="width: 350px">
        <q-card-section>
          <div
            class="text-subtitle1 text-bold text-grey-8">
            <span v-if="deleteId">Delete Session Settings</span>
            <span v-else-if="updateObj">Rename Session Settings</span>
            <span v-else>Save New Session Settings</span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none pt-3">
          <div v-if="deleteId">
            Are you sure you want to remove the selected session settings?
          </div>
          <q-input
            v-else-if="updateObj"
            outlined
            v-model="newSettingName"
            :placeholder="updateObj.name" />
          <q-input
            v-else
            outlined
            v-model="newSettingName"
            placeholder="New Settings Name" />
        </q-card-section>

        <q-card-actions
          class="px-3 pb-3"
          align="right">
          <b-button
            variant="dark-grey"
            class="f-btn--cancel mr-2"
            color="grey-80"
            size="sm"
            v-close-popup
            @click="newSetting = false">
            Cancel
          </b-button>
          <b-button
            v-if="deleteId"
            variant="danger"
            size="sm"
            @click="onDeleteSetting">
            Remove
          </b-button>
          <b-button
            v-else-if="updateObj"
            :disabled="updateObj.name === newSettingName || newSettingName.length === 0"
            variant="success"
            size="sm"
            @click="renameSetting">
            Save
          </b-button>
          <b-button
            v-else
            variant="success"
            size="sm"
            @click="saveAsNew">
            Save
          </b-button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionsForm from './start-dial-sessions-form'
import PhoneIcon from 'components/icons/call-icon'
import CheckIcon from 'components/icons/check-o-icon'
import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'

// const UNTITLED = 'Untitled'

export default {
  name: 'StartDialsSessionsSettings',
  props: {
    list: {
      type: Object
    },
    disabledTrigger: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SessionsForm,
    PhoneIcon,
    CheckIcon
  },
  computed: {
    ...mapFields('powerDialer', [
      'sessionSettings',
      'dialerSessionSettings'
    ]),
    ...mapGetters('powerDialer', [
      'personalSessionSettings',
      'companySessionSettings',
      'sessionSettingGroups'
    ]),
    defaultValues () {
      return { ...DEFAULT_SETTING_VALUES }
    },
    selectedItemName () {
      return this.selectedItem?.name
    },
    hasSelectedTemporarySetting () {
      if (this.temporarySetting?.id) {
        return this.selectedItem.id === this.temporarySetting?.id
      }
      return false
    }
  },
  async mounted () {
    // await this.setSessionSettingGroup()
    this.selectedItem = this.defaultValues
  },
  data () {
    return {
      dialog: false,
      tab: 'create-new',
      tabHeaders: [
        { label: 'Session Settings', name: 'session-settings', disabled: true, type: 'title' },
        { label: 'Create New', name: 'create-new', disabled: false, type: 'button' }
      ],
      groupedSettings: [
        { label: 'Personal', name: 'personal', disabled: true, hovered: false, type: 'label' },
        { label: 'Company', name: 'company', disabled: true, hovered: false, type: 'label' }
      ],
      disabled: true,
      loading: false,
      hovered: '',
      hoveredMenu: '',
      newSetting: false,
      newSettingName: '',
      deleteId: null,
      updateObj: null,
      selectedItem: null,
      selectedItemId: null,
      temporarySetting: {}
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'setSessionSettingGroup',
      'getDialerSessionSettings',
      'clearSessionSetting',
      'setDefaultSettings',
      'createDialerSessionSetting',
      'deleteDialerSessionSetting',
      'updateDialerSessionSetting',
      'getTemporarySessionSetting',
      'updateContactsList',
      'getSessionSetting'
    ]),
    ...mapMutations('powerDialer', [
      'ADD_NEW_SESSION_SETTING',
      'SET_SESSION_SETTINGS'
    ]),
    dialPreparation () {
      this.dialog = true
    },
    async beginDial () {
      this.dialog = false
      /**
       * TODOs
       * Identify first before exiting the component
       * IF selected item is temporary OR
       * IF selected item is personal/company
       */
      if (this.selectedItemName === 'Untitled') {
        let newSettings = { ...this.selectedItem }
        let res = await this.createDialerSessionSetting({
          ...this.removeEmptyParams(newSettings),
          contact_list_id: this.list.id,
          name: `${this.list.name}-${new Date().valueOf()}`
        })
        if (res?.id) {
          await this.getDialerSessionSettings()
        }
      } else {
        let { id } = this.selectedItem
        // this.activeSessionSettingId = id
        await this.updateContactsList({
          id: this.list.id,
          dialer_session_id: id
        })
        this.SET_SESSION_SETTINGS(this.selectedItem)
      }
      this.$emit('start')
    },
    async loadSettings (data) {
      this.loading = true
      let res = null
      if (data?.id) {
        res = await this.getSessionSetting(data.id)
      } else {
        res = await this.getTemporarySessionSetting(this.list.id)
        // this.resetDefaults(false)
      }
      // this.sessionSettings = res
      this.selectedItemId = res.id || ''
      this.selectedItem = res?.id ? res : this.defaultValues
      this.loading = false
    },
    async saveAsNew () {
      this.loading = true
      let newSettings = { ...this.defaultValues }
      newSettings.name = this.newSettingName
      newSettings.is_company_scope = 0
      let res = await this.createDialerSessionSetting(this.removeEmptyParams(newSettings))
      if (res?.id) {
        await this.getDialerSessionSettings()
      }
      this.newSetting = false
      this.loading = false
      // this.ADD_NEW_SESSION_SETTING(res)
    },
    async updateSelectedSetting () {
      let res = await this.updateDialerSessionSetting(
        this.removeEmptyParams(this.selectedItem)
      )
      if (res?.data) {
        this.$generalNotification(`Dialer Session Setting has been updated!`)
      }
    },
    onDeleteRequest (id) {
      this.newSetting = true
      this.deleteId = id
    },
    onRename (data) {
      this.newSetting = true
      this.updateObj = data
    },
    async renameSetting () {
      this.updateObj.name = this.newSettingName
      let res = await this.updateDialerSessionSetting({
        id: this.updateObj.id,
        name: this.updateObj.name
      })
      if (res.data) {
        this.newSetting = false
        this.updateObj = ''
        this.$generalNotification(`Dialer Session Setting has been renamed to ${res.data.name}.`)
      }
    },
    async onDeleteSetting () {
      let res = await this.deleteDialerSessionSetting(this.deleteId)
      if (res.data) {
        await this.getDialerSessionSettings()
        this.newSetting = false
        this.deleteId = null
        this.$generalNotification('Dialer Session Setting has been removed!')
      }
    },
    fetchedGroupSettings (type) {
      return type === 'personal' ? this.personalSessionSettings : this.companySessionSettings
    },
    toggleSelected () {
      if (this.hoveredMenu) {
        // If hovered, trigger actions
      } else {
        this.hovered = ''
      }
    },
    resetDefaults (isExistingList = true) {
      let params = {
        call_disposition_ids: [],
        campaign_id: null,
        company_id: null,
        contact_disposition_ids: [],
        is_company_scope: null,
        metric_options: [],
        name: null,
        script_id: null,
        skip_outside_daytime_hours: 1,
        user_id: null,
        warmup_period_in_seconds: 0
      }
      if (this.sessionSettings?.id && isExistingList) {
        params.id = this.sessionSettings.id
      }
      this.selectedItemId = this.list.dialer_session_id
      this.setDefaultSettings(params)
    },
    removeEmptyParams (params) {
      return Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null && v !== ''))
    },
    isSessionValid (data) {
      return this.selectedItemId === data.id
    }
  },
  watch: {
    async dialog (val) {
      if (val) {
        this.loading = true
        await this.getDialerSessionSettings()
        let temporarySetting = await this.getTemporarySessionSetting(this.list.id)
        this.temporarySetting = temporarySetting || {}
        this.selectedItemId = this.list.dialer_session_id
        let fetchedSettings = this.dialerSessionSettings.find((setting) => {
          return setting.id === this.selectedItemId
        })
        if (fetchedSettings?.id) {
          this.selectedItem = fetchedSettings
        }
        // if (this.sessionSettings?.id) {
        //   // this.resetDefaults(false)
        // }
        this.loading = false
      }
    },
    // selectedItem (val) {
    //   if (val === UNTITLED) {
    //     this.clearSessionSetting()
    //   }
    // },
    newSetting (val) {
      if (!val) {
        this.deleteId = null
        this.updateObj = null
      }
    }
  }
}
</script>
