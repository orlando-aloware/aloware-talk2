<template>
  <div class="t-session-settings">
    <q-btn class="start-dial-button p-0"
           color="success"
           no-caps
           unelevated
           :disabled="disabledTrigger"
           v-if="defaultTrigger"
           @click="dialPreparation">
      <PhoneIcon class="mr-2"
                 color="white"
                 height="12"
                 width="12" />
      <div class="button-label">
        Start Dialing
        <q-tooltip v-if="disabledTrigger">
          To start dialing, a minimum of one (1) contact item in the list is required.
        </q-tooltip>
      </div>
    </q-btn>
    <q-btn no-caps
           unelevated
           @click="dialPreparation"
           v-else>
      <SettingIcon width="15px"
                   height="15px"
                   class="mx-1" />
    </q-btn>
    <q-dialog transition-show="jump-down"
              v-model="dialog">
        <q-card class="my-card py-2 px-2"
                style="width: 800px; max-width: 90vw; min-height: 500px;"
                flat>
          <b-overlay :show="loading">
            <q-card-section class="p-0"
                            horizontal>
              <q-card-section class="p-0 pt-2 pr-2 border-right"
                              style="width: 26% !important">

                <p class="text-weight-bold px-2">
                  Session Settings
                </p>

                <q-list class="mt-3"
                        style="display:contents;"
                        dense
                        bordered
                        padding>
                  <q-item clickable
                          :class="`px-2 border-radius-1 ${hasSelectedTemporarySetting ? 'bg-grey-70' : ''}`"
                          :disable="loading">
                    <q-item-section @click="loadSettings('Untitled')">
                      <div class="text-bold">
                        New <span class="text-weight-regular text-grey-80">(Untitled)</span>
                      </div>
                    </q-item-section>
                    <q-item-section side>
                      <CheckIcon v-if="selectedItemName === 'Untitled'" />
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-list class="mt-3 session-settings-sidebar"
                        style="display:contents;"
                        dense
                        bordered
                        padding>
                  <template v-for="settingCategory in groupedSettings">
                    <q-item :key="settingCategory.value">
                      <q-item-section class="p-0">
                        <div class="text-grey px-2 pt-3 text-uppercase text-caption">
                          {{ settingCategory.label }}
                        </div>
                      </q-item-section>
                    </q-item>
                    <template v-if="fetchedGroupSettings(settingCategory.name).length > 0">
                      <q-item class="px-2 py-0 border-radius-1"
                              clickable
                              v-ripple
                              :key="`${settingCategory.name}-${settingKey}`"
                              :class="getSettingsItemClass(setting)"
                              :disable="loading"
                              v-for="(setting, settingKey) in fetchedGroupSettings(settingCategory.name)"
                              @click.native.prevent="loadSettings(setting)"
                              @mouseenter="hovered = setting.id"
                              @mouseleave="toggleSelected">
                        <q-item-section class="mr-2">
                          {{ setting.name }}
                        </q-item-section>
                        <q-item-section side
                                        v-if="hovered !== setting.id || settingCategory.name === 'company'">
                          <CheckIcon v-if="isSessionValid(setting)"
                                     class="mr-2" />
                        </q-item-section>
                        <q-item-section class="pl-0"
                                        side
                                        v-if="hovered === setting.id && settingCategory.name !== 'company'"
                                        @click.native.stop="{}">
                          <q-btn size="md"
                                 class="m-0"
                                 color="grey"
                                 round
                                 flat
                                 outline
                                 dense
                                 v-show="isRenameAllowed(setting.user_id) || isDeleteAllowed(setting.user_id)"
                                 @click="hoveredMenu = setting.id">
                            <i class="fa fa-ellipsis-h"/>
                          </q-btn>
                          <q-menu anchor="top right"
                                  self="top left">
                            <q-list style="min-width: 100px">
                              <q-item dense
                                      clickable
                                      v-close-popup
                                      v-show="isRenameAllowed(setting.user_id)"
                                      @click="onRename(setting)">
                                <q-item-section class="px-3">
                                  <div>
                                    <i class="fa fa-pencil-alt mr-2"/>
                                    Rename
                                  </div>
                                </q-item-section>
                              </q-item>
                              <q-item dense
                                      clickable
                                      v-close-popup
                                      v-show="isDeleteAllowed(setting.user_id)"
                                      @click="onDeleteRequest(setting.id, setting.user_id)">
                                <q-item-section class="px-3">
                                  <div class="text-red">
                                    <i class="fa fa-trash-alt mr-2"/>
                                    Delete
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-item-section>
                      </q-item>
                    </template>
                    <div :key="settingCategory.name"
                         v-else>
                      <span class="px-2 text-grey text-caption text-italic">
                        No saved settings
                      </span>
                    </div>
                  </template>
                </q-list>
              </q-card-section>

              <q-card-section class="px-0 py-0"
                              style="width: 74% !important"
                              :disabled="loading">
                <q-card flat>
                  <div class="row">
                    <div class="col px-0 d-flex justify-content-end t-session-settings__actions">
                      <q-btn class="px-3 py-0 ml-2"
                             size="sm"
                             color="grey-5"
                             unelevated
                             no-caps
                             @click="resetDefaults">
                        Reset
                      </q-btn>
                      <q-btn class="px-3 py-0 ml-2"
                             size="sm"
                             color="primary"
                             unelevated
                             no-caps
                             :disabled="!isAllowSave"
                             v-if="!hasSelectedTemporarySetting"
                             @click="updateSelectedSetting">
                        Save
                      </q-btn>
                      <q-btn class="px-3 py-0 ml-2"
                             size="sm"
                             color="primary"
                             unelevated
                             no-caps
                             :disabled="isBusy || newSetting"
                             v-if="hasSelectedTemporarySetting"
                             @click="newSetting = true">
                        Save As New
                      </q-btn>
                      <q-btn class="px-3 py-0 ml-2"
                             size="sm"
                             color="success"
                             unelevated
                             no-caps
                             :disabled="disabled"
                             @click="beginDial">
                        {{ defaultTrigger ? 'Begin Dialing' : 'Apply' }}
                      </q-btn>
                    </div>
                  </div>
                  <div class="row mt-3 mb-2">
                    <div class="col">
                      <div class="session-settings-title text-h6 font-weight-bold">
                        {{ selectedItemName }}
                        <q-tooltip anchor="center right">
                          {{ selectedItemName }}
                        </q-tooltip>
                      </div>
                    </div>
                  </div>

                  <start-dial-sessions-form :disabled="isCompanyScope"
                                            :flagged="dialog"
                                            :settings="filterSelectedItem"
                                            @updateSettings='onUpdateSettings'
                                            @valid-form="disabled = false"
                                            @invalid-form="disabled = true"/>
                </q-card>
              </q-card-section>
            </q-card-section>
            <template #overlay>
              <div class="text-center">
                <q-spinner-bars color="primary"
                                size="2em"
                />
                <p id="cancel-label">
                  {{ loadingText }}
                </p>
              </div>
            </template>
          </b-overlay>
        </q-card>
    </q-dialog>

    <!-- DIALOG used for confirmation -->
    <q-dialog persistent
              v-model="newSetting">
      <q-card style="width: 350px">
        <q-card-section>
          <div class="text-subtitle1 text-bold text-grey-8">
            <span v-if="deleteId">
              Delete Session Settings
            </span>
            <span v-else-if="updateObj">
              Rename Session Settings
            </span>
            <span v-else>
              Save New Session Settings
            </span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none pt-3">
          <div v-if="deleteId">
            Are you sure you want to remove the selected session settings?
          </div>
          <q-input outlined
                   :placeholder="updateObj.name"
                   v-model="newSettingName"
                   v-else-if="updateObj"
                   :error="errorMessage != null"
                   :error-message="errorMessage"/>
          <q-input placeholder="New Settings Name"
                   outlined
                   v-model="newSettingName"
                   v-else
                   :error="errorMessage != null"
                   :error-message="errorMessage"/>
        </q-card-section>

        <q-card-actions class="px-3 pb-3"
                        align="right">
          <b-button variant="dark-grey"
                    class="f-btn--cancel mr-2"
                    color="grey-80"
                    size="sm"
                    :disabled="isBusy || isBusy"
                    v-close-popup
                    @click="cancelNewSetting()">
            Cancel
          </b-button>
          <b-button variant="danger"
                    size="sm"
                    :disabled="isBusy"
                    v-if="deleteId"
                    @click="onDeleteSetting">
            <q-spinner-bars class="mr-1"
                            color="white"
                            v-if="isBusy"/>
            {{ isBusy ? ' Removing...' : 'Remove' }}
          </b-button>
          <b-button variant="success"
                    size="sm"
                    :disabled="isSaveButtonDisabled"
                    v-else-if="updateObj"
                    @click="renameSetting">
            <q-spinner-bars class="mr-1"
                            color="white"
                            v-if="isBusy"/>
            {{ isBusy ? ' Saving...' : 'Save' }}
          </b-button>
          <b-button variant="success"
                    size="sm"
                    :disabled="isBusy || !canSaveSettings"
                    v-else
                    @click="saveAsNew">
            <q-spinner-bars class="mr-1"
                            color="white"
                            v-if="isBusy"/>
            {{ isBusy ? ' Saving...' : 'Save' }}
          </b-button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import StartDialSessionsForm from './start-dial-sessions-form'
import PhoneIcon from 'components/icons/call-icon'
import CheckIcon from 'components/icons/check-o-icon'
import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { POWER_DIALER_ORDER } from 'src/constants/power-dialer/power-dialer'
import SettingIcon from 'components/icons/setting-o-icon'
import { isEmpty, isEqual } from 'lodash'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'StartDialSessionsSettings',

  mixins: [
    aclMixin
  ],

  props: {
    list: {
      type: Object
    },

    disabledTrigger: {
      type: Boolean,
      default: false
    },

    defaultTrigger: {
      type: Boolean,
      default: true
    }
  },

  components: {
    StartDialSessionsForm,
    PhoneIcon,
    CheckIcon,
    SettingIcon
  },

  computed: {
    ...mapState(['dialer']),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapFields('powerDialer', [
      'sessionSettings',
      'dialerSessionSettings',
      'activeList',
      'myQueue'
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
      if (!this.selectedItem?.id) {
        return true
      }

      if (this.temporarySetting?.id) {
        return this.selectedItem.id === this.temporarySetting?.id
      }

      return false
    },

    isCompanyScope () {
      return this.selectedItem?.is_company_scope === 1
    },

    listId () {
      if (this.list.id === 'my-queue') {
        return this.myQueue.id
      }

      return this.list.id
    },

    filterSelectedItem () {
      if (!isEmpty(this.selectedItem)) {
        return this.selectedItem
      }

      return {
        call_disposition_ids: [],
        campaign_id: null,
        company_id: null,
        contact_disposition_ids: [],
        is_company_scope: 0,
        metric_options: [],
        name: null,
        script_id: null,
        skip_outside_daytime_hours: 1,
        user_id: null,
        warmup_period_in_seconds: 0,
        order: POWER_DIALER_ORDER.default,
        vm_drop_ids: []
      }
    },

    isSaveButtonDisabled () {
      return this.updateObj.name === this.newSettingName ||
        this.newSettingName.length === 0 || this.isBusy
    },

    settingNameLength () {
      return this.newSettingName?.length ?? 0
    },

    errorMessage () {
      if (this.settingNameLength > 191) {
        return 'Max length is 191 characters'
      }

      return null
    },

    canSaveSettings () {
      return this.settingNameLength > 0 && this.settingNameLength <= 191
    },

    isAllowSave () {
      return !this.saveDisabled && this.selectedItem.user_id === this.profile.id
    }
  },

  async mounted () {
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
      temporarySetting: {},
      saveDisabled: false,
      isBusy: false,
      isDialing: false,
      loadingText: 'Preparing session settings..'
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
      'getSessionSetting',
      'getPowerDialerList',
      'clearRedialedTasks'
    ]),

    ...mapActions([
      'setDialerCommunication'
    ]),

    ...mapMutations('powerDialer', [
      'ADD_NEW_SESSION_SETTING',
      'SET_SESSION_SETTINGS'
    ]),

    dialPreparation () {
      this.dialog = true
    },

    async beginDial () {
      this.clearRedialedTasks()
      this.cleanupDialer()
      const requests = {
        res: null,
        newList: null
      }
      /**
       * Identify first before exiting the component
       * IF selected item is temporary OR
       * IF selected item is personal/company
       */
      this.loading = true
      this.isDialing = true
      this.loadingText = this.defaultTrigger ? 'Redirecting you to Power Dialer session..' : 'Applying changes to session settings..'

      if (this.temporarySetting.id === this.selectedItem.id) {
        const newSettings = { ...this.filterSelectedItem }

        requests.res = await this.createDialerSessionSetting({
          ...this.removeEmptyParams(newSettings),
          contact_list_id: this.listId,
          name: `${this.list.name}-${new Date().valueOf()}`
        })

        if (requests.res?.id) {
          requests.newList = await this.updateContactsList({
            id: this.listId,
            dialer_session_id: null
          })

          this.SET_SESSION_SETTINGS(this.selectedItem)
        }
      } else {
        requests.newList = await this.updateContactsList({
          id: this.listId,
          dialer_session_id: this.selectedItem.id
        })

        this.SET_SESSION_SETTINGS(this.selectedItem)
      }

      if (this.defaultTrigger) {
        if (!this.dialer.isReady) {
          this.loading = false
          this.$generalNotification('Unable to start session. Dialer is offline.', 'error')

          return
        }

        this.$emit('start')
      } else {
        this.$emit('update', requests.newList)
      }

      this.sessionSettings = requests.res?.id ? requests.res : this.selectedItem

      if (this.sessionSettings?.id) {
        this.dialog = false

        return
      }

      this.$generalNotification('Request failed! Error on saving user session settings.', 'warning')
    },

    async loadSettings (data) {
      this.loading = true
      const request = {
        res: null
      }

      if (data?.id) {
        this.loadingText = 'Fetching session settings data..'
        request.res = await this.getSessionSetting(data.id)
      } else {
        this.loadingText = 'Fetching temporary session settings data..'
        request.res = await this.getTemporarySessionSetting(this.listId)
      }

      this.selectedItemId = request.res.id || ''
      this.selectedItem = request.res?.id ? request.res : this.defaultValues
      this.loading = false
    },

    async saveAsNew () {
      this.loading = true
      let newSettings = { ...this.selectedItem }
      newSettings.name = this.newSettingName
      newSettings.is_company_scope = 0
      newSettings.id = null
      newSettings.contact_list_id = null
      this.isBusy = true

      newSettings = this.removeEmptyParams(newSettings)
      const res = await this.createDialerSessionSetting(newSettings)

      if (res.isAxiosError) {
        console.log({ res })
        this.$generalNotification(res.response.data.message ?? 'Dialer session setting could not be saved', 'error')

        this.newSettingName = ''
        this.loading = false
        this.isBusy = false
        return
      }

      if (res?.id) {
        await this.getDialerSessionSettings()

        this.$generalNotification('Dialer session setting has been saved.')
      }

      this.newSettingName = ''
      this.newSetting = false
      this.loading = false
      this.isBusy = false
      this.resetSettings()
    },

    async updateSelectedSetting () {
      this.saveDisabled = true

      let params = this.removeEmptyParams(this.selectedItem)
      params = this.fixEmptyMultipleSelectors(params)

      const res = await this.updateDialerSessionSetting(
        params
      )

      if (res?.data) {
        if (this.sessionSettings.id === res.data.id) {
          await this.getPowerDialerList(this.listId)
        }

        this.$generalNotification(`Dialer session setting has been updated!`)
      }

      this.onUpdatedSessionMetrics()
      this.saveDisabled = false
    },

    onUpdatedSessionMetrics () {
      if (isEqual(this.filterSelectedItem, this.sessionSettings)) {
        return
      }

      this.$emit('on-update-session-metrics')
    },

    onDeleteRequest (id, userId) {
      if (this.isDeleteAllowed(userId)) {
        this.newSetting = true
        this.deleteId = id
      }
    },

    onRename (data) {
      this.newSetting = true
      this.updateObj = data
    },

    async renameSetting () {
      this.updateObj.name = this.newSettingName
      this.isBusy = true

      const res = await this.updateDialerSessionSetting({
        id: this.updateObj.id,
        name: this.updateObj.name
      })

      if (res.data) {
        this.newSetting = false
        this.updateObj = ''
        this.$generalNotification(`Dialer session setting has been renamed to ${res.data.name}.`)
        this.isBusy = false
      }

      this.newSettingName = ''
    },

    async onDeleteSetting () {
      this.isBusy = true
      const res = await this.deleteDialerSessionSetting(this.deleteId)

      if (res.data) {
        await this.getDialerSessionSettings()
        this.newSetting = false
        this.deleteId = null
        this.$generalNotification('Dialer session setting has been removed.')
        this.isBusy = false
      }
    },

    fetchedGroupSettings (type) {
      return type === 'personal' ? this.personalSessionSettings : this.companySessionSettings
    },

    toggleSelected () {
      if (!this.hoveredMenu) {
        this.hovered = ''
      }
    },

    resetDefaults (isExistingList = true) {
      const params = {
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
        warmup_period_in_seconds: 0,
        order: POWER_DIALER_ORDER.default,
        vm_drop_ids: []
      }

      if (this.sessionSettings?.id && isExistingList) {
        params.id = this.sessionSettings.id
      }

      this.selectedItemId = this.list?.dialer_session_id
      this.setDefaultSettings(params)
    },

    resetSettings () {
      this.selectedItem = this.$jsonClone(this.temporarySetting)
    },

    removeEmptyParams (params) {
      return Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null && v.length !== 0))
    },

    isSessionValid (data) {
      return this.selectedItemId === data.id
    },

    cleanupDialer () {
      if (this.dialer.isReady && this.dialer.currentStatus === 'READY') {
        this.setDialerCommunication()
      }
    },

    getSettingsItemClass (setting) {
      const backgroundClass = this.isSessionValid(setting) ? 'bg-grey-70' : ''

      return [
        backgroundClass
      ]
    },

    onUpdateSettings (settings) {
      this.selectedItem = settings
    },

    isRenameAllowed (userId) {
      return this.isAdmin || userId === this.profile.id
    },

    isDeleteAllowed (userId) {
      return this.isAdmin || userId === this.profile.id
    },

    fixEmptyMultipleSelectors (settings) {
      let newSettings = this.$jsonClone(settings)

      const keys = Object.keys(DEFAULT_SETTING_VALUES)

      keys.forEach((key) => {
        if (Array.isArray(DEFAULT_SETTING_VALUES[key]) && isEmpty(newSettings[key])) {
          newSettings[key] = []
        }
      })

      return newSettings
    },

    cancelNewSetting () {
      this.newSettingName = ''
      this.newSetting = false
    }
  },

  watch: {
    async dialog (val) {
      if (val) {
        this.loading = true

        // Fetch personal and company session settings
        await this.getDialerSessionSettings()

        // Fetch temporary session settings, if there is
        const temporarySetting = await this.getTemporarySessionSetting(this.listId)
        this.temporarySetting = temporarySetting || {}
        this.selectedItemId = this.list?.dialer_session_id

        const fetchedSettings = this.dialerSessionSettings.find((setting) => {
          return setting.id === this.selectedItemId
        })

        if (fetchedSettings?.id) {
          this.selectedItem = fetchedSettings
        } else if (this.temporarySetting?.id) {
          this.selectedItem = this.$jsonClone(this.temporarySetting)
        } else {
          this.selectedItem = this.$jsonClone(this.filterSelectedItem)
        }

        this.activeList = this.list
        this.loading = false

        return
      }

      this.selectedItem = {}
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
