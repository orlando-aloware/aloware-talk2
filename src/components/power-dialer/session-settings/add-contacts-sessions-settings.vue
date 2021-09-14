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
        style="width: 800px;"
        class="my-card py-2 px-4">

          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold">Session Settings</q-item-label>
            </q-item-section>
          </q-item>

          <q-card-section horizontal>
            <q-card-section>
              <q-list
                dense
                bordered
                padding
                style="display:contents;">
                <q-item v-for="tab in tabHeaders" :key="tab.value" clickable v-ripple>
                  <q-item-section>
                    {{ tab.label }}
                  </q-item-section>
                </q-item>
              </q-list>
              <!-- <div
                class="t-tabs t-tab-horizontal"
                style="display:inline-grid;">
                <template
                  v-for="tab in tabHeaders">
                  <div
                    :key="tab.value"
                    class="t-tab-item">
                    {{ tab.label }}
                  </div>
                </template>
              </div> -->
            </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </q-card-section>
          </q-card-section>

        <q-tab-panels v-model="tab" animated class="shadow-2 rounded-borders">
          <q-tab-panel name="mails">
            <div class="text-h6">Mails</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <div class="text-h6">Alarms</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>

          <q-tab-panel name="movies">
            <div class="text-h6">Movies</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>
        </q-tab-panels>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddContactsSessionsSettings',
  data () {
    return {
      dialog: false,
      tab: 'create-new',
      tabHeaders: [
        { label: 'Create New', name: 'create-new', disabled: false },
        { label: 'Personal', name: 'personal', disabled: true },
        { label: 'HVAC Sales', name: 'personal-hvac-sales', disabled: false },
        { label: 'Warm Leads', name: 'personal-warm-leads', disabled: false },
        { label: 'Cold Leads', name: 'personal-cold-leads', disabled: false },
        { label: 'Company', name: 'company', disabled: true },
        { label: 'HVAC Sales', name: 'company-hvac-sales', disabled: false },
        { label: 'Warm Leads', name: 'company-warm-leads', disabled: false },
        { label: 'Cold Leads', name: 'company-cold-leads', disabled: false }
      ]
    }
  }
}
</script>
