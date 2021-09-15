<template>
  <div class="t-session-settings">
    <q-btn
      @click="dialog = true"
      no-caps
      unelevated
      size="sm"
      color="success"
      class="px-2">
      Start Dialing
    </q-btn>
    <q-dialog
      v-model="dialog"
      transition-show="jump-down">
      <q-card
        flat
        style="width: 800px; max-width: 80vw;"
        class="my-card py-2 px-2">

        <q-card-section class="p-0" horizontal>
          <q-card-section style="width: 21% !important">
            <q-list
              dense
              bordered
              padding
              style="display:contents;">
              <template
                v-for="t in tabHeaders">
                <q-item
                  v-if="t.type === 'title'"
                  :key="t.value">
                  <q-item-section class="p-0">
                    <div class="text-weight-bold px-2">
                      {{ t.label }}
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-else-if="t.type === 'button'"
                  :key="t.value">
                  <q-item-section class="p-0">
                    <q-btn
                      @click="tab = t.name"
                      unelevated no-caps
                      class="px-2 full-width"
                      color="grey-3"
                      text-color="black">
                      {{ t.label }}
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-item
                  v-else-if="t.type === 'label'"
                  :key="t.value">
                  <q-item-section class="p-0">
                    <div class="text-grey px-2 text-uppercase text-caption">
                      {{ t.label }}
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-else
                  @click="tab = t.name"
                  :key="t.value"
                  clickable
                  v-ripple>
                  <q-item-section class="px-2 mr-2">
                    {{ t.label }}
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-card-section>

          <q-separator vertical />

          <q-card-section
            class="px-0"
            style="width: 78% !important">
            <q-card flat>
              <div class="row">
                <div class="col-12">
                  <q-card flat class="p-0">
                    <q-card-actions class="px-0">
                      <div>Unsaved Settings</div>
                      <q-space />
                      <q-btn
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="grey-5">Reset</q-btn>
                      <q-btn
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="primary">Save As New</q-btn>
                      <q-btn
                        unelevated
                        no-caps
                        size="sm"
                        class="px-3 py-0"
                        color="success">Begin Dialing</q-btn>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
              <q-tab-panels
                v-model="tab"
                keep-alive
                transition-next="fade"
                class="shadow-2 rounded-borders p-0 m-0">
                <template
                  v-for="panel in tabHeaders">
                  <q-tab-panel
                    :key="panel.name"
                    :name="panel.name"
                    class="p-0 m-0">
                    <SessionsForm />
                  </q-tab-panel>
                </template>
              </q-tab-panels>
            </q-card>
          </q-card-section>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import SessionsForm from './start-dial-sessions-form'

export default {
  name: 'StartDialsSessionsSettings',
  components: {
    SessionsForm
  },
  data () {
    return {
      dialog: false,
      tab: 'create-new',
      tabHeaders: [
        { label: 'Session Settings', name: 'session-settings', disabled: true, type: 'title' },
        { label: 'Create New', name: 'create-new', disabled: false, type: 'button' },
        { label: 'Personal', name: 'personal', disabled: true, type: 'label' },
        { label: 'HVAC Sales', name: 'personal-hvac-sales', disabled: false, type: 'link' },
        { label: 'Warm Leads', name: 'personal-warm-leads', disabled: false, type: 'link' },
        { label: 'Cold Leads', name: 'personal-cold-leads', disabled: false, type: 'link' },
        { label: 'Company', name: 'company', disabled: true, type: 'label' },
        { label: 'HVAC Sales', name: 'company-hvac-sales', disabled: false, type: 'link' },
        { label: 'Warm Leads', name: 'company-warm-leads', disabled: false, type: 'link' },
        { label: 'Cold Leads', name: 'company-cold-leads', disabled: false, type: 'link' }
      ]
    }
  }
}
</script>
