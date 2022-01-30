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
        <!-- <q-bar class="bg-white">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar> -->
        <q-card-section
          class="p-0"
          horizontal>
          <q-card-section
            style="width: 26% !important"
            class="p-0 pt-2 pr-2 border-right">
            <p class="text-weight-bold px-2">Session Settings</p>
            <!-- <q-btn
              unelevated no-caps
              class="px-2 mt-3 full-width"
              color="grey-3"
              text-color="black"
              align="left">
              Create New
            </q-btn> -->

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
                  @click="loadSettings('Untitled')">New Setting</q-item-section>
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
                    clickable
                    v-ripple
                    :class="`px-2 py-0 border-radius-1 ${selectedItem === f.name ? 'bg-grey-70' : ''}`"
                    :disable="loading">
                    <q-item-section class="mr-2">
                      {{ f.name }}
                    </q-item-section>
                    <q-item-section
                      v-if="!hovered"
                      side>
                      <CheckIcon
                        v-if="selectedItem === f.name"
                        class="mr-2" />
                    </q-item-section>
                    <q-item-section
                      @click.native.stop="{}"
                      v-if="hovered"
                      side>
                      <q-btn
                        size="md"
                        class="m-0"
                        round flat outline dense
                        color="grey">
                        <i class="fa fa-ellipsis-h"></i>
                        <q-menu
                          anchor="top right"
                          self="top left">
                          <q-list style="min-width: 100px">
                            <q-item dense clickable v-close-popup>
                              <q-item-section class="px-3">
                                <div>
                                  <i class="fa fa-pencil-alt mr-2"></i>
                                  Rename
                                </div>
                              </q-item-section>
                            </q-item>
                            <q-item dense clickable v-close-popup>
                              <q-item-section class="px-3">
                                <div class="text-red">
                                  <i class="fa fa-trash-alt mr-2"></i>
                                  Delete
                                </div>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <!-- <q-btn v-else size="xs" class="m-1" round flat color="grey"></q-btn> -->
                    </q-item-section>
                  </q-item>
                </template>
                <div v-else :key="t.name">
                  <span class="px-2 text-grey text-caption text-italic">No saved settings</span>
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
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="grey-5">Reset</q-btn>
                      <q-btn
                        @click="newSetting = true"
                        unelevated
                        no-caps
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
                      <q-btn
                        @click="test"
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="success">Test</q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
              <!-- <q-tab-panels
                v-model="tab"
                keep-alive
                transition-next="fade"
                class="shadow-2 rounded-borders p-0 m-0">
                <template
                  v-for="panel in tabCollections">
                  <q-tab-panel
                    :key="panel.name"
                    :name="panel.name"
                    class="p-0 m-0">
                    <SessionsForm
                      @valid-form="disabled = false"
                      @invalid-form="disabled = true" />
                  </q-tab-panel>
                </template>
              </q-tab-panels> -->
              <SessionsForm
                @valid-form="disabled = false"
                @invalid-form="disabled = true" />
            </q-card>
          </q-card-section>
        </q-card-section>

      </q-card>
    </q-dialog>
    <q-dialog
      v-model="newSetting"
      persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-subtitle1 text-bold text-grey-8">Save New Session Settings</div>
        </q-card-section>

        <q-card-section class="q-pt-none pt-3">
          <q-input outlined v-model="newSettingObj.name" placeholder="New Settings Name" />
        </q-card-section>

        <q-card-actions
          class="px-3 pb-3"
          align="right">
          <q-btn
            unelevated
            no-caps
            label="Cancel"
            color="grey-80"
            size="sm"
            v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Save"
            color="primary"
            size="sm"
            v-close-popup />
          <!-- <q-btn
            @click="beginDial"
            unelevated
            no-caps
            :disabled="disabled"
            size="sm"
            class="px-3 py-0"
            color="success">Begin Dialing</q-btn> -->
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import SessionsForm from './start-dial-sessions-form'
import PhoneIcon from 'components/icons/call-icon'
import CheckIcon from 'components/icons/check-o-icon'

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
      'sessionSettingGroups'
    ]),
    tabCollections () {
      let items = this.tabHeaders.filter(i => i.disabled === false)
      return items.concat(this.groupedSettings)
    }
  },
  async mounted () {
    await this.setSessionSettingGroup()
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
      newSettingObj: {
        name: ''
      },
      selectedItem: 'Untitled'
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'setSessionSettingGroup',
      'getDialerSessionSettings',
      'getSessionSetting'
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
      } else {
        this.selectedItem = data
      }
      await this.getSessionSetting(data.id)
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    fetchedGroupSettings (type) {
      return type === 'personal' ? this.personalSessionSettings : this.companySessionSettings
    },
    async test () {
      let res = await this.$axios.get('/api/v2/dialer-sessions')
      console.log('res :>> ', res)
    }
  },
  watch: {
    async dialog (val) {
      if (val) {
        await this.getDialerSessionSettings()
      }
    }
  }
}
</script>
