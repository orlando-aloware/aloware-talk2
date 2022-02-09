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
      @click="dialPreparation">
      <PhoneIcon
        class="mr-2"
        color="white"
        height="12"
        width="12" />
      <div class="button-label">
        Start Dialing
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
                :class="`px-2 border-radius-1 ${selectedItem === 'Untitled' ? 'bg-grey-70' : ''}`"
                :disable="loading"
                clickable>
                <q-item-section
                  @click="loadSettings('Untitled')">
                  <div class="text-bold">New <span class="text-weight-regular text-grey-80">(Untitled)</span></div>
                </q-item-section>
                <q-item-section side>
                  <CheckIcon v-if="selectedItem === 'Untitled'" />
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
                    :key="fk"
                    @click.native.prevent="loadSettings(f)"
                    @mouseenter="hovered = f.id"
                    @mouseleave="toggleSelected"
                    clickable
                    v-ripple
                    :class="`px-2 py-0 border-radius-1 ${selectedItem === f.name ? 'bg-grey-70' : ''}`"
                    :disable="loading">
                    <q-item-section class="mr-2">
                      {{ f.name }}
                    </q-item-section>
                    <q-item-section
                      v-if="hovered !== f.id"
                      side>
                      <CheckIcon
                        v-if="selectedItem === f.name"
                        class="mr-2" />
                    </q-item-section>
                    <q-item-section
                      @click.native.stop="{}"
                      v-if="hovered === f.id"
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
                      <div>{{ selectedItem }}</div>
                      <q-space />
                      <q-btn
                        @click="resetDefaults"
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="grey-5">Reset</q-btn>
                      <q-btn
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
import SessionsForm from './start-dial-sessions-form'
import PhoneIcon from 'components/icons/call-icon'
import CheckIcon from 'components/icons/check-o-icon'
import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'

const UNTITLED = 'Untitled'

export default {
  name: 'StartDialsSessionsSettings',
  components: {
    SessionsForm,
    PhoneIcon,
    CheckIcon
  },
  computed: {
    ...mapGetters('powerDialer', [
      'personalSessionSettings',
      'companySessionSettings',
      'sessionSettings',
      'defaultSettings',
      'sessionSettingGroups'
    ]),
    ...mapGetters('contacts', [
      'selectedList'
    ]),
    tabCollections () {
      let items = this.tabHeaders.filter(i => i.disabled === false)
      return items.concat(this.groupedSettings)
    },
    defaultValues () {
      return { ...DEFAULT_SETTING_VALUES }
    }
  },
  async mounted () {
    // await this.setSessionSettingGroup()
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
      selectedItem: UNTITLED
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
      'getSessionSetting'
    ]),
    ...mapMutations('powerDialer', [
      'ADD_NEW_SESSION_SETTING'
    ]),
    dialPreparation () {
      this.dialog = true
    },
    beginDial () {
      this.dialog = false
      this.$emit('start')
    },
    async loadSettings (data) {
      this.loading = true
      if (data?.id) {
        this.selectedItem = data.name
        await this.getSessionSetting(data.id)
      } else {
        await this.getTemporarySessionSetting(this.selectedList.id)
        this.resetDefaults(false)
        this.selectedItem = data
      }
      this.loading = false
    },
    async saveAsNew () {
      this.loading = true
      let newSettings = { ...this.defaultSettings }
      newSettings.name = this.newSettingName
      let res = await this.createDialerSessionSetting(this.removeEmptyParams(newSettings))
      if (res?.id) {
        await this.getDialerSessionSettings()
      }
      this.newSetting = false
      this.loading = false
      // this.ADD_NEW_SESSION_SETTING(res)
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
        name: this.updateObj.name,
        call_disposition_ids: this.defaultSettings.call_disposition_ids,
        campaign_id: this.defaultSettings.campaign_id,
        company_id: this.defaultSettings.company_id,
        contact_disposition_ids: this.defaultSettings.contact_disposition_ids,
        is_company_scope: this.defaultSettings.is_company_scope,
        metric_options: this.defaultSettings.metric_options,
        // script_id: this.defaultSettings.script_id,
        skip_outside_daytime_hours: this.defaultSettings.skip_outside_daytime_hours,
        user_id: this.defaultSettings.user_id,
        warmup_period_in_seconds: this.defaultSettings.warmup_period_in_seconds
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
      this.selectedItem = UNTITLED
      this.setDefaultSettings(params)
    },
    removeEmptyParams (params) {
      return Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null && v !== ''))
    }
  },
  watch: {
    async dialog (val) {
      if (val) {
        this.loading = true
        await this.getDialerSessionSettings()
        if (this.sessionSettings?.id) {
          this.resetDefaults(false)
        }
        this.loading = false
      }
    },
    selectedItem (val) {
      if (val === UNTITLED) {
        this.clearSessionSetting()
      }
    },
    newSetting (val) {
      if (!val) {
        this.deleteId = null
        this.updateObj = null
      }
    }
  }
}
</script>
